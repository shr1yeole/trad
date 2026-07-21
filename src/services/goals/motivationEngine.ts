import { RuleMonitoringSummary } from './ruleEngine'
import { StreakData } from './types'

export interface MotivationalQuote {
  id: string
  title: string
  quote: string
  author: string
  category: 'Discipline' | 'Patience' | 'Risk Management' | 'Consistency'
}

export function generateMotivationalCard(
  ruleSummary: RuleMonitoringSummary,
  streaks: StreakData
): MotivationalQuote {
  if (ruleSummary.complianceRate >= 90) {
    return {
      id: 'mot_disc_high',
      title: 'Excellent Discipline Today',
      quote: 'Great job following your trading plan! Consistency and discipline are your ultimate edge in the markets.',
      author: 'TradeMind AI Coach',
      category: 'Discipline',
    }
  }

  if (ruleSummary.todayLoss > 0 && ruleSummary.complianceRate >= 70) {
    return {
      id: 'mot_protect_capital',
      title: 'Protect Your Capital',
      quote: 'Losses are simply the cost of doing business in trading. Stay patient, preserve capital, and wait for A+ setups.',
      author: 'Trading Rule #1',
      category: 'Risk Management',
    }
  }

  if (streaks.disciplineStreak >= 3) {
    return {
      id: 'mot_consistency',
      title: 'Consistency Creates Profitability',
      quote: `You are on a ${streaks.disciplineStreak}-day discipline streak. Small daily habit wins compound into long-term wealth.`,
      author: 'Market Wisdom',
      category: 'Consistency',
    }
  }

  return {
    id: 'mot_focus_quality',
    title: 'Focus on Quality Setups',
    quote: 'Refuse sub-optimal setups. Execution quality matters far more than trade quantity.',
    author: 'TradeMind AI',
    category: 'Patience',
  }
}
