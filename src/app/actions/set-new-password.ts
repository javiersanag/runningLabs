"use server";

import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const setNewPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/**
 * Sets a new password for a user who logged in with a temporary password.
 * Clears the mustChangePassword flag and refreshes the session.
 */
export async function setNewPassword(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData = {
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const result = setNewPasswordSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors };
    }

    const { newPassword } = result.data;

    try {
        const hashedPassword = await hashPassword(newPassword);

        await db
            .update(athletes)
            .set({
                passwordHash: hashedPassword,
                mustChangePassword: 0,
            })
            .where(eq(athletes.id, user.id));

        // Re-create session without the forced-change flag
        // so middleware stops blocking navigation
        await createSession(user.id, false);

    } catch (error) {
        console.error("Set new password error:", error);
        return { success: false, error: "An unexpected error occurred." };
    }

    redirect("/");
}
