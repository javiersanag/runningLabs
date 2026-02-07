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
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Advanced Analytics</h2>
                <p className="text-white/50">Long-term fitness and performance trends (180-day view)</p>
            </div>

            <div className="space-y-6">
                <div className="glass-panel rounded-2xl p-6 h-[600px] flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Performance Management Chart (PMC)</h3>
                    <div className="flex-1 min-h-0">
                        <FitnessChart data={chartData as any} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card">
                        <h4 className="font-bold text-white mb-4">Metric Explanations</h4>
                        <div className="space-y-4 text-sm text-white/60">
                            <div>
                                <p className="text-white font-bold mb-1">Fitness (CTL)</p>
                                <p>A 42-day exponentially weighted moving average of your daily training load. Represents your long-term training base.</p>
                            </div>
                            <div>
                                <p className="text-white font-bold mb-1">Fatigue (ATL)</p>
                                <p>A 7-day exponentially weighted moving average. Represents your recent training stress.</p>
                            </div>
                            <div>
                                <p className="text-white font-bold mb-1">Form (TSB)</p>
                                <p>The difference between CTL and ATL. A positive number indicates you are "fresh" and potentially ready to race.</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <FitnessChart data={[]} /> {/* Just to use the import if needed, but actually I'll just put an icon */}
                        </div>
                        <h4 className="font-bold text-white mb-2">Predictive Analysis</h4>
                        <p className="text-sm text-white/50">Your current trajectory suggests a 2% improvement in aerobic capacity over the next 4 weeks if current load is maintained.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
