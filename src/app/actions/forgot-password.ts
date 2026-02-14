"use server";

import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";
import { sendTempPasswordEmail } from "@/lib/email";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

/**
 * Generates a cryptographically random temporary password.
 * Format: 3 groups of 4 alphanumeric chars separated by dashes (e.g. "aB3x-kM9p-Tz2w")
 */
function generateTempPassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const bytes = randomBytes(12);
    let password = "";
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) password += "-";
        password += chars[bytes[i] % chars.length];
    }
    return password;
}

/**
 * Handles a forgot-password request.
 * Looks up the user, generates a temp password, hashes it,
 * stores it in the DB, sets the mustChangePassword flag, and sends the email.
 *
 * Always returns success to avoid email enumeration attacks.
 */
export async function requestPasswordReset(formData: FormData) {
    const rawData = { email: formData.get("email") };
    const result = forgotPasswordSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, error: "Please enter a valid email address." };
    }

    const { email } = result.data;

    try {
        const user = await db.query.athletes.findFirst({
            where: (t, { eq }) => eq(t.email, email),
        });

        if (!user) {
            // Don't reveal whether the email exists — return success anyway
            return { success: true };
        }

        // Generate and hash the temporary password
        const tempPassword = generateTempPassword();
        const hashedTemp = await hashPassword(tempPassword);

        // Update the user's password and set the forced-change flag
        await db
            .update(athletes)
            .set({
                passwordHash: hashedTemp,
                mustChangePassword: 1,
            })
            .where(eq(athletes.id, user.id));

        // Send the email (or log to console in dev mode)
        const emailResult = await sendTempPasswordEmail(email, tempPassword);

        if (!emailResult.success) {
            return { success: false, error: "Failed to send email. Please try again later." };
        }

        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}
