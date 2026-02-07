"use server";

import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Updates an activity's details.
 * @param id The activity ID
 * @param data The data to update (name, gearId)
 */
export async function updateActivity(id: string, data: { name?: string; gearId?: string | null }) {
    await db.update(activities)
        .set({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.gearId !== undefined && { gearId: data.gearId }),
        })
        .where(eq(activities.id, id));

    revalidatePath(`/activities/${id}`);
    revalidatePath("/activities");
    revalidatePath("/");

    return { success: true };
}

/**
 * Deletes an activity and redirects to the activities list.
 * @param id The activity ID
 */
export async function deleteActivity(id: string) {
    await db.delete(activities).where(eq(activities.id, id));

    revalidatePath("/activities");
    revalidatePath("/");

    redirect("/activities");
}
