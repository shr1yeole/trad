import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { Timestamp } from 'firebase/firestore'
import { toISTDateString } from '@/lib/tz'

export interface DetectedRiskFlag {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface RiskOutput {
  riskScore: number // 0 (safest) to 100 (highest risk)
  riskLevel: 'Low' | 'Medium' | 'High'
  detectedRisks: DetectedRiskFlag[]
  revengeTradingDetected: boolean
  overtradingDetected: boolean
  consecutiveLossesDetected: boolean
  poorRiskRewardDetected: boolean
  largeDrawdownDetected: boolean
}

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function calculateRiskAnalysis(trades: Trade[], analytics: AnalyticsSummary): RiskOutput {
  if (!trades || trades.length === 0) {
    return {
      riskScore: 10,
      riskLevel: 'Low',
      detectedRisks: [],
      revengeTradingDetected: false,
      overtradingDetected: false,
      consecutiveLossesDetected: false,
      poorRiskRewardDetected: false,
      largeDrawdownDetected: false,
    }
  }

  const sortedTrades = [...trades].sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime())
  const detectedRisks: DetectedRiskFlag[] = []

  let riskScorePoints = 0

  // 1. Consecutive Losses Detection
  let currentLosses = 0
  let maxConsecutiveLosses = 0
  sortedTrades.forEach(t => {
    const pnl = Number(t.profitLoss) || 0
    if (pnl < 0 || t.status === 'Loss') {
      currentLosses++
      if (currentLosses > maxConsecutiveLosses) maxConsecutiveLosses = currentLosses
    } else if (pnl > 0 || t.status === 'Win') {
      currentLosses = 0
    }
  })

  const consecutiveLossesDetected = maxConsecutiveLosses >= 3
  if (consecutiveLossesDetected) {
    riskScorePoints += 25
    detectedRisks.push({
      id: 'consecutive_losses',
      title: 'Consecutive Losses Detected',
      description: `You encountered ${maxConsecutiveLosses} consecutive losing trades. Consider reducing lot size after 2 losses.`,
      severity: maxConsecutiveLosses >= 4 ? 'high' : 'medium',
    })
  }

  // 2. Overtrading Detection (Days with > 5 trades)
  const dailyCounts = new Map<string, number>()
  sortedTrades.forEach(t => {
    const d = getTradeDate(t)
    if (d.getTime() > 0) {
      const iso = toISTDateString(d)
      dailyCounts.set(iso, (dailyCounts.get(iso) || 0) + 1)
    }
  })

  let overtradedDays = 0
  dailyCounts.forEach(count => {
    if (count > 5) overtradedDays++
  })

  const overtradingDetected = overtradedDays > 0
  if (overtradingDetected) {
    riskScorePoints += 20
    detectedRisks.push({
      id: 'overtrading',
      title: 'Overtrading Pattern Detected',
      description: `Detected ${overtradedDays} day(s) with more than 5 trades executed. Set a maximum limit of 3 trades per day.`,
      severity: 'medium',
    })
  }

  // 3. Revenge Trading Detection (Fast re-entries right after a loss)
  let revengeCount = 0
  for (let i = 1; i < sortedTrades.length; i++) {
    const prev = sortedTrades[i - 1]
    const curr = sortedTrades[i]
    const prevPnl = Number(prev.profitLoss) || 0
    if (prevPnl < 0) {
      const t1 = getTradeDate(prev).getTime()
      const t2 = getTradeDate(curr).getTime()
      if (t2 > 0 && t1 > 0 && Math.abs(t2 - t1) <= 30 * 60 * 1000) {
        revengeCount++
      }
    }
  }

  const revengeTradingDetected = revengeCount > 0
  if (revengeTradingDetected) {
    riskScorePoints += 25
    detectedRisks.push({
      id: 'revenge_trading',
      title: 'Revenge Trading Behavior Detected',
      description: `Detected ${revengeCount} trade(s) entered within 30 minutes of a losing trade. Take a 15-minute break after every loss.`,
      severity: 'high',
    })
  }

  // 4. Poor Risk Reward Detection
  const poorRiskRewardDetected = analytics.averageRR > 0 && analytics.averageRR < 1.0
  if (poorRiskRewardDetected) {
    riskScorePoints += 20
    detectedRisks.push({
      id: 'poor_rr',
      title: 'Sub-Optimal Risk:Reward Ratio',
      description: `Your average R:R is 1:${analytics.averageRR.toFixed(2)}. Target a minimum risk-to-reward ratio of 1:1.5 or 1:2.0.`,
      severity: 'medium',
    })
  }

  // 5. Large Drawdown Detection
  const largeDrawdownDetected = analytics.maxDrawdownPercent > 10
  if (largeDrawdownDetected) {
    riskScorePoints += 25
    detectedRisks.push({
      id: 'large_drawdown',
      title: 'Significant Account Drawdown',
      description: `Your peak-to-trough drawdown reached ${analytics.maxDrawdownPercent.toFixed(1)}% ($${analytics.maxDrawdown.toFixed(2)}).`,
      severity: analytics.maxDrawdownPercent > 20 ? 'high' : 'medium',
    })
  }

  const riskScore = Math.min(100, riskScorePoints)
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
  if (riskScore >= 50) riskLevel = 'High'
  else if (riskScore >= 25) riskLevel = 'Medium'
  else riskLevel = 'Low'

  return {
    riskScore,
    riskLevel,
    detectedRisks,
    revengeTradingDetected,
    overtradingDetected,
    consecutiveLossesDetected,
    poorRiskRewardDetected,
    largeDrawdownDetected,
  }
}
