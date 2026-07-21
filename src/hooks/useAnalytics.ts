import { useState, useMemo } from 'react'
import { Trade } from '@/types/trade'
import { calculateAnalytics, AnalyticsSummary } from '@/lib/analytics'
import { Timestamp } from 'firebase/firestore'

export interface AnalyticsFilters {
  startDate: string
  endDate: string
  pair: string
  strategy: string
  session: string
  tradeType: string
}

export const defaultAnalyticsFilters: AnalyticsFilters = {
  startDate: '',
  endDate: '',
  pair: 'All',
  strategy: 'All',
  session: 'All',
  tradeType: 'All',
}

import { toISTDateString } from '@/lib/tz'

function getTradeDate(t: Trade): Date {
  if (!t.tradeDate) return new Date(0)
  if (t.tradeDate instanceof Timestamp) return t.tradeDate.toDate()
  if (t.tradeDate instanceof Date) return t.tradeDate
  const d = new Date(t.tradeDate)
  return isNaN(d.getTime()) ? new Date(0) : d
}

function getTradeSession(d: Date): 'Asian' | 'London' | 'New York' | 'Other' {
  if (isNaN(d.getTime()) || d.getTime() === 0) return 'Other'
  const hour = d.getUTCHours()
  if (hour >= 23 || hour < 8) return 'Asian'
  if (hour >= 7 && hour < 16) return 'London'
  if (hour >= 12 && hour < 21) return 'New York'
  return 'Other'
}

export function useAnalytics(trades: Trade[]) {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultAnalyticsFilters)

  // Unique list of pairs for dropdown filter
  const availablePairs = useMemo(() => {
    const set = new Set<string>()
    trades.forEach(t => {
      if (t.pair) set.add(t.pair.toUpperCase().trim())
    })
    return Array.from(set).sort()
  }, [trades])

  // Unique list of strategies for dropdown filter
  const availableStrategies = useMemo(() => {
    const set = new Set<string>()
    trades.forEach(t => {
      if (t.strategy) set.add(t.strategy.trim())
    })
    return Array.from(set).sort()
  }, [trades])

  // Filtered trades memoization
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // 1. Trade Type filter
      if (filters.tradeType !== 'All') {
        const typeLower = (t.tradeType || '').toLowerCase()
        const filterTypeLower = filters.tradeType.toLowerCase()
        if (typeLower !== filterTypeLower && !(filterTypeLower === 'buy' && typeLower === 'long') && !(filterTypeLower === 'sell' && typeLower === 'short')) {
          return false
        }
      }

      // 2. Pair filter
      if (filters.pair !== 'All') {
        const symbol = (t.pair || '').toUpperCase().trim()
        if (symbol !== filters.pair.toUpperCase().trim()) return false
      }

      // 3. Strategy filter
      if (filters.strategy !== 'All') {
        const strat = (t.strategy || '').trim()
        if (strat !== filters.strategy.trim()) return false
      }

      const d = getTradeDate(t)

      // 4. Session filter
      if (filters.session !== 'All') {
        const session = getTradeSession(d)
        if (session !== filters.session) return false
      }

      // 5. Date Range filter
      if (d.getTime() > 0) {
        const iso = toISTDateString(d)
        if (filters.startDate && iso < filters.startDate) return false
        if (filters.endDate && iso > filters.endDate) return false
      }

      return true
    })
  }, [trades, filters])

  // Memoized live analytics calculations
  const analytics: AnalyticsSummary = useMemo(() => {
    return calculateAnalytics(filteredTrades)
  }, [filteredTrades])

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.startDate !== '' ||
      filters.endDate !== '' ||
      filters.pair !== 'All' ||
      filters.strategy !== 'All' ||
      filters.session !== 'All' ||
      filters.tradeType !== 'All'
    )
  }, [filters])

  const clearFilters = () => {
    setFilters(defaultAnalyticsFilters)
  }

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    filteredTrades,
    analytics,
    availablePairs,
    availableStrategies,
  }
}
