import { useState, useMemo } from 'react'
import { useTrades } from '@/hooks/useTrades'
import { calculateAnalytics } from '@/lib/analytics'
import { calculatePsychologyAnalytics } from '@/lib/psychologyAnalytics'
import { calculateTradingScore } from '@/services/ai/scoreEngine'
import { calculateRiskAnalysis } from '@/services/ai/riskEngine'
import { calculatePerformanceAnalysis } from '@/services/ai/performanceEngine'
import { calculatePsychologyAnalysis } from '@/services/ai/psychologyEngine'
import { generateRecommendations } from '@/services/ai/recommendationEngine'
import { generateFullAIReport, FullAIInsightReport } from '@/services/ai/insightEngine'
import { processChatQuery, ChatMessage } from '@/services/ai/chatEngine'

import {
  analyzePatterns,
  calculateConsistency,
  calculateDiscipline,
  generateAIAlerts,
  generateOpportunities,
  calculateFullAIScore,
} from '@/ai/engines'

export function useAICoach() {
  const { trades, loading, error } = useTrades()

  const analytics = useMemo(() => calculateAnalytics(trades), [trades])
  const psychologyRaw = useMemo(() => calculatePsychologyAnalytics(trades), [trades])
  const score = useMemo(() => calculateTradingScore(trades, analytics), [trades, analytics])
  const risk = useMemo(() => calculateRiskAnalysis(trades, analytics), [trades, analytics])
  const performance = useMemo(() => calculatePerformanceAnalysis(trades, analytics), [trades, analytics])
  const psychology = useMemo(() => calculatePsychologyAnalysis(trades), [trades])

  // Phase 6.5 Pattern Engines
  const patternData = useMemo(() => analyzePatterns(trades), [trades])
  const consistency = useMemo(() => calculateConsistency(trades, analytics), [trades, analytics])
  const discipline = useMemo(() => calculateDiscipline(trades), [trades])
  const aiAlerts = useMemo(
    () => generateAIAlerts(trades, analytics, discipline, psychologyRaw),
    [trades, analytics, discipline, psychologyRaw]
  )
  const opportunities = useMemo(
    () => generateOpportunities(analytics, discipline, aiAlerts),
    [analytics, discipline, aiAlerts]
  )
  const multiScores = useMemo(
    () => calculateFullAIScore(trades, analytics, discipline, consistency, psychologyRaw),
    [trades, analytics, discipline, consistency, psychologyRaw]
  )

  const recommendations = useMemo(
    () => generateRecommendations(trades, analytics, risk, performance, psychology),
    [trades, analytics, risk, performance, psychology]
  )

  const report: FullAIInsightReport = useMemo(
    () => generateFullAIReport(trades, analytics, score, risk, performance, psychology),
    [trades, analytics, score, risk, performance, psychology]
  )

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: `Hello! I am your TradeMind AI Coach. I've analyzed your trading data and current Trading Score is ${multiScores.overallTradingScore}/100 (${multiScores.letterGrade} Grade).`,
      insightCard: {
        title: 'Initial Coaching Assessment',
        content: multiScores.summaryStatement,
      },
      timestamp: 'Just now',
    },
  ])

  const sendMessage = (queryText: string) => {
    if (!queryText.trim()) return

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const aiMsg = processChatQuery(queryText, report)

    setMessages(prev => [...prev, userMsg, aiMsg])
  }

  return {
    trades,
    loading,
    error,
    analytics,
    score,
    risk,
    performance,
    psychology,
    psychologyRaw,
    patternData,
    consistency,
    discipline,
    aiAlerts,
    opportunities,
    multiScores,
    recommendations,
    report,
    messages,
    sendMessage,
  }
}
