"use server";

import { db } from "@/lib/db";
import { goals, trainingPlans, dailyMetrics, activities } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { analyzeRaceContent, predictPerformance, createTrainingPlan } from "@/lib/ai/service";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

/**
 * Creates a new personal or race goal.
 */
export async function createGoalAction(formData: FormData) {
    const athlete = await getCurrentUser();
    if (!athlete) throw new Error("Unauthorized");

    const id = randomUUID();
    const type = formData.get("type") as string;
    const name = formData.get("name") as string;
    const targetDate = formData.get("targetDate") as string;
    const targetMetric = formData.get("targetMetric") as string;
    const targetValue = parseFloat(formData.get("targetValue") as string || "0");
    const raceUrl = formData.get("raceUrl") as string;
    const raceDetailsJson = formData.get("raceDetails") as string;

    // 1. Fetch Athlete Context for immediate prediction
    const latestMetric = await db.query.dailyMetrics.findFirst({
        where: eq(dailyMetrics.athleteId, athlete.id),
        orderBy: [desc(dailyMetrics.date)]
    });

    const recentActivities = await db.query.activities.findMany({
        where: eq(activities.athleteId, athlete.id),
        orderBy: [desc(activities.startTime)],
        limit: 20
    });

    const context = {
        ctl: latestMetric?.ctl || 0,
        atl: latestMetric?.atl || 0,
        tsb: latestMetric?.tsb || 0,
        recentActivities: recentActivities.map(a => ({
            name: a.name,
            type: a.type,
            date: a.startTime,
            distance: a.distance,
            tss: a.tss
        }))
    };

    // 2. Generate Predictions immediately
    const raceDetails = raceDetailsJson ? JSON.parse(raceDetailsJson) : null;
    let predictionsJson = null;
    try {
        const predictions = await predictPerformance(context, raceDetails);
        predictionsJson = JSON.stringify(predictions);
    } catch (err) {
        logger.error("Immediate Prediction Error", err);
    }

    await db.insert(goals).values({
        id,
        athleteId: athlete.id,
        type,
        name,
        targetDate,
        targetMetric,
        targetValue,
        raceUrl,
        raceDetails: raceDetailsJson,
        predictions: predictionsJson,
        status: 'Active',
    });

    revalidatePath("/dashboard");
    revalidatePath("/feed");
    return { success: true, goalId: id };
}

/**
 * Scrapes a race URL and returns structured data using AI.
 */
export async function analyzeRaceAction(url: string) {
    try {
        const raceDetails = await analyzeRaceContent(url);
        return { success: true, data: raceDetails };
    } catch (error) {
        logger.error("Analyze Race Action Error", error);
        return { success: false, error: "Failed to reach the race website. Please check the URL." };
    }
}

/**
 * Generates predictions and a training plan for an existing goal.
 */
export async function generatePlanAction(goalId: string) {
    const athlete = await getCurrentUser();
    if (!athlete) throw new Error("Unauthorized");

    try {
        // 1. Fetch Goal
        const goal = await db.query.goals.findFirst({
            where: eq(goals.id, goalId)
        });
        if (!goal) throw new Error("Goal not found");

        // 2. Fetch Athlete Context
        const latestMetric = await db.query.dailyMetrics.findFirst({
            where: eq(dailyMetrics.athleteId, athlete.id),
            orderBy: [desc(dailyMetrics.date)]
        });

        const recentActivities = await db.query.activities.findMany({
            where: eq(activities.athleteId, athlete.id),
            orderBy: [desc(activities.startTime)],
            limit: 20
        });

        // 2b. Fetch All Active Goals (to account for intermediate races)
        const allGoals = await db.query.goals.findMany({
            where: eq(goals.athleteId, athlete.id),
            orderBy: [desc(goals.targetDate)]
        });

        const context = {
            ctl: latestMetric?.ctl || 0,
            atl: latestMetric?.atl || 0,
            tsb: latestMetric?.tsb || 0,
            recentActivities: recentActivities.map(a => ({
                name: a.name,
                type: a.type,
                date: a.startTime,
                distance: a.distance,
                tss: a.tss
            }))
        };

        // 3. Generate Predictions
        const raceDetails = goal.raceDetails ? JSON.parse(goal.raceDetails) : null;
        let predictions = null;
        if (!goal.predictions) {
            predictions = await predictPerformance(context, raceDetails);
            // Update Goal with Predictions if missing
            await db.update(goals)
                .set({ predictions: JSON.stringify(predictions) })
                .where(eq(goals.id, goalId));
        } else {
            predictions = JSON.parse(goal.predictions);
        }

        // 5. Generate Training Plan
        const plan = await createTrainingPlan(context, goal, allGoals);
        if (plan) {
            const planId = randomUUID();
            // Deactivate old plans for this goal if any
            await db.update(trainingPlans)
                .set({ isActive: false })
                .where(eq(trainingPlans.goalId, goalId));

            await db.insert(trainingPlans).values({
                id: planId,
                goalId: goalId,
                athleteId: athlete.id,
                weeksJson: JSON.stringify(plan),
                isActive: true
            });
        }

        revalidatePath("/dashboard");
        return { success: true, predictions };
    } catch (error) {
        logger.error("Generate Plan Action Error", error);
        return { success: false, error: "Failed to generate training plan." };
    }
}

/**
 * Updates an existing goal.
 */
export async function updateGoalAction(goalId: string, data: { name: string; targetMetric: string; targetValue: number }) {
    try {
        await db.update(goals)
            .set({
                name: data.name,
                targetMetric: data.targetMetric,
                targetValue: data.targetValue,
            })
            .where(eq(goals.id, goalId));

        revalidatePath("/training");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        logger.error("Update Goal Action Error", error);
        return { success: false, error: "Failed to update goal." };
    }
}

/**
 * Deletes a goal and its associated training plans.
 */
export async function deleteGoalAction(goalId: string) {
    try {
        // 1. Delete associated training plans
        await db.delete(trainingPlans).where(eq(trainingPlans.goalId, goalId));

        // 2. Delete the goal
        await db.delete(goals).where(eq(goals.id, goalId));

        revalidatePath("/training");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        logger.error("Delete Goal Action Error", error);
        return { success: false, error: "Failed to delete goal." };
    }
}
