import { Trade } from '@/types/trade'

export interface RiskBehaviorFlag {
  id: string
  title: string
  description: string
  count: number
  severity: 'high' | 'medium' | 'low'
}

export interface DisciplineAnalysis {
  disciplineScore: number // 0 to 100
  checklistAdherencePercent: number
  mistakeFreeTradePercent: number
  riskBehaviorFlags: RiskBehaviorFlag[]
}

export function calculateDiscipline(trades: Trade[]): DisciplineAnalysis {
  if (!trades || trades.length === 0) {
    return {
      disciplineScore: 85,
      checklistAdherencePercent: 80,
      mistakeFreeTradePercent: 85,
      riskBehaviorFlags: [],
    }
  }

  const flags: RiskBehaviorFlag[] = []
  let cleanTrades = 0
  let totalChecklistChecked = 0

  let movedSlCount = 0
  let removedSlCount = 0
  let lotIncreaseAfterLossCount = 0
  let revengeTradeCount = 0

  trades.forEach((t, idx) => {
    const psych = t.psychologyData
    const mistakes = psych?.mistakeTags || []
    const checklist = psych?.checklist || []

    if (mistakes.length === 0) cleanTrades++
    totalChecklistChecked += checklist.length

    mistakes.forEach(m => {
      const lower = m.toLowerCase()
      if (lower.includes('moved stop') || lower.includes('moved sl')) movedSlCount++
      if (lower.includes('no stop') || lower.includes('removed sl') || lower.includes('no sl')) removedSlCount++
      if (lower.includes('revenge')) revengeTradeCount++
      if (lower.includes('overleveraged') || lower.includes('lot')) lotIncreaseAfterLossCount++
    })
  })

  if (movedSlCount > 0) {
    flags.push({
      id: 'flag_moved_sl',
      title: 'Moving Stop Loss Mid-Trade',
      description: `Moved Stop Loss wider on ${movedSlCount} trade(s), increasing downside loss risk.`,
      count: movedSlCount,
      severity: 'high',
    })
  }

  if (removedSlCount > 0) {
    flags.push({
      id: 'flag_no_sl',
      title: 'Executing Without Stop Loss',
      description: `Executed ${removedSlCount} trade(s) without an active Stop Loss defined.`,
      count: removedSlCount,
      severity: 'high',
    })
  }

  if (revengeTradeCount > 0) {
    flags.push({
      id: 'flag_revenge',
      title: 'Revenge Trading Impulse',
      description: `Revenge trading detected on ${revengeTradeCount} trade(s) following a loss.`,
      count: revengeTradeCount,
      severity: 'high',
    })
  }

  if (lotIncreaseAfterLossCount > 0) {
    flags.push({
      id: 'flag_lot_escalation',
      title: 'Position Escalation After Loss',
      description: `Increased lot size / leverage after losing trades on ${lotIncreaseAfterLossCount} occasion(s).`,
      count: lotIncreaseAfterLossCount,
      severity: 'medium',
    })
  }

  const totalTrades = trades.length
  const mistakeFreeTradePercent = Math.round((cleanTrades / totalTrades) * 100)
  const avgChecklistPerTrade = totalChecklistChecked / totalTrades
  const checklistAdherencePercent = Math.min(100, Math.round((avgChecklistPerTrade / 4) * 100))

  const penalties = movedSlCount * 10 + removedSlCount * 15 + revengeTradeCount * 12 + lotIncreaseAfterLossCount * 8
  const disciplineScore = Math.max(10, Math.min(100, Math.round(mistakeFreeTradePercent * 0.5 + checklistAdherencePercent * 0.5 - penalties / 2)))

  return {
    disciplineScore,
    checklistAdherencePercent,
    mistakeFreeTradePercent,
    riskBehaviorFlags: flags,
  }
}
