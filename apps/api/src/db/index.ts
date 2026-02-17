/// <reference types="bun" />
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

const dbPath = process.env.DATABASE_PATH ?? './data/vmgen.db'
const sqlite = new Database(dbPath)
export const db = drizzle({ client: sqlite, schema })
export { schema }
