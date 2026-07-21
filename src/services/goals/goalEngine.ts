import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { TradingGoals } from './types'
import { Timestamp } from 'firebase/firestore'
import { toISTDateString, toISTMonthString, weekStartIST } from '@/lib/tz'

export interface GoalProgressItem {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: '$' | '%' | 'ratio' | 'score'
  progressPercent: number // 0 to 100
  isAchieved: boolean
}

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function calculateGoalProgress(
  trades: Trade[],
  analytics: AnalyticsSummary,
  goals: TradingGoals
): GoalProgressItem[] {
  const todayStr = toISTDateString()
  const currentMonthStr = toISTMonthString()

  const weekAgo = weekStartIST()

  // Today's, Weekly & Monthly P&L
  let todayPnl = 0
  let currentWeekPnl = 0
  let currentMonthPnl = 0
  trades.forEach(t => {
    const pnl = Number(t.profitLoss) || 0
    const d = getTradeDate(t)
    if (d.getTime() > 0) {
      const iso = toISTDateString(d)
      if (iso === todayStr) todayPnl += pnl
      if (d >= weekAgo) currentWeekPnl += pnl
      if (iso.startsWith(currentMonthStr)) currentMonthPnl += pnl
    }
  })

  // 1. Daily Profit
  const dailyProg = goals.dailyProfitGoal > 0 ? Math.min(100, Math.max(0, (todayPnl / goals.dailyProfitGoal) * 100)) : 0

  // 2. Weekly Profit
  const weeklyProg = goals.weeklyProfitGoal > 0 ? Math.min(100, Math.max(0, (currentWeekPnl / goals.weeklyProfitGoal) * 100)) : 0

  // 3. Monthly Profit
  const monthlyProg = goals.monthlyProfitGoal > 0 ? Math.min(100, Math.max(0, (currentMonthPnl / goals.monthlyProfitGoal) * 100)) : 0

  // 4. Yearly Profit
  const yearlyProg = goals.yearlyProfitGoal > 0 ? Math.min(100, Math.max(0, (analytics.netProfit / goals.yearlyProfitGoal) * 100)) : 0

  // 5. Win Rate Goal
  const wrProg = goals.winRateGoal > 0 ? Math.min(100, Math.max(0, (analytics.winRate / goals.winRateGoal) * 100)) : 0

  // 6. Avg RR Goal
  const rrProg = goals.avgRrGoal > 0 ? Math.min(100, Math.max(0, (analytics.averageRR / goals.avgRrGoal) * 100)) : 0

  // 7. Max Drawdown Goal
  const ddAchieved = analytics.maxDrawdownPercent <= goals.maxDrawdownGoal
  const ddProg = ddAchieved ? 100 : Math.max(0, Math.round(100 - (analytics.maxDrawdownPercent - goals.maxDrawdownGoal) * 10))

  return [
    {
      id: 'daily_profit',
      title: 'Daily Profit Target',
      currentValue: todayPnl,
      targetValue: goals.dailyProfitGoal,
      unit: '$',
      progressPercent: dailyProg,
      isAchieved: todayPnl >= goals.dailyProfitGoal,
    },
    {
      id: 'weekly_profit',
      title: 'Weekly Profit Target',
      currentValue: currentWeekPnl,
      targetValue: goals.weeklyProfitGoal,
      unit: '$',
      progressPercent: weeklyProg,
      isAchieved: currentWeekPnl >= goals.weeklyProfitGoal,
    },
    {
      id: 'monthly_profit',
      title: 'Monthly Profit Target',
      currentValue: currentMonthPnl,
      targetValue: goals.monthlyProfitGoal,
      unit: '$',
      progressPercent: monthlyProg,
      isAchieved: currentMonthPnl >= goals.monthlyProfitGoal,
    },
    {
      id: 'yearly_profit',
      title: 'Yearly Profit Target',
      currentValue: analytics.netProfit,
      targetValue: goals.yearlyProfitGoal,
      unit: '$',
      progressPercent: yearlyProg,
      isAchieved: analytics.netProfit >= goals.yearlyProfitGoal,
    },
    {
      id: 'win_rate',
      title: 'Win Rate Target',
      currentValue: Number(analytics.winRate.toFixed(1)),
      targetValue: goals.winRateGoal,
      unit: '%',
      progressPercent: wrProg,
      isAchieved: analytics.winRate >= goals.winRateGoal,
    },
    {
      id: 'avg_rr',
      title: 'Average R:R Target',
      currentValue: Number(analytics.averageRR.toFixed(2)),
      targetValue: goals.avgRrGoal,
      unit: 'ratio',
      progressPercent: rrProg,
      isAchieved: analytics.averageRR >= goals.avgRrGoal,
    },
    {
      id: 'max_drawdown',
      title: 'Max Drawdown Target',
      currentValue: Number(analytics.maxDrawdownPercent.toFixed(1)),
      targetValue: goals.maxDrawdownGoal,
      unit: '%',
      progressPercent: ddProg,
      isAchieved: ddAchieved,
    },
  ]
}
