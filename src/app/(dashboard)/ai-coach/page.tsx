import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, User, Sparkles } from 'lucide-react'
import { AiOrb } from '@/components/AiOrb'

export default function AICoachPage() {
  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-5xl mx-auto">
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#d2bbff]/10 rounded-full blur-[20px]" />
          <AiOrb />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#d2bbff]">TradeMind Coach</h1>
          <p className="text-muted-foreground mt-1">Your personal AI trading assistant.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col bg-[#0a0d1c]/80 border-[#d2bbff]/20 shadow-[0_0_30px_rgba(210,187,255,0.05)] overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
          
          {/* AI Message */}
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#d2bbff]/20 flex items-center justify-center shrink-0 border border-[#d2bbff]/30">
              <Bot className="h-4 w-4 text-[#d2bbff]" />
            </div>
            <div className="bg-[#1b1f2e] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed max-w-[80%]">
              <p>Hello! I noticed you had a great trading week with a 68% win rate. However, your psychology logs indicate elevated stress levels during your losing trades on Wednesday.</p>
              <p className="mt-2">Would you like to review those trades and see where we can improve your risk management, or focus on preparing for the upcoming week?</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex items-start gap-4 flex-row-reverse">
            <div className="h-8 w-8 rounded-full bg-muted border border-white/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-primary/10 border border-primary/20 text-foreground rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed max-w-[80%]">
              <p>Let's review the trades from Wednesday. I felt like I entered too early and got chopped up.</p>
            </div>
          </div>

          {/* AI Message with Insight Card */}
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-[#d2bbff]/20 flex items-center justify-center shrink-0 border border-[#d2bbff]/30">
              <Bot className="h-4 w-4 text-[#d2bbff]" />
            </div>
            <div className="space-y-3 max-w-[80%]">
              <div className="bg-[#1b1f2e] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed">
                <p>I've pulled up your Wednesday trades. You took 3 trades on SOL/USD. Looking at the charts at the time of entry, the 15-minute candle had not yet closed above the key resistance level of $148.50.</p>
                <p className="mt-2">This is a common pattern for you when you're feeling anxious about missing a move (FOMO).</p>
              </div>
              
              <div className="bg-[#111827] border border-[#d2bbff]/30 rounded-xl p-4 shadow-[0_0_15px_rgba(210,187,255,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#d2bbff]" />
                <div className="flex items-center gap-2 text-[#d2bbff] mb-2 font-medium text-sm">
                  <Sparkles className="h-4 w-4" /> AI Insight
                </div>
                <p className="text-sm text-muted-foreground">In your last 10 early entries, 8 resulted in losses. Waiting for candle closure on the 15m timeframe increases your win rate on breakouts from 20% to 75%.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-background/50 backdrop-blur-md">
          <form className="relative flex items-center">
            <Input 
              placeholder="Ask TradeMind Coach..." 
              className="pr-12 bg-[#0E1628]/60 border-white/10 h-12 text-base rounded-xl focus-visible:ring-[#d2bbff]/30 focus-visible:border-[#d2bbff]/50"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1.5 h-9 w-9 text-[#d2bbff] hover:bg-[#d2bbff]/10 hover:text-[#d2bbff]">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            <Badge variant="secondary" className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap">Analyze my recent losses</Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap">How can I improve my win rate?</Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-white/10 bg-white/5 text-muted-foreground whitespace-nowrap">Create a trading plan for tomorrow</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
