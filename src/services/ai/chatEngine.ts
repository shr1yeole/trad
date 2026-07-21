import { FullAIInsightReport } from './insightEngine'

export interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  insightCard?: {
    title: string
    content: string
  }
  timestamp: string
}

export function processChatQuery(userQuery: string, report: FullAIInsightReport): ChatMessage {
  const queryLower = userQuery.toLowerCase()
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  let text = ''
  let insightCard: { title: string; content: string } | undefined

  if (queryLower.includes('loss') || queryLower.includes('losing') || queryLower.includes('drawdown')) {
    text = `Looking at your trade history, your net loss from losing trades is $${report.weeklyReport.loss.toFixed(2)}. `
    if (report.risk.revengeTradingDetected) {
      text += `A key factor is revenge trading (entering new trades within 30 minutes of a loss). `
    }
    if (report.psychology.worstEmotion !== 'N/A') {
      text += `Additionally, trades taken while feeling ${report.psychology.worstEmotion.toLowerCase()} resulted in your steepest losses.`
    }

    insightCard = {
      title: 'Loss Prevention Insight',
      content: `Your worst performing pair is ${report.performance.worstPair?.symbol || 'N/A'}. Enforce a mandatory 15-minute cool-off break after every loss.`,
    }
  } else if (queryLower.includes('win rate') || queryLower.includes('improve') || queryLower.includes('performance')) {
    text = `Your current win rate is ${report.performance.bestPair ? report.score.summaryStatement : `${report.performance.winRateTrend} win rate`}. `
    text += `Your highest win rate occurs during the ${report.performance.bestSession?.session || 'London'} session.`

    insightCard = {
      title: 'Win Rate Optimization',
      content: `Waiting for candle closure before entering increases setup accuracy. Focus capital on ${report.performance.bestPair?.symbol || 'your best performing pairs'}.`,
    }
  } else if (queryLower.includes('risk') || queryLower.includes('lot size') || queryLower.includes('consecutive')) {
    text = `Your Risk Level is currently ${report.risk.riskLevel} with a Risk Score of ${report.risk.riskScore}/100. `
    if (report.risk.consecutiveLossesDetected) {
      text += `You have encountered consecutive losses. I recommend reducing your lot size after two consecutive losses.`
    } else {
      text += `Your risk parameters are within safe limits. Keep your risk-per-trade under 2%.`
    }

    insightCard = {
      title: 'Risk Engine Insight',
      content: `Average R:R ratio is 1:${report.score.tradingScore > 70 ? '1.8' : '1.2'}. Maintain a minimum 1:1.5 RR on all upcoming trades.`,
    }
  } else if (queryLower.includes('plan') || queryLower.includes('tomorrow') || queryLower.includes('recommend')) {
    text = `Here is your recommended trading plan for your next session:\n`
    text += `1. Focus on ${report.habits.favoritePair} during the ${report.habits.favoriteSession} session.\n`
    text += `2. Limit total trades to a maximum of 3 per day.\n`
    text += `3. Verify pre-trade checklist items before placing your order.`

    insightCard = {
      title: 'Actionable Trading Plan',
      content: `Rule: Stop trading immediately if you hit a 2-loss limit in a single session.`,
    }
  } else {
    text = `Based on your live trading data, your current Trading Score is ${report.score.tradingScore}/100 (${report.score.letterGrade} Grade). ${report.score.summaryStatement}`
    insightCard = {
      title: 'Overall AI Assessment',
      content: report.monthlyReport.recommendedFocus,
    }
  }

  return {
    id: `msg_${Date.now()}`,
    sender: 'ai',
    text,
    insightCard,
    timestamp: now,
  }
}
