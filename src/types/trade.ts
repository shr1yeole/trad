import { Timestamp } from 'firebase/firestore'

export type TradeType = 'Buy' | 'Sell'
export type TradeStatus = 'Win' | 'Loss' | 'Breakeven' | 'Running'
export type MoodType = 'Calm' | 'Confident' | 'Anxious' | 'FOMO' | 'Greedy' | 'Fearful' | 'Frustrated' | 'Neutral' | string
export type TradeQualityType = 'A+' | 'A' | 'B' | 'C' | 'D'

export interface TradePsychology {
  moodBeforeTrade: MoodType
  confidenceLevel: number // 0 to 100
  tradeQuality: TradeQualityType
  checklist: string[]
  mistakeTags: string[]
  marketCondition: 'Trending' | 'Ranging' | 'Volatile' | 'Consolidating' | string
  tradingSession: 'Asian' | 'London' | 'New York' | 'Other' | string
  strategy: string
  journalNotes: string
}

export const defaultTradePsychology: TradePsychology = {
  moodBeforeTrade: 'Calm',
  confidenceLevel: 80,
  tradeQuality: 'A',
  checklist: ['Higher Timeframe Alignment', 'Clear Risk Defined'],
  mistakeTags: [],
  marketCondition: 'Trending',
  tradingSession: 'London',
  strategy: '',
  journalNotes: '',
}

export interface Trade {
  id?: string
  pair: string
  market: string
  tradeType: TradeType
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number
  quantity: number
  riskPercentage: number
  profitLoss: number
  rrRatio: number
  strategy: string
  psychology: string
  notes: string
  screenshotUrl: string
  status: TradeStatus
  tradeDate: Timestamp | Date | string
  psychologyData?: TradePsychology
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface TradeFormData {
  pair: string
  market: string
  tradeType: TradeType
  entryPrice: string
  exitPrice: string
  stopLoss: string
  takeProfit: string
  quantity: string
  riskPercentage: string
  profitLoss: string
  rrRatio: string
  strategy: string
  psychology: string
  notes: string
  screenshotUrl: string
  status: TradeStatus
  tradeDate: string
  psychologyData?: TradePsychology
}

export const defaultTradeFormData: TradeFormData = {
  pair: '',
  market: '',
  tradeType: 'Buy',
  entryPrice: '',
  exitPrice: '',
  stopLoss: '',
  takeProfit: '',
  quantity: '',
  riskPercentage: '',
  profitLoss: '',
  rrRatio: '',
  strategy: '',
  psychology: '',
  notes: '',
  screenshotUrl: '',
  status: 'Running',
  tradeDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
  psychologyData: defaultTradePsychology,
}
