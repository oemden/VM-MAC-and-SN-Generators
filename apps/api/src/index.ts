import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import {
  generateMac,
  generateSn,
  validateMacOptions,
  validateSnOptions,
  type MacOptions,
  type SnOptions
} from '@vmgen/core'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'VM MAC & SN Generator API',
    version: '0.1.0',
    endpoints: {
      mac: '/api/mac/generate',
      sn: '/api/sn/generate'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// MAC generation endpoint
app.post('/api/mac/generate', async (c) => {
  try {
    const body = await c.req.json<MacOptions>().catch(() => ({}))

    const validationError = validateMacOptions(body)
    if (validationError) {
      return c.json({ error: validationError }, 400)
    }

    const results = generateMac(body)
    return c.json({
      success: true,
      count: results.length,
      results
    })
  } catch (error) {
    console.error('MAC generation error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// SN generation endpoint
app.post('/api/sn/generate', async (c) => {
  try {
    const body = await c.req.json<SnOptions>().catch(() => ({}))

    const validationError = validateSnOptions(body)
    if (validationError) {
      return c.json({ error: validationError }, 400)
    }

    const results = generateSn(body)
    return c.json({
      success: true,
      count: results.length,
      results
    })
  } catch (error) {
    console.error('SN generation error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get server port from environment or default to 3000
const port = parseInt(process.env.API_PORT ?? '3000', 10)

console.log(`API server starting on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
