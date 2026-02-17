/**
 * Run migrations. Executes SQL files in drizzle/ in order.
 * Usage: bun run scripts/migrate.ts
 */
import { Database } from 'bun:sqlite'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const dbPath = process.env.DATABASE_PATH ?? './data/vmgen.db'
const migrationsDir = join(import.meta.dir, '../drizzle')

const db = new Database(dbPath)
const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith('.sql'))
  .sort()

for (const file of files) {
  const sql = await readFile(join(migrationsDir, file), 'utf-8')
  db.exec(sql)
  console.log(`Ran ${file}`)
}

db.close()
console.log('Migrations complete.')
