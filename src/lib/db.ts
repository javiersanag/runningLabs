import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Check if we are in environment that can write (not Edge)
const sqlite = new Database('runninglabs.db');
export const db = drizzle(sqlite, { schema });
