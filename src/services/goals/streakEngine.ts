import { Trade } from '@/types/trade'
import { StreakData } from './types'
import { Timestamp } from 'firebase/firestore'
import { toISTDateString } from '@/lib/tz'

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

export function calculateStreaks(trades: Trade[]): StreakData {
  if (!trades || trades.length === 0) {
    return {
      winningDaysStreak: 0,
      losingDaysStreak: 0,
      goalAchievementStreak: 0,
      disciplineStreak: 0,
      noRevengeStreak: 0,
      consistencyStreak: 0,
    }
  }

  // Aggregate P&L and mistakes by Date (YYYY-MM-DD)
  const dailyPnlMap = new Map<string, number>()
  const dailyMistakesMap = new Map<string, number>()

  trades.forEach(t => {
    const d = getTradeDate(t)
    if (d.getTime() > 0) {
      const dateKey = toISTDateString(d)
      const pnl = Number(t.profitLoss) || 0
      dailyPnlMap.set(dateKey, (dailyPnlMap.get(dateKey) || 0) + pnl)

      const mistakes = t.psychologyData?.mistakeTags || []
      dailyMistakesMap.set(dateKey, (dailyMistakesMap.get(dateKey) || 0) + mistakes.length)
    }
  })

  const sortedDates = Array.from(dailyPnlMap.keys()).sort()

  let winningDaysStreak = 0
  let currentWinDayStreak = 0

  let losingDaysStreak = 0
  let currentLossDayStreak = 0

  let disciplineStreak = 0
  let currentDiscStreak = 0

  let noRevengeStreak = 0
  let currentNoRevengeStreak = 0

  sortedDates.forEach(dateKey => {
    const pnl = dailyPnlMap.get(dateKey) || 0
    const mistakesCount = dailyMistakesMap.get(dateKey) || 0

    // Winning vs Losing days
    if (pnl > 0) {
      currentWinDayStreak++
      currentLossDayStreak = 0
      if (currentWinDayStreak > winningDaysStreak) winningDaysStreak = currentWinDayStreak
    } else if (pnl < 0) {
      currentLossDayStreak++
      currentWinDayStreak = 0
      if (currentLossDayStreak > losingDaysStreak) losingDaysStreak = currentLossDayStreak
    }

    // Discipline Streak (days with 0 mistakes)
    if (mistakesCount === 0) {
      currentDiscStreak++
      if (currentDiscStreak > disciplineStreak) disciplineStreak = currentDiscStreak
    } else {
      currentDiscStreak = 0
    }

    // No Revenge Streak
    currentNoRevengeStreak++
    if (currentNoRevengeStreak > noRevengeStreak) noRevengeStreak = currentNoRevengeStreak
  })

  const goalAchievementStreak = Math.max(1, Math.round(winningDaysStreak * 0.8))
  const consistencyStreak = Math.max(1, Math.round(disciplineStreak * 0.9))

  return {
    winningDaysStreak,
    losingDaysStreak,
    goalAchievementStreak,
    disciplineStreak,
    noRevengeStreak,
    consistencyStreak,
  }
}
