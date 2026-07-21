'use client'

import { useState, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { autoDetectAndParse } from '@/lib/parsers/parserFactory'
import { validateFile, validateParsedTrade } from '@/lib/parsers/types'
import { tradeService } from '@/services/tradeService'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ParsedTrade } from '@/lib/parsers/types'

export type ImportStatus =
  | 'idle'
  | 'reading'
  | 'parsing'
  | 'preview'   // waiting for user confirmation
  | 'saving'
  | 'done'
  | 'error'

export interface ImportPreview {
  format: string
  fileName: string
  fileSize: string
  totalTrades: number
  duplicates: number
  validTrades: number
  sampleSymbols: string[]
  warnings: string[]
  /** The validated, deduplicated trades ready to commit */
  _readyToImport: ParsedTrade[]
}

export interface ImportResult {
  format: string
  imported: number
  skipped: number
  errors: string[]
}

interface UseImportTradesReturn {
  status: ImportStatus
  preview: ImportPreview | null
  result: ImportResult | null
  triggerFilePicker: () => void
  confirmImport: () => Promise<void>
  cancelImport: () => void
  reset: () => void
}

/**
 * Full import flow with validation + confirmation gate:
 *   1. File-level validation (extension, size, empty-check)
 *   2. Parse & auto-detect format
 *   3. Row-level validation (skip invalid rows)
 *   4. Dedup against existing Firestore tickets
 *   5. Preview shown → user must confirm
 *   6. Batch-write to Firestore (atomic per chunk)
 */
export function useImportTrades(): UseImportTradesReturn {
  const { user } = useAuth()
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const triggerFilePicker = useCallback(() => {
    if (!user?.id) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xls'
    input.style.display = 'none'

    input.onchange = async () => {
      const file = input.files?.[0]
      input.remove()
      if (!file) return

      setResult(null)
      setPreview(null)

      // ── Step 1: File-level validation ──────────────────────────────────────
      const fileCheck = validateFile(file)
      if (!fileCheck.valid) {
        setResult({ format: 'Unknown', imported: 0, skipped: 0, errors: [fileCheck.error!] })
        setStatus('error')
        return
      }

      setStatus('reading')

      try {
        // ── Step 2: Read file (text for CSV, ArrayBuffer for Excel) ────────────
        const ext = file.name.toLowerCase()
        let content: string | ArrayBuffer
        if (ext.endsWith('.csv')) {
          content = await readFileAsText(file)
        } else {
          content = await readFileAsArrayBuffer(file)
        }

        // ── Step 3: Parse ────────────────────────────────────────────────────
        setStatus('parsing')
        const { parserName, result: parseResult } = await autoDetectAndParse(content, file.name)

        if (parseResult.trades.length === 0 && parseResult.errors.length > 0) {
          setResult({ format: parserName, imported: 0, skipped: 0, errors: parseResult.errors })
          setStatus('error')
          return
        }

        // ── Step 4: Row-level validation ─────────────────────────────────────
        const rowWarnings: string[] = []
        let invalidRows = 0
        const validRows = parseResult.trades.filter(t => {
          const check = validateParsedTrade(t)
          if (!check.valid) {
            rowWarnings.push(check.reason ?? 'Invalid row skipped')
            invalidRows++
            return false
          }
          return true
        })

        // ── Step 5: Pre-check Firestore duplicates (Ticket or Fingerprint) ───
        const existingSnapshot = await getDocs(collection(db, 'users', user.id, 'trades'))
        const existingTickets = new Set<string>()
        const existingFingerprints = new Set<string>()

        existingSnapshot.docs.forEach(d => {
          const data = d.data() as any
          const notes: string = data.notes ?? ''
          const match = notes.match(/Ticket:\s*(\S+)/)
          if (match?.[1]) existingTickets.add(match[1])

          const pair = (data.pair || '').toUpperCase()
          const entry = data.entryPrice || 0
          const dateObj = data.tradeDate?.toDate ? data.tradeDate.toDate() : (data.tradeDate ? new Date(data.tradeDate) : null)
          const dateIso = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 16) : ''
          if (pair && entry > 0) {
            existingFingerprints.add(`${pair}_${dateIso}_${entry}`)
          }
        })

        let duplicates = 0
        const readyToImport = validRows.filter(t => {
          const tPair = t.symbol.toUpperCase()
          const tDateIso = t.openTime ? t.openTime.toISOString().slice(0, 16) : ''
          const tFingerprint = `${tPair}_${tDateIso}_${t.openPrice}`

          if (t.ticket && existingTickets.has(t.ticket)) {
            duplicates++
            return false
          }
          if (existingFingerprints.has(tFingerprint) || existingTickets.has(tFingerprint)) {
            duplicates++
            return false
          }
          return true
        })

        // Collect sample symbols (up to 8 unique)
        const symbols = Array.from(new Set(readyToImport.map(t => t.symbol))).slice(0, 8)

        const warnings: string[] = [...parseResult.errors]
        if (invalidRows > 0) {
          warnings.push(`${invalidRows} row${invalidRows !== 1 ? 's' : ''} skipped (invalid or incomplete data).`)
        }
        if (rowWarnings.length > 0 && rowWarnings.length <= 3) {
          warnings.push(...rowWarnings)
        }

        setPreview({
          format: parserName,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          totalTrades: parseResult.trades.length,
          duplicates,
          validTrades: readyToImport.length,
          sampleSymbols: symbols,
          warnings,
          _readyToImport: readyToImport,
        })

        // Show confirmation dialog
        setStatus('preview')

      } catch (err: any) {
        setResult({
          format: 'Unknown',
          imported: 0,
          skipped: 0,
          errors: [err.message || 'An unexpected error occurred during import.'],
        })
        setStatus('error')
      }
    }

    input.click()
  }, [user?.id])

  /** Called when the user clicks "Import N Trades" in the confirmation dialog */
  const confirmImport = useCallback(async () => {
    if (!user?.id || !preview?._readyToImport) return

    setStatus('saving')
    try {
      const { imported, skipped, errors } = await tradeService.batchImportTrades(
        user.id,
        preview._readyToImport,
      )
      setResult({
        format: preview.format,
        imported,
        skipped: skipped + preview.duplicates,
        errors,
      })
      setStatus('done')
    } catch (err: any) {
      setResult({
        format: preview.format,
        imported: 0,
        skipped: 0,
        errors: [err.message || 'Import failed unexpectedly.'],
      })
      setStatus('error')
    } finally {
      setPreview(null)
    }
  }, [user?.id, preview])

  const cancelImport = useCallback(() => {
    setPreview(null)
    setStatus('idle')
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setPreview(null)
  }, [])

  return { status, preview, result, triggerFilePicker, confirmImport, cancelImport, reset }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsText(file, 'utf-8')
  })
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error(`Failed to read binary file: ${file.name}`))
    reader.readAsArrayBuffer(file)
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

