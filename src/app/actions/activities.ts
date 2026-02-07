"use server";

import { db } from "@/lib/db";
import { activities, athletes, dailyMetrics } from "@/lib/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTrainingInsight } from "@/lib/ai/service";

/**
 * Manually triggers a refresh of the AI Training Insight.
 */
export async function refreshAiInsightAction() {
    const athleteId = "default_athlete";
    
    try {
        const latestMetric = await db.query.dailyMetrics.findFirst({
            where: (t, { eq }) => eq(t.athleteId, athleteId),
            orderBy: [desc(dailyMetrics.date)]
        });

        if (latestMetric) {
            const last45Days = new Date();
            last45Days.setDate(last45Days.getDate() - 45);
            const recentActs = await db.query.activities.findMany({
                where: (t, { and, eq, gte }) => and(eq(t.athleteId, athleteId), gte(t.startTime, last45Days.toISOString())),
                orderBy: [desc(activities.startTime)],
                limit: 10
            });

            const context = {
                ctl: latestMetric.ctl || 0,
                atl: latestMetric.atl || 0,
                tsb: latestMetric.tsb || 0,
                recentActivities: recentActs.map(a => ({
                    name: a.name,
                    type: a.type,
                    date: a.startTime,
                    distance: a.distance,
                    tss: a.tss
                }))
            };

            const insight = await generateTrainingInsight(context);
            
            await db.update(athletes)
                .set({
                    lastAiInsight: JSON.stringify(insight),
                    lastAiInsightDate: new Date().toISOString()
                })
                .where(eq(athletes.id, athleteId));
                
            revalidatePath("/");
        }
    } catch (error) {
        console.error("Refresh AI Insight error:", error);
    }
}

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
