'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus, Calendar as CalendarIcon, Download, SlidersHorizontal, Pencil, Trash2, Loader2, BookOpen, Upload, CheckCircle2, AlertCircle, CheckSquare, Square, X, ArrowUpDown } from 'lucide-react'
import { useTrades } from '@/hooks/useTrades'
import { useImportTrades } from '@/hooks/useImportTrades'
import { TradeModal } from '@/components/TradeModal'
import { ImportConfirmDialog } from '@/components/ImportConfirmDialog'
import { Trade, TradeFormData } from '@/types/trade'
import { Timestamp } from 'firebase/firestore'

import { toISTDateString } from '@/lib/tz'

function formatDate(val: any): string {
  if (!val) return '—'
  try {
    const d = val instanceof Timestamp ? val.toDate() : new Date(val)
    return d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '—' }
}

function pnlClass(pnl: number): string {
  if (pnl > 0) return 'text-emerald-400'
  if (pnl < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Win': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    case 'Loss': return 'border-destructive/30 text-destructive bg-destructive/10'
    case 'Running': return 'border-blue-400/30 text-blue-400 bg-blue-400/10'
    default: return 'border-white/20 text-muted-foreground bg-white/5'
  }
}

export default function TradeJournalPage() {
  const { trades, loading, error, addTrade, updateTrade, deleteTrade, deleteTrades, clearError } = useTrades()
  const {
    status: importStatus,
    preview: importPreview,
    result: importResult,
    triggerFilePicker,
    confirmImport,
    cancelImport,
    reset: resetImport,
  } = useImportTrades()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Search & Category Filter State
  const [search, setSearch] = useState('')
  const [selectedMarket, setSelectedMarket] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Result Sorting State ('newest' | 'oldest' | 'highest' | 'lowest')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  // Date Filtering State ('all' | 'single' | 'range')
  const [dateFilterType, setDateFilterType] = useState<'all' | 'single' | 'range'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [singleDate, setSingleDate] = useState<string>('')

  // Selection & Bulk Delete State
  const [selectedTradeIds, setSelectedTradeIds] = useState<Set<string>>(new Set())
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Filtered and sorted trades
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    
    // 1. Filter Phase
    const list = trades.filter(t => {
      const matchesSearch = !q || (
        t.pair.toLowerCase().includes(q) ||
        t.market.toLowerCase().includes(q) ||
        t.strategy.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.tradeType.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        (t.psychology && t.psychology.toLowerCase().includes(q))
      )
      const matchesMarket = selectedMarket === 'All' || t.market.toLowerCase() === selectedMarket.toLowerCase()
      const matchesStatus = selectedStatus === 'All' || t.status.toLowerCase() === selectedStatus.toLowerCase()

      // Date Filtering (Single Date or Date Range)
      let matchesDate = true
      if (dateFilterType !== 'all' && t.tradeDate) {
        try {
          const dObj = t.tradeDate instanceof Timestamp ? t.tradeDate.toDate() : new Date(t.tradeDate)
          if (!isNaN(dObj.getTime())) {
            const iso = toISTDateString(dObj)
            if (dateFilterType === 'single' && singleDate) {
              matchesDate = iso === singleDate
            } else if (dateFilterType === 'range') {
              if (startDate && iso < startDate) matchesDate = false
              if (endDate && iso > endDate) matchesDate = false
            }
          }
        } catch {
          // preserve row if date parsing fails
        }
      }

      return matchesSearch && matchesMarket && matchesStatus && matchesDate
    })

    // 2. Sort Phase (Highest, Lowest, Newest, Oldest)
    list.sort((a, b) => {
      if (sortOrder === 'highest') {
        return (b.profitLoss || 0) - (a.profitLoss || 0)
      }
      if (sortOrder === 'lowest') {
        return (a.profitLoss || 0) - (b.profitLoss || 0)
      }

      const getMillis = (val: any) => {
        if (!val) return 0
        if (val instanceof Timestamp) return val.toMillis()
        if (val instanceof Date) return val.getTime()
        const d = new Date(val)
        return isNaN(d.getTime()) ? 0 : d.getTime()
      }

      const mA = getMillis(a.tradeDate)
      const mB = getMillis(b.tradeDate)

      if (sortOrder === 'oldest') {
        return mA - mB
      }
      // Default: 'newest'
      return mB - mA
    })

    return list
  }, [trades, search, selectedMarket, selectedStatus, sortOrder, dateFilterType, startDate, endDate, singleDate])

  // Select All helper
  const allSelected = useMemo(() => {
    if (filtered.length === 0) return false
    return filtered.every(t => t.id && selectedTradeIds.has(t.id))
  }, [filtered, selectedTradeIds])

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTradeIds(new Set())
    } else {
      const next = new Set<string>()
      filtered.forEach(t => {
        if (t.id) next.add(t.id)
      })
      setSelectedTradeIds(next)
    }
  }

  const toggleSelectTrade = (id: string) => {
    setSelectedTradeIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAdd = () => {
    setSelectedTrade(null)
    setModalMode('add')
    setModalOpen(true)
  }

  const openEdit = (trade: Trade) => {
    setSelectedTrade(trade)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleSubmit = async (data: TradeFormData) => {
    if (modalMode === 'add') {
      await addTrade(data)
      showSuccess('Trade added successfully!')
    } else if (selectedTrade?.id) {
      await updateTrade(selectedTrade.id, data)
      showSuccess('Trade updated successfully!')
    }
  }

  const handleDelete = async (tradeId: string) => {
    if (!tradeId) return
    setIsDeleting(true)
    try {
      await deleteTrade(tradeId)
      setDeleteConfirm(null)
      setSelectedTradeIds(prev => {
        const next = new Set(prev)
        next.delete(tradeId)
        return next
      })
      showSuccess('Trade deleted successfully.')
    } catch (err: any) {
      console.error('Failed to delete trade:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteSubmit = async () => {
    const idsToDelete = Array.from(selectedTradeIds).filter(Boolean)
    if (idsToDelete.length === 0) return
    setIsBulkDeleting(true)
    try {
      await deleteTrades(idsToDelete)
      setSelectedTradeIds(new Set())
      setBulkDeleteModalOpen(false)
      showSuccess(`Successfully deleted ${idsToDelete.length} trade${idsToDelete.length !== 1 ? 's' : ''}.`)
    } catch (err: any) {
      console.error('Failed bulk delete:', err)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedMarket('All')
    setSelectedStatus('All')
    setSortOrder('newest')
    setDateFilterType('all')
    setStartDate('')
    setEndDate('')
    setSingleDate('')
  }

  const hasActiveFilters = Boolean(
    search !== '' ||
    selectedMarket !== 'All' ||
    selectedStatus !== 'All' ||
    sortOrder !== 'newest' ||
    dateFilterType !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    singleDate !== ''
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Trade Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log, track, and analyze your trading performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Universal CSV & Excel Import Trades Button */}
          <Button
            variant="outline"
            onClick={triggerFilePicker}
            disabled={importStatus === 'parsing'}
            className="border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            {importStatus === 'parsing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing File...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Import Trades
              </>
            )}
          </Button>

          {/* Add Entry Button */}
          <Button onClick={openAdd} className="shadow-[0_0_20px_rgba(173,198,255,0.25)] hover:shadow-[0_0_25px_rgba(173,198,255,0.4)] transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-400/80 hover:text-emerald-400 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Import Status Banner */}
      {importResult && (importStatus === 'done' || importStatus === 'error') && (
        <div className={`p-4 rounded-md border text-sm animate-in fade-in duration-200 ${
          importStatus === 'done'
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {importStatus === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={importStatus === 'done' ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                  {importStatus === 'done'
                    ? `Successfully imported ${importResult.imported} trades from ${importResult.format} report`
                    : `Import failed for ${importResult.format} report`}
                </p>
                {importResult.skipped > 0 && (
                  <p className="text-muted-foreground mt-0.5">
                    {importResult.skipped} trade{importResult.skipped !== 1 ? 's' : ''} skipped (already exist or invalid)
                  </p>
                )}
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {importResult.errors.slice(0, 3).map((e, i) => (
                      <li key={i} className="text-red-400/80 text-xs">{e}</li>
                    ))}
                    {importResult.errors.length > 3 && (
                      <li className="text-muted-foreground text-xs">...and {importResult.errors.length - 3} more</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={resetImport}
              className="text-muted-foreground hover:text-foreground text-xs underline shrink-0 mt-0.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Global error */}
      {error && (
        <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Select All & Bulk Actions Toolbar (at Top) */}
      {!loading && trades.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-[#0a0d1c] text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-foreground font-medium select-none text-xs sm:text-sm"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
              <span>
                {allSelected ? 'Deselect All Trades' : 'Select All Trades'} ({filtered.length})
              </span>
            </button>
            {selectedTradeIds.size > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">
                {selectedTradeIds.size} selected
              </span>
            )}
          </div>

          {selectedTradeIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTradeIds(new Set())}
                className="text-xs h-9 border-white/10 hover:bg-white/5"
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteModalOpen(true)}
                className="h-9 bg-destructive/90 hover:bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)] font-medium"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete Selected ({selectedTradeIds.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Search & Filters Card */}
      <Card className="bg-[#0a0d1c]/80 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Live Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search pair, strategy, notes, market, status..."
                className="w-full pl-9 pr-9 bg-background/50 border-white/10 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
              {/* Sort Order (Highest / Lowest / Newest / Oldest) */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as any)}
                  className="h-9 px-3 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="highest">Sort: Highest P&L</option>
                  <option value="lowest">Sort: Lowest P&L</option>
                </select>
              </div>

              {/* Asset Class Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                <select
                  value={selectedMarket}
                  onChange={e => setSelectedMarket(e.target.value)}
                  className="h-9 px-3 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Markets</option>
                  <option value="Forex">Forex</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Indices">Indices</option>
                  <option value="Commodities">Commodities</option>
                  <option value="Stocks">Stocks</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="h-9 px-3 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Statuses</option>
                  <option value="Win">Win</option>
                  <option value="Loss">Loss</option>
                  <option value="Breakeven">Breakeven</option>
                  <option value="Running">Running</option>
                </select>
              </div>

              {/* Date Filter Type Dropdown */}
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                <select
                  value={dateFilterType}
                  onChange={e => setDateFilterType(e.target.value as any)}
                  className="h-9 px-3 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Dates</option>
                  <option value="single">Particular Date</option>
                  <option value="range">Date Range</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sub-row for Particular Date or Date Range Pickers */}
          {dateFilterType !== 'all' && (
            <div className="flex items-center gap-3 pt-3 border-t border-white/5 flex-wrap animate-in fade-in duration-200">
              {dateFilterType === 'single' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Select Date:</span>
                  <Input
                    type="date"
                    value={singleDate}
                    onChange={e => setSingleDate(e.target.value)}
                    className="h-8 w-40 text-xs bg-background/50 border-white/10"
                  />
                </div>
              )}

              {dateFilterType === 'range' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">From:</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="h-8 w-36 text-xs bg-background/50 border-white/10"
                  />
                  <span className="text-xs text-muted-foreground font-medium">To:</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="h-8 w-36 text-xs bg-background/50 border-white/10"
                  />
                </div>
              )}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground h-8 ml-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Clear Filters row when dateFilterType === 'all' and active filters exist */}
          {dateFilterType === 'all' && hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          <span>Loading trades...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {hasActiveFilters ? 'No trades match your search/filters' : 'No trades yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters ? 'Try adjusting your search term or market/status filters.' : 'Click "Add Entry" to log your first trade.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Reset Search & Filters
            </Button>
          ) : (
            <Button onClick={openAdd} className="shadow-[0_0_15px_rgba(173,198,255,0.2)]">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Trade
            </Button>
          )}
        </div>
      )}

      {/* Trade cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(trade => {
            const isSelected = trade.id ? selectedTradeIds.has(trade.id) : false
            return (
              <Card
                key={trade.id || Math.random().toString()}
                onClick={() => trade.id && toggleSelectTrade(trade.id)}
                className={`group overflow-hidden relative transition-all cursor-pointer hover:-translate-y-0.5 ${
                  isSelected ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_15px_rgba(173,198,255,0.15)]' : 'border-white/10'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      {/* Top row with checkbox */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (trade.id) toggleSelectTrade(trade.id)
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title={isSelected ? 'Deselect trade' : 'Select trade'}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground" />
                          )}
                        </button>
                        <span className="text-xl font-bold">{trade.pair}</span>
                        <Badge
                          variant="outline"
                          className={trade.tradeType === 'Buy'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-destructive/30 text-destructive bg-destructive/10'}
                        >
                          {trade.tradeType === 'Buy' ? 'LONG' : 'SHORT'}
                        </Badge>
                        <Badge variant="outline" className={statusBadgeClass(trade.status)}>
                          {trade.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-auto md:ml-0 flex items-center">
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {formatDate(trade.tradeDate)}
                        </span>
                      </div>

                      {/* Strategy */}
                      {trade.strategy && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Setup / Strategy</h3>
                          <p className="text-sm">{trade.strategy}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {trade.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                          <p className="text-sm leading-relaxed">{trade.notes}</p>
                        </div>
                      )}

                      {/* Tags row: market + psychology */}
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        {trade.market && (
                          <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs text-muted-foreground">
                            {trade.market}
                          </Badge>
                        )}
                        {trade.psychology && (
                          <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs text-muted-foreground">
                            {trade.psychology}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right panel: P&L + actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-6 min-w-36 md:border-l md:border-white/5 md:pl-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Net P&L</p>
                        <p className={`text-xl font-bold ${pnlClass(trade.profitLoss)}`}>
                          {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mood</p>
                        <Badge variant="outline" className="border-[#d2bbff]/30 text-[#d2bbff] bg-[#d2bbff]/10">
                          {trade.psychology || '—'}
                        </Badge>
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(trade)
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                          title="Edit trade"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (trade.id) setDeleteConfirm(trade.id)
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete trade"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Trade Add/Edit Modal */}
      <TradeModal
        open={modalOpen}
        mode={modalMode}
        trade={selectedTrade}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal (Single - Displayed at Top) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-destructive/40 bg-[#0d1024] p-6 shadow-[0_0_50px_rgba(239,68,68,0.35)] animate-in slide-in-from-top-6 duration-300 space-y-4">
            <div className="flex items-center gap-3 text-destructive border-b border-white/10 pb-3">
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Trade</h3>
                <p className="text-xs text-muted-foreground">Permanent deletion warning</p>
              </div>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Are you sure you want to delete this trade? This action cannot be undone and will permanently remove it from your journal.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(null)}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting Trade...
                  </>
                ) : (
                  'Delete Trade'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal (Displayed at Top) */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => !isBulkDeleting && setBulkDeleteModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-destructive/40 bg-[#0d1024] p-6 shadow-[0_0_50px_rgba(239,68,68,0.35)] animate-in slide-in-from-top-6 duration-300 space-y-4">
            <div className="flex items-center gap-3 text-destructive border-b border-white/10 pb-3">
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Confirm Bulk Delete</h3>
                <p className="text-xs text-muted-foreground">Permanent batch deletion warning</p>
              </div>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-destructive underline">{selectedTradeIds.size} selected trade{selectedTradeIds.size !== 1 ? 's' : ''}</span>?
              <br />
              This will permanently remove them from your Firebase Cloud Firestore trade journal. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                disabled={isBulkDeleting}
                onClick={() => setBulkDeleteModalOpen(false)}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isBulkDeleting}
                onClick={handleBulkDeleteSubmit}
                className="bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(239,68,68,0.4)] font-medium"
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting {selectedTradeIds.size} Trades...
                  </>
                ) : (
                  `Delete ${selectedTradeIds.size} Trade${selectedTradeIds.size !== 1 ? 's' : ''} Permanently`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Import Confirmation Dialog */}
      <ImportConfirmDialog
        open={importStatus === 'preview'}
        preview={importPreview}
        onConfirm={confirmImport}
        onCancel={cancelImport}
      />
    </div>
  )
}
