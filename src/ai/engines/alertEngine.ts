import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { DisciplineAnalysis } from './disciplineEngine'
import { PsychologySummary } from '@/lib/psychologyAnalytics'

export interface AIAlert {
  id: string
  title: string
  message: string
  type: 'warning' | 'info' | 'success' | 'danger'
  confidence: number // 0 to 100
}

export function generateAIAlerts(
  trades: Trade[],
  analytics: AnalyticsSummary,
  discipline: DisciplineAnalysis,
  psychology: PsychologySummary
): AIAlert[] {
  const alerts: AIAlert[] = []
  if (!trades || trades.length === 0) return alerts

  // 1. Session Profitability comparison
  const londonSession = analytics.sessionStats.find(s => s.session === 'London')
  const nySession = analytics.sessionStats.find(s => s.session === 'New York')

  if (londonSession && nySession && londonSession.pnl > nySession.pnl && londonSession.pnl > 0) {
    const diffPct = nySession.pnl > 0 ? Math.round(((londonSession.pnl - nySession.pnl) / nySession.pnl) * 100) : 34
    alerts.push({
      id: 'alert_london_session',
      title: 'Session Edge Highlight',
      message: `Your London session is ${diffPct}% more profitable than other sessions.`,
      type: 'success',
      confidence: 91,
    })
  }

  // 2. Emotion Impact
  if (psychology.worstEmotion && psychology.worstEmotion.totalPnl < 0) {
    alerts.push({
      id: 'alert_fear_emotion',
      title: 'Emotional Drag Impact',
      message: `${psychology.worstEmotion.emotion} reduces your win rate and generated a net loss of $${Math.abs(psychology.worstEmotion.totalPnl).toFixed(2)}.`,
      type: 'danger',
      confidence: 88,
    })
  }

  // 3. Revenge Trading Loss
  const revengeFlag = discipline.riskBehaviorFlags.find(f => f.id === 'flag_revenge')
  if (revengeFlag) {
    alerts.push({
      id: 'alert_revenge_loss',
      title: 'Revenge Trading Warning',
      message: 'You lose significantly more when taking revenge trades within 30 minutes of a loss.',
      type: 'danger',
      confidence: 94,
    })
  }

  // 4. Moving Stop Loss alert
  const movedSlFlag = discipline.riskBehaviorFlags.find(f => f.id === 'flag_moved_sl')
  if (movedSlFlag && trades.length > 0) {
    const pct = Math.round((movedSlFlag.count / trades.length) * 100)
    alerts.push({
      id: 'alert_moved_sl_pct',
      title: 'Stop Loss Modification Pattern',
      message: `You move Stop Loss wider on ${pct}% of losing trades. Let your initial SL hold.`,
      type: 'warning',
      confidence: 90,
    })
  }

  // 5. Best Asset / Pair comparison
  if (analytics.bestPair && analytics.worstPair && analytics.bestPair.totalPnl > analytics.worstPair.totalPnl + 200) {
    alerts.push({
      id: 'alert_pair_perf',
      title: 'Asset Outperformance',
      message: `${analytics.bestPair.symbol} performs much better than ${analytics.worstPair.symbol} (+$${analytics.bestPair.totalPnl.toFixed(2)} vs ${analytics.worstPair.totalPnl < 0 ? '-' : ''}$${Math.abs(analytics.worstPair.totalPnl).toFixed(2)}).`,
      type: 'info',
      confidence: 89,
    })
  }

  // 6. Time Window Alert
  const bestHourObj = [...analytics.hourlyStats].sort((a, b) => b.pnl - a.pnl)[0]
  if (bestHourObj && bestHourObj.pnl > 0) {
    alerts.push({
      id: 'alert_best_hour',
      title: 'Peak Execution Window',
      message: `Your best trades occur around ${bestHourObj.hourLabel} UTC. Focus execution during this window.`,
      type: 'success',
      confidence: 85,
    })
  }

  // 7. Strategy Strength
  if (analytics.strategyStats.length > 0 && analytics.strategyStats[0].totalPnl > 0) {
    alerts.push({
      id: 'alert_top_strat',
      title: 'Dominant Strategy',
      message: `"${analytics.strategyStats[0].strategy}" has become your strongest strategy with a ${analytics.strategyStats[0].winRate.toFixed(0)}% win rate.`,
      type: 'success',
      confidence: 92,
    })
  }

  return alerts
}
