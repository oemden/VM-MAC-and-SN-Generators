import { describe, it, expect } from 'bun:test'
import { generateSn, validateSnOptions } from './sn'

describe('generateSn', () => {
  it('should generate a single SN by default', () => {
    const results = generateSn()
    expect(results).toHaveLength(1)
    expect(results[0].sn).toMatch(/^VM-[A-Z0-9]{6}$/)
  })

  it('should respect count option', () => {
    const results = generateSn({ count: 5 })
    expect(results).toHaveLength(5)
  })

  it('should respect length option', () => {
    const results = generateSn({ length: 10 })
    expect(results[0].sn).toMatch(/^VM-[A-Z0-9]{10}$/)
  })

  it('should respect prefix option', () => {
    const results = generateSn({ prefix: 'DEB' })
    expect(results[0].sn).toMatch(/^DEB-[A-Z0-9]{6}$/)
  })

  it('should respect suffix option', () => {
    const results = generateSn({ suffix: 'PROD' })
    expect(results[0].sn).toMatch(/^VM-[A-Z0-9]{6}-PROD$/)
  })

  it('should handle prefix and suffix together', () => {
    const results = generateSn({ prefix: 'HQ', suffix: 'LAB', length: 4 })
    expect(results[0].sn).toMatch(/^HQ-[A-Z0-9]{4}-LAB$/)
  })

  it('should generate uppercase SNs by default', () => {
    const results = generateSn({ length: 20 }) // Long enough to likely contain letters
    const randomPart = results[0].sn.split('-')[1]
    expect(randomPart).not.toMatch(/[a-z]/)
  })

  it('should generate lowercase SNs', () => {
    const results = generateSn({ case: 'lower', length: 20 })
    const randomPart = results[0].sn.split('-')[1]
    expect(randomPart).not.toMatch(/[A-Z]/)
  })

  it('should use custom delimiter', () => {
    const results = generateSn({ delimiter: '_', suffix: 'TEST' })
    expect(results[0].sn).toMatch(/^VM_[A-Z0-9]{6}_TEST$/)
  })

  it('should work without prefix', () => {
    const results = generateSn({ noPrefix: true })
    expect(results[0].sn).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('should work without delimiter', () => {
    const results = generateSn({ noDelimiter: true, suffix: 'SRV' })
    expect(results[0].sn).toMatch(/^VM[A-Z0-9]{6}SRV$/)
  })

  it('should work without prefix and delimiter', () => {
    const results = generateSn({ noPrefix: true, noDelimiter: true, suffix: 'X' })
    expect(results[0].sn).toMatch(/^[A-Z0-9]{6}X$/)
  })
})

describe('validateSnOptions', () => {
  it('should return null for valid options', () => {
    expect(validateSnOptions({})).toBeNull()
    expect(validateSnOptions({ length: 8, case: 'mixed', count: 3 })).toBeNull()
  })

  it('should reject invalid length', () => {
    expect(validateSnOptions({ length: 0 })).toBe('Length must be a positive integer')
    expect(validateSnOptions({ length: -1 })).toBe('Length must be a positive integer')
    expect(validateSnOptions({ length: 1.5 })).toBe('Length must be a positive integer')
  })

  it('should reject invalid count', () => {
    expect(validateSnOptions({ count: 0 })).toBe('Count must be a positive integer')
  })

  it('should reject invalid case', () => {
    expect(validateSnOptions({ case: 'invalid' as any })).toBe("Case must be 'upper', 'lower', or 'mixed'")
  })
})
