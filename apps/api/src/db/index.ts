/// <reference types="bun" />
import { mkdirSync } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

const dbPath = process.env.DATABASE_PATH ?? './data/vmgen.db'
const resolvedPath = resolve(process.cwd(), dbPath)
mkdirSync(dirname(resolvedPath), { recursive: true })
const sqlite = new Database(resolvedPath)

/**
 * Run migrations on startup. Ensures DB is ready without manual db:migrate.
 * Tracks applied migrations in _migrations to avoid re-running.
 */
async function runMigrations(db: Database): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY
    )
  `)
  const migrationsDir = join(import.meta.dir, '../../drizzle')
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    const row = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file)
    if (row) continue
    const sql = await readFile(join(migrationsDir, file), 'utf-8')
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const stmt of statements) {
      try {
        db.exec(stmt + ';')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('duplicate column name') || msg.includes('already exists')) {
          // Already applied; skip
        } else {
          throw err
        }
      }
    }
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file)
  }
}

await runMigrations(sqlite)

export const db = drizzle({ client: sqlite, schema })
export { schema }
