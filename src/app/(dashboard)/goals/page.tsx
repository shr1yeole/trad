'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Target,
  Plus,
  TrendingUp,
  Trophy,
  ShieldAlert,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
  Sliders,
  Trash2,
  Edit2,
  CheckSquare,
  ShieldCheck,
  Crown,
  Coins,
  Loader2,
  X,
  Check,
} from 'lucide-react'
import { useGoalsAndRules } from '@/hooks/useGoalsAndRules'
import { CustomTradingRule } from '@/services/goals/types'

export default function GoalsPage() {
  const {
    trades,
    loading,
    goals,
    riskRules,
    customRules,
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
  } = useGoalsAndRules()

  const [activeTab, setActiveTab] = useState<'goals' | 'risk' | 'checklist' | 'achievements'>('goals')
  const [newRuleTitle, setNewRuleTitle] = useState('')
  const [newRuleDesc, setNewRuleDesc] = useState('')
  const [newRuleCategory, setNewRuleCategory] = useState<'Risk' | 'Execution' | 'Strategy' | 'Psychology'>('Execution')
  const [showAddRule, setShowAddRule] = useState(false)

  // Edit Goal Local State & Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [goalsSavedToast, setGoalsSavedToast] = useState(false)
  const [editGoals, setEditGoals] = useState({
    dailyProfitGoal: goals.dailyProfitGoal,
    weeklyProfitGoal: goals.weeklyProfitGoal,
    monthlyProfitGoal: goals.monthlyProfitGoal,
    yearlyProfitGoal: goals.yearlyProfitGoal,
    winRateGoal: goals.winRateGoal,
    avgRrGoal: goals.avgRrGoal,
    maxDrawdownGoal: goals.maxDrawdownGoal,
    maxRiskPerTradeGoal: goals.maxRiskPerTradeGoal || 1.5,
  })

  // Sync edit state when Firestore goals load
  useEffect(() => {
    setEditGoals({
      dailyProfitGoal: goals.dailyProfitGoal,
      weeklyProfitGoal: goals.weeklyProfitGoal,
      monthlyProfitGoal: goals.monthlyProfitGoal,
      yearlyProfitGoal: goals.yearlyProfitGoal,
      winRateGoal: goals.winRateGoal,
      avgRrGoal: goals.avgRrGoal,
      maxDrawdownGoal: goals.maxDrawdownGoal,
      maxRiskPerTradeGoal: goals.maxRiskPerTradeGoal || 1.5,
    })
  }, [goals])

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateGoals({
      dailyProfitGoal: Number(editGoals.dailyProfitGoal),
      weeklyProfitGoal: Number(editGoals.weeklyProfitGoal),
      monthlyProfitGoal: Number(editGoals.monthlyProfitGoal),
      yearlyProfitGoal: Number(editGoals.yearlyProfitGoal),
      winRateGoal: Number(editGoals.winRateGoal),
      avgRrGoal: Number(editGoals.avgRrGoal),
      maxDrawdownGoal: Number(editGoals.maxDrawdownGoal),
      maxRiskPerTradeGoal: Number(editGoals.maxRiskPerTradeGoal),
    })
    setGoalsSavedToast(true)
    setIsEditModalOpen(false)
    setTimeout(() => setGoalsSavedToast(false), 3000)
  }

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleTitle.trim()) return
    addCustomRule({
      title: newRuleTitle,
      description: newRuleDesc || 'Custom user rule',
      category: newRuleCategory,
      enabled: true,
    })
    setNewRuleTitle('')
    setNewRuleDesc('')
    setShowAddRule(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading Goals, Risk Rules & Discipline Monitor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-6xl mx-auto">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Goals & Smart Discipline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time rule monitoring, goal tracking, streaks, and achievement milestones
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'goals'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Trading Goals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'risk'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-muted-foreground hover:text-amber-400'
            }`}
          >
            Risk Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'bg-[#d2bbff] text-[#3f008e] font-bold shadow'
                : 'text-muted-foreground hover:text-[#d2bbff]'
            }`}
          >
            Rules Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-muted-foreground hover:text-emerald-400'
            }`}
          >
            Achievements
          </button>
        </div>
      </div>

      {/* Motivational Card Banner (Section 9) */}
      <Card className="bg-gradient-to-r from-[#0a0d1c] via-[#111827] to-[#0a0d1c] border-[#d2bbff]/20 shadow-[0_0_25px_rgba(210,187,255,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#d2bbff]" />
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#d2bbff] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> {motivationalCard.title}
            </div>
            <p className="text-sm font-medium text-foreground italic leading-relaxed">
              "{motivationalCard.quote}"
            </p>
          </div>
          <Badge variant="outline" className="border-[#d2bbff]/30 text-[#d2bbff] bg-[#d2bbff]/10 text-xs shrink-0">
            {motivationalCard.author}
          </Badge>
        </CardContent>
      </Card>

      {/* Discipline Dashboard Summary (Section 8) & Streaks (Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Rate */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Rule Compliance Rate
              <CheckSquare className="h-4 w-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-extrabold text-emerald-400">{ruleSummary.complianceRate}%</div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${ruleSummary.complianceRate}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ruleSummary.rulesFollowedCount} Followed / {ruleSummary.rulesBrokenCount} Broken
            </p>
          </CardContent>
        </Card>

        {/* Winning Days Streak */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Winning Days Streak
              <Flame className="h-4 w-4 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-amber-400">{streaks.winningDaysStreak} Days</div>
            <p className="text-[11px] text-muted-foreground">Consecutive profitable trading days</p>
          </CardContent>
        </Card>

        {/* Discipline Streak */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Discipline Streak
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-primary">{streaks.disciplineStreak} Days</div>
            <p className="text-[11px] text-muted-foreground">Days with 100% rule adherence</p>
          </CardContent>
        </Card>

        {/* No Revenge Streak */}
        <Card className="bg-[#0a0d1c]/90 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              No Revenge Streak
              <Trophy className="h-4 w-4 text-[#d2bbff]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-[#d2bbff]">{streaks.noRevengeStreak} Days</div>
            <p className="text-[11px] text-muted-foreground">Zero revenge trades logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Notifications & Alerts Banner (Section 5 & 4) */}
      {ruleSummary.violations.length > 0 && (
        <Card className="bg-destructive/10 border-destructive/20 text-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Active Real-Time Rule Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {ruleSummary.violations.map((v, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-black/20 border border-destructive/20 flex items-center justify-between">
                <div>
                  <span className="font-bold">{v.ruleTitle}: </span>
                  <span>{v.message}</span>
                </div>
                <Badge variant="secondary" className="bg-destructive/20 text-destructive text-[10px]">
                  {v.timestamp}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 1: TRADING GOALS (Section 1) */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section Header with Edit Goals Button */}
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Active Trading Targets
              </h3>
              <p className="text-xs text-muted-foreground">Track your progress toward profit targets and performance benchmarks</p>
            </div>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="shadow-[0_0_15px_rgba(173,198,255,0.25)] font-semibold"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit Goals
            </Button>
          </div>

          {/* Goals Saved Toast Banner */}
          {goalsSavedToast && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Goal targets saved successfully!
              </span>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Synced</Badge>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalProgress.map(item => (
              <Card key={item.id} className="relative overflow-hidden group hover:border-primary/50 transition-colors bg-[#0a0d1c]/90 border-white/10">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <div
                    className={`h-full ${item.isAchieved ? 'bg-emerald-400' : 'bg-primary'} transition-all duration-700`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-white/5 text-primary flex items-center gap-2">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditModalOpen(true)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/10"
                        title="Edit Goal"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Badge
                        variant="outline"
                        className={
                          item.isAchieved
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-primary/30 text-primary bg-primary/10'
                        }
                      >
                        {item.isAchieved ? 'Achieved' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-base font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-extrabold">
                        {item.unit === '$' ? `$${item.currentValue.toLocaleString()}` : item.unit === '%' ? `${item.currentValue}%` : item.currentValue}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target: {item.unit === '$' ? `$${item.targetValue.toLocaleString()}` : item.unit === '%' ? `${item.targetValue}%` : item.targetValue}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-muted-foreground">{item.progressPercent.toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Edit Settings Form */}
          <Card className="bg-[#0a0d1c]/90 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" /> Quick Goal Settings
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="text-xs">
                <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Open Full Editor
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGoals} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-muted-foreground font-medium">Daily Profit ($)</label>
                  <Input
                    type="number"
                    value={editGoals.dailyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, dailyProfitGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Weekly Profit ($)</label>
                  <Input
                    type="number"
                    value={editGoals.weeklyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, weeklyProfitGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Monthly Profit ($)</label>
                  <Input
                    type="number"
                    value={editGoals.monthlyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, monthlyProfitGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Yearly Profit ($)</label>
                  <Input
                    type="number"
                    value={editGoals.yearlyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, yearlyProfitGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Win Rate Target (%)</label>
                  <Input
                    type="number"
                    value={editGoals.winRateGoal}
                    onChange={e => setEditGoals({ ...editGoals, winRateGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Average R:R Target</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editGoals.avgRrGoal}
                    onChange={e => setEditGoals({ ...editGoals, avgRrGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Max Drawdown Target (%)</label>
                  <Input
                    type="number"
                    value={editGoals.maxDrawdownGoal}
                    onChange={e => setEditGoals({ ...editGoals, maxDrawdownGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Max Risk / Trade (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editGoals.maxRiskPerTradeGoal}
                    onChange={e => setEditGoals({ ...editGoals, maxRiskPerTradeGoal: Number(e.target.value) })}
                    className="mt-1 bg-white/5 border-white/10 h-10"
                  />
                </div>
                <div className="sm:col-span-3 lg:col-span-4 flex justify-end pt-2">
                  <Button type="submit" className="shadow-[0_0_15px_rgba(173,198,255,0.2)]">
                    Save Goal Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EDIT GOALS MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1329] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Target Goals</h3>
                  <p className="text-xs text-muted-foreground">Adjust profit targets, win rate, and risk benchmarks</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <form onSubmit={handleSaveGoals} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Daily Profit Target ($)
                  </label>
                  <Input
                    type="number"
                    value={editGoals.dailyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, dailyProfitGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Weekly Profit Target ($)
                  </label>
                  <Input
                    type="number"
                    value={editGoals.weeklyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, weeklyProfitGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Monthly Profit Target ($)
                  </label>
                  <Input
                    type="number"
                    value={editGoals.monthlyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, monthlyProfitGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Yearly Profit Target ($)
                  </label>
                  <Input
                    type="number"
                    value={editGoals.yearlyProfitGoal}
                    onChange={e => setEditGoals({ ...editGoals, yearlyProfitGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Win Rate Target (%)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editGoals.winRateGoal}
                    onChange={e => setEditGoals({ ...editGoals, winRateGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Average R:R Target
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editGoals.avgRrGoal}
                    onChange={e => setEditGoals({ ...editGoals, avgRrGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Max Drawdown Target (%)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editGoals.maxDrawdownGoal}
                    onChange={e => setEditGoals({ ...editGoals, maxDrawdownGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold text-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    Max Risk Per Trade (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editGoals.maxRiskPerTradeGoal}
                    onChange={e => setEditGoals({ ...editGoals, maxRiskPerTradeGoal: Number(e.target.value) })}
                    className="bg-black/30 border-white/10 h-10 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="shadow-[0_0_20px_rgba(173,198,255,0.25)]">
                  <Check className="mr-2 h-4 w-4" /> Save Target Goals
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: RISK RULES CONFIGURATION (Section 2) */}
      {activeTab === 'risk' && (
        <Card className="bg-[#0a0d1c]/90 border-white/10 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-400">
              <ShieldAlert className="h-5 w-5" /> Risk Management Threshold Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Daily Loss ($)</p>
                <Input
                  type="number"
                  value={riskRules.maxDailyLoss}
                  onChange={e => updateRiskRules({ maxDailyLoss: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-amber-400 mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Weekly Loss ($)</p>
                <Input
                  type="number"
                  value={riskRules.maxWeeklyLoss}
                  onChange={e => updateRiskRules({ maxWeeklyLoss: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-amber-400 mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Trades / Day</p>
                <Input
                  type="number"
                  value={riskRules.maxTradesPerDay}
                  onChange={e => updateRiskRules({ maxTradesPerDay: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Risk % / Trade</p>
                <Input
                  type="number"
                  step="0.1"
                  value={riskRules.maxRiskPercentage}
                  onChange={e => updateRiskRules({ maxRiskPercentage: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Consecutive Losses</p>
                <Input
                  type="number"
                  value={riskRules.maxConsecutiveLosses}
                  onChange={e => updateRiskRules({ maxConsecutiveLosses: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Lot Size</p>
                <Input
                  type="number"
                  step="0.1"
                  value={riskRules.maxLotSize}
                  onChange={e => updateRiskRules({ maxLotSize: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Max Open Positions</p>
                <Input
                  type="number"
                  value={riskRules.maxOpenPositions}
                  onChange={e => updateRiskRules({ maxOpenPositions: Number(e.target.value) })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-muted-foreground font-medium">Trading Cutoff Time</p>
                <Input
                  type="time"
                  value={riskRules.tradingCutoffTime}
                  onChange={e => updateRiskRules({ tradingCutoffTime: e.target.value })}
                  className="bg-black/30 border-white/10 text-sm font-bold text-foreground mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: RULES CHECKLIST EDITOR (Section 3) */}
      {activeTab === 'checklist' && (
        <Card className="bg-[#0a0d1c]/90 border-white/10 animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#d2bbff]">
              <CheckSquare className="h-5 w-5 text-[#d2bbff]" /> Personal Trading Rules Checklist
            </CardTitle>
            <Button
              onClick={() => setShowAddRule(!showAddRule)}
              size="sm"
              className="bg-[#d2bbff] text-[#3f008e] hover:bg-[#d2bbff]/90 font-bold"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Custom Rule
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Custom Rule Form */}
            {showAddRule && (
              <form onSubmit={handleAddRuleSubmit} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-foreground">Create New Trading Rule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Rule Title (e.g. 'Never trade after 9 PM')..."
                    value={newRuleTitle}
                    onChange={e => setNewRuleTitle(e.target.value)}
                    className="bg-black/30 border-white/10"
                  />
                  <Input
                    placeholder="Short Description..."
                    value={newRuleDesc}
                    onChange={e => setNewRuleDesc(e.target.value)}
                    className="bg-black/30 border-white/10"
                  />
                  <select
                    value={newRuleCategory}
                    onChange={e => setNewRuleCategory(e.target.value as any)}
                    className="bg-[#0a0d1c] border border-white/10 rounded-md px-3 text-xs text-foreground"
                  >
                    <option value="Execution">Execution Rule</option>
                    <option value="Risk">Risk Rule</option>
                    <option value="Strategy">Strategy Rule</option>
                    <option value="Psychology">Psychology Rule</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddRule(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Add Rule
                  </Button>
                </div>
              </form>
            )}

            {/* Custom Rules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                    rule.enabled ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-white/10">
                        {rule.category}
                      </Badge>
                      <h5 className="font-bold text-sm text-foreground">{rule.title}</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    {!rule.isSystemRule && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCustomRule(rule.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: ACHIEVEMENTS SYSTEM (Section 6) */}
      {activeTab === 'achievements' && (
        <Card className="bg-[#0a0d1c]/90 border-white/10 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-400">
              <Award className="h-5 w-5 text-emerald-400" /> Trading Achievements & Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                    ach.unlocked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                      : 'bg-white/5 border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        ach.unlocked
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-muted-foreground'
                      }`}
                    >
                      <Award className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        ach.unlocked
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]'
                          : 'border-white/10 text-muted-foreground text-[10px]'
                      }
                    >
                      {ach.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h4 className="font-bold text-sm">{ach.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ach.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{ach.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${ach.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
