import { Trade } from '@/types/trade'
import { calculatePsychologyAnalytics, PsychologySummary } from '@/lib/psychologyAnalytics'

export interface PsychologyOutput {
  disciplineScore: number
  mostProfitableEmotion: string
  worstEmotion: string
  mostCommonMistake: string
  humanReadableInsights: string[]
}

export function calculatePsychologyAnalysis(trades: Trade[]): PsychologyOutput {
  const psychAnalytics = calculatePsychologyAnalytics(trades)
  const insights: string[] = []

  if (psychAnalytics.mostProfitableEmotion) {
    insights.push(
      `Trades taken while feeling ${psychAnalytics.mostProfitableEmotion.emotion.toLowerCase()} generated your highest total profit (${psychAnalytics.mostProfitableEmotion.winRate.toFixed(0)}% win rate).`
    )
  }

  if (psychAnalytics.worstEmotion && psychAnalytics.worstEmotion.totalPnl < 0) {
    insights.push(
      `Trades taken while feeling ${psychAnalytics.worstEmotion.emotion.toLowerCase()} resulted in your worst losses. Avoid trading when feeling ${psychAnalytics.worstEmotion.emotion.toLowerCase()}.`
    )
  }

  if (psychAnalytics.mostCommonMistake) {
    insights.push(
      `Your most frequent execution mistake is "${psychAnalytics.mostCommonMistake.tag}" (logged ${psychAnalytics.mostCommonMistake.count} times).`
    )
  }

  if (psychAnalytics.averageConfidence > 0) {
    insights.push(
      `Your average confidence level across trades is ${psychAnalytics.averageConfidence.toFixed(0)}%. High confidence (>80%) trades perform significantly better.`
    )
  }

  return {
    disciplineScore: psychAnalytics.disciplineScore,
    mostProfitableEmotion: psychAnalytics.mostProfitableEmotion ? psychAnalytics.mostProfitableEmotion.emotion : 'N/A',
    worstEmotion: psychAnalytics.worstEmotion ? psychAnalytics.worstEmotion.emotion : 'N/A',
    mostCommonMistake: psychAnalytics.mostCommonMistake ? psychAnalytics.mostCommonMistake.tag : 'None',
    humanReadableInsights: insights,
  }
}
