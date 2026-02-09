import { describe, it, expect } from 'bun:test'
import { generateMac, validateMacOptions } from './mac'

describe('generateMac', () => {
  it('should generate a single MAC by default', () => {
    const results = generateMac()
    expect(results).toHaveLength(1)
    expect(results[0].mac).toMatch(/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/)
  })

  it('should generate VMware-compatible MAC addresses', () => {
    const results = generateMac({ count: 10 })
    for (const result of results) {
      expect(result.mac).toMatch(/^00:50:56:[0-3][0-9a-f]:[0-9a-f]{2}:[0-9a-f]{2}$/)
    }
  })

  it('should respect count option', () => {
    const results = generateMac({ count: 5 })
    expect(results).toHaveLength(5)
  })

  it('should generate uppercase MACs', () => {
    const results = generateMac({ case: 'upper' })
    expect(results[0].mac).toMatch(/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/)
  })

  it('should generate lowercase MACs', () => {
    const results = generateMac({ case: 'lower' })
    expect(results[0].mac).toMatch(/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/)
  })

  it('should generate both cases when case=both', () => {
    const results = generateMac({ case: 'both' })
    expect(results[0].lowercase).toBeDefined()
    expect(results[0].uppercase).toBeDefined()
    expect(results[0].lowercase).toMatch(/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/)
    expect(results[0].uppercase).toMatch(/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/)
  })

  it('should use custom delimiter', () => {
    const results = generateMac({ delimiter: '-' })
    expect(results[0].mac).toMatch(/^[0-9a-f]{2}(-[0-9a-f]{2}){5}$/)
  })

  it('should work with empty delimiter', () => {
    const results = generateMac({ delimiter: '' })
    expect(results[0].mac).toMatch(/^[0-9a-f]{12}$/)
  })

  it('should generate random lab MACs', () => {
    const results = generateMac({ random: true, count: 10 })
    for (const result of results) {
      expect(result.mac).toMatch(/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/)
      // Check locally-administered bit (bit 1 of first octet)
      const firstOctet = parseInt(result.mac.split(':')[0], 16)
      expect(firstOctet & 0x02).toBe(0x02) // Locally administered
      expect(firstOctet & 0x01).toBe(0x00) // Unicast
    }
  })
})

describe('validateMacOptions', () => {
  it('should return null for valid options', () => {
    expect(validateMacOptions({})).toBeNull()
    expect(validateMacOptions({ case: 'upper', count: 5 })).toBeNull()
  })

  it('should reject invalid case', () => {
    expect(validateMacOptions({ case: 'invalid' as any })).toBe("Case must be 'upper', 'lower', or 'both'")
  })

  it('should reject invalid count', () => {
    expect(validateMacOptions({ count: 0 })).toBe('Count must be a positive integer')
    expect(validateMacOptions({ count: -1 })).toBe('Count must be a positive integer')
    expect(validateMacOptions({ count: 1.5 })).toBe('Count must be a positive integer')
  })

  it('should reject invalid delimiter', () => {
    expect(validateMacOptions({ delimiter: 'xx' })).toBe('Delimiter must be a single character or empty string')
  })
})
