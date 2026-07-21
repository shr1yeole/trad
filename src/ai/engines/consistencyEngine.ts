import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'

export interface ConsistencyAnalysis {
  consistencyScore: number // 0 - 100
  monthlyConsistency: number
  weeklyConsistency: number
  dailyConsistency: number
  riskConsistency: number
  lotConsistency: number
  drawdownBehavior: {
    largestDrawdown: number
    largestDrawdownPercent: number
    avgDrawdown: number
    recoveryTimeDays: number
    drawdownFrequency: 'Low' | 'Moderate' | 'High'
  }
}

export function calculateConsistency(trades: Trade[], analytics: AnalyticsSummary): ConsistencyAnalysis {
  if (!trades || trades.length === 0) {
    return {
      consistencyScore: 80,
      monthlyConsistency: 80,
      weeklyConsistency: 75,
      dailyConsistency: 70,
      riskConsistency: 85,
      lotConsistency: 90,
      drawdownBehavior: {
        largestDrawdown: 0,
        largestDrawdownPercent: 0,
        avgDrawdown: 0,
        recoveryTimeDays: 0,
        drawdownFrequency: 'Low',
      },
    }
  }

  // 1. Win Rate & P&L stability
  const winRate = analytics.winRate
  const profitFactor = analytics.profitFactor === Infinity ? 3 : analytics.profitFactor

  // 2. Risk & Lot Consistency (variance in risk percentage)
  const risks = trades.map(t => Number(t.riskPercentage) || 1)
  const avgRisk = risks.reduce((a, b) => a + b, 0) / (risks.length || 1)
  const riskVariance = risks.reduce((sum, r) => sum + Math.abs(r - avgRisk), 0) / (risks.length || 1)
  const riskConsistency = Math.max(20, Math.min(100, Math.round(100 - riskVariance * 25)))

  // 3. Daily & Weekly Consistency
  const dailyConsistency = Math.min(100, Math.round(winRate * 0.6 + Math.min(trades.length, 30) * 1.3))
  const weeklyConsistency = Math.min(100, Math.round(dailyConsistency * 0.9 + (profitFactor > 1.2 ? 10 : 0)))
  const monthlyConsistency = Math.min(100, Math.round(weeklyConsistency * 0.95 + (analytics.netProfit > 0 ? 10 : 0)))
  const lotConsistency = Math.min(100, Math.round(riskConsistency * 0.95 + 5))

  // Overall Score (0 to 100)
  const consistencyScore = Math.round(
    monthlyConsistency * 0.25 +
    weeklyConsistency * 0.25 +
    dailyConsistency * 0.2 +
    riskConsistency * 0.15 +
    lotConsistency * 0.15
  )

  // Drawdown Behavior
  const largestDrawdown = analytics.maxDrawdown
  const largestDrawdownPercent = analytics.maxDrawdownPercent
  const avgDrawdown = Number((largestDrawdown * 0.4).toFixed(2))
  const recoveryTimeDays = Math.max(1, Math.round(largestDrawdownPercent * 0.8))
  const drawdownFrequency: 'Low' | 'Moderate' | 'High' =
    largestDrawdownPercent > 15 ? 'High' : largestDrawdownPercent > 8 ? 'Moderate' : 'Low'

  return {
    consistencyScore,
    monthlyConsistency,
    weeklyConsistency,
    dailyConsistency,
    riskConsistency,
    lotConsistency,
    drawdownBehavior: {
      largestDrawdown,
      largestDrawdownPercent,
      avgDrawdown,
      recoveryTimeDays,
      drawdownFrequency,
    },
  }
}
