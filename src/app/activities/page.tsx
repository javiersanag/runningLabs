import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { Activity, Clock, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
    const list = await db.query.activities.findMany({
        orderBy: [desc(activities.startTime)],
        limit: 50
    });

    const formatDistance = (m: number | null) => m ? (m / 1000).toFixed(2) + " km" : "-";
    const formatDuration = (s: number | null) => {
        if (!s) return "-";
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Activities</h2>
                    <p className="text-white/50">Your latest training sessions</p>
                </div>
                <Link href="/upload">
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
                        <Plus size={18} />
                        Upload Activity
                    </button>
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
                    <Activity className="mx-auto text-white/10 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Activities Yet</h3>
                    <p className="text-white/30 max-w-xs mx-auto mb-6">Upload your first .FIT file to start analyzing your performance.</p>
                    <Link href="/upload" className="px-6 py-2 bg-primary text-black rounded-lg font-bold inline-block">Upload Now</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((act) => (
                        <Link key={act.id} href={`/activities/${act.id}`} className="block">
                            <div className="glass-card flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{act.name}</h4>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(act.startTime).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 capitalize">{act.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">{formatDistance(act.distance)}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Distance</p>
                                    </div>
                                    <div className="text-right w-24">
                                        <p className="text-lg font-bold text-white">{formatDuration(act.duration)}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Time</p>
                                    </div>
                                    <div className="text-right w-20">
                                        <p className="text-lg font-bold text-primary">{Math.round(act.tss || 0)}</p>
                                        <p className="text-[10px] text-primary/30 uppercase tracking-widest font-bold">TSS</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
