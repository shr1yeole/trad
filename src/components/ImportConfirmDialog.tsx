'use client'

import { X, FileText, AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImportPreview {
  format: string
  fileName: string
  fileSize: string
  totalTrades: number
  duplicates: number
  validTrades: number
  sampleSymbols: string[]
  warnings: string[]
}

interface ImportConfirmDialogProps {
  open: boolean
  preview: ImportPreview | null
  onConfirm: () => void
  onCancel: () => void
}

export function ImportConfirmDialog({ open, preview, onConfirm, onCancel }: ImportConfirmDialogProps) {
  if (!open || !preview) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-white/10 bg-[#0a0d1c] shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Confirm Import</h2>
              <p className="text-xs text-muted-foreground">{preview.format} Report</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* File info */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{preview.fileName}</p>
              <p className="text-xs text-muted-foreground">{preview.fileSize}</p>
            </div>
          </div>

          {/* Trade counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
              <p className="text-xl font-bold">{preview.totalTrades}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Found</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xl font-bold text-emerald-400">{preview.validTrades}</p>
              <p className="text-xs text-muted-foreground mt-0.5">To Import</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
              <p className="text-xl font-bold text-muted-foreground">{preview.duplicates}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Duplicates</p>
            </div>
          </div>

          {/* Sample symbols */}
          {preview.sampleSymbols.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Symbols detected</p>
              <div className="flex flex-wrap gap-1.5">
                {preview.sampleSymbols.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-amber-400">Warnings</span>
              </div>
              {preview.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400/80 pl-5">{w}</p>
              ))}
            </div>
          )}

          {/* Zero valid notice */}
          {preview.validTrades === 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">No valid trades to import. Please check your file.</p>
            </div>
          )}

          {/* Atomicity notice */}
          <p className="text-xs text-muted-foreground">
            ✓ Duplicate trades will be skipped. If the import is interrupted, previously imported trades remain safe.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={preview.validTrades === 0}
            className="min-w-[130px] shadow-[0_0_15px_rgba(173,198,255,0.2)] hover:shadow-[0_0_20px_rgba(173,198,255,0.4)] transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Import {preview.validTrades} Trade{preview.validTrades !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
