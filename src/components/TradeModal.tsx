'use client'

import { useState, useEffect } from 'react'
import { X, BrainCircuit, CheckSquare, AlertTriangle, Sparkles, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Trade,
  TradeFormData,
  defaultTradeFormData,
  TradePsychology,
  defaultTradePsychology,
  MoodType,
  TradeQualityType,
} from '@/types/trade'
import { Timestamp } from 'firebase/firestore'

import { toISTDateString } from '@/lib/tz'

interface TradeModalProps {
  open: boolean
  mode: 'add' | 'edit'
  trade?: Trade | null
  onClose: () => void
  onSubmit: (data: TradeFormData) => Promise<void>
}

function toDateString(val: any): string {
  if (!val) return toISTDateString()
  if (val instanceof Timestamp) return toISTDateString(val.toDate())
  if (val instanceof Date) return toISTDateString(val)
  if (typeof val === 'string') return val.split('T')[0]
  return toISTDateString()
}

const CHECKLIST_OPTIONS = [
  'HTF Trend Alignment',
  'Clear Key Level / Zone',
  'Risk Defined Before Entry',
  'Execution Plan Followed',
  'Proper RR (>1:1.5)',
  'Wait for Trigger Candle',
]

const MISTAKE_OPTIONS = [
  'FOMO Entry',
  'Chased Price',
  'Overleveraged',
  'Moved Stop Loss',
  'Early Exit / Panic Sell',
  'Revenge Trade',
  'No Stop Loss',
  'Boredom Trade',
]

export function TradeModal({ open, mode, trade, onClose, onSubmit }: TradeModalProps) {
  const [activeTab, setActiveTab] = useState<'trade' | 'psychology'>('trade')
  const [form, setForm] = useState<TradeFormData>(defaultTradeFormData)
  const [psychology, setPsychology] = useState<TradePsychology>(defaultTradePsychology)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && trade) {
      setForm({
        pair: trade.pair || '',
        market: trade.market || '',
        tradeType: trade.tradeType || 'Buy',
        entryPrice: trade.entryPrice !== undefined && trade.entryPrice !== null ? String(trade.entryPrice) : '',
        exitPrice: trade.exitPrice !== undefined && trade.exitPrice !== null ? String(trade.exitPrice) : '',
        stopLoss: trade.stopLoss !== undefined && trade.stopLoss !== null ? String(trade.stopLoss) : '',
        takeProfit: trade.takeProfit !== undefined && trade.takeProfit !== null ? String(trade.takeProfit) : '',
        quantity: trade.quantity !== undefined && trade.quantity !== null ? String(trade.quantity) : '',
        riskPercentage: trade.riskPercentage !== undefined && trade.riskPercentage !== null ? String(trade.riskPercentage) : '',
        profitLoss: trade.profitLoss !== undefined && trade.profitLoss !== null ? String(trade.profitLoss) : '',
        rrRatio: trade.rrRatio !== undefined && trade.rrRatio !== null ? String(trade.rrRatio) : '',
        strategy: trade.strategy || '',
        psychology: trade.psychology || '',
        notes: trade.notes || '',
        screenshotUrl: trade.screenshotUrl || '',
        status: trade.status || 'Win',
        tradeDate: toDateString(trade.tradeDate),
      })
      if (trade.psychologyData) {
        setPsychology(trade.psychologyData)
      } else {
        setPsychology({
          ...defaultTradePsychology,
          moodBeforeTrade: (trade.psychology as MoodType) || 'Calm',
          strategy: trade.strategy || '',
          journalNotes: trade.notes || '',
        })
      }
    } else {
      setForm(defaultTradeFormData)
      setPsychology(defaultTradePsychology)
    }
    setActiveTab('trade')
    setError(null)
  }, [open, mode, trade])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'psychology') {
      setPsychology(prev => ({ ...prev, moodBeforeTrade: value as MoodType }))
    } else if (name === 'strategy') {
      setPsychology(prev => ({ ...prev, strategy: value }))
    } else if (name === 'notes') {
      setPsychology(prev => ({ ...prev, journalNotes: value }))
    }
  }

  const handlePsychologyChange = (field: keyof TradePsychology, value: any) => {
    setPsychology(prev => ({ ...prev, [field]: value }))
  }

  const toggleChecklist = (item: string) => {
    setPsychology(prev => {
      const exists = prev.checklist.includes(item)
      const updated = exists ? prev.checklist.filter(i => i !== item) : [...prev.checklist, item]
      return { ...prev, checklist: updated }
    })
  }

  const toggleMistake = (tag: string) => {
    setPsychology(prev => {
      const exists = prev.mistakeTags.includes(tag)
      const updated = exists ? prev.mistakeTags.filter(t => t !== tag) : [...prev.mistakeTags, tag]
      return { ...prev, mistakeTags: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.pair.trim()) { setError('Pair is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload: TradeFormData = {
        ...form,
        psychology: psychology.moodBeforeTrade || form.psychology || 'Calm',
        strategy: psychology.strategy || form.strategy,
        notes: psychology.journalNotes || form.notes,
        psychologyData: psychology,
      }
      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-14 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/15 bg-[#0a0d1c] shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-6 duration-300">
        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {mode === 'add' ? 'Add New Trade' : 'Edit Trade'}
            </h2>
            <div className="flex items-center p-1 rounded-lg bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('trade')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'trade' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Trade Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('psychology')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'psychology' ? 'bg-[#d2bbff] text-[#3f008e] shadow font-bold' : 'text-muted-foreground hover:text-[#d2bbff]'
                }`}
              >
                <BrainCircuit className="h-3.5 w-3.5" /> Psychology
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === 'trade' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Row 1: Pair + Market + Date */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pair">Pair *</Label>
                  <Input id="pair" name="pair" placeholder="BTC/USD" value={form.pair} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="market">Market</Label>
                  <Input id="market" name="market" placeholder="Crypto" value={form.market} onChange={handleChange} />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <Label htmlFor="tradeDate">Trade Date</Label>
                  <Input id="tradeDate" name="tradeDate" type="date" value={form.tradeDate} onChange={handleChange} />
                </div>
              </div>

              {/* Row 2: Type + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tradeType">Type</Label>
                  <select
                    id="tradeType"
                    name="tradeType"
                    value={form.tradeType}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Buy">Buy (Long)</option>
                    <option value="Sell">Sell (Short)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Win">Win</option>
                    <option value="Loss">Loss</option>
                    <option value="Breakeven">Breakeven</option>
                    <option value="Running">Running</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Prices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="entryPrice">Entry Price</Label>
                  <Input id="entryPrice" name="entryPrice" type="number" step="any" placeholder="0.00" value={form.entryPrice} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input id="exitPrice" name="exitPrice" type="number" step="any" placeholder="0.00" value={form.exitPrice} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input id="stopLoss" name="stopLoss" type="number" step="any" placeholder="0.00" value={form.stopLoss} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="takeProfit">Take Profit</Label>
                  <Input id="takeProfit" name="takeProfit" type="number" step="any" placeholder="0.00" value={form.takeProfit} onChange={handleChange} />
                </div>
              </div>

              {/* Row 4: Quantities & Risk */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" step="any" placeholder="0" value={form.quantity} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="riskPercentage">Risk %</Label>
                  <Input id="riskPercentage" name="riskPercentage" type="number" step="any" placeholder="1.0" value={form.riskPercentage} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profitLoss">P&L ($)</Label>
                  <Input id="profitLoss" name="profitLoss" type="number" step="any" placeholder="0.00" value={form.profitLoss} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rrRatio">R:R Ratio</Label>
                  <Input id="rrRatio" name="rrRatio" type="number" step="any" placeholder="2.0" value={form.rrRatio} onChange={handleChange} />
                </div>
              </div>

              {/* Strategy */}
              <div className="space-y-1.5">
                <Label htmlFor="strategy">Strategy / Setup</Label>
                <Input id="strategy" name="strategy" placeholder="e.g. Breakout Retest" value={form.strategy} onChange={handleChange} />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Trade notes, observations..."
                  value={form.notes}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-2 text-sm shadow-sm transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* Psychology Tab Content */}
          {activeTab === 'psychology' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Row 1: Mood + Quality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="moodBeforeTrade">Mood Before Trade</Label>
                  <select
                    id="moodBeforeTrade"
                    value={psychology.moodBeforeTrade}
                    onChange={e => handlePsychologyChange('moodBeforeTrade', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Calm">Calm & Focused</option>
                    <option value="Confident">Confident</option>
                    <option value="Anxious">Anxious / Nervous</option>
                    <option value="FOMO">FOMO (Fear of Missing Out)</option>
                    <option value="Greedy">Greedy</option>
                    <option value="Fearful">Fearful</option>
                    <option value="Frustrated">Frustrated / Impatient</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Trade Execution Quality Grade</Label>
                  <div className="flex items-center gap-2">
                    {(['A+', 'A', 'B', 'C', 'D'] as TradeQualityType[]).map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handlePsychologyChange('tradeQuality', grade)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          psychology.tradeQuality === grade
                            ? 'bg-[#d2bbff] text-[#3f008e] border-[#d2bbff] shadow-[0_0_12px_rgba(210,187,255,0.4)]'
                            : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confidence Level Slider */}
              <div className="space-y-2 p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-primary" /> Confidence Level
                  </span>
                  <span className="text-primary font-bold text-sm">{psychology.confidenceLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={psychology.confidenceLevel}
                  onChange={e => handlePsychologyChange('confidenceLevel', Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Market Condition & Session */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="marketCondition">Market Condition</Label>
                  <select
                    id="marketCondition"
                    value={psychology.marketCondition}
                    onChange={e => handlePsychologyChange('marketCondition', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Trending">Trending</option>
                    <option value="Ranging">Ranging / Sideways</option>
                    <option value="Volatile">High Volatility / News</option>
                    <option value="Consolidating">Consolidating</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tradingSession">Trading Session</Label>
                  <select
                    id="tradingSession"
                    value={psychology.tradingSession}
                    onChange={e => handlePsychologyChange('tradingSession', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-[#111827]/60 px-3 py-1 text-sm shadow-sm transition-colors text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Asian">Asian Session</option>
                    <option value="London">London Session</option>
                    <option value="New York">New York Session</option>
                    <option value="Other">Other / Off-hours</option>
                  </select>
                </div>
              </div>

              {/* Plan Checklist (Multi-Select) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" /> Trading Plan Checklist
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CHECKLIST_OPTIONS.map(item => {
                    const checked = psychology.checklist.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleChecklist(item)}
                        className={`flex items-center gap-2 p-2 rounded-md text-xs text-left border transition-colors ${
                          checked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                            : 'bg-white/5 border-white/5 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center text-[10px] ${
                          checked ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-white/20'
                        }`}>
                          {checked && '✓'}
                        </div>
                        <span>{item}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mistake Tags (Multi-Select) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Mistake Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MISTAKE_OPTIONS.map(tag => {
                    const active = psychology.mistakeTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMistake(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-destructive/20 border-destructive/50 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 text-sm rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(prev => (prev === 'trade' ? 'psychology' : 'trade'))}
              className="text-xs text-[#d2bbff] hover:text-[#d2bbff]/80"
            >
              {activeTab === 'trade' ? 'Next: Psychology →' : '← Back to Details'}
            </Button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[120px] shadow-[0_0_15px_rgba(173,198,255,0.2)] hover:shadow-[0_0_20px_rgba(173,198,255,0.4)] transition-all"
              >
                {saving ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add Trade' : 'Save Changes')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
