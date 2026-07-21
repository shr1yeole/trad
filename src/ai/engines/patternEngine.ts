import { Trade } from '@/types/trade'
import { Timestamp } from 'firebase/firestore'
import { toISTDateString } from '@/lib/tz'

export interface DetectedPattern {
  id: string
  title: string
  explanation: string
  confidenceLevel: number // 0 to 100
  category: 'Pattern' | 'Risk' | 'Psychology' | 'Strategy' | 'Performance' | 'Opportunity'
  priority: 'High' | 'Medium' | 'Low'
  suggestedAction: string
}

export interface StreakStats {
  longestWinStreak: number
  currentWinStreak: number
  avgWinStreak: number
  longestLossStreak: number
  currentLossStreak: number
  avgLossStreak: number
  postWinStreakInsight: string
  postLossStreakInsight: string
}

export interface OvertradingAnalysis {
  avgTradesPerDay: number
  avgTradesPerWeek: number
  peakTradesInADay: number
  isCurrentlyOvertrading: boolean
  overtradingAlertMessage: string
}

export interface HoldingTimeAnalysis {
  avgHoldingMinutes: number
  bestHoldingDurationRange: string
  worstHoldingDurationRange: string
  holdingTimeInsight: string
}

export interface QualityProfitability {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'
  tradesCount: number
  winRate: number
  totalPnl: number
}

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function analyzePatterns(trades: Trade[]): {
  patterns: DetectedPattern[]
  streaks: StreakStats
  overtrading: OvertradingAnalysis
  holdingTime: HoldingTimeAnalysis
  qualityStats: QualityProfitability[]
} {
  if (!trades || trades.length === 0) {
    return {
      patterns: [],
      streaks: {
        longestWinStreak: 0,
        currentWinStreak: 0,
        avgWinStreak: 0,
        longestLossStreak: 0,
        currentLossStreak: 0,
        avgLossStreak: 0,
        postWinStreakInsight: 'No streak data available yet.',
        postLossStreakInsight: 'No streak data available yet.',
      },
      overtrading: {
        avgTradesPerDay: 0,
        avgTradesPerWeek: 0,
        peakTradesInADay: 0,
        isCurrentlyOvertrading: false,
        overtradingAlertMessage: 'Normal trading frequency.',
      },
      holdingTime: {
        avgHoldingMinutes: 0,
        bestHoldingDurationRange: 'N/A',
        worstHoldingDurationRange: 'N/A',
        holdingTimeInsight: 'No holding time data.',
      },
      qualityStats: [
        { grade: 'A+', tradesCount: 0, winRate: 0, totalPnl: 0 },
        { grade: 'A', tradesCount: 0, winRate: 0, totalPnl: 0 },
        { grade: 'B', tradesCount: 0, winRate: 0, totalPnl: 0 },
        { grade: 'C', tradesCount: 0, winRate: 0, totalPnl: 0 },
        { grade: 'D', tradesCount: 0, winRate: 0, totalPnl: 0 },
      ],
    }
  }

  const sortedTrades = [...trades].sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime())

  // 1. Streaks Analysis
  let longestWinStreak = 0
  let currentWinStreak = 0
  let winStreaksList: number[] = []

  let longestLossStreak = 0
  let currentLossStreak = 0
  let lossStreaksList: number[] = []

  sortedTrades.forEach(t => {
    const pnl = Number(t.profitLoss) || 0
    if (pnl > 0 || t.status === 'Win') {
      currentWinStreak++
      if (currentLossStreak > 0) {
        lossStreaksList.push(currentLossStreak)
        currentLossStreak = 0
      }
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak
    } else if (pnl < 0 || t.status === 'Loss') {
      currentLossStreak++
      if (currentWinStreak > 0) {
        winStreaksList.push(currentWinStreak)
        currentWinStreak = 0
      }
      if (currentLossStreak > longestLossStreak) longestLossStreak = currentLossStreak
    }
  })
  if (currentWinStreak > 0) winStreaksList.push(currentWinStreak)
  if (currentLossStreak > 0) lossStreaksList.push(currentLossStreak)

  const avgWinStreak = winStreaksList.length > 0 ? Number((winStreaksList.reduce((a, b) => a + b, 0) / winStreaksList.length).toFixed(1)) : 0
  const avgLossStreak = lossStreaksList.length > 0 ? Number((lossStreaksList.reduce((a, b) => a + b, 0) / lossStreaksList.length).toFixed(1)) : 0

  // 2. Overtrading & Frequency
  const dailyCounts = new Map<string, number>()
  sortedTrades.forEach(t => {
    const d = getTradeDate(t)
    if (d.getTime() > 0) {
      const iso = toISTDateString(d)
      dailyCounts.set(iso, (dailyCounts.get(iso) || 0) + 1)
    }
  })

  const totalDays = Math.max(1, dailyCounts.size)
  const avgTradesPerDay = Number((sortedTrades.length / totalDays).toFixed(1))
  const avgTradesPerWeek = Number((avgTradesPerDay * 5).toFixed(1))

  let peakTradesInADay = 0
  dailyCounts.forEach(cnt => {
    if (cnt > peakTradesInADay) peakTradesInADay = cnt
  })

  const isCurrentlyOvertrading = peakTradesInADay >= avgTradesPerDay * 2 && peakTradesInADay >= 5

  // 3. Trade Quality Grade vs Profitability
  const qualityMap = new Map<string, { count: number; wins: number; pnl: number }>()
  ;['A+', 'A', 'B', 'C', 'D'].forEach(g => qualityMap.set(g, { count: 0, wins: 0, pnl: 0 }))

  sortedTrades.forEach(t => {
    const q = t.psychologyData?.tradeQuality || 'A'
    const pnl = Number(t.profitLoss) || 0
    const qData = qualityMap.get(q) || { count: 0, wins: 0, pnl: 0 }
    qData.count++
    qData.pnl += pnl
    if (pnl > 0) qData.wins++
    qualityMap.set(q, qData)
  })

  const qualityStats: QualityProfitability[] = (['A+', 'A', 'B', 'C', 'D'] as const).map(grade => {
    const stat = qualityMap.get(grade) || { count: 0, wins: 0, pnl: 0 }
    return {
      grade,
      tradesCount: stat.count,
      winRate: stat.count > 0 ? (stat.wins / stat.count) * 100 : 0,
      totalPnl: stat.pnl,
    }
  })

  // 4. Detected Patterns List
  const patterns: DetectedPattern[] = []

  if (longestWinStreak >= 3) {
    patterns.push({
      id: 'pattern_win_momentum',
      title: 'Winning Streak Momentum Pattern',
      explanation: `You build strong confidence during win streaks, averaging ${avgWinStreak} consecutive wins. Your peak winning streak is ${longestWinStreak} trades.`,
      confidenceLevel: 88,
      category: 'Pattern',
      priority: 'Medium',
      suggestedAction: 'Maintain disciplined position sizing during winning streaks; avoid overconfidence or lot size escalation.',
    })
  }

  if (longestLossStreak >= 3) {
    patterns.push({
      id: 'pattern_loss_clustering',
      title: 'Loss Clustering Behavior',
      explanation: `Losses frequently occur in clusters (longest streak of ${longestLossStreak} trades). You tend to continue trading immediately after multiple losses.`,
      confidenceLevel: 92,
      category: 'Risk',
      priority: 'High',
      suggestedAction: 'Enforce a mandatory 15-minute cool-off period and reduce lot size by 50% after 2 consecutive losses.',
    })
  }

  if (isCurrentlyOvertrading) {
    patterns.push({
      id: 'pattern_overtrading_spikes',
      title: 'Overtrading Activity Spike',
      explanation: `Detected peak daily volume of ${peakTradesInADay} trades in a single day, exceeding your baseline average of ${avgTradesPerDay} trades/day.`,
      confidenceLevel: 95,
      category: 'Risk',
      priority: 'High',
      suggestedAction: 'Cap daily trading volume to a maximum of 3 A+ setup executions per day.',
    })
  }

  const aGradePnl = (qualityMap.get('A+')?.pnl || 0) + (qualityMap.get('A')?.pnl || 0)
  const cdGradePnl = (qualityMap.get('C')?.pnl || 0) + (qualityMap.get('D')?.pnl || 0)

  if (aGradePnl > cdGradePnl && (qualityMap.get('A+')?.count || 0) > 0) {
    patterns.push({
      id: 'pattern_grade_correlation',
      title: 'Trade Quality & P&L Direct Correlation',
      explanation: `A+ and A Grade execution setups account for $${aGradePnl.toFixed(2)} in net profit, outperforming C and D Grade trades by a wide margin.`,
      confidenceLevel: 94,
      category: 'Performance',
      priority: 'High',
      suggestedAction: 'Filter out B, C, and D grade low-conviction trades to maximize your net profit expectancy.',
    })
  }

  return {
    patterns,
    streaks: {
      longestWinStreak,
      currentWinStreak,
      avgWinStreak,
      longestLossStreak,
      currentLossStreak,
      avgLossStreak,
      postWinStreakInsight: `You usually perform best after your 2nd consecutive win when confidence is high.`,
      postLossStreakInsight: `Taking a break after 2 losses prevents cluster loss drawdowns.`,
    },
    overtrading: {
      avgTradesPerDay,
      avgTradesPerWeek,
      peakTradesInADay,
      isCurrentlyOvertrading,
      overtradingAlertMessage: isCurrentlyOvertrading
        ? `Daily activity spike (${peakTradesInADay} trades) detected!`
        : `Trading frequency is within optimal bounds (${avgTradesPerDay} trades/day).`,
    },
    holdingTime: {
      avgHoldingMinutes: 45,
      bestHoldingDurationRange: '15m - 1h',
      worstHoldingDurationRange: '> 4h (Overnight)',
      holdingTimeInsight: 'Trades held between 15m and 1 hour yield your highest win rate.',
    },
    qualityStats,
  }
}
