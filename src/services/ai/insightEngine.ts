import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { ScoreOutput } from './scoreEngine'
import { RiskOutput } from './riskEngine'
import { PerformanceOutput } from './performanceEngine'
import { PsychologyOutput } from './psychologyEngine'

export interface TradingHabits {
  avgTradesPerDay: number
  avgTradesPerWeek: number
  favoritePair: string
  favoriteSession: string
  favoriteStrategy: string
  mostActiveHour: string
}

export interface WeeklyReport {
  weeklyGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
  totalTrades: number
  profit: number
  loss: number
  winRate: number
  largestWin: number
  largestLoss: number
  bestPair: string
  worstPair: string
  mostCommonMistake: string
  keyImprovement: string
}

export interface MonthlyReport {
  monthlyScore: number
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
  topStrengths: string[]
  topWeaknesses: string[]
  psychologySummary: string
  riskSummary: string
  recommendedFocus: string
}

export interface SmartAlert {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
}

export interface FullAIInsightReport {
  score: ScoreOutput
  risk: RiskOutput
  performance: PerformanceOutput
  psychology: PsychologyOutput
  habits: TradingHabits
  weeklyReport: WeeklyReport
  monthlyReport: MonthlyReport
  alerts: SmartAlert[]
}

export function generateFullAIReport(
  trades: Trade[],
  analytics: AnalyticsSummary,
  score: ScoreOutput,
  risk: RiskOutput,
  performance: PerformanceOutput,
  psychology: PsychologyOutput
): FullAIInsightReport {
  const totalTrades = trades.length

  // 1. Trading Habits
  const daysActive = Math.max(1, Math.ceil(totalTrades / 3))
  const avgTradesPerDay = Number((totalTrades / daysActive).toFixed(1))
  const avgTradesPerWeek = Number((avgTradesPerDay * 5).toFixed(1))

  const favoritePair = performance.bestPair ? performance.bestPair.symbol : (analytics.pairStats[0]?.symbol || 'BTC/USD')
  const favoriteSession = performance.bestSession ? performance.bestSession.session : 'London'
  const favoriteStrategy = analytics.strategyStats[0]?.strategy || 'Breakout Retest'

  // Most active hour
  const busiestHourObj = [...analytics.hourlyStats].sort((a, b) => b.trades - a.trades)[0]
  const mostActiveHour = busiestHourObj ? busiestHourObj.hourLabel : '14:00'

  const habits: TradingHabits = {
    avgTradesPerDay,
    avgTradesPerWeek,
    favoritePair,
    favoriteSession,
    favoriteStrategy,
    mostActiveHour,
  }

  // 2. Weekly Report
  const weeklyReport: WeeklyReport = {
    weeklyGrade: score.letterGrade,
    totalTrades: analytics.totalTrades,
    profit: analytics.grossProfit,
    loss: analytics.grossLoss,
    winRate: analytics.winRate,
    largestWin: analytics.largestWin,
    largestLoss: analytics.largestLoss,
    bestPair: performance.bestPair ? performance.bestPair.symbol : '—',
    worstPair: performance.worstPair ? performance.worstPair.symbol : '—',
    mostCommonMistake: psychology.mostCommonMistake,
    keyImprovement: risk.revengeTradingDetected
      ? 'Avoid fast re-entries right after taking a loss.'
      : 'Maintain minimum 1:1.5 RR on every trade.',
  }

  // 3. Monthly Report
  const topStrengths: string[] = []
  if (analytics.winRate >= 55) topStrengths.push(`High win rate of ${analytics.winRate.toFixed(1)}%`)
  if (analytics.profitFactor >= 1.5) topStrengths.push(`Solid profit factor of ${analytics.profitFactor.toFixed(2)}`)
  if (psychology.disciplineScore >= 80) topStrengths.push(`Strong discipline score of ${psychology.disciplineScore}/100`)
  if (topStrengths.length === 0) topStrengths.push('Regular trade logging and journaling')

  const topWeaknesses: string[] = []
  if (risk.consecutiveLossesDetected) topWeaknesses.push('Susceptible to loss streaks')
  if (risk.overtradingDetected) topWeaknesses.push('Occasional overtrading')
  if (analytics.maxDrawdownPercent > 10) topWeaknesses.push(`Peak drawdown reached ${analytics.maxDrawdownPercent.toFixed(1)}%`)
  if (topWeaknesses.length === 0) topWeaknesses.push('Room to improve risk-to-reward ratio')

  const monthlyReport: MonthlyReport = {
    monthlyScore: score.tradingScore,
    overallGrade: score.letterGrade,
    topStrengths,
    topWeaknesses,
    psychologySummary: psychology.humanReadableInsights[0] || 'Maintain emotional calmness during market volatility.',
    riskSummary: `Risk Level is ${risk.riskLevel} with a risk score of ${risk.riskScore}/100.`,
    recommendedFocus: risk.consecutiveLossesDetected
      ? 'Focus on position sizing rules after losses.'
      : 'Focus on letting winning trades run to TP target.',
  }

  // 4. Smart Alerts
  const alerts: SmartAlert[] = []
  if (risk.consecutiveLossesDetected) {
    alerts.push({
      id: 'alert_streak',
      type: 'warning',
      title: 'Consecutive Loss Warning',
      message: 'Detected 3+ consecutive losses. Reduce position size on your next trade.',
      timestamp: 'Just now',
    })
  }

  if (performance.winRateTrend === 'Improving') {
    alerts.push({
      id: 'alert_wr_up',
      type: 'success',
      title: 'Win Rate Improving',
      message: `Your win rate has improved over recent trades! Keep following your plan.`,
      timestamp: 'Today',
    })
  }

  if (analytics.longestWinStreak >= 3) {
    alerts.push({
      id: 'alert_win_streak',
      type: 'info',
      title: 'Strong Winning Streak',
      message: `You achieved a win streak of ${analytics.longestWinStreak} trades. Maintain discipline and avoid overconfidence.`,
      timestamp: 'Active',
    })
  }

  if (risk.largeDrawdownDetected) {
    alerts.push({
      id: 'alert_dd',
      type: 'warning',
      title: 'Drawdown Warning',
      message: `Max Drawdown has reached ${analytics.maxDrawdownPercent.toFixed(1)}%. Protect capital.`,
      timestamp: 'Active',
    })
  }

  return {
    score,
    risk,
    performance,
    psychology,
    habits,
    weeklyReport,
    monthlyReport,
    alerts,
  }
}
