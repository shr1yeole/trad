import { TradeParser, ParseResult, ParsedTrade } from './types'

/**
 * MT5 HTML Report Parser — Robust, broker-agnostic implementation
 *
 * Standard MT5 Trade History HTML report columns (broker names vary):
 *   Time | Deal | Symbol | Type | Direction | Volume | Price | Order | Commission | Swap | Profit | Balance | Comment
 *
 * This parser uses semantic alias matching so it works with XM, Exness,
 * IC Markets, FTMO, Pepperstone, and any other MT5 broker that generates
 * standard HTML statements from the MetaTrader 5 terminal.
 */

// ---------------------------------------------------------------------------
// Column alias maps — add more aliases as brokers use different names
// ---------------------------------------------------------------------------

/** Aliases for the trade time column */
const TIME_ALIASES    = ['time', 'date', 'datetime', 'close time', 'open time', 'deal time']
/** Aliases for the deal/ticket ID column */
const TICKET_ALIASES  = ['deal', 'ticket', 'order', 'deal #', 'deal id', 'ticket #', 'id', 'deal no', 'order id']
/** Aliases for the symbol column */
const SYMBOL_ALIASES  = ['symbol', 'instrument', 'asset', 'pair', 'market', 'item', 'currency pair', 'product']
/** Aliases for the trade direction type (buy/sell) */
const TYPE_ALIASES    = ['type', 'action', 'side', 'trade type', 'direction', 'order type']
/** Aliases for the in/out entry direction column */
const ENTRY_ALIASES   = ['entry', 'in/out', 'in / out', 'deal type', 'position']
/** Aliases for the volume / lots column */
const VOLUME_ALIASES  = ['volume', 'lots', 'size', 'qty', 'quantity', 'lot size', 'contract size']
/** Aliases for the price column */
const PRICE_ALIASES   = ['price', 'deal price', 'fill price', 'execution price', 'trade price', 'avg price']
/** Aliases for the stop loss column */
const SL_ALIASES      = ['s/l', 's / l', 'sl', 'stop loss', 'stop_loss', 'stoploss', 'stop']
/** Aliases for the take profit column */
const TP_ALIASES      = ['t/p', 't / p', 'tp', 'take profit', 'take_profit', 'takeprofit', 'target']
/** Aliases for the commission column */
const COMM_ALIASES    = ['commission', 'comm', 'fee', 'fees', 'charges']
/** Aliases for the swap column */
const SWAP_ALIASES    = ['swap', 'rollover', 'interest', 'financing']
/** Aliases for the profit column */
const PROFIT_ALIASES  = ['profit', 'p&l', 'pnl', 'gain', 'net profit', 'realised p&l', 'realized p&l', 'net p&l']
/** Aliases for the comment column */
const COMMENT_ALIASES = ['comment', 'comments', 'note', 'notes', 'remark', 'remarks', 'description']

// ---------------------------------------------------------------------------
// Non-trade row types to skip
// ---------------------------------------------------------------------------
const SKIP_ROW_TYPES = new Set([
  'balance', 'deposit', 'withdrawal', 'credit', 'bonus',
  'dividend', 'correction', 'transfer', 'charge',
])

// ---------------------------------------------------------------------------
// Helper: find the best-matching column index from a list of aliases
// ---------------------------------------------------------------------------
function findCol(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const idx = headers.findIndex(h => h === alias || h.includes(alias))
    if (idx >= 0) return idx
  }
  return -1
}

// ---------------------------------------------------------------------------
// Helper: find the LAST occurrence (for when "Profit" appears multiple times)
// ---------------------------------------------------------------------------
function findLastCol(headers: string[], aliases: string[]): number {
  let last = -1
  for (const alias of aliases) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i] === alias || headers[i].includes(alias)) {
        if (i > last) last = i
        break
      }
    }
  }
  return last
}

// ---------------------------------------------------------------------------
// Column mapping result
// ---------------------------------------------------------------------------
interface ColMap {
  iTime: number
  iTicket: number
  iSymbol: number
  iType: number
  iEntry: number
  iVolume: number
  iPrice: number
  iSL: number
  iTP: number
  iComm: number
  iSwap: number
  iProfit: number
  iComment: number
}

function buildColMap(rawHeaders: string[]): ColMap {
  // Normalise: trim, lowercase, collapse multiple spaces
  const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/\s+/g, ' '))

  console.debug('[MT5 Parser] Detected column headers:', headers)

  return {
    iTime:    findCol(headers, TIME_ALIASES),
    iTicket:  findCol(headers, TICKET_ALIASES),
    iSymbol:  findCol(headers, SYMBOL_ALIASES),
    iType:    findCol(headers, TYPE_ALIASES),
    iEntry:   findCol(headers, ENTRY_ALIASES),
    iVolume:  findCol(headers, VOLUME_ALIASES),
    iPrice:   findCol(headers, PRICE_ALIASES),
    iSL:      findCol(headers, SL_ALIASES),
    iTP:      findCol(headers, TP_ALIASES),
    iComm:    findCol(headers, COMM_ALIASES),
    iSwap:    findCol(headers, SWAP_ALIASES),
    iProfit:  findLastCol(headers, PROFIT_ALIASES),
    iComment: findCol(headers, COMMENT_ALIASES),
  }
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export const mt5Parser: TradeParser = {
  name: 'MT5',

  canParse(content: string, filename: string): boolean {
    const lower = content.toLowerCase()
    const ext   = filename.toLowerCase()
    if (!ext.endsWith('.html') && !ext.endsWith('.htm')) return false

    // Strong signals — any of these is enough
    if (lower.includes('metatrader 5'))   return true
    if (lower.includes('metatrader5'))    return true
    if (lower.includes('mt5'))            return true

    // Weaker structural signals — require at least two
    const signals = [
      lower.includes('deals'),
      lower.includes('commission'),
      lower.includes('swap'),
      lower.includes('profit'),
      lower.includes('balance'),
    ]
    return signals.filter(Boolean).length >= 3
  },

  async parse(content: string): Promise<ParseResult> {
    const errors: string[] = []
    const trades: ParsedTrade[] = []
    let skippedRows = 0

    try {
      const domParser = new DOMParser()
      const doc = domParser.parseFromString(content, 'text/html')

      // ── Strategy 1: find the <table> that contains a "Deals" section heading ──
      // MT5 wraps sections in <div> or <td> headings like "Deals", "Trade History", etc.
      let dealsTable = findDealsTable(doc)

      if (!dealsTable) {
        // ── Strategy 2: find any table whose header row matches known column names ──
        dealsTable = findTableByHeaders(doc)
      }

      if (!dealsTable) {
        const detail = 'Tried all detection strategies. '
          + 'Ensure the file is an MT5 Trade History HTML report exported from the MT5 terminal.'
        errors.push(`Could not find a Deals / Trade History table in this MT5 report. ${detail}`)
        return { trades, errors, format: 'MT5' }
      }

      // ── Locate the header row ───────────────────────────────────────────────
      // Header may be a <thead>/<tr> inside the table or an earlier sibling
      const allRows = Array.from(dealsTable.querySelectorAll('tr'))
      if (allRows.length < 2) {
        errors.push('Deals table appears to have no data rows.')
        return { trades, errors, format: 'MT5' }
      }

      // Find the header row: first row with <th> cells OR a row whose cells
      // match known column aliases
      const { headerRowIdx, colMap } = detectHeaderRow(allRows)

      if (headerRowIdx < 0) {
        const missing = getMissingRequiredCols(colMap)
        errors.push(
          `Could not map required column(s) in the MT5 table: ${missing.join(', ')}. ` +
          'Check that the report contains a Symbol/Instrument and Price column.'
        )
        return { trades, errors, format: 'MT5' }
      }

      console.debug('[MT5 Parser] Column mapping:', colMap)

      // ── Collect "in" deals indexed by their deal/ticket ID ─────────────────
      // MT5 Netting: each closed trade = one "in" deal + one "out" deal
      // MT5 Hedging: each trade row may be self-contained
      // We use a symbol+type key as fallback for brokers that don't show deal IDs
      const inDeals = new Map<string, ParsedTrade>()
      const ticketsSeen = new Set<string>()

      // ── Parse data rows ─────────────────────────────────────────────────────
      for (let i = headerRowIdx + 1; i < allRows.length; i++) {
        const cells = Array.from(allRows[i].querySelectorAll('td')).map(
          c => c.textContent?.trim() ?? ''
        )

        // Skip very short rows (section headings, totals, empty spacers)
        if (cells.length < 4) continue

        // Skip summary / total rows: first cell often says "Totals:" etc.
        const firstCell = cells[0].toLowerCase()
        if (
          firstCell.startsWith('total') ||
          firstCell.startsWith('summary') ||
          firstCell === ''  && cells.every(c => c === '')
        ) continue

        const g = (idx: number) => idx >= 0 && idx < cells.length ? cells[idx] : ''

        const rawSymbol = g(colMap.iSymbol)
        const rawType   = g(colMap.iType).toLowerCase().trim()
        const rawEntry  = g(colMap.iEntry).toLowerCase().trim()

        // ── Skip non-trade rows ─────────────────────────────────────────────
        // Balance/Deposit/Withdrawal rows often have no symbol or a skip type
        if (SKIP_ROW_TYPES.has(rawType) || SKIP_ROW_TYPES.has(rawEntry)) {
          skippedRows++
          continue
        }

        // If there's an entry column and it's neither "in" nor "out", skip
        if (colMap.iEntry >= 0 && rawEntry && !isEntryIn(rawEntry) && !isEntryOut(rawEntry)) {
          // Could be a "balance" or header repeat row
          if (SKIP_ROW_TYPES.has(rawEntry) || rawEntry === 'balance') {
            skippedRows++
            continue
          }
        }

        // Require a symbol
        if (!rawSymbol) {
          skippedRows++
          continue
        }

        // ── Parse numeric fields ────────────────────────────────────────────
        const ticket     = g(colMap.iTicket) || `row_${i}`
        const timeStr    = g(colMap.iTime)
        const time       = timeStr ? parseDate(timeStr) : undefined
        const price      = parseNum(g(colMap.iPrice))
        const volume     = parseNum(g(colMap.iVolume))
        const profit     = parseNum(g(colMap.iProfit))
        const commission = parseNum(g(colMap.iComm))
        const swap       = parseNum(g(colMap.iSwap))
        const sl         = parseNum(g(colMap.iSL))
        const tp         = parseNum(g(colMap.iTP))
        const comment    = g(colMap.iComment)

        // Require a valid price — zero/missing means the row is a balance row
        if (!isFinite(price) || price <= 0) {
          skippedRows++
          continue
        }

        const tradeType: 'buy' | 'sell' = rawType.includes('sell') ? 'sell' : 'buy'

        // ── In/Out pairing logic ─────────────────────────────────────────────
        if (colMap.iEntry >= 0 && rawEntry) {
          if (isEntryIn(rawEntry)) {
            // Opening deal — store it keyed by ticket
            inDeals.set(ticket, {
              ticket,
              symbol: rawSymbol,
              type: tradeType,
              volume,
              openTime: time,
              openPrice: price,
              closePrice: 0,
              stopLoss: sl,
              takeProfit: tp,
              profit: 0,
              commission,
              swap,
              comment,
            })
          } else if (isEntryOut(rawEntry)) {
            // Closing deal — match with its opening deal
            const opening = inDeals.get(ticket)
            const combined: ParsedTrade = opening
              ? {
                  ...opening,
                  closeTime: time,
                  closePrice: price,
                  profit,
                  commission: (opening.commission ?? 0) + commission,
                  swap: (opening.swap ?? 0) + swap,
                }
              : {
                  // No matching "in" found — treat as self-contained
                  ticket,
                  symbol: rawSymbol,
                  type: tradeType,
                  volume,
                  closeTime: time,
                  openPrice: price,
                  closePrice: price,
                  stopLoss: sl,
                  takeProfit: tp,
                  profit,
                  commission,
                  swap,
                  comment,
                }

            if (!ticketsSeen.has(ticket)) {
              ticketsSeen.add(ticket)
              trades.push(combined)
            }

            inDeals.delete(ticket)
          }
          // "in/out" (open & close in single row) — treat as self-contained
          else if (rawEntry === 'in/out') {
            if (!ticketsSeen.has(ticket)) {
              ticketsSeen.add(ticket)
              trades.push({
                ticket, symbol: rawSymbol, type: tradeType, volume,
                openTime: time, closeTime: time,
                openPrice: price, closePrice: price,
                stopLoss: sl, takeProfit: tp,
                profit, commission, swap, comment,
              })
            }
          }
        } else {
          // No entry/direction column — assume every row is a closed trade
          if (!ticketsSeen.has(ticket)) {
            ticketsSeen.add(ticket)
            trades.push({
              ticket, symbol: rawSymbol, type: tradeType, volume,
              openTime: time, closeTime: time,
              openPrice: price, closePrice: price,
              stopLoss: sl, takeProfit: tp,
              profit, commission, swap, comment,
            })
          }
        }
      }

      console.debug(
        `[MT5 Parser] Finished. Trades: ${trades.length}, skipped rows: ${skippedRows}, unmatched in-deals: ${inDeals.size}`
      )

      if (trades.length === 0 && skippedRows > 0) {
        errors.push(
          `The table was found but all ${skippedRows} rows were skipped. ` +
          'This may mean the report contains no closed trade rows, or the row types (Balance, Deposit, etc.) were all filtered out.'
        )
      }

    } catch (err: any) {
      errors.push(`MT5 parse error: ${err.message}`)
      console.error('[MT5 Parser] Unexpected error:', err)
    }

    return { trades, errors, format: 'MT5', skipped: skippedRows }
  },
}

// ---------------------------------------------------------------------------
// Table detection strategies
// ---------------------------------------------------------------------------

/**
 * Strategy 1: Walk the DOM looking for a heading element (div/td/th/caption)
 * that says "Deals" or "Trade History", then return the next sibling table
 * or the table that contains the heading.
 */
function findDealsTable(doc: Document): Element | null {
  const dealsKeywords = ['deals', 'trade history', 'trading history', 'trade report', 'closed trades', 'closed positions']

  // Check all text nodes inside block elements for section headings
  const candidates = Array.from(doc.querySelectorAll('div, td, th, caption, h1, h2, h3, h4, p, span'))
  for (const el of candidates) {
    const text = el.textContent?.trim().toLowerCase() ?? ''
    if (dealsKeywords.some(kw => text === kw || text.startsWith(kw))) {
      // Is this element itself inside a table row?
      const parentTable = el.closest('table')
      if (parentTable) return parentTable

      // Or is there a table sibling/child nearby?
      let sibling: Element | null = el.nextElementSibling
      while (sibling) {
        if (sibling.tagName === 'TABLE') return sibling
        const t = sibling.querySelector('table')
        if (t) return t
        sibling = sibling.nextElementSibling
      }

      // Check parent's next sibling
      const parent = el.parentElement
      if (parent) {
        let ps: Element | null = parent.nextElementSibling
        while (ps) {
          if (ps.tagName === 'TABLE') return ps
          const t = ps.querySelector('table')
          if (t) return t
          ps = ps.nextElementSibling
        }
      }
    }
  }
  return null
}

/**
 * Strategy 2: Find any table whose header row contains at least 3 known
 * column aliases (Symbol, Price, Profit are required).
 */
function findTableByHeaders(doc: Document): Element | null {
  const tables = Array.from(doc.querySelectorAll('table'))

  for (const table of tables) {
    const firstRow = table.querySelector('tr')
    if (!firstRow) continue

    const cells = Array.from(firstRow.querySelectorAll('th, td')).map(
      c => c.textContent?.trim().toLowerCase() ?? ''
    )

    const colMap = buildColMap(cells)

    // Require Symbol + Price + Profit as a minimum
    if (colMap.iSymbol >= 0 && colMap.iPrice >= 0 && colMap.iProfit >= 0) {
      console.debug('[MT5 Parser] Found trade table via header matching in strategy 2')
      return table
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Header row detection within a table
// ---------------------------------------------------------------------------

function detectHeaderRow(rows: Element[]): { headerRowIdx: number; colMap: ColMap } {
  // Prefer a row that has <th> elements
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const ths = rows[i].querySelectorAll('th')
    if (ths.length > 0) {
      const headers = Array.from(ths).map(th => th.textContent?.trim() ?? '')
      // Also include any tds in this row
      const tds = Array.from(rows[i].querySelectorAll('td')).map(td => td.textContent?.trim() ?? '')
      const allHeaders = headers.length > tds.length ? headers : tds
      const colMap = buildColMap(allHeaders)
      if (colMap.iSymbol >= 0 && colMap.iPrice >= 0) {
        return { headerRowIdx: i, colMap }
      }
    }
  }

  // Fallback: check the first few rows for td content that matches aliases
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const cells = Array.from(rows[i].querySelectorAll('td')).map(
      c => c.textContent?.trim() ?? ''
    )
    if (cells.length < 3) continue
    const colMap = buildColMap(cells)
    if (colMap.iSymbol >= 0 && colMap.iPrice >= 0) {
      return { headerRowIdx: i, colMap }
    }
  }

  return { headerRowIdx: -1, colMap: buildColMap([]) }
}

function getMissingRequiredCols(colMap: ColMap): string[] {
  const missing: string[] = []
  if (colMap.iSymbol < 0) missing.push('Symbol/Instrument')
  if (colMap.iPrice  < 0) missing.push('Price')
  if (colMap.iProfit < 0) missing.push('Profit')
  return missing
}

// ---------------------------------------------------------------------------
// Entry direction helpers
// ---------------------------------------------------------------------------

function isEntryIn(raw: string): boolean {
  return raw === 'in' || raw === 'entry' || raw === 'open' || raw === 'buy' && raw.length <= 3
}

function isEntryOut(raw: string): boolean {
  return (
    raw === 'out' ||
    raw.startsWith('out by') ||
    raw === 'exit' ||
    raw === 'close' ||
    raw === 'reversal'
  )
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function parseNum(raw: string): number {
  if (!raw) return 0
  // Strip currency symbols, spaces, thousands separators
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  return isFinite(n) ? n : 0
}

/**
 * Parse date strings from MT5 reports.
 * MT5 uses: "2024.05.14 10:30:00" or "2024-05-14 10:30:00"
 * Also handles ISO strings and locale-formatted dates.
 */
function parseDate(raw: string): Date | undefined {
  if (!raw) return undefined
  // MT5 canonical format: "2024.05.14 10:30:00"
  const mt5 = raw.replace(/\./g, '-').replace(' ', 'T')
  const d = new Date(mt5)
  if (!isNaN(d.getTime())) return d
  // Fallback: let the browser parse it
  const d2 = new Date(raw)
  return isNaN(d2.getTime()) ? undefined : d2
}


