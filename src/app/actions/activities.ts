"use server";

import { db } from "@/lib/db";
import { activities, athletes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateActivityOneLiner, generateTrainingInsight } from "@/lib/ai/service";

// --- AI Actions ---

export async function refreshAiInsightAction() {
    try {
        // 1. Fetch Context
        const athlete = await db.query.athletes.findFirst({
            where: (t, { eq }) => eq(t.id, "default_athlete")
        });

        // Mock context for now or fetch real data
        const context = {
            ctl: 42,
            atl: 50,
            tsb: -8,
            recentActivities: []
        };

        const insight = await generateTrainingInsight(context);

        await db.update(athletes)
            .set({
                lastAiInsight: JSON.stringify(insight),
                lastAiInsightDate: new Date().toISOString()
            })
            .where(eq(athletes.id, "default_athlete"));

        revalidatePath("/");

    } catch (e) {
        console.error("Failed to refresh insight", e);
    }
}

export async function generateActivityInsight(activityId: string) {
    try {
        // 1. Fetch Activity Data
        const activity = await db.query.activities.findFirst({
            where: (t, { eq }) => eq(t.id, activityId)
        });

        if (!activity) {
            return { success: false, error: "Activity not found" };
        }

        // 2. Prepare Context for AI
        const formatDuration = (s: number) => {
            const mins = Math.floor(s / 60);
            return `${mins}m`;
        };

        const context = `
            Activity Type: ${activity.type}
            Distance: ${(activity.distance || 0) / 1000} km
            Duration: ${formatDuration(activity.duration || 0)}
            Avg HR: ${activity.averageHr || 'N/A'} bpm
            Elevation Gain: ${activity.elevationGain || 0} m
            Power: ${activity.averagePower || 'N/A'} W
            Date: ${new Date(activity.startTime).toDateString()}
            Title: ${activity.name}
        `;

        // 3. Call AI Service
        const insight = await generateActivityOneLiner(context);

        // 4. Update Database
        await db.update(activities)
            .set({ aiInsight: insight })
            .where(eq(activities.id, activityId));

        // 5. Revalidate Feed
        revalidatePath("/feed");
        revalidatePath(`/activities/${activityId}`);

        return { success: true, insight };

    } catch (error) {
        console.error("Error generating insight:", error);
        return { success: false, error: "Failed to generate insight" };
    }
}

// --- CRUD Actions ---

export async function updateActivity(data: any) {
    try {
        const { id, ...updates } = data;
        await db.update(activities)
            .set(updates)
            .where(eq(activities.id, id));

        revalidatePath("/activities");
        revalidatePath(`/activities/${id}`);
        revalidatePath("/feed");
        return { success: true };
    } catch (error) {
        console.error("Failed to update activity", error);
        return { success: false, error: "Failed to update" };
    }
}

export async function deleteActivity(id: string) {
    try {
        await db.delete(activities).where(eq(activities.id, id));
        revalidatePath("/activities");
        revalidatePath("/feed");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete activity", error);
        return { success: false, error: "Failed to delete" };
    }
}
