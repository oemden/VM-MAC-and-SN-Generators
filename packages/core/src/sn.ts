export type SnCase = 'upper' | 'lower' | 'mixed'

export interface SnOptions {
  length?: number
  prefix?: string
  suffix?: string
  case?: SnCase
  count?: number
  delimiter?: string
  noPrefix?: boolean
  noDelimiter?: boolean
}

export interface SnResult {
  sn: string
}

const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'

function randomChar(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)]
}

function generateRandomPart(length: number, caseType: SnCase): string {
  let result = ''

  for (let i = 0; i < length; i++) {
    // Randomly choose between letter and number (50/50)
    if (Math.random() < 0.5) {
      // Generate letter
      if (caseType === 'upper') {
        result += randomChar(UPPERCASE_LETTERS)
      } else if (caseType === 'lower') {
        result += randomChar(LOWERCASE_LETTERS)
      } else {
        // Mixed: randomly choose upper or lower
        result += Math.random() < 0.5
          ? randomChar(UPPERCASE_LETTERS)
          : randomChar(LOWERCASE_LETTERS)
      }
    } else {
      // Generate digit
      result += randomChar(DIGITS)
    }
  }

  return result
}

function generateSingleSn(options: SnOptions): string {
  const length = options.length ?? 6
  const prefix = options.noPrefix ? '' : (options.prefix ?? 'VM')
  const suffix = options.suffix ?? ''
  const caseType = options.case ?? 'upper'
  const delimiter = options.noDelimiter ? '' : (options.delimiter ?? '-')

  const randomPart = generateRandomPart(length, caseType)

  let sn = ''

  // Add prefix
  if (prefix) {
    sn = prefix
    if (delimiter) {
      sn += delimiter
    }
  }

  // Add random part
  sn += randomPart

  // Add suffix
  if (suffix) {
    if (delimiter) {
      sn += delimiter
    }
    sn += suffix
  }

  return sn
}

export function generateSn(options: SnOptions = {}): SnResult[] {
  const count = options.count ?? 1
  const results: SnResult[] = []

  for (let i = 0; i < count; i++) {
    results.push({ sn: generateSingleSn(options) })
  }

  return results
}

export function validateSnOptions(options: SnOptions): string | null {
  if (options.length !== undefined && (options.length < 1 || !Number.isInteger(options.length))) {
    return 'Length must be a positive integer'
  }

  if (options.count !== undefined && (options.count < 1 || !Number.isInteger(options.count))) {
    return 'Count must be a positive integer'
  }

  if (options.case && !['upper', 'lower', 'mixed'].includes(options.case)) {
    return "Case must be 'upper', 'lower', or 'mixed'"
  }

  return null
}
