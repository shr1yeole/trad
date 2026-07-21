import { Trade } from '@/types/trade'
import { AnalyticsSummary, SymbolPerformance, StrategyPerformance, SessionPerformance, WeekdayPerformance } from '@/lib/analytics'

export interface PerformanceOutput {
  bestPair: SymbolPerformance | null
  worstPair: SymbolPerformance | null
  bestWeekday: WeekdayPerformance | null
  worstWeekday: WeekdayPerformance | null
  bestSession: SessionPerformance | null
  worstSession: SessionPerformance | null
  bestStrategy: StrategyPerformance | null
  worstStrategy: StrategyPerformance | null
  winRateTrend: 'Improving' | 'Declining' | 'Stable'
  rrTrend: 'Improving' | 'Declining' | 'Stable'
  profitTrend: 'Upward' | 'Downward' | 'Flat'
}

export function calculatePerformanceAnalysis(trades: Trade[], analytics: AnalyticsSummary): PerformanceOutput {
  if (!trades || trades.length === 0) {
    return {
      bestPair: null,
      worstPair: null,
      bestWeekday: null,
      worstWeekday: null,
      bestSession: null,
      worstSession: null,
      bestStrategy: null,
      worstStrategy: null,
      winRateTrend: 'Stable',
      rrTrend: 'Stable',
      profitTrend: 'Flat',
    }
  }

  // Weekdays
  const activeWeekdays = analytics.weekdayStats.filter(w => w.trades > 0)
  const sortedWeekdays = [...activeWeekdays].sort((a, b) => b.pnl - a.pnl)
  const bestWeekday = sortedWeekdays.length > 0 ? sortedWeekdays[0] : null
  const worstWeekday = sortedWeekdays.length > 0 ? sortedWeekdays[sortedWeekdays.length - 1] : null

  // Sessions
  const activeSessions = analytics.sessionStats.filter(s => s.trades > 0)
  const sortedSessions = [...activeSessions].sort((a, b) => b.pnl - a.pnl)
  const bestSession = sortedSessions.length > 0 ? sortedSessions[0] : null
  const worstSession = sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1] : null

  // Strategies
  const bestStrategy = analytics.strategyStats.length > 0 ? analytics.strategyStats[0] : null
  const worstStrategy = analytics.strategyStats.length > 0 ? analytics.strategyStats[analytics.strategyStats.length - 1] : null

  // Trend detection (Compare last 10 trades vs prior trades)
  let winRateTrend: 'Improving' | 'Declining' | 'Stable' = 'Stable'
  let rrTrend: 'Improving' | 'Declining' | 'Stable' = 'Stable'
  let profitTrend: 'Upward' | 'Downward' | 'Flat' = 'Flat'

  if (trades.length >= 6) {
    const recent = trades.slice(-5)
    const prior = trades.slice(0, -5)

    const recentWins = recent.filter(t => (Number(t.profitLoss) > 0 || t.status === 'Win')).length
    const priorWins = prior.filter(t => (Number(t.profitLoss) > 0 || t.status === 'Win')).length

    const recentWR = (recentWins / recent.length) * 100
    const priorWR = (priorWins / prior.length) * 100

    if (recentWR > priorWR + 10) winRateTrend = 'Improving'
    else if (recentWR < priorWR - 10) winRateTrend = 'Declining'

    const recentNet = recent.reduce((sum, t) => sum + (Number(t.profitLoss) || 0), 0)
    if (recentNet > 0) profitTrend = 'Upward'
    else if (recentNet < 0) profitTrend = 'Downward'
  }

  return {
    bestPair: analytics.bestPair,
    worstPair: analytics.worstPair,
    bestWeekday,
    worstWeekday,
    bestSession,
    worstSession,
    bestStrategy,
    worstStrategy,
    winRateTrend,
    rrTrend,
    profitTrend,
  }
}
