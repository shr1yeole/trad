import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart as LineChartIcon, BarChart3, PieChart, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your performance metrics and trading edge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0a0d1c]/80 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expectancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142.50</div>
            <p className="text-xs text-muted-foreground mt-1">Per trade average</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0a0d1c]/80 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-8.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Recovered in 14 days</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0d1c]/80 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">1.84</div>
            <p className="text-xs text-muted-foreground mt-1">Excellent return on risk</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0d1c]/80 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETH/USD</div>
            <p className="text-xs text-muted-foreground mt-1">68% Win Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-primary" />
              Cumulative Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px] border border-white/5 mx-6 mb-6 rounded-lg bg-background/50">
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" /> Chart Visualization
            </span>
          </CardContent>
        </Card>

        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              P&L by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px] border border-white/5 mx-6 mb-6 rounded-lg bg-background/50">
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Bar Chart Visualization
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            Performance by Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Breakout Retest', 'Moving Average Bounce', 'Mean Reversion', 'News Catalyst'].map((strategy, i) => (
              <div key={strategy} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="w-8 justify-center">{i + 1}</Badge>
                  <span className="font-medium">{strategy}</span>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right hidden sm:block">
                    <span className="text-muted-foreground block text-xs">Win Rate</span>
                    <span className="font-medium">{[68, 54, 42, 31][i]}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-xs">Net P&L</span>
                    <span className={`font-medium ${i < 2 ? 'text-emerald-400' : (i === 2 ? 'text-foreground' : 'text-destructive')}`}>
                      {i < 2 ? '+' : (i === 2 ? '' : '-')}
                      ${[4250, 1820, 150, 840][i]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
