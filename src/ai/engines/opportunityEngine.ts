import { AnalyticsSummary } from '@/lib/analytics'
import { DisciplineAnalysis } from './disciplineEngine'
import { AIAlert } from './alertEngine'

export interface OpportunitySuggestion {
  id: string
  title: string
  description: string
  expectedImpact: 'High P&L Boost' | 'Risk Reduction' | 'Consistency Gain'
  actionableStep: string
}

export function generateOpportunities(
  analytics: AnalyticsSummary,
  discipline: DisciplineAnalysis,
  alerts: AIAlert[]
): OpportunitySuggestion[] {
  const suggestions: OpportunitySuggestion[] = []

  // 1. Session Opportunity
  const london = analytics.sessionStats.find(s => s.session === 'London')
  const ny = analytics.sessionStats.find(s => s.session === 'New York')

  if (london && london.winRate >= 50) {
    suggestions.push({
      id: 'opp_london',
      title: 'Capitalize on London Session Edge',
      description: `London session yields a ${london.winRate.toFixed(0)}% win rate for you. Align your core trade setups during London market open.`,
      expectedImpact: 'High P&L Boost',
      actionableStep: 'Focus primary entries between 07:00 and 11:00 UTC.',
    })
  }

  if (ny && ny.pnl < 0) {
    suggestions.push({
      id: 'opp_reduce_ny',
      title: 'Reduce New York Session Exposure',
      description: `New York session trades currently show negative expectancy (-$${Math.abs(ny.pnl).toFixed(2)}).`,
      expectedImpact: 'Risk Reduction',
      actionableStep: 'Half position size or refrain from taking new trades during NY off-hours.',
    })
  }

  // 2. Best Asset Opportunity
  if (analytics.bestPair && analytics.bestPair.totalPnl > 0) {
    suggestions.push({
      id: 'opp_focus_best_asset',
      title: `Double Down on ${analytics.bestPair.symbol}`,
      description: `${analytics.bestPair.symbol} is your highest yielding instrument (+$${analytics.bestPair.totalPnl.toFixed(2)} net profit).`,
      expectedImpact: 'High P&L Boost',
      actionableStep: `Prioritize ${analytics.bestPair.symbol} setups over secondary pairs.`,
    })
  }

  // 3. RR Optimization
  if (analytics.averageRR < 2.0) {
    suggestions.push({
      id: 'opp_rr_boost',
      title: 'Target Minimum 1:2 Risk-to-Reward Ratio',
      description: `Increasing your average R:R from 1:${analytics.averageRR.toFixed(2)} to 1:2.0 will significantly boost total expectancy.`,
      expectedImpact: 'Consistency Gain',
      actionableStep: 'Refuse trades where the first target is less than 2x your stop distance.',
    })
  }

  // 4. Discipline & Risk Reduction
  if (discipline.disciplineScore < 80) {
    suggestions.push({
      id: 'opp_discipline',
      title: 'Elevate Pre-Trade Checklist Discipline',
      description: `Improving your discipline score to 85+ will eliminate unforced execution errors.`,
      expectedImpact: 'Risk Reduction',
      actionableStep: 'Require all 4 checklist rules to be checked before placing orders.',
    })
  }

  return suggestions
}
