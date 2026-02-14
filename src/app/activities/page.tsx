import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { Activity, Plus, ChevronRight, MapPin, Clock, Zap, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

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
            <PageHeader
                title="Activities"
                subtitle="Your historical training data and session details."
                actions={
                    <Link href="/upload">
                        <Button className="flex items-center gap-2">
                            <Plus size={16} />
                            Upload Session
                        </Button>
                    </Link>
                }
            />

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
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                                    <th className="text-left py-4 px-3 md:px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Activity</th>
                                    <th className="text-right py-4 px-3 md:px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Distance</th>
                                    <th className="text-right py-4 px-3 md:px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Duration</th>
                                    <th className="text-right py-4 px-3 md:px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] hidden md:table-cell">Elevation</th>
                                    <th className="text-right py-4 px-3 md:px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] hidden md:table-cell">TSS</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {list.map((act) => (
                                    <tr
                                        key={act.id}
                                        className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer hover-lift"
                                    >
                                        <td className="py-5 px-3 md:px-6">
                                            <Link href={`/activities/${act.id}`} className="block">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-foreground font-bold group-hover:text-primary transition-colors text-sm md:text-base">
                                                            {act.name || "Morning Run"}
                                                        </span>
                                                        {act.isRace && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-wider border border-amber-200 shadow-sm">
                                                                <Trophy size={10} />
                                                                Race
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        {formatDate(act.startTime)}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-5 px-3 md:px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold">{formatDistance(act.distance)}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase">km</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-3 md:px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold">{formatDuration(act.duration)}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase">h:m</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-3 md:px-6 text-right hidden md:table-cell">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold">{act.elevationGain || "-"}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase">m</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-3 md:px-6 text-right hidden md:table-cell">
                                            <div className="flex flex-col items-end">
                                                <span className="text-foreground font-bold">{act.tss || "-"}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase">TSS</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-3 md:px-6 text-right">
                                            <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors md:opacity-0 md:group-hover:opacity-100" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
            )
            }
        </>
    );
}
