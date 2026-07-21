import Papa from 'papaparse'
import { TradeParser, ParseResult } from './types'
import { parseRawRows } from './tabularHelper'

/**
 * Universal CSV Trade Parser using PapaParse.
 */
export const csvParser: TradeParser = {
  name: 'CSV',

  canParse(content: string | ArrayBuffer, filename: string): boolean {
    const ext = filename.toLowerCase()
    if (ext.endsWith('.csv')) return true
    if (typeof content === 'string') {
      return content.includes(',') || content.includes(';') || content.includes('\t')
    }
    return false
  },

  async parse(content: string | ArrayBuffer): Promise<ParseResult> {
    try {
      let text: string
      if (typeof content === 'string') {
        text = content
      } else {
        const decoder = new TextDecoder('utf-8')
        text = decoder.decode(content)
      }

      const parsed = Papa.parse<Record<string, any>>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
      })

      if (parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
        return {
          trades: [],
          errors: [parsed.errors.map(e => e.message).join('; ')],
          format: 'CSV',
        }
      }

      return parseRawRows(parsed.data || [], 'CSV')
    } catch (err: any) {
      return {
        trades: [],
        errors: [`CSV parse error: ${err.message || err}`],
        format: 'CSV',
      }
    }
  },
}
