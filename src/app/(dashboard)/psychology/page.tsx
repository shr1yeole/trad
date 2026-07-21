'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BrainCircuit,
  Activity,
  Zap,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  CheckCircle2,
  Smile,
  Frown,
  Sliders,
  ShieldCheck,
  BookOpen,
  Loader2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { useTrades } from '@/hooks/useTrades'
import { usePsychologyAnalytics } from '@/hooks/usePsychologyAnalytics'
import { TradeModal } from '@/components/TradeModal'
import { TradeFormData } from '@/types/trade'

function formatCurrency(val: number): string {
  const sign = val >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PsychologyPage() {
  const { trades, loading, error, addTrade, updateTrade } = useTrades()
  const { analytics } = usePsychologyAnalytics(trades)

  const [modalOpen, setModalOpen] = useState(false)

  const handleCreateTrade = async (data: TradeFormData) => {
    await addTrade(data)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <p className="text-sm font-medium">Analyzing emotional capital & mindset analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Trading Psychology
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your emotional capital, discipline score, and execution quality
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto bg-[#d2bbff] text-[#3f008e] hover:bg-[#d2bbff]/90 shadow-[0_0_20px_rgba(210,187,255,0.3)] font-bold transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Log Emotion & Trade
        </Button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Overview Cards (4 Key Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Discipline Score */}
        <Card className="bg-[#0a0d1c]/90 border-t-2 border-t-[#d2bbff] shadow-[0_0_20px_rgba(210,187,255,0.08)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#d2bbff] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Discipline Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{analytics.disciplineScore}/100</div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  analytics.disciplineScore >= 80 ? 'bg-emerald-400' : analytics.disciplineScore >= 60 ? 'bg-amber-400' : 'bg-destructive'
                }`}
                style={{ width: `${analytics.disciplineScore}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Based on plan adherence & mistake frequency</p>
          </CardContent>
        </Card>

        {/* 2. Most Profitable Emotion */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Smile className="h-4 w-4 text-emerald-400" /> Most Profitable Emotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {analytics.mostProfitableEmotion ? analytics.mostProfitableEmotion.emotion : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.mostProfitableEmotion ? formatCurrency(analytics.mostProfitableEmotion.totalPnl) : 'No data logged'}
            </p>
          </CardContent>
        </Card>

        {/* 3. Worst Emotion */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Frown className="h-4 w-4 text-destructive" /> Worst Emotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {analytics.worstEmotion ? analytics.worstEmotion.emotion : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.worstEmotion ? formatCurrency(analytics.worstEmotion.totalPnl) : 'No data logged'}
            </p>
          </CardContent>
        </Card>

        {/* 4. Most Common Mistake */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Top Trading Mistake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-400 truncate">
              {analytics.mostCommonMistake ? analytics.mostCommonMistake.tag : 'None'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Logged {analytics.mostCommonMistake ? analytics.mostCommonMistake.count : 0} times
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State when no trades exist */}
      {trades.length === 0 && (
        <Card className="border-dashed border-white/20 bg-[#0a0d1c]/40 py-12 text-center">
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-xl bg-[#d2bbff]/10 flex items-center justify-center text-[#d2bbff]">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">No psychology logs recorded yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Log your emotional state, confidence level, and execution quality on your trades to unlock mindset analytics.
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)} className="bg-[#d2bbff] text-[#3f008e] font-bold">
              <Plus className="mr-2 h-4 w-4" /> Log Emotion & Trade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4 Charts Grid */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart 1: Emotion Distribution (Pie Chart) */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#d2bbff]" />
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.emotionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="tradesCount"
                      nameKey="emotion"
                    >
                      {analytics.emotionDistribution.map((entry, index) => (
                        <Cell key={`emotion-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any, name: any, item: any) => [
                        `${val} trades (${item.payload.winRate.toFixed(0)}% Win Rate, ${formatCurrency(item.payload.totalPnl)})`,
                        item.payload.emotion,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Mistake Frequency (Bar Chart) */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Mistake Frequency & Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.mistakeFrequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="tag" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any, name: any, item: any) => [
                        `${val} occurrences (${formatCurrency(item.payload.totalPnl)} Net P&L)`,
                        'Mistake Tag',
                      ]}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Confidence vs Profit Chart */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Confidence Level vs Profit ($)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" dataKey="confidence" name="Confidence Level" unit="%" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <YAxis type="number" dataKey="pnl" name="P&L" unit="$" stroke="#94a3b8" fontSize={11} />
                    <ZAxis type="category" dataKey="pair" name="Pair" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#ffffff20', borderRadius: '8px' }}
                      formatter={(val: any, name: any, item: any) => [
                        name === 'P&L' ? formatCurrency(val) : `${val}%`,
                        name,
                      ]}
                    />
                    <Scatter name="Trades" data={analytics.confidenceVsProfit} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 4: Strategy vs Emotion Analysis */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                Strategy vs Dominant Emotion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">Strategy</th>
                      <th className="px-4 py-3">Dominant Emotion</th>
                      <th className="px-4 py-3">Trades</th>
                      <th className="px-4 py-3">Win Rate</th>
                      <th className="px-4 py-3 text-right">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.strategyVsEmotion.map(item => (
                      <tr key={item.strategy} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-foreground">{item.strategy}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="border-white/10 text-muted-foreground">
                            {item.dominantEmotion}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{item.tradesCount}</td>
                        <td className="px-4 py-2.5 text-foreground">{item.winRate.toFixed(1)}%</td>
                        <td className={`px-4 py-2.5 text-right font-bold ${item.totalPnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                          {formatCurrency(item.totalPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Psychology Timeline Log Table */}
      {trades.length > 0 && (
        <Card className="border-white/10 bg-[#0a0d1c]/90">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Psychology Log Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Mood</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Quality Grade</th>
                    <th className="px-4 py-3">Mistake Tags</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.psychologyTimeline.map(log => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-medium">{log.date}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{log.pair}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            log.emotion === 'Calm' || log.emotion === 'Confident'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : log.emotion === 'FOMO' || log.emotion === 'Anxious' || log.emotion === 'Frustrated'
                              ? 'border-destructive/30 text-destructive bg-destructive/10'
                              : 'border-primary/30 text-primary bg-primary/10'
                          }
                        >
                          {log.emotion}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">{log.confidence}%</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#d2bbff]/10 text-[#d2bbff] border border-[#d2bbff]/20">
                          {log.quality}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.mistakes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {log.mistakes.map(m => (
                              <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive border border-destructive/20">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400/80 text-[11px]">Clean Execution ✓</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${log.pnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                        {formatCurrency(log.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade & Psychology Modal */}
      <TradeModal
        open={modalOpen}
        mode="add"
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTrade}
      />
    </div>
  )
}
