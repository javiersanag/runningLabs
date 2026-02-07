import { FitnessChart } from "@/components/charts/FitnessChart";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const history = await db.query.dailyMetrics.findMany({
        where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
        orderBy: [desc(dailyMetrics.date)],
        limit: 180
    });

    const chartData = history.reverse();

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Advanced Analytics</h2>
                <p className="text-white/40 text-sm">Long-term fitness and performance trends (180-day view)</p>
            </div>

            {/* Main Chart */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white/60 mb-3">Performance Management Chart (PMC)</h3>
                <div className="h-[500px] bg-white/[0.02] rounded-xl p-4">
                    <FitnessChart data={chartData as any} />
                </div>
            </div>

            {/* Metric Explanations - Inline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="py-4 border-t border-white/5">
                    <p className="text-white font-bold mb-1">Fitness (CTL)</p>
                    <p className="text-white/50">42-day exponentially weighted average of daily training load. Represents your long-term base.</p>
                </div>
                <div className="py-4 border-t border-white/5">
                    <p className="text-white font-bold mb-1">Fatigue (ATL)</p>
                    <p className="text-white/50">7-day exponentially weighted average. Represents recent training stress.</p>
                </div>
                <div className="py-4 border-t border-white/5">
                    <p className="text-white font-bold mb-1">Form (TSB)</p>
                    <p className="text-white/50">CTL minus ATL. Positive values indicate freshness and race readiness.</p>
                </div>
            </div>
        </>
    );
}
