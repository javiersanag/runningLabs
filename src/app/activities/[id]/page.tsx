import { db } from "@/lib/db";
import { activities, gear } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Clock, MapPin, Zap, TrendingUp, Footprints } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ActivityChart } from "@/components/charts/ActivityChart";
import ActivityMap from "@/components/charts/ActivityMap";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const activity = await db.query.activities.findFirst({
        where: (t, { eq }) => eq(t.id, id)
    });

    if (!activity) notFound();

    const allGear = await db.query.gear.findMany({
        where: (t, { eq }) => eq(t.athleteId, "default_athlete")
    });

    const samples = activity.samples ? JSON.parse(activity.samples) : [];

    const formatDistance = (m: number | null) => m ? (m / 1000).toFixed(2) + " km" : "-";
    const formatDuration = (s: number | null) => {
        if (!s) return "-";
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;
    };

    const formatPace = (speedMs: number | null) => {
        if (!speedMs || speedMs === 0) return "-";
        const minPerKm = 1000 / (speedMs * 60);
        const mins = Math.floor(minPerKm);
        const secs = Math.floor((minPerKm - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')} /km`;
    };

    async function updateGear(formData: FormData) {
        "use server";
        const gearId = formData.get("gearId") as string;
        await db.update(activities).set({ gearId }).where(eq(activities.id, id));
        revalidatePath(`/activities/${id}`);
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/activities" className="text-xs text-white/40 hover:text-primary transition">Activities</Link>
                        <span className="text-white/20">/</span>
                        <span className="text-xs text-white/60">{activity.name}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{activity.name}</h2>
                    <p className="text-white/50">{new Date(activity.startTime).toLocaleString()}</p>
                </div>

                <div className="glass-panel p-2 rounded-xl flex items-center gap-4">
                    <form action={updateGear} className="flex items-center gap-3 px-3">
                        <Footprints size={16} className="text-primary" />
                        <select
                            name="gearId"
                            defaultValue={activity.gearId || ""}
                            className="bg-transparent text-sm text-white/80 outline-none focus:text-white"
                        >
                            <option value="" className="bg-background">No Gear Assigned</option>
                            {allGear.map(g => (
                                <option key={g.id} value={g.id} className="bg-background">{g.name} ({g.brand})</option>
                            ))}
                        </select>
                        <button type="submit" className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 hover:bg-primary/20 transition">Save</button>
                    </form>
                </div>
            </div>

            <div className="mb-8">
                <div className="glass-panel p-6 rounded-2xl h-[500px] relative overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Route Map</h3>
                    <div className="flex-1 relative group">
                        <ActivityMap samples={samples} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Distance", value: formatDistance(activity.distance), icon: MapPin },
                    { label: "Duration", value: formatDuration(activity.duration), icon: Clock },
                    { label: "Avg Pace", value: formatPace(activity.distance! / activity.duration!), icon: TrendingUp },
                    { label: "Total Load", value: Math.round((activity.tss || 0) + (activity.trimp || 0)), icon: Zap },
                ].map((stat, i) => (
                    <div key={i} className="glass-card">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <stat.icon size={12} className="text-primary" />
                            {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6">Pace, HR & Elevation</h3>
                        <div className="flex-1 min-h-0">
                            <ActivityChart samples={samples} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card">
                        <h3 className="font-bold text-white mb-4">Physiological Data</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/40 text-sm">Avg Heart Rate</span>
                                <span className="text-white font-bold">{activity.averageHr || '--'} bpm</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/40 text-sm">Max Heart Rate</span>
                                <span className="text-white font-bold">{activity.maxHr || '--'} bpm</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/40 text-sm">Avg Power</span>
                                <span className="text-white font-bold">{activity.averagePower || '--'} W</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/40 text-sm">Elevation Gain</span>
                                <span className="text-white font-bold">{activity.elevationGain || 0} m</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card bg-primary/5 border-primary/20">
                        <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                            <Zap size={18} />
                            Training Effect
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            This activity contributed <strong>{Math.round((activity.tss || 0) + (activity.trimp || 0))} Load Units</strong> to your chronic load.
                            Based on your current TSB, this was a {((activity.tss || 0) + (activity.trimp || 0)) > 100 ? 'strenuous' : 'moderate'} session.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
