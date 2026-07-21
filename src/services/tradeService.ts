import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Trade, TradeFormData } from '@/types/trade'
import { ParsedTrade, parsedToTrade } from '@/lib/parsers/types'

// Path helper: users/{uid}/trades
const tradesRef = (uid: string) => collection(db, 'users', uid, 'trades')
const tradeRef  = (uid: string, tradeId: string) => doc(db, 'users', uid, 'trades', tradeId)

/**
 * Parse form string values into proper numeric types for Firestore
 */
function parseFormData(data: TradeFormData): Omit<Trade, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    pair: data.pair.trim().toUpperCase(),
    market: data.market.trim(),
    tradeType: data.tradeType,
    entryPrice: parseFloat(data.entryPrice) || 0,
    exitPrice: parseFloat(data.exitPrice) || 0,
    stopLoss: parseFloat(data.stopLoss) || 0,
    takeProfit: parseFloat(data.takeProfit) || 0,
    quantity: parseFloat(data.quantity) || 0,
    riskPercentage: parseFloat(data.riskPercentage) || 0,
    profitLoss: parseFloat(data.profitLoss) || 0,
    rrRatio: parseFloat(data.rrRatio) || 0,
    strategy: data.strategy.trim(),
    psychology: data.psychology.trim(),
    notes: data.notes.trim(),
    screenshotUrl: data.screenshotUrl.trim(),
    status: data.status,
    tradeDate: data.tradeDate
      ? Timestamp.fromDate(new Date(data.tradeDate))
      : Timestamp.now(),
  }
}

export const tradeService = {
  /**
   * Create a new trade under users/{uid}/trades
   */
  async createTrade(uid: string, data: TradeFormData): Promise<string> {
    const parsed = parseFormData(data)
    const docRef = await addDoc(tradesRef(uid), {
      ...parsed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  /**
   * Fetch all trades for a user once (ordered newest first by tradeDate)
   */
  async getTrades(uid: string): Promise<Trade[]> {
    const q = query(tradesRef(uid), orderBy('tradeDate', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trade))
  },

  /**
   * Fetch a single trade
   */
  async getTrade(uid: string, tradeId: string): Promise<Trade | null> {
    const snapshot = await getDoc(tradeRef(uid, tradeId))
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as Trade
  },

  /**
   * Update an existing trade
   */
  async updateTrade(uid: string, tradeId: string, data: TradeFormData): Promise<void> {
    const parsed = parseFormData(data)
    await updateDoc(tradeRef(uid, tradeId), {
      ...parsed,
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * Delete a single trade
   */
  async deleteTrade(uid: string, tradeId: string): Promise<void> {
    await deleteDoc(tradeRef(uid, tradeId))
  },

  /**
   * Delete multiple trades in atomic batches of 499
   */
  async deleteTrades(uid: string, tradeIds: string[]): Promise<void> {
    const BATCH_SIZE = 499
    for (let i = 0; i < tradeIds.length; i += BATCH_SIZE) {
      const chunk = tradeIds.slice(i, i + BATCH_SIZE)
      const batch = writeBatch(db)
      chunk.forEach(id => {
        batch.delete(tradeRef(uid, id))
      })
      await batch.commit()
    }
  },

  /**
   * Subscribe to real-time trades updates. Returns an unsubscribe function.
   */
  subscribeTrades(
    uid: string,
    onUpdate: (trades: Trade[]) => void,
    onError?: (err: Error) => void,
  ): Unsubscribe {
    const q = query(tradesRef(uid), orderBy('tradeDate', 'desc'))
    return onSnapshot(
      q,
      snapshot => {
        const trades = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trade))
        onUpdate(trades)
      },
      err => {
        console.error('Firestore onSnapshot error:', err)
        onError?.(err)
      },
    )
  },

  /**
   * Batch-import a list of ParsedTrades into Firestore.
   * Skips duplicates by checking the ticket number embedded in the notes field.
   * Firestore batches are capped at 500 operations; we chunk accordingly.
   *
   * Returns { imported, skipped, errors }
   */
  async batchImportTrades(
    uid: string,
    parsedTrades: ParsedTrade[],
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const errors: string[] = []
    let imported = 0
    let skipped  = 0

    // ── Step 1: Fetch existing ticket numbers & fingerprints for dedup ─────
    const existingSnapshot = await getDocs(tradesRef(uid))
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

    // ── Step 2: Row-validate and deduplicate ──────────────────────────────────
    const toImport: ParsedTrade[] = []
    const { validateParsedTrade } = await import('@/lib/parsers/types')

    for (const trade of parsedTrades) {
      const tPair = trade.symbol.toUpperCase()
      const tDateIso = trade.openTime ? trade.openTime.toISOString().slice(0, 16) : ''
      const tFingerprint = `${tPair}_${tDateIso}_${trade.openPrice}`

      // Dedup by ticket number or combination of Symbol + Open Time + Entry Price
      if (
        (trade.ticket && existingTickets.has(trade.ticket)) ||
        existingTickets.has(tFingerprint) ||
        existingFingerprints.has(tFingerprint)
      ) {
        skipped++
        continue
      }

      // Row validation
      const validation = validateParsedTrade(trade)
      if (!validation.valid) {
        errors.push(`Skipped row – ${validation.reason}`)
        skipped++
        continue
      }

      toImport.push(trade)
    }

    // ── Step 3: Batch-write in chunks of 499 ──────────────────────────────────
    // Each chunk is committed independently (atomic per chunk).
    // If the browser/network interrupts mid-import, all already-committed
    // chunks remain in Firestore — no partial document states are possible.
    const BATCH_SIZE = 499
    for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
      const chunk = toImport.slice(i, i + BATCH_SIZE)
      const batch = writeBatch(db)

      for (const parsed of chunk) {
        try {
          const tradeData = parsedToTrade(parsed)
          const newDocRef = doc(tradesRef(uid))   // auto-generated ID
          batch.set(newDocRef, {
            ...tradeData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          imported++
        } catch (err: any) {
          errors.push(`Failed to stage trade (${parsed.symbol}): ${err.message}`)
          skipped++
          imported--   // undo the pre-increment
        }
      }

      // Commit this chunk — atomic; either all writes succeed or none do
      await batch.commit()
    }

    return { imported, skipped, errors }
  },
}
