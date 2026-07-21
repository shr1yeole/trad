import { Trade } from '@/types/trade'
import { Timestamp } from 'firebase/firestore'

export interface EmotionStat {
  emotion: string
  tradesCount: number
  wins: number
  losses: number
  totalPnl: number
  winRate: number
  color: string
}

export interface MistakeStat {
  tag: string
  count: number
  totalPnl: number
  avgLoss: number
}

export interface ConfidenceProfitPoint {
  tradeIndex: number
  date: string
  pair: string
  confidence: number
  pnl: number
  emotion: string
}

export interface PsychologyTimelinePoint {
  id: string
  date: string
  pair: string
  type: string
  pnl: number
  emotion: string
  confidence: number
  quality: string
  checklistCount: number
  mistakes: string[]
  notes: string
}

export interface StrategyEmotionStat {
  strategy: string
  dominantEmotion: string
  tradesCount: number
  winRate: number
  totalPnl: number
}

export interface PsychologySummary {
  disciplineScore: number
  mostProfitableEmotion: EmotionStat | null
  worstEmotion: EmotionStat | null
  mostCommonMistake: MistakeStat | null
  totalMistakesLogged: number
  averageConfidence: number
  emotionDistribution: EmotionStat[]
  mistakeFrequency: MistakeStat[]
  confidenceVsProfit: ConfidenceProfitPoint[]
  psychologyTimeline: PsychologyTimelinePoint[]
  strategyVsEmotion: StrategyEmotionStat[]
}

import { toISTDateString } from './tz'

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

function formatPeriodDate(d: Date): string {
  if (isNaN(d.getTime()) || d.getTime() === 0) return 'Unknown'
  return toISTDateString(d)
}

const EMOTION_COLORS: Record<string, string> = {
  Calm: '#10b981',
  Confident: '#3b82f6',
  Anxious: '#f59e0b',
  FOMO: '#ef4444',
  Greedy: '#ec4899',
  Fearful: '#8b5cf6',
  Frustrated: '#dc2626',
  Neutral: '#6b7280',
}

export function calculatePsychologyAnalytics(trades: Trade[]): PsychologySummary {
  if (!trades || trades.length === 0) {
    return {
      disciplineScore: 100,
      mostProfitableEmotion: null,
      worstEmotion: null,
      mostCommonMistake: null,
      totalMistakesLogged: 0,
      averageConfidence: 0,
      emotionDistribution: [],
      mistakeFrequency: [],
      confidenceVsProfit: [],
      psychologyTimeline: [],
      strategyVsEmotion: [],
    }
  }

  const sortedTrades = [...trades].sort((a, b) => getTradeDate(a).getTime() - getTradeDate(b).getTime())

  const emotionMap = new Map<string, { tradesCount: number; wins: number; losses: number; totalPnl: number }>()
  const mistakeMap = new Map<string, { count: number; totalPnl: number; losses: number }>()
  const strategyEmotionMap = new Map<string, Map<string, { tradesCount: number; wins: number; totalPnl: number }>>()

  let totalConfidenceSum = 0
  let confidenceCount = 0

  let cleanTradesCount = 0
  let totalChecklistItems = 0
  let totalChecklistChecked = 0
  let qualityScoreSum = 0

  const confidenceVsProfit: ConfidenceProfitPoint[] = []
  const psychologyTimeline: PsychologyTimelinePoint[] = []

  sortedTrades.forEach((trade, idx) => {
    const pnl = Number(trade.profitLoss) || 0
    const d = getTradeDate(trade)
    const dateStr = formatPeriodDate(d)

    const psych = trade.psychologyData
    const emotion = (psych?.moodBeforeTrade || trade.psychology || 'Neutral').trim()
    const confidence = psych?.confidenceLevel !== undefined ? Number(psych.confidenceLevel) : 80
    const quality = psych?.tradeQuality || 'A'
    const checklist = psych?.checklist || []
    const mistakes = psych?.mistakeTags || []
    const notes = psych?.journalNotes || trade.notes || ''
    const strategy = (psych?.strategy || trade.strategy || 'General').trim()

    totalConfidenceSum += confidence
    confidenceCount++

    // Quality Grade scoring: A+ (100), A (90), B (75), C (60), D (40)
    const gradeWeight = quality === 'A+' ? 100 : quality === 'A' ? 90 : quality === 'B' ? 75 : quality === 'C' ? 60 : 40
    qualityScoreSum += gradeWeight

    if (mistakes.length === 0) {
      cleanTradesCount++
    }

    totalChecklistChecked += checklist.length
    totalChecklistItems += 5 // Benchmark 5 checklist items per trade

    // Emotion aggregation
    const eData = emotionMap.get(emotion) || { tradesCount: 0, wins: 0, losses: 0, totalPnl: 0 }
    eData.tradesCount++
    eData.totalPnl += pnl
    if (pnl > 0) eData.wins++
    else if (pnl < 0) eData.losses++
    emotionMap.set(emotion, eData)

    // Mistake aggregation
    mistakes.forEach(tag => {
      const mData = mistakeMap.get(tag) || { count: 0, totalPnl: 0, losses: 0 }
      mData.count++
      mData.totalPnl += pnl
      if (pnl < 0) mData.losses += Math.abs(pnl)
      mistakeMap.set(tag, mData)
    })

    // Strategy vs Emotion aggregation
    if (!strategyEmotionMap.has(strategy)) {
      strategyEmotionMap.set(strategy, new Map())
    }
    const stratEmoMap = strategyEmotionMap.get(strategy)!
    const seData = stratEmoMap.get(emotion) || { tradesCount: 0, wins: 0, totalPnl: 0 }
    seData.tradesCount++
    seData.totalPnl += pnl
    if (pnl > 0) seData.wins++
    stratEmoMap.set(emotion, seData)

    // Confidence vs Profit point
    confidenceVsProfit.push({
      tradeIndex: idx + 1,
      date: dateStr,
      pair: (trade.pair || 'Unknown').toUpperCase(),
      confidence,
      pnl,
      emotion,
    })

    // Timeline item
    psychologyTimeline.unshift({
      id: trade.id || String(idx),
      date: dateStr,
      pair: (trade.pair || 'Unknown').toUpperCase(),
      type: trade.tradeType || 'Buy',
      pnl,
      emotion,
      confidence,
      quality,
      checklistCount: checklist.length,
      mistakes,
      notes,
    })
  })

  // Emotion Distribution Array
  const emotionDistribution: EmotionStat[] = Array.from(emotionMap.entries()).map(([emotion, stat]) => ({
    emotion,
    tradesCount: stat.tradesCount,
    wins: stat.wins,
    losses: stat.losses,
    totalPnl: stat.totalPnl,
    winRate: stat.tradesCount > 0 ? (stat.wins / stat.tradesCount) * 100 : 0,
    color: EMOTION_COLORS[emotion] || '#a855f7',
  })).sort((a, b) => b.tradesCount - a.tradesCount)

  // Most Profitable & Worst Emotion
  const sortedByPnl = [...emotionDistribution].sort((a, b) => b.totalPnl - a.totalPnl)
  const mostProfitableEmotion = sortedByPnl.length > 0 ? sortedByPnl[0] : null
  const worstEmotion = sortedByPnl.length > 0 ? sortedByPnl[sortedByPnl.length - 1] : null

  // Mistake Frequency Array
  const mistakeFrequency: MistakeStat[] = Array.from(mistakeMap.entries()).map(([tag, stat]) => ({
    tag,
    count: stat.count,
    totalPnl: stat.totalPnl,
    avgLoss: stat.count > 0 ? stat.losses / stat.count : 0,
  })).sort((a, b) => b.count - a.count)

  const mostCommonMistake = mistakeFrequency.length > 0 ? mistakeFrequency[0] : null
  const totalMistakesLogged = mistakeFrequency.reduce((acc, m) => acc + m.count, 0)
  const averageConfidence = confidenceCount > 0 ? totalConfidenceSum / confidenceCount : 0

  // Discipline Score (0-100)
  const totalTradesCount = sortedTrades.length
  const cleanTradePct = totalTradesCount > 0 ? (cleanTradesCount / totalTradesCount) * 100 : 100
  const avgQualityScore = totalTradesCount > 0 ? qualityScoreSum / totalTradesCount : 90
  const disciplineScore = Math.round(cleanTradePct * 0.5 + avgQualityScore * 0.5)

  // Strategy vs Emotion Breakdown
  const strategyVsEmotion: StrategyEmotionStat[] = []
  strategyEmotionMap.forEach((emoMap, stratName) => {
    let dominantEmo = 'Neutral'
    let maxCount = 0
    let totalStratTrades = 0
    let totalStratWins = 0
    let totalStratPnl = 0

    emoMap.forEach((stat, emoName) => {
      totalStratTrades += stat.tradesCount
      totalStratWins += stat.wins
      totalStratPnl += stat.totalPnl
      if (stat.tradesCount > maxCount) {
        maxCount = stat.tradesCount
        dominantEmo = emoName
      }
    })

    strategyVsEmotion.push({
      strategy: stratName,
      dominantEmotion: dominantEmo,
      tradesCount: totalStratTrades,
      winRate: totalStratTrades > 0 ? (totalStratWins / totalStratTrades) * 100 : 0,
      totalPnl: totalStratPnl,
    })
  })

  return {
    disciplineScore,
    mostProfitableEmotion,
    worstEmotion,
    mostCommonMistake,
    totalMistakesLogged,
    averageConfidence,
    emotionDistribution,
    mistakeFrequency,
    confidenceVsProfit,
    psychologyTimeline,
    strategyVsEmotion,
  }
}
