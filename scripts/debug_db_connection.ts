import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@libsql/client";

dotenv.config({ path: ".env.local" });

const originalUrl = process.env.TURSO_DATABASE_URL;
console.log("Original URL:", originalUrl);

try {
    if (!originalUrl) throw new Error("URL is undefined");
    new URL(originalUrl);
    console.log("Original URL is valid for new URL()");
} catch (e: any) {
    console.log("Original URL is INVALID for new URL():", e.message);
}

if (originalUrl?.startsWith("file:")) {
    const dbPath = originalUrl.replace("file:", "");
    // Handle "./" if present
    const cleanDbPath = dbPath.startsWith("./") ? dbPath.slice(2) : dbPath;
    const absolutePath = path.resolve(process.cwd(), cleanDbPath);
    // On Windows, file:///C:/... is valid.
    const fixedUrl = `file:///${absolutePath.replace(/\\/g, '/')}`;
    console.log("Fixed URL attempt:", fixedUrl);

    try {
        new URL(fixedUrl);
        console.log("Fixed URL is valid for new URL()");

        // Try creating client
        const client = createClient({ url: fixedUrl, authToken: process.env.TURSO_AUTH_TOKEN });
        console.log("Client created successfully with fixed URL");

    } catch (e: any) {
        console.log("Fixed URL failed:", e);
    }
}
