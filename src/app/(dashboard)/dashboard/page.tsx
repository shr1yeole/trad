'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3,
  Calendar as CalendarIcon,
  BookOpen,
  Plus,
  Upload,
  Loader2,
  BrainCircuit,
  Flame,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { useTrades } from '@/hooks/useTrades'
import { useImportTrades } from '@/hooks/useImportTrades'
import { calculateAnalytics } from '@/lib/analytics'
import { GoalsWidget } from '@/components/GoalsWidget'

function formatCurrency(val: number): string {
  const sign = val >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCurrencyRaw(val: number): string {
  const sign = val >= 0 ? '' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function DashboardPage() {
  const { trades, loading, error } = useTrades()
  const { triggerFilePicker, status: importStatus } = useImportTrades()

  const analytics = useMemo(() => calculateAnalytics(trades), [trades])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Calculating live dashboard analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time performance metrics, risk ratios, and trading statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={triggerFilePicker}
            disabled={importStatus === 'parsing'}
            className="border-white/10 bg-white/5 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Upload className="mr-2 h-4 w-4" /> Import Trades
          </Button>
          <Link href="/journal">
            <Button className="shadow-[0_0_20px_rgba(173,198,255,0.25)] hover:shadow-[0_0_25px_rgba(173,198,255,0.4)]">
              <Plus className="mr-2 h-4 w-4" /> Log Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Overview Cards (8 Key Metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Net Profit */}
        <Card className="relative overflow-hidden group border-white/10 bg-[#0a0d1c]/90 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Profit
            </CardTitle>
            {analytics.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-extrabold ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
              {formatCurrency(analytics.netProfit)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {analytics.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        {/* 2. Win Rate */}
        <Card className="relative overflow-hidden group border-white/10 bg-[#0a0d1c]/90 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Win Rate
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {analytics.winRate.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {analytics.winningTrades} Wins / {analytics.losingTrades} Losses
            </p>
          </CardContent>
        </Card>

        {/* 3. Profit Factor */}
        <Card className="relative overflow-hidden group border-white/10 bg-[#0a0d1c]/90 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profit Factor
            </CardTitle>
            <Activity className="h-4 w-4 text-[#d2bbff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#d2bbff]">
              {analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Gross Profit / Gross Loss
            </p>
          </CardContent>
        </Card>

        {/* 4. Max Drawdown */}
        <Card className="relative overflow-hidden group border-white/10 bg-[#0a0d1c]/90 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Max Drawdown
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-destructive">
              -${analytics.maxDrawdown.toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Peak-to-trough decline
            </p>
          </CardContent>
        </Card>

        {/* 5. Total Profit */}
        <Card className="border-white/10 bg-[#0a0d1c]/80">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Profit</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">${analytics.totalProfit.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* 6. Total Loss */}
        <Card className="border-white/10 bg-[#0a0d1c]/80">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Loss</p>
            <p className="text-xl font-bold text-destructive mt-1">-${analytics.totalLoss.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* 7. Average RR */}
        <Card className="border-white/10 bg-[#0a0d1c]/80">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average R:R</p>
            <p className="text-xl font-bold text-foreground mt-1">1:{analytics.averageRR.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* 8. Total Trades */}
        <Card className="border-white/10 bg-[#0a0d1c]/80">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Logged Trades</p>
            <p className="text-xl font-bold text-foreground mt-1">{analytics.totalTrades}</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Smart Discipline Compact Widget */}
      <GoalsWidget />

      {/* Empty State Banner when no trades exist */}
      {trades.length === 0 && (
        <Card className="border-dashed border-white/20 bg-[#0a0d1c]/40 py-12 text-center">
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">No trades recorded yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Log your first trade manually or import a MetaTrader / CSV report to unlock full live analytics and equity curves.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={triggerFilePicker} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Import Trades
              </Button>
              <Link href="/journal">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Entry
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Charts Grid */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart 1: Equity Curve */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Cumulative Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.equityCurve}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cumulative P&L']}
                    />
                    <Area type="monotone" dataKey="cumulativePnl" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Monthly Profit */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyProfit}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Monthly P&L']}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {analytics.monthlyProfit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Weekly Performance */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#d2bbff]" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Weekly P&L']}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {analytics.weeklyPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 4: Daily P&L */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Daily P&L Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyPnL}>
                    <defs>
                      <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Daily P&L']}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#dailyGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deep Statistics & Breakdown Grid */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Trade & Risk Statistics */}
          <Card className="border-white/10 bg-[#0a0d1c]/90 space-y-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Trade & Risk Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Winning Trades</span>
                <span className="font-semibold text-emerald-400">{analytics.winningTrades}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Losing Trades</span>
                <span className="font-semibold text-destructive">{analytics.losingTrades}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Breakeven Trades</span>
                <span className="font-semibold text-muted-foreground">{analytics.breakevenTrades}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Average Win</span>
                <span className="font-semibold text-emerald-400">${analytics.averageWin.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Average Loss</span>
                <span className="font-semibold text-destructive">-${analytics.averageLoss.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Largest Win</span>
                <span className="font-semibold text-emerald-400">${analytics.largestWin.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Largest Loss</span>
                <span className="font-semibold text-destructive">-${Math.abs(analytics.largestLoss).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-muted-foreground">Best R:R</span>
                <span className="font-semibold text-foreground">1:{analytics.bestRR.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Worst R:R</span>
                <span className="font-semibold text-foreground">1:{analytics.worstRR.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pair Performance */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Pair & Instrument Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-xs text-muted-foreground">Best Pair</p>
                  <p className="text-base font-bold text-emerald-400 mt-1">
                    {analytics.bestPair ? analytics.bestPair.symbol : '—'}
                  </p>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    {analytics.bestPair ? formatCurrency(analytics.bestPair.totalPnl) : ''}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <p className="text-xs text-muted-foreground">Worst Pair</p>
                  <p className="text-base font-bold text-destructive mt-1">
                    {analytics.worstPair ? analytics.worstPair.symbol : '—'}
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5">
                    {analytics.worstPair ? formatCurrency(analytics.worstPair.totalPnl) : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Top Symbols by P&L
                </p>
                {analytics.pairStats.slice(0, 5).map(pair => (
                  <div key={pair.symbol} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                    <span className="font-medium text-foreground">{pair.symbol}</span>
                    <div className="text-right">
                      <span className={`font-semibold ${pair.totalPnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                        {formatCurrencyRaw(pair.totalPnl)}
                      </span>
                      <span className="text-muted-foreground ml-2">({pair.winRate.toFixed(0)}% Win)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Records & Streaks */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Records & Trading Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Flame className="h-4 w-4 text-amber-400" /> Longest Win Streak
                  </span>
                  <span className="font-bold text-amber-400 text-sm">{analytics.longestWinStreak} Trades</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Longest Loss Streak
                  </span>
                  <span className="font-bold text-destructive text-sm">{analytics.longestLosingStreak} Trades</span>
                </div>
              </div>

              <div className="space-y-3 text-sm pt-1">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-muted-foreground">Best Trading Day</span>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">
                      {analytics.bestDay ? formatCurrency(analytics.bestDay.pnl) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.bestDay ? analytics.bestDay.date : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Worst Trading Day</span>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {analytics.worstDay ? formatCurrency(analytics.worstDay.pnl) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.worstDay ? analytics.worstDay.date : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trading Sessions */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Session Performance
                </p>
                <div className="space-y-1.5">
                  {analytics.sessionStats.map(session => (
                    <div key={session.session} className="flex items-center justify-between text-xs p-1.5 rounded bg-white/5">
                      <span className="font-medium">{session.session} Session</span>
                      <span className={`font-semibold ${session.pnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                        {formatCurrencyRaw(session.pnl)} ({session.trades} trades)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
