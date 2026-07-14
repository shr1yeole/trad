import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus, Calendar as CalendarIcon, Download, SlidersHorizontal } from 'lucide-react'

const journalEntries = [
  { 
    id: '1', 
    date: '2024-05-14',
    symbol: 'BTC/USD', 
    type: 'LONG', 
    setup: 'Breakout Retest',
    pnl: '+$450.00', 
    pnlClass: 'text-emerald-400', 
    mood: 'Calm',
    notes: 'Waited for the 1H candle to close above the previous resistance. Entry was clean, stopped out 50% at target 1, trailed the rest. Textbook execution.',
    tags: ['Crypto', 'Day Trade', 'Trend Following']
  },
  { 
    id: '2', 
    date: '2024-05-14',
    symbol: 'ETH/USD', 
    type: 'SHORT', 
    setup: 'Moving Average Rejection',
    pnl: '+$250.00', 
    pnlClass: 'text-emerald-400', 
    mood: 'Focused',
    notes: 'Price rejected the 200 EMA on the 15m timeframe. Volume confirmed the reversal. Quick scalp.',
    tags: ['Crypto', 'Scalp']
  },
  { 
    id: '3', 
    date: '2024-05-13',
    symbol: 'SOL/USD', 
    type: 'LONG', 
    setup: 'Support Bounce',
    pnl: '-$155.00', 
    pnlClass: 'text-destructive', 
    mood: 'Frustrated',
    notes: 'Entered slightly early before confirmation. Bitcoin dragged the whole market down. Need to wait for full 15m close next time.',
    tags: ['Crypto', 'Mistake', 'FOMO']
  },
]

export default function TradeJournalPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground mt-1">Review your setups, notes, and emotional states.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="w-full sm:w-auto shadow-[0_0_15px_rgba(173,198,255,0.2)] hover:shadow-[0_0_20px_rgba(173,198,255,0.4)] transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      <Card className="bg-[#0a0d1c]/80">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by symbol, tags, or notes..." 
                className="w-full pl-9 bg-background/50"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Button variant="outline" size="sm" className="shrink-0 bg-background/50">
                <CalendarIcon className="mr-2 h-4 w-4" /> Date Range
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 bg-background/50">
                <Filter className="mr-2 h-4 w-4" /> Asset Class
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 bg-background/50">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Setups
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {journalEntries.map((entry) => (
          <Card key={entry.id} className="group overflow-hidden relative transition-all hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold">{entry.symbol}</span>
                    <Badge variant="outline" className={entry.type === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-destructive/30 text-destructive bg-destructive/10'}>
                      {entry.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-auto md:ml-0 flex items-center">
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {entry.date}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Setup / Strategy</h3>
                    <p className="text-sm">{entry.setup}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                    <p className="text-sm leading-relaxed">{entry.notes}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    {entry.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-6 min-w-32 md:border-l md:border-white/5 md:pl-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Net P&L</p>
                    <p className={`text-xl font-bold ${entry.pnlClass}`}>{entry.pnl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mood</p>
                    <Badge variant="outline" className="border-[#d2bbff]/30 text-[#d2bbff] bg-[#d2bbff]/10">
                      {entry.mood}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
