'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  PieChart as PieChartIcon,
  BarChart3,
  Calendar as CalendarIcon,
  BookOpen,
  Plus,
  Upload,
  Loader2,
  BrainCircuit,
  Filter,
  X,
  ShieldAlert,
  DollarSign,
  Layers,
  Repeat,
  Flame,
  ArrowUpDown,
  LineChart as LineChartIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useTrades } from '@/hooks/useTrades'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useImportTrades } from '@/hooks/useImportTrades'
import Link from 'next/link'

function formatCurrency(val: number): string {
  const sign = val >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCurrencyRaw(val: number): string {
  const sign = val >= 0 ? '' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AnalyticsPage() {
  const { trades, loading, error } = useTrades()
  const { triggerFilePicker, status: importStatus } = useImportTrades()

  const {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    filteredTrades,
    analytics,
    availablePairs,
    availableStrategies,
  } = useAnalytics(trades)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Computing advanced live analytics & charts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Advanced Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep dive into your performance metrics, risk expectancy, and trading edge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={triggerFilePicker}
            disabled={importStatus === 'parsing'}
            className="border-white/10 bg-white/5 hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Upload className="mr-2 h-4 w-4 text-cyan-400" /> Import Trades
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

      {/* Global Filter Bar */}
      <Card className="bg-[#0a0d1c]/90 border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Filter className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" /> Global Analytics Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2 border border-rose-500/20"
              >
                <X className="mr-1 h-3 w-3 text-rose-400" /> Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Date Range: From */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-cyan-400 shrink-0" />
                From Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="h-8 text-xs bg-background/50 border-white/10 focus:border-cyan-500/50"
              />
            </div>

            {/* 2. Date Range: To */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-cyan-400 shrink-0" />
                To Date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="h-8 text-xs bg-background/50 border-white/10 focus:border-cyan-500/50"
              />
            </div>

            {/* 3. Pair Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3 text-blue-400 shrink-0" />
                Pair / Symbol
              </label>
              <select
                value={filters.pair}
                onChange={e => setFilters(prev => ({ ...prev, pair: e.target.value }))}
                className="h-8 w-full px-2 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Pairs ({availablePairs.length})</option>
                {availablePairs.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 4. Strategy Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-amber-400 shrink-0" />
                Strategy / Setup
              </label>
              <select
                value={filters.strategy}
                onChange={e => setFilters(prev => ({ ...prev, strategy: e.target.value }))}
                className="h-8 w-full px-2 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="All">All Strategies ({availableStrategies.length})</option>
                {availableStrategies.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 5. Session Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
                Trading Session
              </label>
              <select
                value={filters.session}
                onChange={e => setFilters(prev => ({ ...prev, session: e.target.value }))}
                className="h-8 w-full px-2 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Sessions</option>
                <option value="Asian">Asian Session</option>
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="Other">Other Hours</option>
              </select>
            </div>

            {/* 6. Trade Type Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-purple-400 shrink-0" />
                Trade Type
              </label>
              <select
                value={filters.tradeType}
                onChange={e => setFilters(prev => ({ ...prev, tradeType: e.target.value }))}
                className="h-8 w-full px-2 rounded-md bg-background/50 border border-white/10 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="All">All Types (Buy & Sell)</option>
                <option value="Buy">Buy (Long) Only</option>
                <option value="Sell">Sell (Short) Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 13 Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Net Profit */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-xl font-bold ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
              {formatCurrency(analytics.netProfit)}
            </div>
          </CardContent>
        </Card>

        {/* Expectancy */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Expectancy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">
              {formatCurrencyRaw(analytics.expectancy)}
            </div>
            <p className="text-[10px] text-muted-foreground">Per trade avg</p>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-primary">
              {analytics.winRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-muted-foreground">{analytics.winningTrades}W / {analytics.losingTrades}L</p>
          </CardContent>
        </Card>

        {/* Profit Factor */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-[#d2bbff]">
              {analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Max Drawdown */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-destructive">
              -${analytics.maxDrawdown.toFixed(2)}
            </div>
            <p className="text-[10px] text-destructive/80">-{analytics.maxDrawdownPercent.toFixed(1)}%</p>
          </CardContent>
        </Card>

        {/* Average RR */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Average R:R</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-foreground">
              1:{analytics.averageRR.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Profit</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">${analytics.grossProfit.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Gross Loss */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Gross Loss</p>
            <p className="text-lg font-bold text-destructive mt-0.5">-${analytics.grossLoss.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Total Trades */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total Trades</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{analytics.totalTrades}</p>
          </CardContent>
        </Card>

        {/* Winning Trades */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Winning Trades</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{analytics.winningTrades}</p>
          </CardContent>
        </Card>

        {/* Largest Win */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Largest Win</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">${analytics.largestWin.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Largest Loss */}
        <Card className="bg-[#0a0d1c]/80 border-white/10">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Largest Loss</p>
            <p className="text-lg font-bold text-destructive mt-0.5">-${Math.abs(analytics.largestLoss).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State Banner */}
      {filteredTrades.length === 0 && (
        <Card className="border-dashed border-white/20 bg-[#0a0d1c]/40 py-12 text-center">
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {trades.length === 0 ? 'No trades recorded yet' : 'No trades match your active filters'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                {trades.length === 0
                  ? 'Log your first trade manually or import a MetaTrader/CSV report to unlock advanced analytics.'
                  : 'Try adjusting your date range, pair, strategy, or session filters.'}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline">
                  <X className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
              ) : (
                <>
                  <Button onClick={triggerFilePicker} variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import Trades
                  </Button>
                  <Link href="/journal">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Entry
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8 Charts Grid */}
      {filteredTrades.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart 1: Interactive Equity Curve */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-emerald-400" />
                Interactive Cumulative Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.equityCurve}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="cumulativePnl" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#eqGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Drawdown Curve */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Drawdown Curve (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.drawdownCurve}>
                    <defs>
                      <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.0} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Drawdown']}
                    />
                    <Area type="monotone" dataKey="drawdownPercent" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#ddGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Monthly Performance */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
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

          {/* Chart 4: Weekly Performance */}
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

          {/* Chart 5: Win/Loss Pie Chart */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Win / Loss Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.winLossPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.winLossPie.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`${val} trades`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 6: Trading Session Bar Chart */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Performance by Trading Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.sessionStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Session P&L']}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {analytics.sessionStats.map((entry, index) => (
                        <Cell key={`session-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 7: Profit by Symbol Bar Chart */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-400" />
                Profit by Symbol / Instrument
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.pairStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Net P&L']}
                    />
                    <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
                      {analytics.pairStats.slice(0, 8).map((entry, index) => (
                        <Cell key={`pair-${index}`} fill={entry.totalPnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 8: Daily P&L */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Daily P&L Area Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyPnL}>
                    <defs>
                      <linearGradient id="dailyPnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Daily P&L']}
                    />
                    <Area type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#dailyPnlGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tables & Time Analysis Section */}
      {filteredTrades.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Table 1: Pair Performance */}
            <Card className="border-white/10 bg-[#0a0d1c]/90">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pair Performance Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Trades</th>
                        <th className="px-4 py-3">Win Rate</th>
                        <th className="px-4 py-3">Avg Win</th>
                        <th className="px-4 py-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.pairStats.map(pair => (
                        <tr key={pair.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-foreground">{pair.symbol}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{pair.tradesCount}</td>
                          <td className="px-4 py-2.5 text-foreground">{pair.winRate.toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-emerald-400">${pair.avgWin.toFixed(2)}</td>
                          <td className={`px-4 py-2.5 text-right font-bold ${pair.totalPnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                            {formatCurrencyRaw(pair.totalPnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Table 2: Strategy Performance */}
            <Card className="border-white/10 bg-[#0a0d1c]/90">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Strategy Performance Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">Setup / Strategy</th>
                        <th className="px-4 py-3">Trades</th>
                        <th className="px-4 py-3">Win Rate</th>
                        <th className="px-4 py-3">Profit Factor</th>
                        <th className="px-4 py-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.strategyStats.map(strat => (
                        <tr key={strat.strategy} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{strat.strategy}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{strat.tradesCount}</td>
                          <td className="px-4 py-2.5 text-foreground">{strat.winRate.toFixed(1)}%</td>
                          <td className="px-4 py-2.5 text-[#d2bbff]">
                            {strat.profitFactor === Infinity ? '∞' : strat.profitFactor.toFixed(2)}
                          </td>
                          <td className={`px-4 py-2.5 text-right font-bold ${strat.totalPnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                            {formatCurrencyRaw(strat.totalPnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Analysis: Weekday Breakdown */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Performance by Weekday
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {analytics.weekdayStats.map(wd => (
                  <div key={wd.dayName} className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">{wd.dayName}</p>
                    <p className={`text-base font-bold ${wd.pnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                      {formatCurrencyRaw(wd.pnl)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {wd.trades} trades ({wd.winRate.toFixed(0)}% W)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
