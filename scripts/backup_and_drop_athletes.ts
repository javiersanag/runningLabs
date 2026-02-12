import * as dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";
import fs from "fs";

const result = dotenv.config({ path: ".env.local" });

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith("file:")) {
    const dbPath = process.env.TURSO_DATABASE_URL.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), dbPath);
    process.env.TURSO_DATABASE_URL = `file:///${absolutePath.replace(/\\/g, '/')}`;
    console.log("Adjusted TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);
} else {
    console.log("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);
}

async function main() {
    // Dynamic import to ensure process.env is updated before db.ts runs
    const { db } = await import("@/lib/db");


    console.log("Reading existing athlete data...");

    try {
        const result = await db.run(sql`SELECT * FROM athletes WHERE id = 'default_athlete'`);
        const athlete = result.rows[0];

        if (athlete) {
            console.log("Found athlete:", athlete);
            const backupPath = path.join(process.cwd(), "backup_athlete.json");
            fs.writeFileSync(backupPath, JSON.stringify(athlete, null, 2));
            console.log("Backup saved to:", backupPath);
        } else {
            console.log("No default_athlete found. Skipping backup.");
        }

        console.log("Dropping table athletes...");
        // Disable FK checks temporarily to allow dropping referenced table?
        // SQLite usually requires it.
        await db.run(sql`PRAGMA foreign_keys = OFF`);
        await db.run(sql`DROP TABLE IF EXISTS athletes`);
        await db.run(sql`PRAGMA foreign_keys = ON`);

        console.log("Table dropped successfully.");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
