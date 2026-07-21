import { Trade } from '@/types/trade'
import { calculateAnalytics, AnalyticsSummary } from '@/lib/analytics'

export interface ScoreOutput {
  tradingScore: number
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
  healthStatus: 'Excellent' | 'Good' | 'Needs Improvement' | 'High Risk'
  consistencyScore: number
  summaryStatement: string
}

export function calculateTradingScore(trades: Trade[], analytics: AnalyticsSummary): ScoreOutput {
  if (!trades || trades.length === 0) {
    return {
      tradingScore: 80,
      letterGrade: 'B',
      healthStatus: 'Needs Improvement',
      consistencyScore: 50,
      summaryStatement: 'Log your first trades to generate a personalized AI trading score and health assessment.',
    }
  }

  // 1. Win Rate Score (0 to 30 pts)
  const wrScore = Math.min(30, (analytics.winRate / 100) * 30)

  // 2. Profit Factor Score (0 to 25 pts)
  const pf = analytics.profitFactor === Infinity ? 3 : analytics.profitFactor
  const pfScore = Math.min(25, (pf / 2.5) * 25)

  // 3. Drawdown Score (0 to 25 pts)
  const dd = analytics.maxDrawdownPercent
  const ddScore = Math.max(0, 25 - (dd / 20) * 25)

  // 4. Risk-Reward Score (0 to 20 pts)
  const rr = analytics.averageRR || 1
  const rrScore = Math.min(20, (rr / 2) * 20)

  const rawScore = Math.round(wrScore + pfScore + ddScore + rrScore)
  const tradingScore = Math.max(10, Math.min(100, rawScore))

  // Letter Grade
  let letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C'
  if (tradingScore >= 90) letterGrade = 'A+'
  else if (tradingScore >= 80) letterGrade = 'A'
  else if (tradingScore >= 70) letterGrade = 'B'
  else if (tradingScore >= 60) letterGrade = 'C'
  else letterGrade = 'D'

  // Health Status
  let healthStatus: 'Excellent' | 'Good' | 'Needs Improvement' | 'High Risk' = 'Good'
  if (tradingScore >= 85) healthStatus = 'Excellent'
  else if (tradingScore >= 70) healthStatus = 'Good'
  else if (tradingScore >= 55) healthStatus = 'Needs Improvement'
  else healthStatus = 'High Risk'

  // Consistency Score
  const consistencyScore = Math.round(Math.min(100, (analytics.winRate * 0.4) + (Math.min(analytics.totalTrades, 50) * 0.6)))

  // Summary statement generator
  let summaryStatement = ''
  if (analytics.netProfit > 0) {
    summaryStatement = `You are maintaining strong profitability with a ${analytics.winRate.toFixed(1)}% win rate and a ${analytics.profitFactor.toFixed(2)} profit factor.`
  } else if (analytics.maxDrawdownPercent > 15) {
    summaryStatement = `Your max drawdown has reached ${analytics.maxDrawdownPercent.toFixed(1)}%. Focus on protecting your capital and reducing position sizes.`
  } else {
    summaryStatement = `Your overall consistency is ${consistencyScore}%. Maintaining disciplined risk-to-reward will improve your trading grade.`
  }

  return {
    tradingScore,
    letterGrade,
    healthStatus,
    consistencyScore,
    summaryStatement,
  }
}
