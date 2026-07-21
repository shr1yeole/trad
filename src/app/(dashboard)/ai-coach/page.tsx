'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Zap,
  Award,
  AlertTriangle,
  Clock,
  Target,
  CheckCircle2,
  Activity,
  Flame,
  FileText,
  Calendar as CalendarIcon,
  Layers,
  ChevronRight,
  Loader2,
  BookOpen,
  Compass,
  Sliders,
  ShieldCheck,
  Percent,
} from 'lucide-react'
import { AiOrb } from '@/components/AiOrb'
import { useAICoach } from '@/hooks/useAICoach'
import Link from 'next/link'

function formatCurrency(val: number): string {
  const sign = val >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AICoachPage() {
  const {
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
  } = useAICoach()

  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'chat'>('overview')
  const [inputQuery, setInputQuery] = useState('')

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim()) return
    sendMessage(inputQuery)
    setInputQuery('')
  }

  const handleQuickPrompt = (promptText: string) => {
    setActiveTab('chat')
    sendMessage(promptText)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
        <p className="text-sm font-medium">Running AI Pattern Detection & 20-Point engine analysis...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-6xl mx-auto">
      {/* Header with AI Orb & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-[#d2bbff]/20 bg-gradient-to-r from-[#0a0d1c] via-[#111827] to-[#0a0d1c] shadow-[0_0_35px_rgba(210,187,255,0.08)]">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="h-24 w-24 relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[#d2bbff]/15 rounded-full blur-[20px]" />
            <AiOrb />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#d2bbff]">TradeMind AI Coach</h1>
              <Badge variant="outline" className="border-[#d2bbff]/30 text-[#d2bbff] bg-[#d2bbff]/10 text-[10px]">
                Pattern Engine v6.5
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous pattern detection, multi-score analytics, and risk intelligence
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'patterns'
                ? 'bg-[#d2bbff] text-[#3f008e] shadow font-bold'
                : 'text-muted-foreground hover:text-[#d2bbff]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Pattern Detection
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow'
                : 'text-muted-foreground hover:text-blue-400'
            }`}
          >
            <Bot className="h-3.5 w-3.5" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* TAB 1: OVERVIEW & INSIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Section 1: AI Overview & Scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trading Score & Grade */}
            <Card className="bg-[#0a0d1c]/90 border-t-2 border-t-[#d2bbff] shadow-[0_0_20px_rgba(210,187,255,0.08)] md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#d2bbff] flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Trading Score</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d2bbff]/20 text-[#d2bbff] text-xs font-extrabold border border-[#d2bbff]/30">
                    Grade {multiScores.letterGrade}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-foreground">{multiScores.overallTradingScore}</span>
                  <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                  <Badge
                    variant="outline"
                    className={`ml-auto ${
                      multiScores.healthStatus === 'Excellent'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : multiScores.healthStatus === 'Good'
                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    Health: {multiScores.healthStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {multiScores.summaryStatement}
                </p>
              </CardContent>
            </Card>

            {/* Consistency Score */}
            <Card className="bg-[#0a0d1c]/90 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" /> Consistency Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-extrabold text-emerald-400">{multiScores.consistencyScore}%</div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${multiScores.consistencyScore}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground">Win Rate & Execution stability</p>
              </CardContent>
            </Card>

            {/* Risk Level */}
            <Card className="bg-[#0a0d1c]/90 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" /> Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-3xl font-extrabold ${risk.riskLevel === 'Low' ? 'text-emerald-400' : risk.riskLevel === 'Medium' ? 'text-amber-400' : 'text-destructive'}`}>
                  {risk.riskLevel} Risk
                </div>
                <p className="text-xs text-muted-foreground">Risk Score: {risk.riskScore}/100</p>
              </CardContent>
            </Card>
          </div>

          {/* Smart Alerts & Anomaly Warnings */}
          {aiAlerts.length > 0 && (
            <Card className="bg-[#0a0d1c]/90 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" /> AI Smart Pattern Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                        alert.type === 'danger'
                          ? 'bg-destructive/10 border-destructive/20 text-destructive'
                          : alert.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          : alert.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold">{alert.title}</p>
                          <span className="text-[10px] opacity-75">{alert.confidence}% confidence</span>
                        </div>
                        <p className="opacity-90">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="bg-[#0a0d1c]/90 border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Personalized Data-Driven Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map(rec => (
                  <div key={rec.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[10px]">
                        {rec.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          rec.priority === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: PATTERN DETECTION SECTION */}
      {activeTab === 'patterns' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 6 AI Sub-Scores Bar */}
          <Card className="bg-[#0a0d1c]/90 border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-[#d2bbff]" /> 20-Point Multi-Score Engine Breakdown (Out of 100)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Performance</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">{multiScores.performanceScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Psychology</p>
                  <p className="text-2xl font-extrabold text-[#d2bbff] mt-1">{multiScores.psychologyScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Risk Control</p>
                  <p className="text-2xl font-extrabold text-blue-400 mt-1">{multiScores.riskScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Discipline</p>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">{multiScores.disciplineScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Consistency</p>
                  <p className="text-2xl font-extrabold text-primary mt-1">{multiScores.consistencyScore}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#d2bbff]/10 border border-[#d2bbff]/30">
                  <p className="text-[10px] text-[#d2bbff] font-extrabold uppercase">Overall Score</p>
                  <p className="text-2xl font-extrabold text-foreground mt-1">{multiScores.overallTradingScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insufficient Data Onboarding Card */}
          {trades.length < 3 && (
            <Card className="border-dashed border-white/20 bg-[#0a0d1c]/50 py-8 text-center">
              <CardContent className="space-y-3 flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-[#d2bbff]/10 flex items-center justify-center text-[#d2bbff]">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">More Trade Data Needed for Deep Pattern Intelligence</h3>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Import or log at least 3 to 5 trades to unlock streak detection, quality correlation, and holding time insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detected Patterns Cards Grid */}
          {patternData.patterns.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#d2bbff]" /> Detected Hidden Trading Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patternData.patterns.map(pat => (
                  <Card key={pat.id} className="bg-[#0a0d1c]/90 border-white/10 relative overflow-hidden group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[10px]">
                          {pat.category}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground">{pat.confidenceLevel}% Confidence</span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              pat.priority === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {pat.priority}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold mt-2 text-foreground">{pat.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <p className="text-muted-foreground leading-relaxed">{pat.explanation}</p>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                        <p className="font-bold text-[#d2bbff] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Suggested Action:
                        </p>
                        <p className="text-muted-foreground">{pat.suggestedAction}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Opportunity Finder */}
          {opportunities.length > 0 && (
            <Card className="bg-[#0a0d1c]/90 border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-emerald-400" />
                  Opportunity Finder & Edge Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map(opp => (
                    <div key={opp.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{opp.title}</h4>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                          {opp.expectedImpact}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{opp.description}</p>
                      <p className="text-xs font-semibold text-[#d2bbff]">
                        Action: <span className="text-muted-foreground font-normal">{opp.actionableStep}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trade Quality vs Profitability Table */}
          <Card className="border-white/10 bg-[#0a0d1c]/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Trade Execution Quality Grade vs Profitability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">Quality Grade</th>
                      <th className="px-4 py-3">Trades Count</th>
                      <th className="px-4 py-3">Win Rate</th>
                      <th className="px-4 py-3 text-right">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patternData.qualityStats.map(qs => (
                      <tr key={qs.grade} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-[#d2bbff]/10 text-[#d2bbff] border border-[#d2bbff]/20">
                            Grade {qs.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{qs.tradesCount}</td>
                        <td className="px-4 py-2.5 text-foreground">{qs.winRate.toFixed(1)}%</td>
                        <td className={`px-4 py-2.5 text-right font-bold ${qs.totalPnl >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                          {formatCurrency(qs.totalPnl)}
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

      {/* TAB 3: AI ASSISTANT CHAT */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col bg-[#0a0d1c]/90 border-[#d2bbff]/20 shadow-[0_0_30px_rgba(210,187,255,0.05)] overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#d2bbff]">
              <Bot className="h-5 w-5 text-[#d2bbff]" /> Ask TradeMind AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6 max-h-[480px] overflow-y-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.sender === 'ai'
                      ? 'bg-[#d2bbff]/20 border-[#d2bbff]/30 text-[#d2bbff]'
                      : 'bg-primary/20 border-primary/30 text-primary'
                  }`}
                >
                  {msg.sender === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                <div className="space-y-3 max-w-[80%]">
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'ai'
                        ? 'bg-[#1b1f2e] border border-white/5 rounded-tl-sm text-foreground'
                        : 'bg-primary/10 border border-primary/20 rounded-tr-sm text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {msg.insightCard && (
                    <div className="bg-[#111827] border border-[#d2bbff]/30 rounded-xl p-4 shadow-[0_0_15px_rgba(210,187,255,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#d2bbff]" />
                      <div className="flex items-center gap-2 text-[#d2bbff] mb-1.5 font-medium text-xs">
                        <Sparkles className="h-4 w-4" /> {msg.insightCard.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{msg.insightCard.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5 bg-background/50 backdrop-blur-md">
            <form onSubmit={handleChatSubmit} className="relative flex items-center">
              <Input
                placeholder="Ask TradeMind AI Coach (e.g. 'Analyze my recent losses', 'How to improve win rate?')..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                className="pr-12 bg-[#0E1628]/60 border-white/10 h-12 text-sm rounded-xl focus-visible:ring-[#d2bbff]/30 focus-visible:border-[#d2bbff]/50"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 h-9 w-9 text-[#d2bbff] hover:bg-[#d2bbff]/10 hover:text-[#d2bbff]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <Badge
                variant="secondary"
                onClick={() => handleQuickPrompt('Analyze my recent losses')}
                className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap text-xs"
              >
                Analyze my recent losses
              </Badge>
              <Badge
                variant="secondary"
                onClick={() => handleQuickPrompt('How can I improve my win rate?')}
                className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap text-xs"
              >
                How can I improve my win rate?
              </Badge>
              <Badge
                variant="secondary"
                onClick={() => handleQuickPrompt('Create a trading plan for tomorrow')}
                className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap text-xs"
              >
                Create a trading plan for tomorrow
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
