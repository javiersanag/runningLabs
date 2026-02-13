import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { goals, trainingPlans, activities, dailyMetrics } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { GoalManager } from "@/components/training/GoalManager";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";
import { PredictionCard } from "@/components/training/PredictionCard";
import { TrainingPageClient } from "./TrainingPageClient";

export default async function TrainingPage() {
    const athlete = await getCurrentUser();
    if (!athlete) return null;

    const currentGoals = await db.query.goals.findMany({
        where: eq(goals.athleteId, athlete.id),
        orderBy: [desc(goals.createdAt)]
    });

    const activePlan = await db.query.trainingPlans.findFirst({
        where: and(
            eq(trainingPlans.athleteId, athlete.id),
            eq(trainingPlans.isActive, true)
        ),
        orderBy: [desc(trainingPlans.createdAt)]
    });

    // Use predictions from the most recent active goal
    const latestActiveGoal = currentGoals.find(g => g.status === 'Active');

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <TrainingPageClient
                initialGoals={currentGoals}
                activePlan={activePlan}
                latestActiveGoal={latestActiveGoal || currentGoals[0]}
            />
        </div>
    );
}
