import { db } from "./db";
import { activities, dailyMetrics } from "./schema";
import { calculateNextCTL, calculateNextATL, calculateTSB } from "./metrics";
import { eq, gte, asc, sql } from "drizzle-orm";

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
    const dailyData = new Map<string, { load: number, distance: number, duration: number, hrSum: number, hrCount: number, z: number[] }>();

    for (const act of relevantActivities) {
        const day = act.startTime.split('T')[0];
        const existing = dailyData.get(day) || { load: 0, distance: 0, duration: 0, hrSum: 0, hrCount: 0, z: [0, 0, 0, 0, 0, 0] };

        const load = (act.tss || 0) + (act.trimp || 0);
        existing.load += load;
        existing.distance += act.distance || 0;
        existing.duration += act.duration || 0;
        if (act.averageHr) {
            existing.hrSum += act.averageHr;
            existing.hrCount += 1;
        }

        // Parse samples for high-res zone distribution if available
        if (act.samples) {
            try {
                const samples = JSON.parse(act.samples);
                samples.forEach((s: any) => {
                    if (s.heartRate) {
                        const pct = s.heartRate / maxHr;
                        if (pct < 0.6) existing.z[1] += 1;
                        else if (pct < 0.7) existing.z[2] += 1;
                        else if (pct < 0.8) existing.z[3] += 1;
                        else if (pct < 0.9) existing.z[4] += 1;
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
        const data = dailyData.get(dayStr) || { load: 0, distance: 0, duration: 0, hrSum: 0, hrCount: 0, z: [0, 0, 0, 0, 0, 0] };

        // Calculate new metrics
        currentCtl = calculateNextCTL(currentCtl, data.load);
        currentAtl = calculateNextATL(currentAtl, data.load);
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
            }
        });

        cursor.setDate(cursor.getDate() + 1);
    }
}
