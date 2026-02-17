import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

/**
 * Saved SN/MAC generation results. One row per value.
 * user_id and project_id reserved for Pro; unused in Standard.
 */
export const savedResults = sqliteTable(
  'saved_results',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type', { enum: ['sn', 'mac'] }).notNull(),
    value: text('value').notNull(),
    comment: text('comment'),
    vmName: text('vm_name'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    userId: integer('user_id'),
    projectId: integer('project_id')
  },
  (table) => ({
    saved_results_type_created_at_idx: index('saved_results_type_created_at_idx').on(
      table.type,
      table.createdAt
    )
  })
)

export type SavedResult = typeof savedResults.$inferSelect
export type NewSavedResult = typeof savedResults.$inferInsert
