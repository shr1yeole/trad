import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { RiskOutput } from './riskEngine'
import { PerformanceOutput } from './performanceEngine'
import { PsychologyOutput } from './psychologyEngine'

export interface Recommendation {
  id: string
  category: 'Risk' | 'Strategy' | 'Psychology' | 'Execution'
  title: string
  action: string
  priority: 'High' | 'Medium' | 'Low'
}

export function generateRecommendations(
  trades: Trade[],
  analytics: AnalyticsSummary,
  risk: RiskOutput,
  performance: PerformanceOutput,
  psychology: PsychologyOutput
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // 1. Risk-based recommendations
  if (risk.consecutiveLossesDetected) {
    recommendations.push({
      id: 'rec_reduce_lot',
      category: 'Risk',
      title: 'Reduce Lot Size After Consecutive Losses',
      action: 'Lower position size by 50% immediately following two consecutive losses until a win is logged.',
      priority: 'High',
    })
  }

  if (risk.overtradingDetected) {
    recommendations.push({
      id: 'rec_max_trades',
      category: 'Execution',
      title: 'Cap Daily Execution to 3 Trades',
      action: 'Enforce a strict maximum limit of 3 trades per day to eliminate overtrading and preserve mental capital.',
      priority: 'High',
    })
  }

  if (risk.revengeTradingDetected) {
    recommendations.push({
      id: 'rec_cool_off',
      category: 'Psychology',
      title: 'Mandatory 15-Minute Cool-Off Break',
      action: 'Step away from trading screens for 15 minutes after taking a loss before looking for new setups.',
      priority: 'High',
    })
  }

  // 2. Risk-Reward recommendation
  if (analytics.averageRR > 0 && analytics.averageRR < 1.5) {
    recommendations.push({
      id: 'rec_min_rr',
      category: 'Strategy',
      title: 'Maintain Minimum 1:1.5 Risk-to-Reward Ratio',
      action: 'Refuse setups offering less than 1:1.5 RR. Let winners run to Take Profit target.',
      priority: 'Medium',
    })
  }

  // 3. Performance / Pair recommendations
  if (performance.worstPair && performance.worstPair.totalPnl < 0) {
    recommendations.push({
      id: 'rec_avoid_worst_pair',
      category: 'Strategy',
      title: `Pause Trading on ${performance.worstPair.symbol}`,
      action: `${performance.worstPair.symbol} has generated a net loss of $${Math.abs(performance.worstPair.totalPnl).toFixed(2)}. Focus capital on ${performance.bestPair?.symbol || 'your best pairs'}.`,
      priority: 'Medium',
    })
  }

  if (performance.bestSession) {
    recommendations.push({
      id: 'rec_focus_session',
      category: 'Execution',
      title: `Focus Execution During ${performance.bestSession.session} Session`,
      action: `Your highest win rate (${performance.bestSession.winRate.toFixed(0)}%) occurs during the ${performance.bestSession.session} session.`,
      priority: 'Low',
    })
  }

  // 4. Psychology / Mistake recommendations
  if (psychology.mostCommonMistake && psychology.mostCommonMistake !== 'None') {
    recommendations.push({
      id: 'rec_eliminate_mistake',
      category: 'Psychology',
      title: `Eliminate "${psychology.mostCommonMistake}" Entries`,
      action: `Add a pre-trade rule verifying you are not making a "${psychology.mostCommonMistake}" entry before clicking buy or sell.`,
      priority: 'High',
    })
  }

  // Default fallback recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec_default',
      category: 'Execution',
      title: 'Wait for Full Setup Confirmation',
      action: 'Always wait for candle closure on your entry timeframe before entering a trade.',
      priority: 'Medium',
    })
  }

  return recommendations
}
