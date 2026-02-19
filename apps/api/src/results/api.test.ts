/**
 * Integration tests for POST /api/results and GET /api/results.
 * Uses isolated SQLite DB. DATABASE_PATH must be set before db import.
 * DB module auto-runs migrations on startup.
 */
import { join } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'

const testDbDir = mkdtempSync(join(tmpdir(), 'vmgen-api-test-'))
process.env.DATABASE_PATH = join(testDbDir, 'test.db')

import { describe, expect, it, afterAll } from 'bun:test'

// Import app; db module auto-runs migrations
const { app } = await import('../index')

afterAll(() => {
  rmSync(testDbDir, { recursive: true })
})

describe('POST /api/results', () => {
  it('should return 201 with ids for valid payload', async () => {
    const res = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sn',
        values: ['ABC123', 'DEF456'],
        comment: 'test'
      })
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.count).toBe(2)
    expect(json.ids).toHaveLength(2)
    expect(typeof json.ids[0]).toBe('number')
  })

  it('should return 400 for invalid type', async () => {
    const res = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid', values: ['x'] })
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
    expect(json.details).toBeDefined()
  })

  it('should return 400 for empty values', async () => {
    const res = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sn', values: [] })
    })
    expect(res.status).toBe(400)
  })

  it('should return 409 when saving second SN for same VM', async () => {
    const createRes = await app.request('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'vm-sn-test' })
    })
    expect(createRes.status).toBe(201)
    const { id: vmId } = await createRes.json()

    const first = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sn',
        values: ['SN001'],
        vm_id: vmId
      })
    })
    expect(first.status).toBe(201)

    const second = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sn',
        values: ['SN002'],
        vm_id: vmId
      })
    })
    expect(second.status).toBe(409)
    const json = await second.json()
    expect(json.error).toBe('VM already has a Serial Number')
  })

  it('should allow multiple MACs for same VM', async () => {
    const createRes = await app.request('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'vm-mac-test' })
    })
    expect(createRes.status).toBe(201)
    const { id: vmId } = await createRes.json()

    const first = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'mac',
        values: ['00:11:22:33:44:55'],
        vm_id: vmId
      })
    })
    expect(first.status).toBe(201)

    const second = await app.request('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'mac',
        values: ['00:11:22:33:44:66'],
        vm_id: vmId
      })
    })
    expect(second.status).toBe(201)
  })
})

describe('GET /api/results', () => {
  it('should return 200 with results list', async () => {
    const res = await app.request('/api/results')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.results)).toBe(true)
    if (json.results.length > 0) {
      expect(json.results[0]).toHaveProperty('id')
      expect(json.results[0]).toHaveProperty('type')
      expect(json.results[0]).toHaveProperty('value')
      expect(json.results[0]).toHaveProperty('created_at')
    }
  })

  it('should filter by type when type param provided', async () => {
    const res = await app.request('/api/results?type=sn')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    for (const r of json.results) {
      expect(r.type).toBe('sn')
    }
  })

  it('should respect limit param', async () => {
    const res = await app.request('/api/results?limit=1')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results.length).toBeLessThanOrEqual(1)
  })
})

describe('POST /api/vms', () => {
  it('should return 201 with id for valid name', async () => {
    const res = await app.request('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test-vm-api-01' })
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(typeof json.id).toBe('number')
    expect(json.name).toBe('test-vm-api-01')
    expect(json.created_at).toBeDefined()
  })

  it('should return 409 for duplicate name', async () => {
    await app.request('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'dup-vm-api' })
    })

    const res = await app.request('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'dup-vm-api' })
    })
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toBe('VM with this name already exists')
  })
})

describe('GET /api/vms', () => {
  it('should return 200 with vms list', async () => {
    const res = await app.request('/api/vms')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.vms)).toBe(true)
    if (json.vms.length > 0) {
      expect(json.vms[0]).toHaveProperty('id')
      expect(json.vms[0]).toHaveProperty('name')
      expect(json.vms[0]).toHaveProperty('created_at')
    }
  })
})
