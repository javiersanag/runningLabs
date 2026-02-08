import { db } from "@/lib/db";
import { activities, dailyMetrics, athletes } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { LeftPanel } from "@/components/feed/LeftPanel";
import { ActivityCard } from "@/components/feed/ActivityCard";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
    // 1. Fetch Athlete
    const athlete = await db.query.athletes.findFirst({
        where: (t, { eq }) => eq(t.id, "default_athlete")
    });

    // 2. Fetch Activities
    const activityList = await db.query.activities.findMany({
        where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
        orderBy: [desc(activities.startTime)],
        limit: 20
    });

    // 3. Fetch Latest Metrics
    const latestMetric = await db.query.dailyMetrics.findFirst({
        where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
        orderBy: [desc(dailyMetrics.date)]
    });

    // 4. Calculate Stats (Quick Check)
    // In a real app, this might be a separate fast query or pre-calculated
    const stats = {
        totalActivities: await db.$count(activities, eq(activities.athleteId, "default_athlete")),
        thisMonth: activityList.filter(a => {
            const date = new Date(a.startTime);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative items-start">
            {/* Left Panel - Sticky */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-24">
                <LeftPanel athlete={athlete} stats={stats} dailyMetric={latestMetric} />
            </div>

            {/* Main Feed */}
            <div className="md:col-span-8 lg:col-span-6">
                <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                    Running Feed
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full font-bold">
                        {activityList.length} New
                    </span>
                </h2>

                {activityList.length > 0 ? (
                    <div className="space-y-6">
                        {activityList.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
                        <p className="text-neutral-400 font-bold mb-2">No activities yet</p>
                        <p className="text-sm text-neutral-500">Go for a run and upload your first session!</p>
                    </div>
                )}

                <div className="mt-8 text-center pb-12">
                    <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">You're all caught up</p>
                </div>
            </div>

            {/* Right Panel - (Hidden on mobile/tablet, placeholder for now) */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
                {/* Future: Suggested Connections, Challenges, etc. */}
            </div>
        </div>
    );
}
