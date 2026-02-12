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

        await createSession(user.id);

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Internal server error" };
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
