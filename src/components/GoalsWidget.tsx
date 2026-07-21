'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, ShieldAlert, Award, ChevronRight, Activity } from 'lucide-react'
import { useGoalsAndRules } from '@/hooks/useGoalsAndRules'
import Link from 'next/link'

export function GoalsWidget() {
  const { goalProgress, ruleSummary, achievements, goals } = useGoalsAndRules()

  const dailyProfitItem = goalProgress.find(g => g.id === 'daily_profit')
  const nextAchievement = achievements.find(a => !a.unlocked) || achievements[0]

  return (
    <Card className="border-white/10 bg-[#0a0d1c]/90 shadow-[0_0_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Target className="h-4 w-4 text-primary" /> Daily Goals & Smart Discipline Monitor
        </CardTitle>
        <Link href="/goals">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer">
            View All Rules <ChevronRight className="h-3 w-3 ml-0.5" />
          </Badge>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {/* 1. Today's Profit Target */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Daily Target</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1">
              ${dailyProfitItem?.currentValue.toFixed(0) || 0} / ${goals.dailyProfitGoal}
            </p>
            <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${dailyProfitItem?.progressPercent || 0}%` }}
              />
            </div>
          </div>

          {/* 2. Today's Risk Used */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Risk Used Today</p>
            <p className="text-base font-extrabold text-amber-400 mt-1">
              {ruleSummary.todayRiskUsedPercent.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Cap: 4.0%</p>
          </div>

          {/* 3. Trades Remaining */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Trades Remaining</p>
            <p className="text-base font-extrabold text-foreground mt-1">
              {ruleSummary.tradesRemainingToday}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Max {ruleSummary.todayTradesCount + ruleSummary.tradesRemainingToday} / day</p>
          </div>

          {/* 4. Discipline Compliance */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Rule Compliance</p>
            <p className="text-base font-extrabold text-[#d2bbff] mt-1">
              {ruleSummary.complianceRate}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {ruleSummary.rulesFollowedCount} followed / {ruleSummary.rulesBrokenCount} broken
            </p>
          </div>

          {/* 5. Next Achievement */}
          <div className="p-3 rounded-xl bg-[#d2bbff]/10 border border-[#d2bbff]/20 flex flex-col justify-between">
            <p className="text-[10px] text-[#d2bbff] uppercase font-bold flex items-center justify-center gap-1">
              <Award className="h-3 w-3" /> Next Achievement
            </p>
            <p className="text-xs font-bold text-foreground truncate mt-1">
              {nextAchievement?.title || 'Elite Trader'}
            </p>
            <div className="w-full bg-white/10 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-[#d2bbff] h-full rounded-full"
                style={{ width: `${nextAchievement?.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
