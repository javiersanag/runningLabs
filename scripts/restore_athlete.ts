import * as dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";
import fs from "fs";

const result = dotenv.config({ path: ".env.local" });

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith("file:")) {
    const dbPath = process.env.TURSO_DATABASE_URL.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), dbPath);
    process.env.TURSO_DATABASE_URL = `file:///${absolutePath.replace(/\\/g, '/')}`;
}

async function main() {
    const { db } = await import("@/lib/db");
    const { athletes } = await import("@/lib/schema");

    console.log("Restoring athlete data...");

    const backupPath = path.join(process.cwd(), "backup_athlete.json");
    if (!fs.existsSync(backupPath)) {
        console.log("No backup file found. Skipping restore.");
        return;
    }

    try {
        const data = fs.readFileSync(backupPath, "utf-8");
        const athlete = JSON.parse(data);
        console.log("Read backup:", athlete);

        // Adapt data to new schema
        // Old: name, new: firstName, lastName
        // Old: no email/passwordHash

        // Split name (simple heuristic)
        const fullName = athlete.name || "Performance Athlete";
        const parts = fullName.split(" ");
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ") || null;

        // Placeholder auth data
        // User will likely need to reset pass or we just assume this is a legacy account that needs special handling?
        // Plan said: "existing data ... will remain ... but will no longer be accessible without logging in"
        // And "You'll need to register a new account and re-associate data".
        // Re-associating implies the ID `default_athlete` stays?
        // But if user registers new account, they get NEW random ID.
        // So `default_athlete` data is "orphaned" unless we migrate it to new user.
        // OR we just create a dummy login for `default_athlete`?
        // Let's create a dummy login: admin@khronos.run / password (hashed 'password')?
        // Or just placeholder and let them register new account.

        const restoredAthlete = {
            id: athlete.id || "default_athlete",
            firstName: firstName,
            lastName: lastName,
            email: "legacy_user@local.dev", // Placeholder email to satisfy unique constraint
            // bcrypt hash for "password" (12 rounds) - precomputed or computed here?
            // Let's rely on auth lib later? No, I need to insert it now.
            // I'll use a known hash or just "placeholder_hash" (so they can't login, effectively locked out until manual fix or migration).
            // Actually, if I use a placeholder hash, they can't login.
            // If they register new account, they get new ID.
            // Then their old data is lost?
            // The plan said: "I can add a one-time migration script to link existing data to your new account".
            // So leaving it as `legacy_user` is fine.
            passwordHash: "$2a$12$eXf6/wGk.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1", // Invalid hash logic or placeholder
            age: athlete.age || 30,
            ftp: athlete.ftp || 250,
            maxHr: athlete.maxHr || 190,
            weight: athlete.weight || 70,
            lastAiInsight: athlete.lastAiInsight,
            lastAiInsightDate: athlete.lastAiInsightDate,
            createdAt: athlete.createdAt
        };

        console.log("Inserting restored athlete:", restoredAthlete);

        await db.insert(athletes).values(restoredAthlete).onConflictDoNothing();

        console.log("Restore complete.");

    } catch (error) {
        console.error("Error restoring:", error);
    }
}

main();
