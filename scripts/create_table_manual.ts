import * as dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";

const result = dotenv.config({ path: ".env.local" });

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith("file:")) {
    const dbPath = process.env.TURSO_DATABASE_URL.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), dbPath);
    process.env.TURSO_DATABASE_URL = `file:///${absolutePath.replace(/\\/g, '/')}`;
}

async function main() {
    const { db } = await import("@/lib/db");

    console.log("Creating table athletes manually...");

    // Schema from src/lib/schema.ts
    // id: text("id").primaryKey(),
    // firstName: text("first_name").notNull(),
    // lastName: text("last_name"),
    // email: text("email").notNull().unique(),
    // passwordHash: text("password_hash").notNull(),
    // age: integer("age"),
    // ftp: integer("ftp").default(250),
    // maxHr: integer("max_hr").default(190),
    // weight: real("weight"),
    // lastAiInsight: text("last_ai_insight"),
    // lastAiInsightDate: text("last_ai_insight_date"),
    // createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),

    try {
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS athletes (
                id text PRIMARY KEY NOT NULL,
                first_name text NOT NULL,
                last_name text,
                email text NOT NULL,
                password_hash text NOT NULL,
                age integer,
                ftp integer DEFAULT 250,
                max_hr integer DEFAULT 190,
                weight real,
                last_ai_insight text,
                last_ai_insight_date text,
                created_at text DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create unique index for email
        // Note: SQLite supports UNIQUE constraint in CREATE TABLE, but separate index often better for Drizzle introspection?
        // Drizzle schema defines .unique(), which maps to UNIQUE constraint usually.
        // But let's add explicit index to match what Drizzle likely expects.
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS athletes_email_unique ON athletes (email);`);

        console.log("Table created successfully.");
    } catch (error) {
        console.error("Error creating table:", error);
    }
}

main();
