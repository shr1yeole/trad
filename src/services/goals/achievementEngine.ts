import { Trade } from '@/types/trade'
import { AnalyticsSummary } from '@/lib/analytics'
import { Achievement } from './types'

export function evaluateAchievements(trades: Trade[], analytics: AnalyticsSummary): Achievement[] {
  const totalTrades = trades.length
  const winningTrades = analytics.winningTrades
  const winRate = analytics.winRate
  const netProfit = analytics.netProfit

  const achievementsList: Achievement[] = [
    {
      id: 'ach_first_win_week',
      title: 'First Winning Week',
      description: 'Log a week with a positive net profit.',
      category: 'Profit',
      iconName: 'Trophy',
      unlocked: netProfit > 0 && totalTrades >= 5,
      progress: netProfit > 0 ? 100 : Math.min(90, totalTrades * 18),
    },
    {
      id: 'ach_10_wins',
      title: '10 Winning Trades',
      description: 'Execute 10 profitable trades.',
      category: 'Milestone',
      iconName: 'Award',
      unlocked: winningTrades >= 10,
      progress: Math.min(100, (winningTrades / 10) * 100),
    },
    {
      id: 'ach_50_wins',
      title: '50 Winning Trades',
      description: 'Execute 50 profitable trades.',
      category: 'Milestone',
      iconName: 'Sparkles',
      unlocked: winningTrades >= 50,
      progress: Math.min(100, (winningTrades / 50) * 100),
    },
    {
      id: 'ach_100_trades',
      title: '100 Trades Completed',
      description: 'Log 100 total trades in your journal.',
      category: 'Milestone',
      iconName: 'BookOpen',
      unlocked: totalTrades >= 100,
      progress: Math.min(100, (totalTrades / 100) * 100),
    },
    {
      id: 'ach_1000_trades',
      title: '1000 Trades Master',
      description: 'Import or log 1000 trades.',
      category: 'Milestone',
      iconName: 'Zap',
      unlocked: totalTrades >= 1000,
      progress: Math.min(100, (totalTrades / 1000) * 100),
    },
    {
      id: 'ach_no_revenge_30',
      title: '30 Days No Revenge',
      description: 'Trade 30 days without any revenge trading tags.',
      category: 'Discipline',
      iconName: 'ShieldCheck',
      unlocked: totalTrades >= 10 && analytics.maxDrawdownPercent < 12,
      progress: totalTrades >= 10 ? 100 : Math.min(90, totalTrades * 9),
    },
    {
      id: 'ach_master_risk',
      title: 'Master Risk Manager',
      description: 'Maintain average R:R above 1:2 and max drawdown below 8%.',
      category: 'Discipline',
      iconName: 'ShieldAlert',
      unlocked: analytics.averageRR >= 2.0 && analytics.maxDrawdownPercent <= 8.0 && totalTrades >= 10,
      progress: analytics.averageRR >= 2.0 ? 100 : Math.min(80, (analytics.averageRR / 2.0) * 100),
    },
    {
      id: 'ach_perfect_rr',
      title: 'Perfect Risk-to-Reward',
      description: 'Achieve an average R:R of 1:2.5 or higher.',
      category: 'Profit',
      iconName: 'Target',
      unlocked: analytics.averageRR >= 2.5 && totalTrades >= 5,
      progress: Math.min(100, (analytics.averageRR / 2.5) * 100),
    },
    {
      id: 'ach_elite_trader',
      title: 'Elite Trader',
      description: 'Maintain a 65%+ Win Rate across 50+ trades.',
      category: 'Streak',
      iconName: 'Crown',
      unlocked: winRate >= 65 && totalTrades >= 50,
      progress: winRate >= 65 ? Math.min(100, (totalTrades / 50) * 100) : Math.min(90, (winRate / 65) * 100),
    },
    {
      id: 'ach_gold_scalper',
      title: 'Gold Scalper',
      description: 'Log 15+ profitable trades on XAU/USD or Forex metals.',
      category: 'Profit',
      iconName: 'Coins',
      unlocked: analytics.bestPair?.symbol.includes('GOLD') || analytics.bestPair?.symbol.includes('XAU') || false,
      progress: analytics.bestPair?.symbol.includes('GOLD') ? 100 : 40,
    },
  ]

  return achievementsList
}
