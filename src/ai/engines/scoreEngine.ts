import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { DisciplineAnalysis } from './disciplineEngine'
import { ConsistencyAnalysis } from './consistencyEngine'
import { PsychologySummary } from '@/lib/psychologyAnalytics'

export interface MultiScoreBreakdown {
  performanceScore: number // 0-100
  psychologyScore: number // 0-100
  riskScore: number // 0-100 (100 = safest)
  disciplineScore: number // 0-100
  consistencyScore: number // 0-100
  overallTradingScore: number // 0-100
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
  healthStatus: 'Excellent' | 'Good' | 'Needs Improvement' | 'High Risk'
  summaryStatement: string
}

export function calculateFullAIScore(
  trades: Trade[],
  analytics: AnalyticsSummary,
  discipline: DisciplineAnalysis,
  consistency: ConsistencyAnalysis,
  psychology: PsychologySummary
): MultiScoreBreakdown {
  if (!trades || trades.length === 0) {
    return {
      performanceScore: 75,
      psychologyScore: 80,
      riskScore: 85,
      disciplineScore: 85,
      consistencyScore: 80,
      overallTradingScore: 80,
      letterGrade: 'B',
      healthStatus: 'Needs Improvement',
      summaryStatement: 'Log your first trades to unlock full AI score engine breakdown.',
    }
  }

  // 1. Performance Score (0-100) based on Win Rate, Profit Factor, Expectancy
  const wrPart = Math.min(40, (analytics.winRate / 100) * 40)
  const pf = analytics.profitFactor === Infinity ? 3 : analytics.profitFactor
  const pfPart = Math.min(35, (pf / 2.5) * 35)
  const rrPart = Math.min(25, (analytics.averageRR / 2) * 25)
  const performanceScore = Math.round(wrPart + pfPart + rrPart)

  // 2. Psychology Score (0-100)
  const psychologyScore = Math.round(
    psychology.disciplineScore * 0.6 +
    (psychology.mostProfitableEmotion ? 25 : 15) +
    (psychology.totalMistakesLogged === 0 ? 15 : 5)
  )

  // 3. Risk Score (0-100, 100 = Safest)
  const ddPenalty = Math.min(40, analytics.maxDrawdownPercent * 2)
  const riskScore = Math.max(10, Math.round(100 - ddPenalty))

  // 4. Discipline Score
  const disciplineScore = discipline.disciplineScore

  // 5. Consistency Score
  const consistencyScore = consistency.consistencyScore

  // 6. Overall Trading Score
  const overallTradingScore = Math.round(
    performanceScore * 0.25 +
    psychologyScore * 0.20 +
    riskScore * 0.20 +
    disciplineScore * 0.20 +
    consistencyScore * 0.15
  )

  // Letter Grade
  let letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C'
  if (overallTradingScore >= 90) letterGrade = 'A+'
  else if (overallTradingScore >= 80) letterGrade = 'A'
  else if (overallTradingScore >= 70) letterGrade = 'B'
  else if (overallTradingScore >= 60) letterGrade = 'C'
  else letterGrade = 'D'

  // Health Status
  let healthStatus: 'Excellent' | 'Good' | 'Needs Improvement' | 'High Risk' = 'Good'
  if (overallTradingScore >= 85) healthStatus = 'Excellent'
  else if (overallTradingScore >= 70) healthStatus = 'Good'
  else if (overallTradingScore >= 55) healthStatus = 'Needs Improvement'
  else healthStatus = 'High Risk'

  let summaryStatement = ''
  if (analytics.netProfit > 0) {
    summaryStatement = `Overall Trading Score is ${overallTradingScore}/100 (${letterGrade} Grade). You are maintaining a ${analytics.winRate.toFixed(1)}% win rate with strong profitability.`
  } else {
    summaryStatement = `Overall Trading Score is ${overallTradingScore}/100 (${letterGrade} Grade). Focus on reducing drawdown and improving discipline.`
  }

  return {
    performanceScore,
    psychologyScore,
    riskScore,
    disciplineScore,
    consistencyScore,
    overallTradingScore,
    letterGrade,
    healthStatus,
    summaryStatement,
  }
}
