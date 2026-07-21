import { Trade } from '@/types/trade'
import { Timestamp } from 'firebase/firestore'

export interface SymbolPerformance {
  symbol: string
  totalPnl: number
  tradesCount: number
  wins: number
  losses: number
  winRate: number
  avgWin: number
  avgLoss: number
}

export interface StrategyPerformance {
  strategy: string
  totalPnl: number
  tradesCount: number
  wins: number
  losses: number
  winRate: number
  profitFactor: number
}

export interface SessionPerformance {
  session: 'Asian' | 'London' | 'New York' | 'Other'
  pnl: number
  trades: number
  winRate: number
}

export interface HourlyPerformance {
  hour: number
  hourLabel: string
  pnl: number
  trades: number
}

export interface WeekdayPerformance {
  dayName: string
  dayIndex: number
  pnl: number
  trades: number
  winRate: number
}

export interface EquityPoint {
  tradeIndex: number
  date: string
  label: string
  pnl: number
  cumulativePnl: number
}

export interface DrawdownPoint {
  tradeIndex: number
  date: string
  drawdown: number
  drawdownPercent: number
}

export interface PeriodPnlPoint {
  period: string
  pnl: number
  trades: number
  winRate: number
}

export interface DayRecord {
  date: string
  pnl: number
  tradesCount: number
}

export interface PieChartPoint {
  name: string
  value: number
  color: string
}

export interface AnalyticsSummary {
  netProfit: number
  grossProfit: number
  grossLoss: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  expectancy: number
  averageHoldingTimeMinutes: number
  profitFactor: number
  maxDrawdown: number
  maxDrawdownPercent: number
  averageRR: number
  bestRR: number
  worstRR: number
  bestPair: SymbolPerformance | null
  worstPair: SymbolPerformance | null
  pairStats: SymbolPerformance[]
  strategyStats: StrategyPerformance[]
  sessionStats: SessionPerformance[]
  hourlyStats: HourlyPerformance[]
  weekdayStats: WeekdayPerformance[]
  bestDay: DayRecord | null
  worstDay: DayRecord | null
  longestWinStreak: number
  longestLosingStreak: number
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  monthlyProfit: PeriodPnlPoint[]
  weeklyPerformance: PeriodPnlPoint[]
  dailyPnL: PeriodPnlPoint[]
  winLossPie: PieChartPoint[]
}

import { toISTDateString, toISTHour, toISTDayOfWeek } from './tz'

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

function formatPeriodDate(d: Date): string {
  if (isNaN(d.getTime()) || d.getTime() === 0) return 'Unknown'
  return toISTDateString(d)
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function calculateAnalytics(trades: Trade[]): AnalyticsSummary {
  if (!trades || trades.length === 0) {
    return {
      netProfit: 0,
      grossProfit: 0,
      grossLoss: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      expectancy: 0,
      averageHoldingTimeMinutes: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      averageRR: 0,
      bestRR: 0,
      worstRR: 0,
      bestPair: null,
      worstPair: null,
      pairStats: [],
      strategyStats: [],
      sessionStats: [],
      hourlyStats: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        hourLabel: `${h.toString().padStart(2, '0')}:00`,
        pnl: 0,
        trades: 0,
      })),
      weekdayStats: WEEKDAY_NAMES.map((dayName, dayIndex) => ({
        dayName,
        dayIndex,
        pnl: 0,
        trades: 0,
        winRate: 0,
      })),
      bestDay: null,
      worstDay: null,
      longestWinStreak: 0,
      longestLosingStreak: 0,
      equityCurve: [],
      drawdownCurve: [],
      monthlyProfit: [],
      weeklyPerformance: [],
      dailyPnL: [],
      winLossPie: [
        { name: 'Wins', value: 0, color: '#10b981' },
        { name: 'Losses', value: 0, color: '#ef4444' },
        { name: 'Breakeven', value: 0, color: '#6b7280' },
      ],
    }
  }

  // Sort trades chronologically by date
  const sortedTrades = [...trades].sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime())

  let netProfit = 0
  let winningTrades = 0
  let losingTrades = 0
  let breakevenTrades = 0
  let totalProfit = 0
  let totalLoss = 0
  let largestWin = 0
  let largestLoss = 0

  let sumRR = 0
  let validRRCount = 0
  let bestRR = 0
  let worstRR = Infinity

  const pairMap = new Map<string, { totalPnl: number; tradesCount: number; wins: number; losses: number; sumWinPnl: number; sumLossPnl: number }>()
  const strategyMap = new Map<string, { totalPnl: number; tradesCount: number; wins: number; losses: number; profitPnl: number; lossPnl: number }>()
  const dailyMap = new Map<string, { pnl: number; trades: number; wins: number }>()
  const monthlyMap = new Map<string, { pnl: number; trades: number; wins: number }>()
  const weeklyMap = new Map<string, { pnl: number; trades: number; wins: number }>()
  const hourlyMap = new Map<number, { pnl: number; trades: number }>()
  const weekdayMap = new Map<number, { pnl: number; trades: number; wins: number }>()

  const sessionPnl = {
    Asian: { pnl: 0, trades: 0, wins: 0 },
    London: { pnl: 0, trades: 0, wins: 0 },
    'New York': { pnl: 0, trades: 0, wins: 0 },
    Other: { pnl: 0, trades: 0, wins: 0 },
  }

  // Equity & Drawdown Curve
  let peakEquity = 0
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  let runningEquity = 0

  const equityCurve: EquityPoint[] = [{ tradeIndex: 0, date: 'Start', label: 'Start', pnl: 0, cumulativePnl: 0 }]
  const drawdownCurve: DrawdownPoint[] = [{ tradeIndex: 0, date: 'Start', drawdown: 0, drawdownPercent: 0 }]

  // Streaks
  let currentWinStreak = 0
  let longestWinStreak = 0
  let currentLosingStreak = 0
  let longestLosingStreak = 0

  sortedTrades.forEach((trade, idx) => {
    const pnl = Number(trade.profitLoss) || 0
    netProfit += pnl
    runningEquity += pnl

    const d = getTradeDate(trade)
    const dateStr = formatPeriodDate(d)

    // Equity Curve & Drawdown
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity
    }
    const currentDrawdown = peakEquity - runningEquity
    const currentDrawdownPct = peakEquity > 0 ? (currentDrawdown / peakEquity) * 100 : 0

    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown
      maxDrawdownPercent = currentDrawdownPct
    }

    equityCurve.push({
      tradeIndex: idx + 1,
      date: dateStr,
      label: `#${idx + 1} (${dateStr})`,
      pnl,
      cumulativePnl: runningEquity,
    })

    drawdownCurve.push({
      tradeIndex: idx + 1,
      date: dateStr,
      drawdown: -currentDrawdown,
      drawdownPercent: -currentDrawdownPct,
    })

    // Win / Loss / Breakeven classification
    if (pnl > 0 || trade.status === 'Win') {
      winningTrades++
      totalProfit += Math.max(pnl, 0)
      if (pnl > largestWin) largestWin = pnl

      currentWinStreak++
      currentLosingStreak = 0
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak
    } else if (pnl < 0 || trade.status === 'Loss') {
      losingTrades++
      totalLoss += Math.abs(pnl)
      if (pnl < largestLoss) largestLoss = pnl

      currentLosingStreak++
      currentWinStreak = 0
      if (currentLosingStreak > longestLosingStreak) longestLosingStreak = currentLosingStreak
    } else {
      breakevenTrades++
      currentWinStreak = 0
      currentLosingStreak = 0
    }

    // Risk / Reward
    const rr = Number(trade.rrRatio)
    if (!isNaN(rr) && rr > 0) {
      sumRR += rr
      validRRCount++
      if (rr > bestRR) bestRR = rr
      if (rr < worstRR) worstRR = rr
    }

    // Pair Statistics
    const symbol = (trade.pair || 'Unknown').toUpperCase().trim()
    const pData = pairMap.get(symbol) || { totalPnl: 0, tradesCount: 0, wins: 0, losses: 0, sumWinPnl: 0, sumLossPnl: 0 }
    pData.totalPnl += pnl
    pData.tradesCount++
    if (pnl > 0) {
      pData.wins++
      pData.sumWinPnl += pnl
    } else if (pnl < 0) {
      pData.losses++
      pData.sumLossPnl += Math.abs(pnl)
    }
    pairMap.set(symbol, pData)

    // Strategy Statistics
    const stratName = (trade.strategy || 'General / Unclassified').trim()
    const sData = strategyMap.get(stratName) || { totalPnl: 0, tradesCount: 0, wins: 0, losses: 0, profitPnl: 0, lossPnl: 0 }
    sData.totalPnl += pnl
    sData.tradesCount++
    if (pnl > 0) {
      sData.wins++
      sData.profitPnl += pnl
    } else if (pnl < 0) {
      sData.losses++
      sData.lossPnl += Math.abs(pnl)
    }
    strategyMap.set(stratName, sData)

    // Time & Session Statistics
    if (d.getTime() > 0) {
      const hour = toISTHour(d)
      const hData = hourlyMap.get(hour) || { pnl: 0, trades: 0 }
      hData.pnl += pnl
      hData.trades++
      hourlyMap.set(hour, hData)

      const dayIdx = toISTDayOfWeek(d)
      const wdData = weekdayMap.get(dayIdx) || { pnl: 0, trades: 0, wins: 0 }
      wdData.pnl += pnl
      wdData.trades++
      if (pnl > 0) wdData.wins++
      weekdayMap.set(dayIdx, wdData)

      // Session classification (UTC base remains standard)
      const utcHour = d.getUTCHours()
      let session: 'Asian' | 'London' | 'New York' | 'Other' = 'Other'
      if (utcHour >= 23 || utcHour < 8) session = 'Asian'
      else if (utcHour >= 7 && utcHour < 16) session = 'London'
      else if (utcHour >= 12 && utcHour < 21) session = 'New York'
      sessionPnl[session].pnl += pnl
      sessionPnl[session].trades++
      if (pnl > 0) sessionPnl[session].wins++

      // Daily aggregation
      const dayData = dailyMap.get(dateStr) || { pnl: 0, trades: 0, wins: 0 }
      dayData.pnl += pnl
      dayData.trades++
      if (pnl > 0) dayData.wins++
      dailyMap.set(dateStr, dayData)

      // Monthly aggregation (YYYY-MM)
      const monthStr = dateStr.slice(0, 7)
      const monthData = monthlyMap.get(monthStr) || { pnl: 0, trades: 0, wins: 0 }
      monthData.pnl += pnl
      monthData.trades++
      if (pnl > 0) monthData.wins++
      monthlyMap.set(monthStr, monthData)

      // Weekly aggregation
      const weekStr = getIsoWeekKey(d)
      const weekData = weeklyMap.get(weekStr) || { pnl: 0, trades: 0, wins: 0 }
      weekData.pnl += pnl
      weekData.trades++
      if (pnl > 0) weekData.wins++
      weeklyMap.set(weekStr, weekData)
    }
  })

  const totalTrades = sortedTrades.length
  const totalClosedTrades = winningTrades + losingTrades + breakevenTrades || totalTrades
  const winRate = totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0
  const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0
  const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0
  const expectancy = totalTrades > 0 ? netProfit / totalTrades : 0
  const averageRR = validRRCount > 0 ? sumRR / validRRCount : 0
  if (worstRR === Infinity) worstRR = 0

  // Pair Performance Array
  const pairStats: SymbolPerformance[] = Array.from(pairMap.entries()).map(([symbol, stat]) => ({
    symbol,
    totalPnl: stat.totalPnl,
    tradesCount: stat.tradesCount,
    wins: stat.wins,
    losses: stat.losses,
    winRate: stat.tradesCount > 0 ? (stat.wins / stat.tradesCount) * 100 : 0,
    avgWin: stat.wins > 0 ? stat.sumWinPnl / stat.wins : 0,
    avgLoss: stat.losses > 0 ? stat.sumLossPnl / stat.losses : 0,
  })).sort((a, b) => b.totalPnl - a.totalPnl)

  const bestPair = pairStats.length > 0 ? pairStats[0] : null
  const worstPair = pairStats.length > 0 ? pairStats[pairStats.length - 1] : null

  // Strategy Performance Array
  const strategyStats: StrategyPerformance[] = Array.from(strategyMap.entries()).map(([strategy, stat]) => ({
    strategy,
    totalPnl: stat.totalPnl,
    tradesCount: stat.tradesCount,
    wins: stat.wins,
    losses: stat.losses,
    winRate: stat.tradesCount > 0 ? (stat.wins / stat.tradesCount) * 100 : 0,
    profitFactor: stat.lossPnl > 0 ? stat.profitPnl / stat.lossPnl : stat.profitPnl > 0 ? Infinity : 0,
  })).sort((a, b) => b.totalPnl - a.totalPnl)

  // Session Stats Array
  const sessionStats: SessionPerformance[] = (['Asian', 'London', 'New York', 'Other'] as const).map(sKey => ({
    session: sKey,
    pnl: sessionPnl[sKey].pnl,
    trades: sessionPnl[sKey].trades,
    winRate: sessionPnl[sKey].trades > 0 ? (sessionPnl[sKey].wins / sessionPnl[sKey].trades) * 100 : 0,
  }))

  // Hourly Stats Array (24 Hours)
  const hourlyStats: HourlyPerformance[] = Array.from({ length: 24 }, (_, h) => {
    const hData = hourlyMap.get(h) || { pnl: 0, trades: 0 }
    return {
      hour: h,
      hourLabel: `${h.toString().padStart(2, '0')}:00`,
      pnl: hData.pnl,
      trades: hData.trades,
    }
  })

  // Weekday Stats Array
  const weekdayStats: WeekdayPerformance[] = WEEKDAY_NAMES.map((dayName, dayIndex) => {
    const wdData = weekdayMap.get(dayIndex) || { pnl: 0, trades: 0, wins: 0 }
    return {
      dayName,
      dayIndex,
      pnl: wdData.pnl,
      trades: wdData.trades,
      winRate: wdData.trades > 0 ? (wdData.wins / wdData.trades) * 100 : 0,
    }
  })

  // Records (Best Day & Worst Day)
  let bestDay: DayRecord | null = null
  let worstDay: DayRecord | null = null

  dailyMap.forEach((val, dateKey) => {
    if (!bestDay || val.pnl > bestDay.pnl) {
      bestDay = { date: dateKey, pnl: val.pnl, tradesCount: val.trades }
    }
    if (!worstDay || val.pnl < worstDay.pnl) {
      worstDay = { date: dateKey, pnl: val.pnl, tradesCount: val.trades }
    }
  })

  // Chart Points
  const monthlyProfit: PeriodPnlPoint[] = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, stat]) => ({
      period: m,
      pnl: stat.pnl,
      trades: stat.trades,
      winRate: stat.trades > 0 ? (stat.wins / stat.trades) * 100 : 0,
    }))

  const weeklyPerformance: PeriodPnlPoint[] = Array.from(weeklyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([w, stat]) => ({
      period: w,
      pnl: stat.pnl,
      trades: stat.trades,
      winRate: stat.trades > 0 ? (stat.wins / stat.trades) * 100 : 0,
    }))

  const dailyPnL: PeriodPnlPoint[] = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([d, stat]) => ({
      period: d,
      pnl: stat.pnl,
      trades: stat.trades,
      winRate: stat.trades > 0 ? (stat.wins / stat.trades) * 100 : 0,
    }))

  const winLossPie: PieChartPoint[] = [
    { name: 'Wins', value: winningTrades, color: '#10b981' },
    { name: 'Losses', value: losingTrades, color: '#ef4444' },
    { name: 'Breakeven', value: breakevenTrades, color: '#6b7280' },
  ]

  return {
    netProfit,
    grossProfit: totalProfit,
    grossLoss: totalLoss,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    totalProfit,
    totalLoss,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    expectancy,
    averageHoldingTimeMinutes: 0,
    profitFactor,
    maxDrawdown,
    maxDrawdownPercent,
    averageRR,
    bestRR,
    worstRR,
    bestPair,
    worstPair,
    pairStats,
    strategyStats,
    sessionStats,
    hourlyStats,
    weekdayStats,
    bestDay,
    worstDay,
    longestWinStreak,
    longestLosingStreak,
    equityCurve,
    drawdownCurve,
    monthlyProfit,
    weeklyPerformance,
    dailyPnL,
    winLossPie,
  }
}

function getIsoWeekKey(d: Date): string {
  // Shift to IST timezone values and use UTC methods to avoid runtime local timezone variance
  const date = new Date(d.getTime() + 5.5 * 60 * 60 * 1000)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7))
  const week1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7)
  return `${date.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}
