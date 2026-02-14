"use server";

import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";

/**
 * Updates the athlete's physiological profile.
 */
export async function updateProfileAction(formData: FormData) {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) throw new Error("Unauthorized");

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const age = parseInt(formData.get("age") as string);
    const ftp = parseInt(formData.get("ftp") as string);
    const maxHr = parseInt(formData.get("maxHr") as string);
    const weight = parseFloat(formData.get("weight") as string);

    await db.update(athletes).set({
        firstName: firstName || "Athlete",
        lastName: lastName || null,
        age,
        ftp,
        maxHr,
        weight
    }).where(eq(athletes.id, sessionUser.id));

    revalidatePath("/profile");
    revalidatePath("/settings");
    revalidatePath("/");
}
