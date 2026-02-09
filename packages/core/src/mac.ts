export type MacCase = 'upper' | 'lower' | 'both'
export type MacTarget = 'vmware'

export interface MacOptions {
  case?: MacCase
  count?: number
  delimiter?: string
  target?: MacTarget
  random?: boolean
}

export interface MacResult {
  mac: string
  uppercase?: string
  lowercase?: string
}

const VMWARE_PREFIX = ['00', '50', '56']

function randomByte(max = 256): number {
  return Math.floor(Math.random() * max)
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0')
}

function generateSingleMac(options: MacOptions): string[] {
  const delimiter = options.delimiter ?? ':'
  let octets: string[]

  if (options.random) {
    // Random lab mode: locally-administered unicast MAC
    // Bit 0 = 0 (unicast), Bit 1 = 1 (locally administered)
    const firstByte = (randomByte() & 0xfc) | 0x02
    octets = [
      toHex(firstByte),
      toHex(randomByte()),
      toHex(randomByte()),
      toHex(randomByte()),
      toHex(randomByte()),
      toHex(randomByte())
    ]
  } else {
    // VMware static MACs: 00:50:56:XX:YY:ZZ
    // XX: 00-3F (0-63), YY/ZZ: 00-FF (0-255)
    octets = [
      ...VMWARE_PREFIX,
      toHex(randomByte(64)),
      toHex(randomByte()),
      toHex(randomByte())
    ]
  }

  const mac = octets.join(delimiter)
  const caseType = options.case ?? 'lower'

  if (caseType === 'both') {
    return [mac.toLowerCase(), mac.toUpperCase()]
  } else if (caseType === 'upper') {
    return [mac.toUpperCase()]
  } else {
    return [mac.toLowerCase()]
  }
}

export function generateMac(options: MacOptions = {}): MacResult[] {
  const count = options.count ?? 1
  const results: MacResult[] = []

  for (let i = 0; i < count; i++) {
    const macs = generateSingleMac(options)

    if (options.case === 'both') {
      results.push({
        mac: macs[0],
        lowercase: macs[0],
        uppercase: macs[1]
      })
    } else {
      results.push({ mac: macs[0] })
    }
  }

  return results
}

export function validateMacOptions(options: MacOptions): string | null {
  if (options.case && !['upper', 'lower', 'both'].includes(options.case)) {
    return "Case must be 'upper', 'lower', or 'both'"
  }

  if (options.count !== undefined && (options.count < 1 || !Number.isInteger(options.count))) {
    return 'Count must be a positive integer'
  }

  if (options.delimiter !== undefined && options.delimiter !== '' && options.delimiter.length !== 1) {
    return 'Delimiter must be a single character or empty string'
  }

  if (options.target && options.target !== 'vmware') {
    return "Unsupported target type (supported: 'vmware')"
  }

  return null
}
