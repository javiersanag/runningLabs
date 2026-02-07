import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { Activity, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
    const list = await db.query.activities.findMany({
        orderBy: [desc(activities.startTime)],
        limit: 50
    });

    const formatDistance = (m: number | null) => m ? (m / 1000).toFixed(2) : "-";
    const formatDuration = (s: number | null) => {
        if (!s) return "-";
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = Math.floor(s % 60);
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Activities</h2>
                    <p className="text-white/40 text-sm">Your latest training sessions</p>
                </div>
                <Link href="/upload">
                    <button className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
                        <Plus size={16} />
                        Upload
                    </button>
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                    <Activity className="mx-auto text-white/10 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Activities Yet</h3>
                    <p className="text-white/30 max-w-xs mx-auto mb-6">Upload your first .FIT file to start analyzing your performance.</p>
                    <Link href="/upload" className="px-6 py-2 bg-primary text-black rounded-lg font-bold inline-block">Upload Now</Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">Date</th>
                                <th className="text-left py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">Name</th>
                                <th className="text-right py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">Time</th>
                                <th className="text-right py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">Distance</th>
                                <th className="text-right py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">Elev</th>
                                <th className="text-right py-3 px-2 text-xs font-bold text-white/30 uppercase tracking-widest">TSS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((act) => (
                                <tr
                                    key={act.id}
                                    className="border-b border-white/5 hover:bg-white/[0.02] transition cursor-pointer group"
                                >
                                    <td className="py-3 px-2 text-white/50">{formatDate(act.startTime)}</td>
                                    <td className="py-3 px-2">
                                        <Link href={`/activities/${act.id}`} className="text-white font-medium group-hover:text-primary transition">
                                            {act.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-2 text-right text-white font-mono">{formatDuration(act.duration)}</td>
                                    <td className="py-3 px-2 text-right text-white">{formatDistance(act.distance)} km</td>
                                    <td className="py-3 px-2 text-right text-white/50">{act.elevationGain || 0} m</td>
                                    <td className="py-3 px-2 text-right text-primary font-bold">{Math.round((act.tss || 0) + (act.trimp || 0))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
