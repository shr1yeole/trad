import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

// Placeholder days to render a grid
const days: Array<{ day: number; currentMonth: boolean; pnl?: number; trades?: number }> = 
  Array.from({ length: 35 }, (_, i) => {
    const day = i - 2 // Offset to start from a previous month's days
    if (day <= 0) return { day: 30 + day, currentMonth: false }
    if (day > 31) return { day: day - 31, currentMonth: false }
    
    // Add some dummy PnL data to specific days
    let pnl: number | undefined
    let trades: number | undefined
    if (day === 12) { pnl = 280; trades = 3 }
    if (day === 13) { pnl = -155; trades = 2 }
    if (day === 14) { pnl = 700; trades = 4 }
    if (day === 15) { pnl = 120; trades = 1 }

    return { day, currentMonth: true, pnl, trades }
  })

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Calendar</h1>
          <p className="text-muted-foreground mt-1">Your daily performance at a glance.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111827] rounded-lg p-1 border border-white/10">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white/5">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-4 font-medium min-w-[120px] justify-center text-sm">
            May 2024
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white/5">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-[#0a0d1c]/50">
        <div className="grid grid-cols-7 border-b border-white/5">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-5 flex-1">
          {days.map((d, i) => (
            <div 
              key={i} 
              className={`min-h-[120px] p-3 border-b border-r border-white/5 transition-colors hover:bg-white/5 relative group cursor-pointer ${
                !d.currentMonth ? 'bg-background/20 text-muted-foreground opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-sm font-medium ${
                  d.currentMonth && d.day === 14 ? 'h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center -m-1' : ''
                }`}>
                  {d.day}
                </span>
                {d.trades != null && d.trades > 0 && (
                  <span className="text-xs text-muted-foreground">{d.trades} trades</span>
                )}
              </div>
              
              {d.pnl != null && (
                <div className={`mt-4 text-center py-1.5 rounded-md ${
                  d.pnl > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'
                }`}>
                  <span className="font-bold text-sm">
                    {d.pnl > 0 ? '+' : ''}${d.pnl}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
