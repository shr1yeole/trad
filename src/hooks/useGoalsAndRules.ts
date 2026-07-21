import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useTrades } from '@/hooks/useTrades'
import { calculateAnalytics } from '@/lib/analytics'
import {
  TradingGoals,
  RiskRules,
  CustomTradingRule,
  UserGoalsState,
  defaultTradingGoals,
  defaultRiskRules,
  defaultCustomRules,
  calculateGoalProgress,
  monitorRules,
  evaluateAchievements,
  calculateStreaks,
  generateMotivationalCard,
} from '@/services/goals'

const STORAGE_KEY = 'trademind_goals_rules_v1'

export function useGoalsAndRules() {
  const { user } = useAuth()
  const { trades, loading: tradesLoading } = useTrades()

  const [goals, setGoals] = useState<TradingGoals>(defaultTradingGoals)
  const [riskRules, setRiskRules] = useState<RiskRules>(defaultRiskRules)
  const [customRules, setCustomRules] = useState<CustomTradingRule[]>(defaultCustomRules)
  const [loading, setLoading] = useState(true)

  // 1. Fetch settings from Firestore or LocalStorage
  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        if (user?.id) {
          const docRef = doc(db, 'users', user.id, 'settings', 'goals')
          const snap = await getDoc(docRef)
          if (snap.exists()) {
            const data = snap.data() as UserGoalsState
            if (data.goals) setGoals(data.goals)
            if (data.riskRules) setRiskRules(data.riskRules)
            if (data.customRules && data.customRules.length > 0) setCustomRules(data.customRules)
          }
        } else if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored) as UserGoalsState
            if (parsed.goals) setGoals(parsed.goals)
            if (parsed.riskRules) setRiskRules(parsed.riskRules)
            if (parsed.customRules) setCustomRules(parsed.customRules)
          }
        }
      } catch (err) {
        console.warn('Could not load user goals/rules settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user?.id])

  // 2. Persist settings update helper
  const saveState = useCallback(
    async (newGoals: TradingGoals, newRisk: RiskRules, newCustom: CustomTradingRule[]) => {
      const payload: UserGoalsState = {
        goals: newGoals,
        riskRules: newRisk,
        customRules: newCustom,
        achievements: [],
        streaks: {
          winningDaysStreak: 0,
          losingDaysStreak: 0,
          goalAchievementStreak: 0,
          disciplineStreak: 0,
          noRevengeStreak: 0,
          consistencyStreak: 0,
        },
        lastUpdated: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      }

      if (user?.id) {
        try {
          const docRef = doc(db, 'users', user.id, 'settings', 'goals')
          await setDoc(docRef, payload, { merge: true })
        } catch (err) {
          console.warn('Failed saving goals to Firestore:', err)
        }
      }
    },
    [user?.id]
  )

  const updateGoals = (updated: Partial<TradingGoals>) => {
    const next = { ...goals, ...updated }
    setGoals(next)
    saveState(next, riskRules, customRules)
  }

  const updateRiskRules = (updated: Partial<RiskRules>) => {
    const next = { ...riskRules, ...updated }
    setRiskRules(next)
    saveState(goals, next, customRules)
  }

  const toggleRule = (ruleId: string) => {
    const next = customRules.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    setCustomRules(next)
    saveState(goals, riskRules, next)
  }

  const addCustomRule = (rule: Omit<CustomTradingRule, 'id'>) => {
    const newRule: CustomTradingRule = {
      ...rule,
      id: `custom_${Date.now()}`,
    }
    const next = [...customRules, newRule]
    setCustomRules(next)
    saveState(goals, riskRules, next)
  }

  const deleteCustomRule = (ruleId: string) => {
    const next = customRules.filter(r => r.id !== ruleId)
    setCustomRules(next)
    saveState(goals, riskRules, next)
  }

  // 3. Real-time Reactive Calculations
  const analytics = useMemo(() => calculateAnalytics(trades), [trades])
  const goalProgress = useMemo(() => calculateGoalProgress(trades, analytics, goals), [trades, analytics, goals])
  const ruleSummary = useMemo(() => monitorRules(trades, riskRules, customRules), [trades, riskRules, customRules])
  const achievements = useMemo(() => evaluateAchievements(trades, analytics), [trades, analytics])
  const streaks = useMemo(() => calculateStreaks(trades), [trades])
  const motivationalCard = useMemo(
    () => generateMotivationalCard(ruleSummary, streaks),
    [ruleSummary, streaks]
  )

  return {
    trades,
    loading: loading || tradesLoading,
    goals,
    riskRules,
    customRules,
    analytics,
    goalProgress,
    ruleSummary,
    achievements,
    streaks,
    motivationalCard,
    updateGoals,
    updateRiskRules,
    toggleRule,
    addCustomRule,
    deleteCustomRule,
  }
}
