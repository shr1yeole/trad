import { Trade } from '@/types/trade'
import { RiskRules, CustomTradingRule } from './types'
import { Timestamp } from 'firebase/firestore'
import { toISTDateString, toISTHoursMinString } from '@/lib/tz'

export interface RuleViolation {
  ruleId: string
  ruleTitle: string
  message: string
  timestamp: string
  severity: 'high' | 'medium' | 'low'
}

export interface RuleMonitoringSummary {
  rulesFollowedCount: number
  rulesBrokenCount: number
  complianceRate: number // %
  todayTradesCount: number
  todayLoss: number
  todayRiskUsedPercent: number
  tradesRemainingToday: number
  isTradingCutoffActive: boolean
  violations: RuleViolation[]
}

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function monitorRules(
  trades: Trade[],
  riskRules: RiskRules,
  customRules: CustomTradingRule[]
): RuleMonitoringSummary {
  const todayStr = toISTDateString()
  const violations: RuleViolation[] = []

  let todayTradesCount = 0
  let todayLoss = 0
  let todayRiskUsedPercent = 0

  const activeCustomRules = customRules.filter(r => r.enabled)

  trades.forEach(t => {
    const d = getTradeDate(t)
    const pnl = Number(t.profitLoss) || 0
    const riskPct = Number(t.riskPercentage) || 1

    if (d.getTime() > 0 && toISTDateString(d) === todayStr) {
      todayTradesCount++
      if (pnl < 0) todayLoss += Math.abs(pnl)
      todayRiskUsedPercent += riskPct
    }

    // Check custom rule violations in trade psychology data
    const psych = t.psychologyData
    const mistakes = psych?.mistakeTags || []

    mistakes.forEach(m => {
      const lower = m.toLowerCase()
      if (lower.includes('moved stop') || lower.includes('moved sl')) {
        violations.push({
          ruleId: 'rule_1',
          ruleTitle: 'Never Move Stop Loss',
          message: `Stop Loss was moved wider on ${t.pair} trade.`,
          timestamp: d.getTime() > 0 ? toISTDateString(d) : 'Recent',
          severity: 'high',
        })
      }
      if (lower.includes('revenge')) {
        violations.push({
          ruleId: 'rule_8',
          ruleTitle: 'Never Revenge Trade',
          message: `Revenge trading detected on ${t.pair} trade.`,
          timestamp: d.getTime() > 0 ? toISTDateString(d) : 'Recent',
          severity: 'high',
        })
      }
    })
  })

  // Check today's risk rule limits
  if (todayLoss >= riskRules.maxDailyLoss) {
    violations.push({
      ruleId: 'risk_daily_loss',
      ruleTitle: 'Maximum Daily Loss Limit Reached',
      message: `Today's loss ($${todayLoss.toFixed(2)}) reached maximum limit ($${riskRules.maxDailyLoss}). Trading disabled for today.`,
      timestamp: 'Today',
      severity: 'high',
    })
  }

  if (todayTradesCount > riskRules.maxTradesPerDay) {
    violations.push({
      ruleId: 'risk_daily_trades',
      ruleTitle: 'Maximum Daily Trades Exceeded',
      message: `Executed ${todayTradesCount} trades today, exceeding your maximum limit of ${riskRules.maxTradesPerDay}.`,
      timestamp: 'Today',
      severity: 'high',
    })
  }

  const tradesRemainingToday = Math.max(0, riskRules.maxTradesPerDay - todayTradesCount)

  // Cutoff time check
  const now = new Date()
  const nowHoursMin = toISTHoursMinString(now)
  const isTradingCutoffActive = Boolean(riskRules.tradingCutoffTime && nowHoursMin >= riskRules.tradingCutoffTime)

  const rulesBrokenCount = violations.length
  const totalEnabledRules = activeCustomRules.length + 3 // custom rules + core risk rules
  const rulesFollowedCount = Math.max(0, totalEnabledRules - rulesBrokenCount)
  const complianceRate = totalEnabledRules > 0 ? Math.round((rulesFollowedCount / totalEnabledRules) * 100) : 100

  return {
    rulesFollowedCount,
    rulesBrokenCount,
    complianceRate,
    todayTradesCount,
    todayLoss,
    todayRiskUsedPercent,
    tradesRemainingToday,
    isTradingCutoffActive,
    violations,
  }
}
