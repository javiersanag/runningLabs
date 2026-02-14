import { db } from "@/lib/db";
import { activities, gear } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MapPin, Clock, Zap, TrendingUp, Heart, Mountain, Tag, ChevronLeft, Calendar, Share2, MoreHorizontal, Trophy } from "lucide-react";
import Link from "next/link";
import { ActivityChart } from "@/components/charts/ActivityChart";
import ActivityMap from "@/components/charts/ActivityMap";
import { EditActivityDialog } from "@/components/activities/EditActivityDialog";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/MetricCard";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return null;

    const activity = await db.query.activities.findFirst({
        where: (t, { eq, and }) => and(eq(t.id, id), eq(t.athleteId, user.id))
    });

    if (!activity) notFound();

    const allGear = await db.query.gear.findMany({
        where: (t, { eq }) => eq(t.athleteId, user.id)
    });

    const currentGear = allGear.find(g => g.id === activity.gearId);

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
        let targetDist = 1000;
        let lastSplitTime = new Date(samples[0].timestamp).getTime();
        let elevSinceLastSplit = 0;
        let hrValues: number[] = [];

        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            const dist = s.distance || 0;
            const time = new Date(s.timestamp).getTime();

            if (s.heartRate) hrValues.push(s.heartRate);
            const elevDiff = i > 0 ? (s.altitude - samples[i - 1].altitude) : 0;
            elevSinceLastSplit += elevDiff;

            while (dist >= targetDist) {
                const prevS = samples[i - 1] || s;
                const prevDist = prevS.distance || 0;
                const prevTime = new Date(prevS.timestamp).getTime();

                const ratio = dist === prevDist ? 1 : (targetDist - prevDist) / (dist - prevDist);
                const timeAtTarget = prevTime + ratio * (time - prevTime);

                const splitDuration = (timeAtTarget - lastSplitTime) / 1000;
                const splitElev = elevSinceLastSplit - elevDiff + (elevDiff * ratio);

                splits.push({
                    km: splits.length + 1,
                    pace: splitDuration,
                    elev: Math.round(splitElev),
                    avgHr: hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null,
                    maxHr: hrValues.length > 0 ? Math.max(...hrValues) : null
                });

                lastSplitTime = timeAtTarget;
                elevSinceLastSplit = elevDiff * (1 - ratio);
                targetDist += 1000;
                hrValues = [];
            }
        }

        const finalS = samples[samples.length - 1];
        const finalDist = finalS.distance || 0;
        const remainingDist = finalDist - (targetDist - 1000);

        if (remainingDist > 50) {
            const finalTime = new Date(finalS.timestamp).getTime();
            const splitDuration = (finalTime - lastSplitTime) / 1000;
            splits.push({
                km: (finalDist / 1000).toFixed(2),
                pace: splitDuration * (1000 / remainingDist),
                elev: Math.round(elevSinceLastSplit),
                avgHr: hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null,
                maxHr: hrValues.length > 0 ? Math.max(...hrValues) : null
            });
        }
        return splits;
    };

    const splits = calculateSplits(samples);
    const formatPaceSecs = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalLoad = Math.round((activity.tss || 0) + (activity.trimp || 0));

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/activities"
                    className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Activities
                </Link>
                {/*   <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-3 h-9">
                        <Share2 size={16} />
                    </Button>
                    <Button variant="secondary" className="px-3 h-9">
                        <MoreHorizontal size={16} />
                    </Button>
                </div> */}
            </div>

            {/* Title Section */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{activity.name || "Morning Session"}</h1>
                        {activity.isRace && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 shadow-sm">
                                <Trophy size={20} className="text-amber-500" />
                                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Race Activity</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {currentGear && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100/50 rounded-lg border border-neutral-200 shadow-sm">
                                <Tag size={12} className="text-neutral-400" />
                                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{currentGear.name}</span>
                            </div>
                        )}
                        <EditActivityDialog
                            activity={{
                                id: activity.id,
                                name: activity.name,
                                gearId: activity.gearId,
                                isRace: !!activity.isRace
                            }}
                            allGear={allGear}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-neutral-400">
                    <div className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                        <Calendar size={12} />
                        {new Date(activity.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                        <Clock size={12} />
                        {new Date(activity.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="flex flex-nowrap gap-3 mb-8 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                <MetricCard
                    label="Distance"
                    value={formatDistance(activity.distance)}
                    unit="KM"
                    icon="📍"
                    primary
                    compact
                />
                <MetricCard
                    label="Pace"
                    value={formatPace(activity.distance! / activity.duration!)}
                    unit="/KM"
                    icon="⏱️"
                    compact
                />
                <MetricCard
                    label="Duration"
                    value={formatDuration(activity.duration)}
                    icon="🕒"
                    compact
                />
                <MetricCard
                    label="Elevation"
                    value={activity.elevationGain || 0}
                    unit="M"
                    icon="🏔️"
                    className="text-emerald-600"
                    compact
                />
                <MetricCard
                    label="Load"
                    value={totalLoad}
                    unit="TSS"
                    icon="⚡"
                    className="text-primary"
                    compact
                />
                <MetricCard
                    label="Avg HR"
                    value={activity.averageHr || '--'}
                    unit="BPM"
                    icon="❤️"
                    className="text-rose-600"
                    compact
                />
            </div>

            {/* Map and Splits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 overflow-hidden p-0 h-[300px] md:h-[450px]">
                    <div className="w-full h-full relative">
                        <ActivityMap samples={samples} />
                    </div>
                </Card>
                <Card className="flex flex-col h-[300px] md:h-[450px] p-0">
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp size={12} className="text-primary" />
                            Split Analysis
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-[11px] border-collapse">
                            <thead className="sticky top-0 bg-white z-10 border-b border-neutral-100">
                                <tr className="text-neutral-400 font-bold uppercase tracking-widest">
                                    <th className="py-3 px-4 text-left">KM</th>
                                    <th className="py-3 px-2 text-right">Pace</th>
                                    <th className="py-3 px-2 text-right">Elev</th>
                                    <th className="py-3 px-4 text-right">HR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {splits.map((s, i) => (
                                    <tr key={i} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="py-3 px-4 font-bold text-neutral-400">{s.km}</td>
                                        <td className="py-3 px-2 text-right text-foreground font-mono font-bold group-hover:text-primary transition-colors">{formatPaceSecs(s.pace)}</td>
                                        <td className="py-3 px-2 text-right text-neutral-500 font-medium">{s.elev}m</td>
                                        <td className="py-3 px-4 text-right text-foreground font-bold">{s.avgHr || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Analysis Chart */}
            <Card className="mb-8 overflow-hidden flex flex-col items-stretch">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">Detailed Session Analytics</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> PACE</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> HR</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ELEV</span>
                    </div>
                </div>
                <div className="h-[250px] md:h-[350px]">
                    <ActivityChart samples={samples} />
                </div>
            </Card>
        </div>
    );
}
