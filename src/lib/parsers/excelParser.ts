import * as XLSX from 'xlsx'
import { TradeParser, ParseResult } from './types'
import { parse2DRows } from './tabularHelper'

/**
 * Universal MetaTrader 5 & General Excel (.xlsx, .xls) Trade Parser using SheetJS.
 * Automatically scans every row in the worksheet to detect the actual trade header row,
 * ignoring title/metadata rows, empty rows, and summary statistics.
 */
export const excelParser: TradeParser = {
  name: 'Excel',

  canParse(content: string | ArrayBuffer, filename: string): boolean {
    const ext = filename.toLowerCase()
    return ext.endsWith('.xlsx') || ext.endsWith('.xls')
  },

  async parse(content: string | ArrayBuffer): Promise<ParseResult> {
    try {
      let workbook: XLSX.WorkBook

      if (typeof content === 'string') {
        workbook = XLSX.read(content, { type: 'string', cellDates: true, dense: true })
      } else {
        const buf = new Uint8Array(content)
        workbook = XLSX.read(buf, { type: 'array', cellDates: true, dense: true })
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        return { trades: [], errors: ['Excel file contains no worksheets.'], format: 'Excel' }
      }

      // Iterate through sheets to find the worksheet with trade data
      let bestRows2D: any[][] = []
      let sheetUsed = workbook.SheetNames[0]

      for (const name of workbook.SheetNames) {
        const sheet = workbook.Sheets[name]
        if (!sheet || !sheet['!ref']) continue
        const rows2D = XLSX.utils.sheet_to_json<any[]>(sheet, {
          header: 1,
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd hh:mm:ss',
        })
        if (rows2D && rows2D.length > 0) {
          bestRows2D = rows2D
          sheetUsed = name
          break
        }
      }

      if (bestRows2D.length === 0) {
        return { trades: [], errors: ['No data rows found in the Excel file.'], format: 'Excel' }
      }

      return parse2DRows(bestRows2D, `Excel (${sheetUsed})`)
    } catch (err: any) {
      console.error('[Excel Parser Error]:', err)
      return {
        trades: [],
        errors: [`Excel parse error: ${err.message || err}`],
        format: 'Excel',
      }
    }
  },
}
