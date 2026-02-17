/// <reference types="bun" />
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

const dbPath = process.env.DATABASE_PATH ?? './data/vmgen.db'
const resolvedPath = resolve(process.cwd(), dbPath)
mkdirSync(dirname(resolvedPath), { recursive: true })
const sqlite = new Database(resolvedPath)
export const db = drizzle({ client: sqlite, schema })
export { schema }
