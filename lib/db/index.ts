import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

let dbUrl = process.env.DATABASE_URL!
if (dbUrl && dbUrl.includes('postgres:postgres@supabase_db_')) {
    const url = URL.parse(dbUrl) as URL
    url.hostname = url.hostname.split('_')[1]
    dbUrl = url.href
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(dbUrl, { prepare: false })
export const db = drizzle(client);