import { Hono } from 'hono'
import { asc, eq, sql } from 'drizzle-orm'
import { db, schema } from '../db'
import { createVmBodySchema } from './validation'

const vms = new Hono()

vms.get('/', async (c) => {
  try {
    const list = await db
      .select()
      .from(schema.vms)
      .orderBy(asc(schema.vms.name))

    const counts = await db
      .select({
        vmId: schema.savedResults.vmId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(schema.savedResults)
      .where(sql`${schema.savedResults.vmId} IS NOT NULL`)
      .groupBy(schema.savedResults.vmId)

    const countMap = Object.fromEntries(counts.map((r) => [r.vmId!, r.count]))

    return c.json({
      success: true,
      vms: list.map((v) => ({
        id: v.id,
        name: v.name,
        created_at: v.createdAt,
        associated_count: countMap[v.id] ?? 0
      }))
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
    const existing = await db
      .select({ id: schema.vms.id })
      .from(schema.vms)
      .where(eq(schema.vms.name, result.data.name))
      .limit(1)
    if (existing.length > 0) {
      return c.json({ error: 'VM with this name already exists' }, 409)
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

vms.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10)
    if (isNaN(id)) {
      return c.json({ error: 'Invalid id' }, 400)
    }
    const existing = await db
      .select({ id: schema.vms.id })
      .from(schema.vms)
      .where(eq(schema.vms.id, id))
      .limit(1)
    if (existing.length === 0) {
      return c.body(null, 404)
    }
    const cascade = c.req.query('cascade') === 'true'
    if (cascade) {
      await db.delete(schema.savedResults).where(eq(schema.savedResults.vmId, id))
    } else {
      await db
        .update(schema.savedResults)
        .set({ vmId: null, vmName: null })
        .where(eq(schema.savedResults.vmId, id))
    }
    await db.delete(schema.vms).where(eq(schema.vms.id, id))
    return c.body(null, 204)
  } catch (error) {
    console.error('Delete VM error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default vms
