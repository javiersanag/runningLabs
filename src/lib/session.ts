import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { athletes } from "@/lib/schema";

// Wrap in cache to prevent duplicate DB calls in the same request (e.g. layout + page)
export const getCurrentUser = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const payload = await verifySession(token);
    if (!payload?.userId) return null;

    const userId = payload.userId as string;

    // Fetch user from DB
    // Use findFirst with where clause because query builder is safer
    const user = await db.query.athletes.findFirst({
        where: (t, { eq }) => eq(t.id, userId)
    });

    return user || null;
});
