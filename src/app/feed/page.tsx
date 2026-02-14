import { db } from "@/lib/db";
import { activities, dailyMetrics, athletes, goals } from "@/lib/schema";
import { desc, eq, and } from "drizzle-orm";
import { LeftPanel } from "@/components/feed/LeftPanel";
import { ActivityCard } from "@/components/feed/ActivityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Mountain, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
    // 1. Fetch Athlete
    const athlete = await getCurrentUser();
    if (!athlete) return null;

    // 2. Fetch Activities
    const data = await db.query.activities.findMany({
        where: (t, { eq }) => eq(t.athleteId, athlete.id),
        orderBy: [desc(activities.startTime)],
        limit: 20
    });

    const activityList: any[] = JSON.parse(JSON.stringify(data));

    // 3. Fetch Latest Metrics
    const latestMetric = await db.query.dailyMetrics.findFirst({
        where: (t, { eq }) => eq(t.athleteId, athlete.id),
        orderBy: [desc(dailyMetrics.date)]
    });

    // 4. Calculate Stats (Quick Check)
    const stats = {
        totalActivities: await db.$count(activities, eq(activities.athleteId, athlete.id)),
        thisMonth: activityList.filter(a => {
            const date = new Date(a.startTime);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    };

    // 5. Calculate Streak (Last 7 Days)
    const now = new Date();
    const streakData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        // Important: Use i-6 so today (i=6) has offset 0, and 6 days ago (i=0) has offset -6
        d.setDate(d.getDate() - (6 - i));
        const dStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // 'M', 'T', 'W', etc.
        return {
            active: activityList.some(a => a.startTime.startsWith(dStr)),
            label: dayLabel
        };
    });

    const streakDays = streakData.map(d => d.active);
    const streakLabels = streakData.map(d => d.label);

    const latestActivity = activityList[0];

    // 6. Fetch Active Goal
    const activeGoal = await db.query.goals.findFirst({
        where: (t, { and, eq }) => and(eq(t.athleteId, athlete.id), eq(t.status, 'Active')),
        orderBy: [desc(goals.createdAt)]
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
            {/* Left Panel - Sticky behavior handled internally */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
                <LeftPanel
                    athlete={athlete}
                    stats={stats}
                    dailyMetric={latestMetric}
                    streakDays={streakDays}
                    streakLabels={streakLabels}
                    latestActivity={latestActivity}
                    activeGoal={activeGoal}
                />
            </div>

            {/* Mobile Summary Strip — visible only on small screens */}
            <div className="md:hidden col-span-1 -mt-2 mb-2">
                <div className="grid grid-cols-3 gap-2 pb-2">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-3 shadow-sm">
                        <p className="text-lg font-black text-foreground">{stats.totalActivities}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Activities</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-3 shadow-sm">
                        <p className="text-lg font-black text-primary">{Math.round(latestMetric?.ctl || 0)}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Fitness</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-3 shadow-sm">
                        <p className="text-lg font-black text-purple-500">{Math.round(latestMetric?.atl || 0)}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Fatigue</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-3 shadow-sm">
                        <p className={`text-lg font-black ${(latestMetric?.tsb || 0) >= 0 ? 'text-success' : 'text-warning'}`}>{Math.round(latestMetric?.tsb || 0)}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Form</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-3 shadow-sm">
                        <p className="text-lg font-black text-foreground">{stats.thisMonth}</p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Last 30d</p>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="md:col-span-8 lg:col-span-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-l font-black text-foreground flex items-center gap-2">
                        Activity Feed
                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full font-bold">
                            {activityList.length} Activities
                        </span>
                    </h2>
                    <Link href="/upload">
                        <Button variant="ghost" className="text-primary hover:bg-primary/5 h-8 px-3 text-xs gap-2">
                            <Upload size={14} />
                            Upload
                        </Button>
                    </Link>
                </div>

                {activityList.length > 0 ? (
                    <div className="space-y-6">
                        {activityList.map((activity: any) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Mountain size={32} className="text-neutral-400" />}
                        title="No Activities Found"
                        description="It looks like you haven't recorded any activities yet. Time to lace up!"
                        action={{ label: "Upload Activity", href: "/upload" }}
                        className="mt-8"
                    />)}

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
