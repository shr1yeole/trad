import { Trade, TradeType, TradeStatus } from '@/types/trade'
import { Timestamp } from 'firebase/firestore'

/**
 * A parsed trade row from any import source, before being mapped to the Trade model.
 * All fields are optional because different sources provide different data.
 */
export interface ParsedTrade {
  ticket?: string           // Unique identifier from the source (used for dedup)
  symbol: string
  type: 'buy' | 'sell'
  volume: number
  openTime?: Date
  closeTime?: Date
  openPrice: number
  closePrice: number
  stopLoss?: number
  takeProfit?: number
  profit: number
  commission?: number
  swap?: number
  comment?: string
}

/**
 * Result returned from any parser
 */
export interface ParseResult {
  trades: ParsedTrade[]
  errors: string[]
  format: string    // e.g. "MT5", "MT4", "CSV"
  skipped?: number  // duplicates or invalid rows
}

/**
 * Interface all parsers must implement
 */
export interface TradeParser {
  /** Human-readable name for UI messages */
  name: string
  /** Check if this parser can handle the provided content */
  canParse(content: string | ArrayBuffer, filename: string): boolean
  /** Parse the content and return structured trades */
  parse(content: string | ArrayBuffer, filename?: string): Promise<ParseResult>
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Allowed file extensions */
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']
/** Maximum file size: 10 MB */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate the raw File object before even reading it.
 */
export function validateFile(file: File): FileValidationResult {
  const name = file.name.toLowerCase()
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))
  if (!hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file type "${file.name}". Only CSV (.csv) and Excel (.xlsx, .xls) files are supported.`,
    }
  }
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
    }
  }
  return { valid: true }
}

export interface RowValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Validate a single ParsedTrade row after parsing.
 * Returns { valid: false, reason } for rows that should be skipped.
 */
export function validateParsedTrade(trade: ParsedTrade): RowValidationResult {
  if (!trade.symbol || trade.symbol.trim() === '') {
    return { valid: false, reason: 'Missing symbol' }
  }
  if (!isFinite(trade.openPrice) || trade.openPrice <= 0) {
    return { valid: false, reason: `Invalid open price for ${trade.symbol}` }
  }
  if (!isFinite(trade.closePrice) || trade.closePrice < 0) {
    return { valid: false, reason: `Invalid close price for ${trade.symbol}` }
  }
  if (!isFinite(trade.volume) || trade.volume < 0) {
    return { valid: false, reason: `Invalid volume for ${trade.symbol}` }
  }
  if (trade.type !== 'buy' && trade.type !== 'sell') {
    return { valid: false, reason: `Unknown trade type "${trade.type}" for ${trade.symbol}` }
  }
  return { valid: true }
}

/**
 * Convert a ParsedTrade into our app's Trade model for Firestore
 */
export function parsedToTrade(parsed: ParsedTrade): Omit<Trade, 'id' | 'createdAt' | 'updatedAt'> {
  const pnl = (parsed.profit || 0) + (parsed.commission || 0) + (parsed.swap || 0)
  const status: TradeStatus = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven'
  const tradeDate = parsed.closeTime ?? parsed.openTime ?? new Date()

  const notes = [
    parsed.comment ? `Comment: ${parsed.comment}` : '',
    parsed.commission ? `Commission: ${parsed.commission}` : '',
    parsed.swap ? `Swap: ${parsed.swap}` : '',
    parsed.ticket ? `Ticket: ${parsed.ticket}` : '',
  ].filter(Boolean).join(' | ')

  return {
    pair: parsed.symbol.toUpperCase(),
    market: detectMarket(parsed.symbol),
    tradeType: parsed.type === 'buy' ? 'Buy' : 'Sell',
    entryPrice: parsed.openPrice,
    exitPrice: parsed.closePrice,
    stopLoss: parsed.stopLoss ?? 0,
    takeProfit: parsed.takeProfit ?? 0,
    quantity: parsed.volume,
    riskPercentage: 0,
    profitLoss: pnl,
    rrRatio: 0,
    strategy: '',
    psychology: '',
    notes,
    screenshotUrl: '',
    status,
    tradeDate: Timestamp.fromDate(tradeDate),
  }
}

function detectMarket(symbol: string): string {
  const s = symbol.toUpperCase()
  const forex = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF']
  const crypto = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'ADA', 'DOGE', 'LTC']
  if (crypto.some(c => s.includes(c))) return 'Crypto'
  if (forex.some(f => s.includes(f)) && s.length <= 6) return 'Forex'
  if (['US30', 'SPX', 'NAS', 'DAX', 'FTSE', 'JP225'].some(i => s.includes(i))) return 'Indices'
  if (['XAU', 'XAG', 'GOLD', 'SILVER', 'OIL', 'BRENT'].some(c => s.includes(c))) return 'Commodities'
  return 'Stocks'
}
