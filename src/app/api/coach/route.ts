import { NextResponse } from "next/server";
import { askCoach } from "@/lib/ai/service";
import { db } from "@/lib/db";
import { dailyMetrics, activities } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        // 1. Gather Context (RAG-lite)
        const todayMetric = await db.query.dailyMetrics.findFirst({
            where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
            orderBy: [desc(dailyMetrics.date)]
        });

        const recentActs = await db.query.activities.findMany({
             where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
             orderBy: [desc(activities.startTime)],
             limit: 3
        });

        const context = {
            ctl: todayMetric?.ctl || 0,
            atl: todayMetric?.atl || 0,
            tsb: todayMetric?.tsb || 0,
            recentActivities: recentActs.map(a => ({
                name: a.name,
                type: a.type,
                date: a.startTime,
                distance: a.distance,
                tss: a.tss
            }))
        };

        // 2. Query Service
        const response = await askCoach(query, context);

        return NextResponse.json(response);
    } catch (e: unknown) {
        console.error("Error in coach API:", e);
        return NextResponse.json({ message: "Error processing request" }, { status: 500 });
    }
}
