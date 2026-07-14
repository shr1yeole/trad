import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, TrendingUp, Trophy } from 'lucide-react'

const goals = [
  {
    id: '1',
    title: 'Reach $100k Funded Account',
    target: 100000,
    current: 85400,
    deadline: '2024-12-31',
    status: 'IN_PROGRESS',
    icon: Trophy,
    color: 'text-yellow-500'
  },
  {
    id: '2',
    title: 'Maintain 65%+ Win Rate',
    target: 65,
    current: 68.5,
    deadline: '2024-06-30',
    status: 'ACHIEVED',
    icon: Target,
    color: 'text-emerald-400'
  },
  {
    id: '3',
    title: 'Grow Personal Account to $25k',
    target: 25000,
    current: 12450,
    deadline: '2024-12-31',
    status: 'IN_PROGRESS',
    icon: TrendingUp,
    color: 'text-primary'
  }
]

export default function GoalsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">Set, track, and crush your trading objectives.</p>
        </div>
        <Button className="w-full sm:w-auto shadow-[0_0_15px_rgba(173,198,255,0.2)]">
          <Plus className="mr-2 h-4 w-4" /> Create Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.max(0, (goal.current / goal.target) * 100))
          
          return (
            <Card key={goal.id} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div 
                  className={`h-full ${goal.status === 'ACHIEVED' ? 'bg-emerald-400' : 'bg-primary'} transition-all duration-1000`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-white/5 ${goal.color}`}>
                    <goal.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={
                    goal.status === 'ACHIEVED' 
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                      : 'border-primary/30 text-primary bg-primary/10'
                  }>
                    {goal.status === 'ACHIEVED' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{goal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-2xl font-bold">
                      {goal.title.includes('%') ? `${goal.current}%` : `$${goal.current.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {goal.title.includes('%') ? `${goal.target}%` : `$${goal.target.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-muted-foreground">{progress.toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span>Deadline</span>
                  <span className="font-medium text-foreground">{goal.deadline}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
