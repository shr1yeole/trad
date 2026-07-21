import { ParsedTrade, ParseResult } from './types'

/**
 * Shared Tabular Data Parsing Helper for CSV and Excel imports.
 * Features automatic header-row discovery (handles files with metadata/title rows at top),
 * dynamic alias matching, non-trade/balance row filtering, robust date/number coercion,
 * and duplicate fingerprinting.
 */

const SYMBOL_ALIASES = ['symbol', 'pair', 'instrument', 'asset', 'market', 'currency pair', 'item', 'product', 'ticker', 'ccy pair']
const TYPE_ALIASES   = ['type', 'direction', 'buy/sell', 'side', 'action', 'order type', 'trade type', 'b/s']
const VOLUME_ALIASES = ['volume', 'lots', 'lot', 'lot size', 'size', 'qty', 'quantity', 'amount', 'contracts', 'vol']
const OPEN_PRICE_ALIASES  = ['open price', 'entry price', 'open_price', 'entry_price', 'fill price', 'buy price', 'entry']
const CLOSE_PRICE_ALIASES = ['close price', 'exit price', 'close_price', 'exit_price', 'closing price', 'exit']
const SL_ALIASES     = ['stop loss', 's/l', 'sl', 'stop_loss', 'stoploss', 'stop']
const TP_ALIASES     = ['take profit', 't/p', 'tp', 'take_profit', 'takeprofit', 'target']
const PROFIT_ALIASES = ['profit', 'p&l', 'pnl', 'net profit', 'realised p&l', 'realized p&l', 'net p&l', 'profit/loss', 'profit / loss', 'gain', 'return', 'total profit']
const COMM_ALIASES   = ['commission', 'comm', 'fee', 'fees', 'charges']
const SWAP_ALIASES   = ['swap', 'rollover', 'interest', 'financing']
const OPEN_TIME_ALIASES  = ['open time', 'open date', 'entry time', 'entry date', 'open_time', 'start time']
const CLOSE_TIME_ALIASES = ['close time', 'close date', 'exit time', 'exit date', 'close_time', 'closing time', 'end time']
const TICKET_ALIASES = ['ticket', 'order', 'deal', 'id', 'ticket #', 'order #', 'deal #', 'trade id', 'position id', 'transaction id', 'position']
const COMMENT_ALIASES = ['comment', 'comments', 'note', 'notes', 'remark', 'remarks', 'description']

const SKIP_TYPES = new Set(['balance', 'deposit', 'withdrawal', 'credit', 'bonus', 'dividend', 'transfer', 'correction'])

export function parseRawRows(rows: Record<string, any>[], formatName: string): ParseResult {
  const errors: string[] = []
  const trades: ParsedTrade[] = []
  let skipped = 0

  if (!rows || rows.length === 0) {
    return { trades: [], errors: ['File contains no data rows.'], format: formatName }
  }

  // ── Step 1: Discover Header Row ─────────────────────────────────────────────
  // Check if Object.keys(rows[0]) contains valid headers, OR if a row's values
  // contain the actual header row (in case of top title/metadata lines).
  let rawHeaders: string[] = Object.keys(rows[0] || {})
  let dataRows: Record<string, any>[] = rows
  let headerFoundIdx = -1

  // Function to check if a list of strings looks like trade headers
  const isHeaderSet = (headersList: string[]): boolean => {
    const norm = headersList.map(h => String(h).trim().toLowerCase().replace(/[\_\-\.\s]+/g, ' '))
    const hasSymbol = SYMBOL_ALIASES.some(a => norm.some(h => h === a || h.includes(a)))
    const hasPrice  = OPEN_PRICE_ALIASES.concat(CLOSE_PRICE_ALIASES, ['price']).some(a => norm.some(h => h === a || h.includes(a)))
    return hasSymbol && hasPrice
  }

  if (!isHeaderSet(rawHeaders)) {
    // Search the first 15 rows for a row whose cell values match trade headers
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const cellValues = Object.values(rows[i] || {}).map(v => String(v ?? ''))
      if (isHeaderSet(cellValues)) {
        rawHeaders = cellValues
        dataRows = rows.slice(i + 1)
        headerFoundIdx = i
        break
      }
    }
  }

  const normalizedHeaders = rawHeaders.map(h =>
    String(h).trim().toLowerCase().replace(/[\_\-\.\s]+/g, ' ')
  )

  const findIdx = (aliases: string[]) => {
    for (const alias of aliases) {
      const idx = normalizedHeaders.findIndex(h => h === alias || h.includes(alias))
      if (idx >= 0) return idx
    }
    return -1
  }

  const findIndices = (alias: string) => {
    const indices: number[] = []
    normalizedHeaders.forEach((h, i) => {
      if (h === alias || h.includes(alias)) indices.push(i)
    })
    return indices
  }

  // Map columns dynamically
  const iSymbol = findIdx(SYMBOL_ALIASES)
  const iType   = findIdx(TYPE_ALIASES)
  const iVolume = findIdx(VOLUME_ALIASES)

  let iOpenPrice  = findIdx(OPEN_PRICE_ALIASES)
  let iClosePrice = findIdx(CLOSE_PRICE_ALIASES)

  if (iOpenPrice < 0 || iClosePrice < 0) {
    const genericPrices = findIndices('price')
    if (iOpenPrice < 0 && genericPrices.length > 0) iOpenPrice = genericPrices[0]
    if (iClosePrice < 0 && genericPrices.length > 1) iClosePrice = genericPrices[1]
    else if (iClosePrice < 0 && iOpenPrice >= 0) iClosePrice = iOpenPrice
  }

  let iOpenTime  = findIdx(OPEN_TIME_ALIASES)
  let iCloseTime = findIdx(CLOSE_TIME_ALIASES)

  if (iOpenTime < 0 || iCloseTime < 0) {
    const genericTimes = Array.from(
      new Set([...findIndices('time'), ...findIndices('date')])
    )
    if (iOpenTime < 0 && genericTimes.length > 0) iOpenTime = genericTimes[0]
    if (iCloseTime < 0 && genericTimes.length > 1) iCloseTime = genericTimes[1]
    else if (iCloseTime < 0 && iOpenTime >= 0) iCloseTime = iOpenTime
  }

  const iSL      = findIdx(SL_ALIASES)
  const iTP      = findIdx(TP_ALIASES)
  const iProfit  = findIdx(PROFIT_ALIASES)
  const iComm    = findIdx(COMM_ALIASES)
  const iSwap    = findIdx(SWAP_ALIASES)
  const iTicket  = findIdx(TICKET_ALIASES)
  const iComment = findIdx(COMMENT_ALIASES)

  // Verify mandatory mapping requirement (Symbol and Open Price are required)
  const missingCols: string[] = []
  if (iSymbol < 0) missingCols.push('Symbol / Pair / Instrument')
  if (iOpenPrice < 0 && iClosePrice < 0) missingCols.push('Entry / Open Price')

  if (missingCols.length > 0) {
    console.debug(`[${formatName}] Header mapping failed. Missing:`, missingCols, 'Detected Headers:', rawHeaders)
    return {
      trades: [],
      errors: [
        `Could not map required column(s): ${missingCols.join(', ')}. ` +
        `Detected file headers: [${rawHeaders.filter(Boolean).join(', ')}]`
      ],
      format: formatName,
    }
  }

  console.debug(`[${formatName}] Header discovery index: ${headerFoundIdx}, column mapping:`, {
    iSymbol, iType, iVolume, iOpenPrice, iClosePrice, iOpenTime, iCloseTime, iSL, iTP, iProfit, iComm, iSwap, iTicket, iComment
  })

  // ── Step 2: Iterate Data Rows ──────────────────────────────────────────────
  for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
    const row = dataRows[rIdx]
    
    // Extract row cell value by index or key
    const getVal = (idx: number) => {
      if (idx < 0) return undefined
      // If header discovery shifted to values array
      if (headerFoundIdx >= 0) {
        const vals = Object.values(row || {})
        return idx < vals.length ? vals[idx] : undefined
      }
      const key = rawHeaders[idx]
      return key ? row[key] : undefined
    }

    const symbolRaw = getVal(iSymbol)
    if (symbolRaw === undefined || symbolRaw === null) {
      skipped++
      continue
    }

    const symbol = String(symbolRaw).trim()
    const symLower = symbol.toLowerCase()

    if (!symbol || symLower.includes('total') || symLower.includes('summary') || SKIP_TYPES.has(symLower)) {
      skipped++
      continue
    }

    const typeRaw = String(getVal(iType) ?? '').toLowerCase().trim()
    if (SKIP_TYPES.has(typeRaw)) {
      skipped++
      continue
    }

    const tradeType: 'buy' | 'sell' = typeRaw.includes('sell') ? 'sell' : 'buy'

    const openPrice  = parseNum(getVal(iOpenPrice))
    const closePrice = iClosePrice >= 0 ? parseNum(getVal(iClosePrice)) : openPrice
    const volume     = parseNum(getVal(iVolume))
    const profit     = parseNum(getVal(iProfit))
    const commission = parseNum(getVal(iComm))
    const swap       = parseNum(getVal(iSwap))
    const sl         = parseNum(getVal(iSL))
    const tp         = parseNum(getVal(iTP))
    const comment    = String(getVal(iComment) ?? '').trim()
    const ticketRaw  = getVal(iTicket)

    const openTime  = parseDate(getVal(iOpenTime))
    const closeTime = parseDate(getVal(iCloseTime)) ?? openTime

    // Invalid open price -> skip row
    if (!isFinite(openPrice) || openPrice <= 0) {
      skipped++
      continue
    }

    // Determine ticket or fallback ticket (combination of Symbol + Open Time + Entry Price)
    let ticket: string
    if (ticketRaw !== undefined && ticketRaw !== null && String(ticketRaw).trim() !== '') {
      ticket = String(ticketRaw).trim()
    } else {
      const timePart = openTime ? openTime.toISOString().slice(0, 16) : `row_${rIdx}`
      ticket = `${symbol.toUpperCase()}_${timePart}_${openPrice}`
    }

    trades.push({
      ticket,
      symbol,
      type: tradeType,
      volume: volume > 0 ? volume : 1,
      openTime,
      closeTime,
      openPrice,
      closePrice: closePrice > 0 ? closePrice : openPrice,
      stopLoss: sl,
      takeProfit: tp,
      profit,
      commission,
      swap,
      comment,
    })
  }

  return { trades, errors, format: formatName, skipped }
}

export function parse2DRows(rows2D: any[][], formatName: string): ParseResult {
  const errors: string[] = []
  const trades: ParsedTrade[] = []
  let skipped = 0

  if (!rows2D || rows2D.length === 0) {
    return { trades: [], errors: ['Worksheet is empty.'], format: formatName }
  }

  // ── Step 1: Scan Every Row to Find the Header Row ───────────────────────────
  let headerRowIdx = -1
  let headerCells: string[] = []

  const isTradeHeaderRow = (cells: string[]): boolean => {
    const norm = cells.map(c => String(c ?? '').trim().toLowerCase().replace(/[\_\-\.\s]+/g, ' '))

    const hasSymbol = SYMBOL_ALIASES.some(a => norm.some(h => h === a || h.includes(a)))
    const hasType   = TYPE_ALIASES.some(a => norm.some(h => h === a || h.includes(a)))
    const hasPrice  = OPEN_PRICE_ALIASES.concat(CLOSE_PRICE_ALIASES, ['price']).some(a => norm.some(h => h === a || h.includes(a)))
    const hasProfit = PROFIT_ALIASES.some(a => norm.some(h => h === a || h.includes(a)))
    const hasVolume = VOLUME_ALIASES.some(a => norm.some(h => h === a || h.includes(a)))

    const matches = (hasSymbol ? 1 : 0) + (hasType ? 1 : 0) + (hasPrice ? 1 : 0) + (hasProfit ? 1 : 0) + (hasVolume ? 1 : 0)
    return matches >= 2 && (hasSymbol || hasPrice || hasProfit)
  }

  for (let i = 0; i < rows2D.length; i++) {
    const rowValues = (rows2D[i] || []).map(v => String(v ?? '').trim())
    if (rowValues.every(cell => cell === '')) continue

    if (isTradeHeaderRow(rowValues)) {
      headerRowIdx = i
      headerCells = rowValues
      break
    }
  }

  // Fallback: search for any row with "symbol", "pair", "position", or "ticket"
  if (headerRowIdx < 0) {
    for (let i = 0; i < rows2D.length; i++) {
      const rowValues = (rows2D[i] || []).map(v => String(v ?? '').trim().toLowerCase())
      if (rowValues.some(c => c.includes('symbol') || c.includes('pair') || c.includes('position') || c.includes('ticket') || c.includes('item'))) {
        headerRowIdx = i
        headerCells = (rows2D[i] || []).map(v => String(v ?? '').trim())
        break
      }
    }
  }

  if (headerRowIdx < 0) {
    return {
      trades: [],
      errors: ['Could not detect trade history header row in Excel worksheet.'],
      format: formatName,
    }
  }

  const normalizedHeaders = headerCells.map(h =>
    String(h).trim().toLowerCase().replace(/[\_\-\.\s]+/g, ' ')
  )

  console.log(`[${formatName}] Header row detected at row ${headerRowIdx + 1}:`, headerCells)

  const findIdx = (aliases: string[]) => {
    for (const alias of aliases) {
      const idx = normalizedHeaders.findIndex(h => h === alias || h.includes(alias))
      if (idx >= 0) return idx
    }
    return -1
  }

  const findIndices = (alias: string) => {
    const indices: number[] = []
    normalizedHeaders.forEach((h, i) => {
      if (h === alias || h.includes(alias)) indices.push(i)
    })
    return indices
  }

  // Column Index Mapping
  const iSymbol = findIdx(SYMBOL_ALIASES)
  const iType   = findIdx(TYPE_ALIASES)
  const iVolume = findIdx(VOLUME_ALIASES)

  let iOpenPrice  = findIdx(OPEN_PRICE_ALIASES)
  let iClosePrice = findIdx(CLOSE_PRICE_ALIASES)

  if (iOpenPrice < 0 || iClosePrice < 0) {
    const genericPrices = findIndices('price')
    if (iOpenPrice < 0 && genericPrices.length > 0) iOpenPrice = genericPrices[0]
    if (iClosePrice < 0 && genericPrices.length > 1) iClosePrice = genericPrices[1]
    else if (iClosePrice < 0 && iOpenPrice >= 0) iClosePrice = iOpenPrice
  }

  let iOpenTime  = findIdx(OPEN_TIME_ALIASES)
  let iCloseTime = findIdx(CLOSE_TIME_ALIASES)

  if (iOpenTime < 0 || iCloseTime < 0) {
    const genericTimes = Array.from(
      new Set([...findIndices('time'), ...findIndices('date')])
    )
    if (iOpenTime < 0 && genericTimes.length > 0) iOpenTime = genericTimes[0]
    if (iCloseTime < 0 && genericTimes.length > 1) iCloseTime = genericTimes[1]
    else if (iCloseTime < 0 && iOpenTime >= 0) iCloseTime = iOpenTime
  }

  const iSL      = findIdx(SL_ALIASES)
  const iTP      = findIdx(TP_ALIASES)
  const iProfit  = findIdx(PROFIT_ALIASES)
  const iComm    = findIdx(COMM_ALIASES)
  const iSwap    = findIdx(SWAP_ALIASES)
  const iTicket  = findIdx(TICKET_ALIASES)
  const iComment = findIdx(COMMENT_ALIASES)

  // Verify mandatory mapping requirement
  const missingCols: string[] = []
  if (iSymbol < 0) missingCols.push('Symbol / Pair / Instrument')
  if (iOpenPrice < 0 && iClosePrice < 0) missingCols.push('Entry / Open Price')

  if (missingCols.length > 0) {
    return {
      trades: [],
      errors: [
        `Could not map required column(s): ${missingCols.join(', ')}. ` +
        `Detected file headers: [${headerCells.filter(Boolean).join(', ')}]`
      ],
      format: formatName,
    }
  }

  // ── Step 2: Iterate Rows After Detected Header ──────────────────────────────
  for (let rIdx = headerRowIdx + 1; rIdx < rows2D.length; rIdx++) {
    try {
      const row = rows2D[rIdx] || []
      
      // Skip completely empty rows
      if (row.length === 0 || row.every(cell => cell === undefined || cell === null || String(cell).trim() === '')) {
        skipped++
        continue
      }

      const getVal = (idx: number) => {
        if (idx < 0 || idx >= row.length) return undefined
        return row[idx]
      }

      const symbolRaw = getVal(iSymbol)
      if (symbolRaw === undefined || symbolRaw === null) {
        skipped++
        continue
      }

      const symbol = String(symbolRaw).trim()
      const symLower = symbol.toLowerCase()

      // Skip summary, totals, deposit, withdrawal, and statistics rows
      if (
        !symbol ||
        symLower.includes('total') ||
        symLower.includes('summary') ||
        symLower.includes('balance') ||
        symLower.includes('deposit') ||
        symLower.includes('withdrawal') ||
        symLower.includes('statistic') ||
        symLower.includes('closed p/l') ||
        symLower.includes('floating p/l') ||
        symLower.includes('credit') ||
        symLower.includes('equity') ||
        symLower.includes('margin') ||
        SKIP_TYPES.has(symLower)
      ) {
        skipped++
        continue
      }

      const typeRaw = String(getVal(iType) ?? '').toLowerCase().trim()
      if (SKIP_TYPES.has(typeRaw)) {
        skipped++
        continue
      }

      const tradeType: 'buy' | 'sell' = typeRaw.includes('sell') ? 'sell' : 'buy'

      const openPrice  = parseNum(getVal(iOpenPrice))
      const closePrice = iClosePrice >= 0 ? parseNum(getVal(iClosePrice)) : openPrice
      const volume     = parseNum(getVal(iVolume))
      const profit     = parseNum(getVal(iProfit))
      const commission = parseNum(getVal(iComm))
      const swap       = parseNum(getVal(iSwap))
      const sl         = parseNum(getVal(iSL))
      const tp         = parseNum(getVal(iTP))
      const comment    = String(getVal(iComment) ?? '').trim()
      const ticketRaw  = getVal(iTicket)

      const openTime  = parseDate(getVal(iOpenTime))
      const closeTime = parseDate(getVal(iCloseTime)) ?? openTime

      // Skip invalid row without failing the entire import
      if (!isFinite(openPrice) || openPrice <= 0) {
        skipped++
        continue
      }

      // Ticket generation / fallback
      let ticket: string
      if (ticketRaw !== undefined && ticketRaw !== null && String(ticketRaw).trim() !== '') {
        ticket = String(ticketRaw).trim()
      } else {
        const timePart = openTime ? openTime.toISOString().slice(0, 16) : `row_${rIdx}`
        ticket = `${symbol.toUpperCase()}_${timePart}_${openPrice}`
      }

      trades.push({
        ticket,
        symbol,
        type: tradeType,
        volume: volume > 0 ? volume : 1,
        openTime,
        closeTime,
        openPrice,
        closePrice: closePrice > 0 ? closePrice : openPrice,
        stopLoss: sl,
        takeProfit: tp,
        profit,
        commission,
        swap,
        comment,
      })
    } catch (rowErr) {
      // Continue importing even if a single row encounters an error
      console.warn(`[${formatName}] Error parsing row ${rIdx}:`, rowErr)
      skipped++
    }
  }

  return { trades, errors, format: formatName, skipped }
}

function parseNum(val: any): number {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return isFinite(val) ? val : 0
  const cleaned = String(val).replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  return isFinite(n) ? n : 0
}

function parseDate(val: any): Date | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (val instanceof Date && !isNaN(val.getTime())) return val

  // Excel serial date number (e.g. 45230.5)
  if (typeof val === 'number') {
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000))
    if (!isNaN(jsDate.getTime())) return jsDate
  }

  const s = String(val).trim()
  if (!s) return undefined

  // Replace dot formatted dates e.g. 2024.05.14 10:30:00 -> 2024-05-14T10:30:00
  const isoLike = s.replace(/\./g, '-').replace(' ', 'T')
  const d = new Date(isoLike)
  if (!isNaN(d.getTime())) return d

  const d2 = new Date(s)
  return isNaN(d2.getTime()) ? undefined : d2
}
