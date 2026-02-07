"use server";

import { db } from "@/lib/db";
import { activities, athletes } from "@/lib/schema";
import { parseFitFile } from "@/lib/parser";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { recalculateMetricsChain } from "@/lib/analytics";

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
            const intensityFactor = session.normalized_power / ftp;
            tss = (session.total_elapsed_time * session.normalized_power * intensityFactor) / (ftp * 36);
        }

        if (session.avg_heart_rate) {
            const durationMin = session.total_elapsed_time / 60;
            const hrReserve = maxHr - restHr;
            const avgHrFraction = (session.avg_heart_rate - restHr) / hrReserve;
            const b = 1.92;
            trimp = durationMin * avgHrFraction * 0.64 * Math.exp(b * avgHrFraction);
        }

        // 4. Extract Samples for Charts/Map
        // We'll filter records to reduce data size for the MVP (~1 pt per 5-10s if possible, or just take first 1000)
        const allRecords = fitData.activity?.sessions?.[0]?.laps?.[0]?.records || fitData.records || [];
        const samples = allRecords.map((r: any) => ({
            timestamp: r.timestamp,
            lat: r.position_lat,
            lng: r.position_long,
            distance: r.distance,
            altitude: r.altitude,
            speed: r.speed,
            heartRate: r.heart_rate,
            power: r.power
        })).filter((_: any, i: number) => i % 5 === 0); // Downsample for performance

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
            averagePower: session.avg_power,
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
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
}

