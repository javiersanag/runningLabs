import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { Activity, Plus, ChevronRight, MapPin, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Activities</h2>
                    <p className="text-sm text-neutral-500 font-medium">Your historical training data and session details.</p>
                </div>
                <Link href="/upload">
                    <Button className="flex items-center gap-2">
                        <Plus size={16} />
                        Upload Session
                    </Button>
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-neutral-100 p-16 text-center bg-neutral-50/50">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <Activity size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No Activities Found</h3>
                    <p className="text-neutral-500 max-w-xs mx-auto mb-8 font-medium">Upload your first .FIT file to unlock personalized performance analytics.</p>
                    <Link href="/upload">
                        <Button>Upload Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="text-left py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Activity</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Distance</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Duration</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Elevation</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">TSS</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {list.map((act) => (
                                    <tr
                                        key={act.id}
                                        className="group hover:bg-neutral-50/50 transition-all cursor-pointer"
                                    >
                                        <td className="py-5 px-6">
                                            <Link href={`/activities/${act.id}`} className="block">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-bold group-hover:text-primary transition-colors mb-0.5">
                                                        {act.name || "Morning Run"}
                                                    </span>
                                                    <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        {formatDate(act.startTime)}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold">{formatDistance(act.distance)}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">KM</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold font-mono">{formatDuration(act.duration)}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">TIME</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-neutral-600 font-bold">{act.elevationGain || 0}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">M</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <Zap size={10} />
                                                    {Math.round((act.tss || 0) + (act.trimp || 0))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <ChevronRight size={16} className="text-neutral-200 group-hover:text-primary transition-colors" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
