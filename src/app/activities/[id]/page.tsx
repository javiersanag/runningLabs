import { db } from "@/lib/db";
import { activities, gear } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MapPin, Clock, Zap, TrendingUp, Heart, Mountain } from "lucide-react";
import Link from "next/link";
import { ActivityChart } from "@/components/charts/ActivityChart";
import ActivityMap from "@/components/charts/ActivityMap";
import { EditActivityDialog } from "@/components/activities/EditActivityDialog";

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

    const formatDistance = (m: number | null) => m ? (m / 1000).toFixed(2) : "-";
    const formatDuration = (s: number | null) => {
        if (!s) return "-";
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPace = (speedMs: number | null) => {
        if (!speedMs || speedMs === 0) return "-";
        const minPerKm = 1000 / (speedMs * 60);
        const mins = Math.floor(minPerKm);
        const secs = Math.floor((minPerKm - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateSplits = (samples: any[]) => {
        if (!samples || samples.length === 0) return [];
        const splits = [];
        let lastSplitDistance = 0;
        let startTime = samples[0].timestamp;
        let elevGain = 0;
        let hrValues: number[] = [];

        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            const dist = s.distance || 0;
            if (s.heartRate) hrValues.push(s.heartRate);
            if (i > 0) {
                elevGain += (s.altitude - samples[i - 1].altitude);
            }

            if (dist - lastSplitDistance >= 1000) {
                const duration = (new Date(s.timestamp).getTime() - new Date(startTime).getTime()) / 1000;
                splits.push({
                    km: splits.length + 1,
                    pace: duration,
                    elev: Math.round(elevGain),
                    avgHr: hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null,
                    maxHr: hrValues.length > 0 ? Math.max(...hrValues) : null
                });
                lastSplitDistance = dist;
                startTime = s.timestamp;
                elevGain = 0;
                hrValues = [];
            }
        }

        const finalDist = samples[samples.length - 1].distance || 0;
        const remainingDist = finalDist - lastSplitDistance;
        if (remainingDist > 50) {
            const duration = (new Date(samples[samples.length - 1].timestamp).getTime() - new Date(startTime).getTime()) / 1000;
            splits.push({
                km: (finalDist / 1000).toFixed(2),
                pace: duration * (1000 / remainingDist),
                elev: Math.round(elevGain),
                avgHr: hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null,
                maxHr: hrValues.length > 0 ? Math.max(...hrValues) : null
            });
        }
        return splits;
    };

    const splits = calculateSplits(samples);
    const formatPaceSecs = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.round(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalLoad = Math.round((activity.tss || 0) + (activity.trimp || 0));

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/activities" className="text-xs text-white/40 hover:text-primary transition">Activities</Link>
                        <span className="text-white/20">/</span>
                        <span className="text-xs text-white/60">{activity.name}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{activity.name}</h2>
                    <p className="text-white/40 text-sm">{new Date(activity.startTime).toLocaleString()}</p>
                </div>

                <EditActivityDialog
                    activity={{
                        id: activity.id,
                        name: activity.name,
                        gearId: activity.gearId
                    }}
                    allGear={allGear}
                />
            </div>

            {/* Key Metrics Strip */}
            <div className="flex items-center gap-3 py-3 mb-1 border-white/5">
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-white/40" />
                    <span className="text-white font-bold">{formatDistance(activity.distance)}</span>
                    <span className="text-white/40 text-xs">km</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-white/40" />
                    <span className="text-white font-bold font-mono">{formatDuration(activity.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-white/40" />
                    <span className="text-white font-bold">{formatPace(activity.distance! / activity.duration!)}</span>
                    <span className="text-white/40 text-xs">/km</span>
                </div>
                <div className="flex items-center gap-2">
                    <Mountain size={14} className="text-green-400" />
                    <span className="text-white font-bold">{activity.elevationGain || 0}</span>
                    <span className="text-white/30 text-xs">m</span>
                </div>
            </div>

            {/* Physiological Data - Compact */}
            <div className="flex items-center gap-8 py-1 mb-4 border-white/5 text-sm">
                <div className="flex items-center gap-2">
                    <Heart size={14} className="text-red-400" />
                    <span className="text-white/40">Avg HR</span>
                    <span className="text-white font-bold">{activity.averageHr || '--'}</span>
                    <span className="text-white/30 text-xs">bpm</span>
                </div>
                <div className="flex items-center gap-2">
                    <Heart size={14} className="text-red-500" />
                    <span className="text-white/40">Max HR</span>
                    <span className="text-white font-bold">{activity.maxHr || '--'}</span>
                    <span className="text-white/30 text-xs">bpm</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-white/40">Avg Power</span>
                    <span className="text-white font-bold">{activity.averagePower || '--'}</span>
                    <span className="text-white/30 text-xs">W</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-primary" />
                    <span className="text-primary font-bold">{totalLoad}</span>
                    <span className="text-white/40 text-xs">Load</span>
                </div>
            </div>

            {/* Splits & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 border border-white/5 rounded-xl overflow-hidden bg-white/[0.02] flex flex-col h-[400px]">
                    <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={12} className="text-primary" />
                            Splits (1km)
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-[11px]">
                            <thead className="sticky top-0 bg-[#0a0a0c] z-10">
                                <tr className="text-white/30 border-b border-white/5">
                                    <th className="py-2 px-3 text-left">KM</th>
                                    <th className="py-2 px-2 text-right">Pace</th>
                                    <th className="py-2 px-2 text-right">Elev</th>
                                    <th className="py-2 px-2 text-right">Avg HR</th>
                                    <th className="py-2 px-2 text-right pr-3">Max HR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {splits.map((s, i) => (
                                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                                        <td className="py-2.5 px-3 text-white/50">{s.km}</td>
                                        <td className="py-2.5 px-2 text-right text-white font-mono">{formatPaceSecs(s.pace)}</td>
                                        <td className="py-2.5 px-2 text-right text-green-400">{s.elev}m</td>
                                        <td className="py-2.5 px-2 text-right text-white">{s.avgHr || '--'}</td>
                                        <td className="py-2.5 px-2 text-right text-white/60 pr-3">{s.maxHr || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden border border-white/5">
                    <ActivityMap samples={samples} />
                </div>
            </div>

            {/* Chart */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-white/60 mb-3">Pace, HR & Elevation</h3>
                <div className="h-[300px] bg-white/[0.02] rounded-xl p-4">
                    <ActivityChart samples={samples} />
                </div>
            </div>
        </>
    );
}
