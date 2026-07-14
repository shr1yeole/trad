import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Target, BrainCircuit, Activity, LineChart } from 'lucide-react'

const stats = [
  {
    title: 'Net P&L',
    value: '+$12,450.00',
    change: '+14.5%',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    title: 'Win Rate',
    value: '68.5%',
    change: '+2.4%',
    trend: 'up',
    icon: Target,
  },
  {
    title: 'Profit Factor',
    value: '2.4',
    change: '-0.1',
    trend: 'down',
    icon: Activity,
  },
  {
    title: 'Psychology Score',
    value: '92/100',
    change: '+5 pts',
    trend: 'up',
    icon: BrainCircuit,
  },
]

const recentTrades = [
  { id: '1', symbol: 'BTC/USD', type: 'LONG', entry: '$64,200', exit: '$65,100', pnl: '+$450.00', pnlClass: 'text-emerald-400', date: '2024-05-14 14:30' },
  { id: '2', symbol: 'ETH/USD', type: 'SHORT', entry: '$3,100', exit: '$3,050', pnl: '+$250.00', pnlClass: 'text-emerald-400', date: '2024-05-14 10:15' },
  { id: '3', symbol: 'SOL/USD', type: 'LONG', entry: '$145.20', exit: '$142.10', pnl: '-$155.00', pnlClass: 'text-destructive', date: '2024-05-13 09:45' },
  { id: '4', symbol: 'AAPL', type: 'LONG', entry: '$182.40', exit: '$185.20', pnl: '+$280.00', pnlClass: 'text-emerald-400', date: '2024-05-12 15:20' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="default">
          New Trade
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group">
            {/* Subtle highlight gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 flex items-center text-xs">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-400' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart Area placeholder */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full rounded-lg border border-white/5 bg-[#0a0d1c]/50 flex items-center justify-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <LineChart className="h-5 w-5" /> Chart Data Visualization
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Panel */}
        <Card className="col-span-1 border-t-2 border-t-[#d2bbff] shadow-[0_0_15px_rgba(210,187,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#d2bbff]/5 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#d2bbff]">
              <BrainCircuit className="h-5 w-5" />
              AI Coach Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Observation:</strong> You've had a strong winning streak on Tech stocks this week, but your risk/reward ratio has dipped. 
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Recommendation:</strong> Consider tightening your stop-losses on the upcoming NVDA earnings play to protect profits.
              </p>
            </div>
            <Button variant="ai" className="w-full mt-4">
              Chat with AI Coach
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Symbol</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Exit</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">P&L</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 font-medium text-foreground">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        trade.type === 'LONG' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{trade.entry}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trade.exit}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trade.date}</td>
                    <td className={`px-4 py-3 text-right font-medium ${trade.pnlClass}`}>
                      {trade.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
