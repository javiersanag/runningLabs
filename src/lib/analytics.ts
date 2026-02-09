import { db } from "./db";
import { logger } from "@/lib/logger";
import { activities, dailyMetrics, athletes } from "./schema";
import { calculateNextCTL, calculateNextATL } from "./metrics";
import { eq, gte, asc, desc } from "drizzle-orm";
import { generateTrainingInsight } from "./ai/service";

export async function recalculateMetricsChain(startDateStr: string, athleteId: string) {
    // 1. Get the baseline (day before start date)
    const startDate = new Date(startDateStr);
    const yesterday = new Date(startDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const prevMetric = await db.query.dailyMetrics.findFirst({
        where: (table, { and, eq }) => and(eq(table.date, yesterdayStr), eq(table.athleteId, athleteId))
    });

    let currentCtl = prevMetric?.ctl || 0;
    let currentAtl = prevMetric?.atl || 0;

    // 2. Fetch Athlete Profile for Zone calculation
    const athlete = await db.query.athletes.findFirst({
        where: (t, { eq }) => eq(t.id, athleteId)
    });
    const maxHr = athlete?.maxHr || 190;

    // 3. Fetch all activities from startDate onwards
    const relevantActivities = await db.query.activities.findMany({
        where: (table, { and, eq, gte }) => and(
            eq(table.athleteId, athleteId),
            gte(table.startTime, startDateStr)
        ),
        orderBy: asc(activities.startTime)
    });

    // Group by date
    const dailyData = new Map<string, { load: number, distance: number, duration: number, hrSum: number, hrCount: number, maxHr: number, z: number[] }>();

    for (const act of relevantActivities) {
        const day = act.startTime.split('T')[0];
        const existing = dailyData.get(day) || { load: 0, distance: 0, duration: 0, hrSum: 0, hrCount: 0, maxHr: 0, z: [0, 0, 0, 0, 0, 0] };

        // Prioritize TSS (Power) over TRIMP (HR)
        const load = act.tss ? act.tss : (act.trimp || 0);
        existing.load += load;
        existing.distance += act.distance || 0;
        existing.duration += act.duration || 0;
        if (act.averageHr) {
            existing.hrSum += act.averageHr;
            existing.hrCount += 1;
        }
        if (act.maxHr && act.maxHr > existing.maxHr) {
            existing.maxHr = act.maxHr;
        }

        // Parse samples for high-res zone distribution if available
        if (act.samples) {
            try {
                const samples = JSON.parse(act.samples);
                samples.forEach((s: any) => {
                    if (s.heartRate) {
                        const hr = s.heartRate;
                        if (hr < 117) existing.z[1] += 1;
                        else if (hr < 135) existing.z[2] += 1;
                        else if (hr < 153) existing.z[3] += 1;
                        else if (hr < 165) existing.z[4] += 1;
                        else existing.z[5] += 1;
                    }
                });
            } catch (e) { }
        }

        dailyData.set(day, existing);
    }

    const lastDate = new Date();

    // Iterate
    const cursor = new Date(startDate);
    while (cursor <= lastDate) {
        const dayStr = cursor.toISOString().split('T')[0];
        const data = dailyData.get(dayStr) || { load: 0, distance: 0, duration: 0, hrSum: 0, hrCount: 0, maxHr: 0, z: [0, 0, 0, 0, 0, 0] };

        // Load is either TSS (Power) or TRIMP (HR) fallback. 
        // We shouldn't add them as it doubles the daily stress.
        const dailyLoad = data.load;

        // Calculate new metrics
        currentCtl = calculateNextCTL(currentCtl, dailyLoad);
        currentAtl = calculateNextATL(currentAtl, dailyLoad);
        const tsb = currentCtl - currentAtl;
        const acwr = currentCtl > 0 ? currentAtl / currentCtl : 0;

        // Upsert
        await db.insert(dailyMetrics).values({
            id: `${athleteId}_${dayStr}`,
            athleteId,
            date: dayStr,
            ctl: currentCtl,
            atl: currentAtl,
            tsb: tsb,
            acwr: acwr,
            z1Time: data.z[1],
            z2Time: data.z[2],
            z3Time: data.z[3],
            z4Time: data.z[4],
            z5Time: data.z[5],
            totalDistance: data.distance,
            totalDuration: data.duration,
            averagePace: data.duration > 0 && data.distance > 0 ? (data.duration / (data.distance / 1000)) : 0,
            averageHr: data.hrCount > 0 ? Math.round(data.hrSum / data.hrCount) : null,
            maxHr: data.maxHr > 0 ? data.maxHr : null,
        }).onConflictDoUpdate({
            target: dailyMetrics.id,
            set: {
                ctl: currentCtl,
                atl: currentAtl,
                tsb: tsb,
                acwr: acwr,
                z1Time: data.z[1],
                z2Time: data.z[2],
                z3Time: data.z[3],
                z4Time: data.z[4],
                z5Time: data.z[5],
                totalDistance: data.distance,
                totalDuration: data.duration,
                averagePace: data.duration > 0 && data.distance > 0 ? (data.duration / (data.distance / 1000)) : 0,
                averageHr: data.hrCount > 0 ? Math.round(data.hrSum / data.hrCount) : null,
                maxHr: data.maxHr > 0 ? data.maxHr : null,
            }
        });

        cursor.setDate(cursor.getDate() + 1);
    }

    // AI Insight Generation
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
        }
    } catch (aiError) {
        logger.error("Failed to generate AI insight", aiError);
    }
}
