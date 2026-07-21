import { TradeParser, ParseResult } from './types'
import { csvParser } from './csvParser'
import { excelParser } from './excelParser'

/**
 * Registry of all available trade parsers, checked in order.
 * To add a new format (e.g. cTrader, MyFxBook, JSON):
 *   1. Create a new parser file implementing TradeParser.
 *   2. Import it here and add it to the PARSERS array.
 *   That's it — no UI changes needed.
 */
const PARSERS: TradeParser[] = [
  csvParser,
  excelParser,
]

export interface AutoDetectResult {
  parserName: string
  result: ParseResult
}

/**
 * Auto-detect the format and parse the file content.
 * Returns the first parser that claims it can handle the content.
 */
export async function autoDetectAndParse(
  content: string | ArrayBuffer,
  filename: string,
): Promise<AutoDetectResult> {
  for (const parser of PARSERS) {
    if (parser.canParse(content, filename)) {
      const result = await parser.parse(content, filename)
      return { parserName: parser.name, result }
    }
  }

  // No parser matched — return an error result
  return {
    parserName: 'Unknown',
    result: {
      trades: [],
      errors: [
        `Unsupported file format: "${filename}". ` +
        'Supported formats: CSV (.csv), Excel (.xlsx, .xls).'
      ],
      format: 'Unknown',
    },
  }
}

/**
 * List of all supported formats for display in the UI
 */
export const SUPPORTED_FORMATS = PARSERS.map(p => p.name)

