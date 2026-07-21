import { useMemo } from 'react'
import { Trade } from '@/types/trade'
import { calculatePsychologyAnalytics, PsychologySummary } from '@/lib/psychologyAnalytics'

export function usePsychologyAnalytics(trades: Trade[]) {
  const analytics: PsychologySummary = useMemo(() => {
    return calculatePsychologyAnalytics(trades)
  }, [trades])

  return {
    analytics,
  }
}
