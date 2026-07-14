import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, Activity, Battery, BatteryCharging, Zap, Plus } from 'lucide-react'

export default function PsychologyPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Psychology</h1>
          <p className="text-muted-foreground mt-1">Track your emotional capital and mindset.</p>
        </div>
        <Button className="w-full sm:w-auto bg-[#d2bbff] text-[#3f008e] hover:bg-[#d2bbff]/90 shadow-[0_0_15px_rgba(210,187,255,0.3)]">
          <Plus className="mr-2 h-4 w-4" /> Log Emotion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0a0d1c]/80 border-t-2 border-t-[#d2bbff] shadow-[0_0_20px_rgba(210,187,255,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#d2bbff]">
              <BrainCircuit className="h-4 w-4" /> Current State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">Focused</div>
            <p className="text-xs text-muted-foreground mt-1">Logged 2 hours ago</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0d1c]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" /> Average Stress Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">3.4</div>
              <span className="text-sm text-muted-foreground mb-1">/ 10</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '34%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0d1c]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Mental Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-3xl font-bold text-primary">
              <BatteryCharging className="h-6 w-6" /> 85%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Optimal zone for trading</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle>Mood vs. Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">How your emotional state correlates with your P&L.</p>
            <div className="flex-1 border border-white/5 rounded-lg bg-background/50 flex items-center justify-center min-h-[250px]">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" /> Correlation Scatter Plot
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Psychology Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { emotion: 'Focused', stress: 2, energy: 9, note: 'Had a good night sleep, feeling sharp for the NY session.', time: 'Today, 08:30 AM' },
                { emotion: 'Anxious', stress: 7, energy: 5, note: 'Took a loss early on, feeling the urge to revenge trade. Stepping away.', time: 'Yesterday, 10:15 AM' },
                { emotion: 'Calm', stress: 3, energy: 7, note: 'Market is slow, no setups forming. Patiently waiting.', time: 'May 12, 09:00 AM' },
                { emotion: 'Euphoric', stress: 4, energy: 10, note: 'Hit my weekly goal in two trades. Need to be careful not to get overconfident.', time: 'May 10, 14:45 PM' },
              ].map((log, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-3 transition-colors hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        log.emotion === 'Focused' || log.emotion === 'Calm' 
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                          : log.emotion === 'Anxious' 
                          ? 'border-destructive/30 text-destructive bg-destructive/10'
                          : 'border-primary/30 text-primary bg-primary/10'
                      }>
                        {log.emotion}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="text-muted-foreground">Stress: <span className="text-foreground">{log.stress}/10</span></span>
                      <span className="text-muted-foreground">Energy: <span className="text-foreground">{log.energy}/10</span></span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{log.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
