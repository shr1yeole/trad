'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { Trade } from '@/types/trade'
import { toISTDateString } from '@/lib/tz'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const { user } = useAuth()
  
  // Date State in IST
  const [year, setYear] = useState(() => {
    const d = new Date()
    return Number(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-')[0])
  })
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return Number(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-')[1]) // 1-12
  })

  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  // 1. Fetch only current month's trades in real-time
  useEffect(() => {
    if (!user?.id) {
      setTrades([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Boundaries in IST (+05:30)
    const startStr = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`
    const nextMonthNum = month === 12 ? 1 : month + 1
    const nextYearNum = month === 12 ? year + 1 : year
    const endStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, '0')}-01T00:00:00+05:30`

    const start = new Date(startStr)
    const end = new Date(endStr)

    const tradesColl = collection(db, 'users', user.id, 'trades')
    const q = query(
      tradesColl,
      where('tradeDate', '>=', Timestamp.fromDate(start)),
      where('tradeDate', '<', Timestamp.fromDate(end)),
      orderBy('tradeDate', 'desc')
    )

    const unsub = onSnapshot(
      q,
      snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade))
        setTrades(list)
        setLoading(false)
      },
      err => {
        console.error('Error loading calendar trades:', err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user?.id, year, month])

  // Get Today's Date String in IST for highlighting
  const todayDateStr = useMemo(() => toISTDateString(), [])

  // 2. Build the calendar grid cells dynamically
  const gridCells = useMemo(() => {
    // Weekday index of the 1st of the month in IST
    const firstDay = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`)
    const startDayOfWeek = firstDay.getDay()

    const totalDaysInMonth = new Date(year, month, 0).getDate()
    const totalDaysInPrevMonth = new Date(year, month - 1, 0).getDate()

    const cells: Array<{ day: number; dateString: string; currentMonth: boolean; key: string }> = []

    // Previous month padding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = totalDaysInPrevMonth - i
      const prevMonthNum = month === 1 ? 12 : month - 1
      const prevYearNum = month === 1 ? year - 1 : year
      const dateString = `${prevYearNum}-${String(prevMonthNum).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`
      cells.push({
        day: prevDay,
        dateString,
        currentMonth: false,
        key: `prev-${prevDay}`,
      })
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      cells.push({
        day: i,
        dateString,
        currentMonth: true,
        key: `curr-${i}`,
      })
    }

    // Next month padding days to round up to 35 or 42 grid cells
    const totalCellsNeeded = cells.length <= 35 ? 35 : 42
    const nextDaysCount = totalCellsNeeded - cells.length
    for (let i = 1; i <= nextDaysCount; i++) {
      const nextMonthNum = month === 12 ? 1 : month + 1
      const nextYearNum = month === 12 ? year + 1 : year
      const dateString = `${nextYearNum}-${String(nextMonthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      cells.push({
        day: i,
        dateString,
        currentMonth: false,
        key: `next-${i}`,
      })
    }

    return { cells, totalCells: totalCellsNeeded }
  }, [year, month])

  // 3. Map trades by date string (IST YYYY-MM-DD)
  const dailyTradesMap = useMemo(() => {
    const map = new Map<string, Trade[]>()
    trades.forEach(t => {
      if (!t.tradeDate) return
      let d: Date
      if (t.tradeDate instanceof Timestamp) {
        d = t.tradeDate.toDate()
      } else if (t.tradeDate instanceof Date) {
        d = t.tradeDate
      } else {
        d = new Date(t.tradeDate)
      }

      if (isNaN(d.getTime())) return
      const dateKey = toISTDateString(d)
      const existing = map.get(dateKey) || []
      existing.push(t)
      map.set(dateKey, existing)
    })
    return map
  }, [trades])

  // Month navigation handlers
  const handlePrevMonth = () => {
    setMonth(prev => {
      if (prev === 1) {
        setYear(y => y - 1)
        return 12
      }
      return prev - 1
    })
  }

  const handleNextMonth = () => {
    setMonth(prev => {
      if (prev === 12) {
        setYear(y => y + 1)
        return 1
      }
      return prev + 1
    })
  }

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' })
  }

  // Selected date's trades for modal
  const selectedTrades = useMemo(() => {
    if (!selectedDateKey) return []
    return dailyTradesMap.get(selectedDateKey) || []
  }, [selectedDateKey, dailyTradesMap])

  // Helpers for UI display
  const pnlClass = (pnl: number) => {
    if (pnl > 0) return 'text-emerald-400'
    if (pnl < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Calendar</h1>
          <p className="text-muted-foreground mt-1">Your daily performance at a glance.</p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2 bg-[#111827] rounded-lg p-1 border border-white/10">
          <Button onClick={handlePrevMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white/5">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 font-medium min-w-[120px] justify-center text-sm">
            {getMonthName(month)} {year}
          </div>
          <Button onClick={handleNextMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white/5">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <Card className="bg-[#0a0d1c]/50 border-white/10 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 border-t border-white/5">
          {gridCells.cells.map((cell, i) => {
            const cellTrades = dailyTradesMap.get(cell.dateString) || []
            const tradesCount = cellTrades.length
            const dailyPnl = cellTrades.reduce((sum, t) => sum + (Number(t.profitLoss) || 0), 0)
            const isToday = cell.dateString === todayDateStr

            return (
              <div
                key={cell.key}
                onClick={() => tradesCount > 0 && setSelectedDateKey(cell.dateString)}
                className={`min-h-[75px] sm:min-h-[120px] p-1 sm:p-3 border-b border-r border-white/5 transition-colors relative group ${
                  tradesCount > 0 ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
                } ${!cell.currentMonth ? 'bg-background/20 text-muted-foreground opacity-45' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isToday
                        ? 'h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center -m-0.5 sm:-m-1'
                        : ''
                    }`}
                  >
                    {cell.day}
                  </span>
                  {tradesCount > 0 && (
                    <span className="text-[9px] sm:text-xs text-muted-foreground">
                      {tradesCount}<span className="hidden sm:inline"> trades</span>
                    </span>
                  )}
                </div>

                {tradesCount > 0 && (
                  <div
                    className={`mt-2 sm:mt-4 text-center py-0.5 sm:py-1.5 rounded-md ${
                      dailyPnl > 0
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : dailyPnl < 0
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    <span className="font-bold text-[10px] sm:text-sm">
                      {dailyPnl > 0 ? '+' : ''}${dailyPnl.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Daily Trades Detail Modal */}
      {selectedDateKey && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-14 px-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSelectedDateKey(null)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/15 bg-[#0a0d1c] shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-6 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Trades on {new Date(selectedDateKey).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  <p className="text-xs text-muted-foreground">Daily performance summary</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDateKey(null)}
                className="rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Content list of trades */}
            <div className="p-6 space-y-4">
              {selectedTrades.map((trade) => {
                const pnl = Number(trade.profitLoss) || 0
                return (
                  <Card key={trade.id} className="border-white/10 relative overflow-hidden bg-[#0d1127]/60">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-extrabold">{trade.pair}</span>
                            <Badge
                              variant="outline"
                              className={
                                trade.tradeType === 'Buy'
                                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                  : 'border-destructive/30 text-destructive bg-destructive/10'
                              }
                            >
                              {trade.tradeType === 'Buy' ? 'LONG' : 'SHORT'}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                trade.status === 'Win'
                                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                  : trade.status === 'Loss'
                                  ? 'border-destructive/30 text-destructive bg-destructive/10'
                                  : 'border-white/20 text-muted-foreground bg-white/5'
                              }
                            >
                              {trade.status}
                            </Badge>
                          </div>
                          
                          {trade.strategy && (
                            <p className="text-xs text-muted-foreground font-medium">
                              Strategy: <span className="text-foreground">{trade.strategy}</span>
                            </p>
                          )}

                          {trade.notes && (
                            <p className="text-xs text-muted-foreground max-w-md line-clamp-2">
                              {trade.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                            <span>Quantity: {trade.quantity}</span>
                            <span>•</span>
                            <span>R:R: {trade.rrRatio}</span>
                            <span>•</span>
                            <span>Risk: {trade.riskPercentage}%</span>
                          </div>
                        </div>

                        {/* P&L Info */}
                        <div className="sm:text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net P&L</p>
                          <p className={`text-xl font-bold ${pnlClass(pnl)}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </p>
                          {trade.psychology && (
                            <Badge variant="secondary" className="mt-1 bg-white/5 text-[10px] text-muted-foreground">
                              {trade.psychology}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
