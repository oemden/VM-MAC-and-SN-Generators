import { Hono } from 'hono'
import { asc } from 'drizzle-orm'
import { db, schema } from '../db'
import { createVmBodySchema } from './validation'

const vms = new Hono()

vms.get('/', async (c) => {
  try {
    const list = await db
      .select()
      .from(schema.vms)
      .orderBy(asc(schema.vms.name))
    return c.json({
      success: true,
      vms: list.map((v) => ({ id: v.id, name: v.name, created_at: v.createdAt }))
    })
  } catch (error) {
    console.error('List VMs error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

vms.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => null)
    if (body === null) {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }
    const result = createVmBodySchema.safeParse(body)
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Validation failed'
      return c.json({ error: msg }, 400)
    }
    const [row] = await db
      .insert(schema.vms)
      .values({ name: result.data.name, createdAt: new Date() })
      .returning()
    if (!row) throw new Error('Insert failed')
    return c.json(
      { success: true, id: row.id, name: row.name, created_at: row.createdAt },
      201
    )
  } catch (error) {
    console.error('Create VM error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default vms
