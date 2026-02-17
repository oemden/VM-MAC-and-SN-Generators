import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from '../db'
import {
  validateSaveResultsBody,
  RESULTS_LIMIT_DEFAULT,
  RESULTS_LIMIT_MAX
} from './validation'

const results = new Hono()

/** Get VM id by name, or create VM if not exists (create-on-fly) */
async function getOrCreateVmId(vmName: string): Promise<number> {
  const existing = await db
    .select()
    .from(schema.vms)
    .where(eq(schema.vms.name, vmName))
    .limit(1)
  if (existing[0]) return existing[0].id
  const [row] = await db
    .insert(schema.vms)
    .values({ name: vmName, createdAt: new Date() })
    .returning({ id: schema.vms.id })
  if (!row) throw new Error('Failed to create VM')
  return row.id
}

/** POST /api/results — Save one or more SN/MAC results */
results.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => null)
    if (body === null) {
      return c.json(
        { error: 'Invalid JSON body', details: [{ field: 'body', message: 'Request body must be valid JSON' }] },
        400
      )
    }

    const validation = validateSaveResultsBody(body)
    if (!validation.success) {
      return c.json(
        { error: validation.error, details: validation.details },
        400
      )
    }

    const { type, values, comment, vm_id: vmIdParam, vm_name } = validation.data
    const now = new Date()

    let vmId: number | null = null
    if (vmIdParam) {
      vmId = vmIdParam
    } else if (vm_name) {
      vmId = await getOrCreateVmId(vm_name)
    }

    if (type === 'sn' && vmId) {
      const existing = await db
        .select({ id: schema.savedResults.id })
        .from(schema.savedResults)
        .where(
          and(
            eq(schema.savedResults.vmId, vmId),
            eq(schema.savedResults.type, 'sn')
          )
        )
        .limit(1)
      if (existing.length > 0) {
        return c.json({ error: 'VM already has a Serial Number' }, 409)
      }
    }

    const rows = await db
      .insert(schema.savedResults)
      .values(
        values.map((value) => ({
          type,
          value,
          comment: comment ?? null,
          vmName: vm_name ?? null,
          vmId,
          createdAt: now,
          userId: null,
          projectId: null
        }))
      )
      .returning({ id: schema.savedResults.id })

    const ids = rows.map((r) => r.id)
    return c.json({ success: true, count: ids.length, ids }, 201)
  } catch (error) {
    console.error('Save results error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/** GET /api/results — List saved results with optional filters */
results.get('/', async (c) => {
  try {
    const typeParam = c.req.query('type')
    const limitParam = c.req.query('limit')
    const offsetParam = c.req.query('offset')

    const type = typeParam === 'sn' || typeParam === 'mac' ? typeParam : undefined
    const limit = Math.min(
      Math.max(parseInt(limitParam ?? String(RESULTS_LIMIT_DEFAULT), 10) || RESULTS_LIMIT_DEFAULT, 1),
      RESULTS_LIMIT_MAX
    )
    const offset = Math.max(parseInt(offsetParam ?? '0', 10) || 0, 0)

    const resultsList = await db
      .select({
        id: schema.savedResults.id,
        type: schema.savedResults.type,
        value: schema.savedResults.value,
        comment: schema.savedResults.comment,
        vmName: schema.savedResults.vmName,
        vmId: schema.savedResults.vmId,
        vmNameFromJoin: schema.vms.name,
        createdAt: schema.savedResults.createdAt
      })
      .from(schema.savedResults)
      .leftJoin(schema.vms, eq(schema.savedResults.vmId, schema.vms.id))
      .where(type ? eq(schema.savedResults.type, type) : undefined)
      .orderBy(desc(schema.savedResults.createdAt))
      .limit(limit)
      .offset(offset)

    return c.json({
      success: true,
      results: resultsList.map((r) => ({
        id: r.id,
        type: r.type,
        value: r.value,
        comment: r.comment,
        vm_name: r.vmNameFromJoin ?? r.vmName ?? null,
        created_at: r.createdAt
      }))
    })
  } catch (error) {
    console.error('List results error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default results
