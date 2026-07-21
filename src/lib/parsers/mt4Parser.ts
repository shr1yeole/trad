import { TradeParser, ParseResult, ParsedTrade } from './types'

/**
 * MT4 HTML Report Parser
 *
 * MT4 reports use a different HTML structure than MT5.
 * The trade history table typically has these columns:
 * Open Time | Ticket | Type | Size | Item | Price | S/L | T/P | Close Time | Price | Commission | Swap | Profit
 *
 * Rows come in pairs: an "open" row and a "close" row. We match them by ticket.
 * Balance, credit and deposit rows are filtered out.
 */
export const mt4Parser: TradeParser = {
  name: 'MT4',

  canParse(content: string, filename: string): boolean {
    const lower = content.toLowerCase()
    return (
      lower.includes('metatrader 4') ||
      lower.includes('mt4') ||
      (lower.includes('ticket') && lower.includes('swap') && lower.includes('profit') &&
        lower.includes('open time') &&
        (filename.endsWith('.html') || filename.endsWith('.htm')))
    )
  },

  async parse(content: string): Promise<ParseResult> {
    const errors: string[] = []
    const trades: ParsedTrade[] = []
    const ticketsSeen = new Set<string>()

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')

      const tables = Array.from(doc.querySelectorAll('table'))
      let tradeTable: Element | null = null

      for (const table of tables) {
        const text = table.textContent?.toLowerCase() ?? ''
        if (
          (text.includes('open time') || text.includes('ticket')) &&
          text.includes('profit') &&
          text.includes('swap')
        ) {
          tradeTable = table
          break
        }
      }

      if (!tradeTable) {
        errors.push('Could not find a trade history table in this MT4 report.')
        return { trades, errors, format: 'MT4' }
      }

      const rows = Array.from(tradeTable.querySelectorAll('tr'))
      if (rows.length < 2) {
        errors.push('Trade table has no data rows.')
        return { trades, errors, format: 'MT4' }
      }

      // Parse header
      const headerCells = Array.from(rows[0].querySelectorAll('th, td')).map(
        c => c.textContent?.trim().toLowerCase() ?? ''
      )

      // MT4 format: Open Time | Ticket | Type | Size | Item | Price | S/L | T/P | Close Time | Price | Commission | Swap | Profit
      const col = (name: string) => headerCells.findIndex(h => h.includes(name))

      // Some MT4 reports don't have a header — fall back to positional parsing
      let usePositional = headerCells.every(h => !h)

      const iOpenTime  = usePositional ? 0  : col('open time')
      const iTicket    = usePositional ? 1  : col('ticket')
      const iType      = usePositional ? 2  : col('type')
      const iSize      = usePositional ? 3  : col('size')  >= 0 ? col('size') : col('volume')
      const iSymbol    = usePositional ? 4  : (col('item') >= 0 ? col('item') : col('symbol'))
      const iOpenPrice = usePositional ? 5  : col('price')
      const iSL        = usePositional ? 6  : (col('s / l') >= 0 ? col('s / l') : col('sl'))
      const iTP        = usePositional ? 7  : (col('t / p') >= 0 ? col('t / p') : col('tp'))
      const iCloseTime = usePositional ? 8  : col('close time')
      const iClosePrice = usePositional ? 9 : -1   // second "Price" column
      const iCommission = usePositional ? 10 : col('commission')
      const iSwap      = usePositional ? 11 : col('swap')
      const iProfit    = usePositional ? 12 : headerCells.lastIndexOf('profit') >= 0
        ? headerCells.lastIndexOf('profit')
        : col('profit')
      const iComment   = col('comment')

      // MT4 has two "price" columns (open & close). Find second occurrence.
      let secondPriceIdx = -1
      if (!usePositional) {
        let priceCount = 0
        for (let i = 0; i < headerCells.length; i++) {
          if (headerCells[i].includes('price')) {
            priceCount++
            if (priceCount === 2) { secondPriceIdx = i; break }
          }
        }
      }
      const iClosePriceActual = iClosePrice >= 0 ? iClosePrice : secondPriceIdx

      // MT4 non-trade row types (skip these)
      const skipTypes = new Set(['balance', 'credit', 'deposit', 'withdrawal'])

      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td')).map(
          c => c.textContent?.trim() ?? ''
        )
        if (cells.length < 6) continue

        const getCell = (idx: number) => idx >= 0 && idx < cells.length ? cells[idx] : ''

        const typeRaw = getCell(iType).toLowerCase()
        if (!typeRaw || skipTypes.has(typeRaw)) continue

        const symbol = getCell(iSymbol)
        if (!symbol) continue

        const ticket     = getCell(iTicket) || String(i)
        const openTimeS  = getCell(iOpenTime)
        const closeTimeS = iCloseTime >= 0 ? getCell(iCloseTime) : ''
        const openPrice  = parseFloat(getCell(iOpenPrice)) || 0
        const closePrice = iClosePriceActual >= 0 ? parseFloat(getCell(iClosePriceActual)) || 0 : 0
        const size       = iSize >= 0 ? parseFloat(getCell(iSize)) || 0 : 0
        const sl         = iSL >= 0 ? parseFloat(getCell(iSL)) || 0 : 0
        const tp         = iTP >= 0 ? parseFloat(getCell(iTP)) || 0 : 0
        const commission = iCommission >= 0 ? parseFloat(getCell(iCommission)) || 0 : 0
        const swap       = iSwap >= 0 ? parseFloat(getCell(iSwap)) || 0 : 0
        const profit     = iProfit >= 0 ? parseFloat(getCell(iProfit)) || 0 : 0
        const comment    = iComment >= 0 ? getCell(iComment) : ''

        const tradeType: 'buy' | 'sell' = typeRaw.includes('sell') ? 'sell' : 'buy'

        if (ticketsSeen.has(ticket)) continue
        ticketsSeen.add(ticket)

        const trade: ParsedTrade = {
          ticket,
          symbol,
          type: tradeType,
          volume: size,
          openTime: openTimeS ? new Date(openTimeS) : undefined,
          closeTime: closeTimeS ? new Date(closeTimeS) : undefined,
          openPrice,
          closePrice: closePrice || openPrice,
          stopLoss: sl,
          takeProfit: tp,
          profit,
          commission,
          swap,
          comment,
        }

        trades.push(trade)
      }

    } catch (err: any) {
      errors.push(`MT4 parse error: ${err.message}`)
    }

    return { trades, errors, format: 'MT4' }
  },
}
