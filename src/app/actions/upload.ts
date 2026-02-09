"use server";

import { logger } from "@/lib/logger";

import { db } from "@/lib/db";
import { activities, athletes } from "@/lib/schema";
import { parseFitFile } from "@/lib/parser";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { recalculateMetricsChain } from "@/lib/analytics";
import { calculateTSS, calculateTRIMP } from "@/lib/metrics";

export async function uploadActivity(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    // Buffer.from is needed for fit-file-parser
    const buffer = Buffer.from(arrayBuffer);

    try {
        // 1. Parse .FIT
        if (!file.name.toLowerCase().endsWith(".fit")) {
            throw new Error("Only .fit files supported in this MVP");
        }

        const fitData = await parseFitFile(buffer);

        // 2. Ensure Athlete exists (Auto-init for MVP)
        let athlete = await db.query.athletes.findFirst({
            where: (table, { eq }) => eq(table.id, "default_athlete")
        });

        if (!athlete) {
            await db.insert(athletes).values({
                id: "default_athlete",
                name: "Performance Athlete",
                ftp: 250,
                maxHr: 190,
                weight: 70
            });
            athlete = await db.query.athletes.findFirst({
                where: (table, { eq }) => eq(table.id, "default_athlete")
            });
        }

        const ftp = athlete?.ftp || 250;
        const maxHr = athlete?.maxHr || 190;
        const restHr = 60;

        // 3. Extract Metrics
        const session = fitData.activity?.sessions?.[0];
        if (!session) throw new Error("No session data found in FIT file");

        const id = randomUUID();

        // Calculate Training Load
        let tss = session.training_stress_score;
        let trimp = 0;

        if (!tss && session.normalized_power && session.total_elapsed_time) {
            tss = calculateTSS(session.total_elapsed_time, session.normalized_power, ftp);
        }

        if (session.avg_heart_rate) {
            trimp = calculateTRIMP(session.total_elapsed_time / 60, session.avg_heart_rate, maxHr, restHr);
        }

        // 4. Extract Samples for Charts/Map
        // Aggregate records from all sessions and all laps to ensure full coverage
        let allRecords: any[] = [];
        if (fitData.activity?.sessions) {
            fitData.activity.sessions.forEach((sess: any) => {
                if (sess.laps) {
                    sess.laps.forEach((lap: any) => {
                        if (lap.records) {
                            allRecords = allRecords.concat(lap.records);
                        }
                    });
                }
            });
        }

        // Fallback to top-level records if sessions/laps structure is different
        if (allRecords.length === 0) {
            allRecords = fitData.records || [];
        }

        let lastDistance = 0;
        let cumulativeDistanceOffset = 0;

        const samples = allRecords.map((r: any) => {
            let d = r.distance || 0;
            // Handle cases where distance might reset per lap
            if (d < lastDistance && lastDistance - d > 10) {
                cumulativeDistanceOffset += lastDistance;
            }
            lastDistance = d;
            const currentDistance = d + cumulativeDistanceOffset;

            return {
                timestamp: r.timestamp,
                lat: r.position_lat,
                lng: r.position_long,
                distance: currentDistance,
                altitude: r.altitude,
                speed: r.speed,
                heartRate: r.heart_rate,
                power: r.power
            };
        }).filter((_: any, i: number) => i % 5 === 0);

        // 5. Save to DB
        const startTimeStr = new Date(session.start_time).toISOString();

        await db.insert(activities).values({
            id: id,
            athleteId: "default_athlete",
            name: `${session.sport || 'Activity'} ${new Date(session.start_time).toLocaleDateString()}`,
            type: session.sport || "Run",
            startTime: startTimeStr,
            distance: session.total_distance,
            duration: session.total_elapsed_time,
            elevationGain: session.total_ascent,
            averageHr: session.avg_heart_rate,
            maxHr: session.max_heart_rate,
            averagePower: session.avg_power || session.average_power,
            normalizedPower: session.normalized_power,
            tss: tss || 0,
            trimp: trimp || 0,
            samples: JSON.stringify(samples),
            sourceFile: file.name
        });

        // 6. Trigger Analytics Engine
        await recalculateMetricsChain(startTimeStr.split('T')[0], "default_athlete");

        revalidatePath("/");
        revalidatePath("/activities");

        return { success: true, id };
    } catch (error: any) {
        logger.error("Upload error", error);
        return { success: false, error: error.message };
    }
}

