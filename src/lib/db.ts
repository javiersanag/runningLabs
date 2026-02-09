import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

/**
 * Database client using Turso (libSQL) for cloud-compatible SQLite.
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.
 */
const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
