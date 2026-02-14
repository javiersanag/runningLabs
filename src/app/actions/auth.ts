"use server";

import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { z } from "zod";

// Input validation schemas
const registerSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().max(50).optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function registerUser(formData: FormData) {
    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors };
    }

    const { firstName, lastName, email, password } = result.data;

    try {
        // Check uniqueness
        const existing = await db.query.athletes.findFirst({
            where: (t, { eq }) => eq(t.email, email)
        });

        if (existing) {
            return { success: false, error: "Email already registered" };
        }

        const hashedPassword = await hashPassword(password);
        const id = randomUUID();

        await db.insert(athletes).values({
            id,
            firstName,
            lastName: lastName || null,
            email,
            passwordHash: hashedPassword,
            age: 30, // Default for now
            ftp: 250,
            maxHr: 190,
            weight: 70
        });

        await createSession(id);

    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Internal server error" };
    }

    redirect("/");
}

export async function loginUser(formData: FormData) {
    const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    // Validate schema
    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, error: "Invalid email or password" };
    }

    const { email, password } = result.data;

    let mustChange = false;

    try {
        const user = await db.query.athletes.findFirst({
            where: (t, { eq }) => eq(t.email, email)
        });

        if (!user || !user.passwordHash) {
            // Generic error
            return { success: false, error: "Invalid email or password" };
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return { success: false, error: "Invalid email or password" };
        }

        mustChange = user.mustChangePassword === 1;
        await createSession(user.id, mustChange);

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Internal server error" };
    }

    // Redirect forced-change users to the password reset page
    if (mustChange) {
        redirect("/set-new-password");
    }

    redirect("/");
}

export async function logoutUser() {
    await destroySession();
    redirect("/login");
}

import { dailyMetrics, activities, gear } from "@/lib/schema";
import { getCurrentUser } from "@/lib/session";

export async function deleteAccount() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    try {
        // Cascade delete
        await db.delete(dailyMetrics).where(eq(dailyMetrics.athleteId, user.id));
        await db.delete(activities).where(eq(activities.athleteId, user.id));
        await db.delete(gear).where(eq(gear.athleteId, user.id));
        await db.delete(athletes).where(eq(athletes.id, user.id));

        await destroySession();
    } catch (error) {
        console.error("Delete account error:", error);
        throw new Error("Failed to delete account");
    }

    redirect("/register");
}

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[0-9]/, "New password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function changePassword(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const rawData = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    };

    const result = changePasswordSchema.safeParse(rawData);
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors };
    }

    const { currentPassword, newPassword } = result.data;

    try {
        // 1. Verify current password
        const dbUser = await db.query.athletes.findFirst({
            where: (t, { eq }) => eq(t.id, user.id)
        });

        if (!dbUser || !dbUser.passwordHash) {
            return { success: false, error: "User not found" };
        }

        const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
        if (!isCurrentValid) {
            return { success: false, errors: { currentPassword: ["Incorrect current password"] } };
        }

        // 2. Hash and update
        const hashedNewPassword = await hashPassword(newPassword);
        await db.update(athletes)
            .set({ passwordHash: hashedNewPassword })
            .where(eq(athletes.id, user.id));

        return { success: true };
    } catch (error) {
        console.error("Password change error:", error);
        return { success: false, error: "Internal server error" };
    }
}
