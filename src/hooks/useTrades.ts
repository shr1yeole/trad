'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { tradeService } from '@/services/tradeService'
import { Trade, TradeFormData } from '@/types/trade'

interface UseTradesReturn {
  trades: Trade[]
  loading: boolean
  error: string | null
  addTrade: (data: TradeFormData) => Promise<void>
  updateTrade: (tradeId: string, data: TradeFormData) => Promise<void>
  deleteTrade: (tradeId: string) => Promise<void>
  deleteTrades: (tradeIds: string[]) => Promise<void>
  clearError: () => void
}

export function useTrades(): UseTradesReturn {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Subscribe to real-time updates when user is available
  useEffect(() => {
    if (!user?.id) {
      setTrades([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsub = tradeService.subscribeTrades(
      user.id,
      (updatedTrades) => {
        setTrades(updatedTrades)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Failed to load trades.')
        setLoading(false)
      },
    )

    unsubscribeRef.current = unsub

    // Cleanup listener on unmount or user change
    return () => {
      unsub()
      unsubscribeRef.current = null
    }
  }, [user?.id])

  const addTrade = useCallback(async (data: TradeFormData) => {
    if (!user?.id) throw new Error('Not authenticated')
    try {
      await tradeService.createTrade(user.id, data)
      // Real-time listener will update trades automatically
    } catch (err: any) {
      const message = err.message || 'Failed to add trade.'
      setError(message)
      throw new Error(message)
    }
  }, [user?.id])

  const updateTrade = useCallback(async (tradeId: string, data: TradeFormData) => {
    if (!user?.id) throw new Error('Not authenticated')
    try {
      await tradeService.updateTrade(user.id, tradeId, data)
      // Real-time listener will update trades automatically
    } catch (err: any) {
      const message = err.message || 'Failed to update trade.'
      setError(message)
      throw new Error(message)
    }
  }, [user?.id])

  const deleteTrade = useCallback(async (tradeId: string) => {
    if (!user?.id) throw new Error('Not authenticated')
    if (!tradeId) throw new Error('Invalid trade ID')
    // Optimistic UI — remove from local state immediately
    setTrades(prev => prev.filter(t => t.id !== tradeId))
    try {
      await tradeService.deleteTrade(user.id, tradeId)
    } catch (err: any) {
      const message = err.message || 'Failed to delete trade.'
      setError(message)
      throw err
    }
  }, [user?.id])

  const deleteTrades = useCallback(async (tradeIds: string[]) => {
    if (!user?.id) throw new Error('Not authenticated')
    const validIds = tradeIds.filter(Boolean)
    if (validIds.length === 0) return
    const idsSet = new Set(validIds)
    // Optimistic UI — remove from local state immediately
    setTrades(prev => prev.filter(t => !t.id || !idsSet.has(t.id)))
    try {
      await tradeService.deleteTrades(user.id, validIds)
    } catch (err: any) {
      const message = err.message || 'Failed to delete selected trades.'
      setError(message)
      throw err
    }
  }, [user?.id])

  const clearError = useCallback(() => setError(null), [])

  return { trades, loading, error, addTrade, updateTrade, deleteTrade, deleteTrades, clearError }
}
