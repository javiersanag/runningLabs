import { FitnessChart } from "@/components/charts/FitnessChart";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const data = await db.query.dailyMetrics.findMany({
        where: (t, { eq }) => eq(t.athleteId, user.id),
        orderBy: [desc(dailyMetrics.date)],
        limit: 180
    });

    const history = JSON.parse(JSON.stringify(data));

    const chartData = history.reverse();

    return (
        <>
            <div className="max-w-6xl mx-auto">
                <PageHeader
                    title="Advanced Analytics"
                    subtitle="Long-term fitness and performance trends (180-day view)"
                    className="mb-10"
                />

                {/* Main Chart */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Performance Management Chart (PMC)</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Fitness</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Fatigue</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Freshness</span></div>
                        </div>
                    </div>
                    <div className="h-[350px] md:h-[550px] bg-white dark:bg-neutral-900 rounded-3xl p-4 md:p-8 border border-neutral-100 dark:border-neutral-800 shadow-xl shadow-neutral-100/50 dark:shadow-none">
                        <FitnessChart data={chartData as any} />
                    </div>
                </div>

                {/* Metric Explanations - Inline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mt-12 pb-12">
                    <div className="p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                        <p className="text-foreground font-black uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Fitness (CTL)
                        </p>
                        <p className="text-neutral-500 font-medium leading-relaxed">42-day exponentially weighted average of daily training load. Represents your long-term cardiovascular base and muscular endurance.</p>
                    </div>
                    <div className="p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                        <p className="text-foreground font-black uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            Fatigue (ATL)
                        </p>
                        <p className="text-neutral-500 font-medium leading-relaxed">7-day exponentially weighted average. Represents recent training stress and immediate physiological demand.</p>
                    </div>
                    <div className="p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                        <p className="text-foreground font-black uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            Form (TSB)
                        </p>
                        <p className="text-neutral-500 font-medium leading-relaxed">CTL minus ATL. Positive values indicate freshness and race readiness, while negative values suggest you are building fitness.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
