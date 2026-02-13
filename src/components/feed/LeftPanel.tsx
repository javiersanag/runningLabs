"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Activity, Bike, Calendar, ChevronRight, Flame, Heart, TrendingUp, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeftPanel({
    athlete,
    stats,
    dailyMetric,
    streakDays,
    streakLabels,
    latestActivity,
    activeGoal
}: {
    athlete: any,
    stats: any,
    dailyMetric: any,
    streakDays: boolean[],
    streakLabels: string[],
    latestActivity?: any,
    activeGoal?: any
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [stickyTop, setStickyTop] = useState(96); // Default top-24 (96px)

    useEffect(() => {
        const updateStickyPos = () => {
            if (!ref.current) return;
            const height = ref.current.scrollHeight;
            const vh = window.innerHeight;

            // If the panel is taller than the viewport, we stick to the bottom
            // Otherwise, we stick to the top with a margin
            if (height > vh - 120) { // accounting for some margin
                setStickyTop(vh - height - 32);
            } else {
                setStickyTop(96);
            }
        };

        updateStickyPos();
        window.addEventListener("resize", updateStickyPos);
        return () => window.removeEventListener("resize", updateStickyPos);
    }, [athlete, stats, dailyMetric]);

    const initials = (athlete?.firstName?.[0] || "") + (athlete?.lastName?.[0] || "") || "RL";
    // const initials = athlete?.firstName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "RL";

    // Use passed streak data instead of mock
    const displayStreak = streakDays || [false, false, false, false, false, false, false];
    const displayLabels = streakLabels || ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div
            ref={ref}
            className="space-y-6 transition-all duration-300"
            style={{
                position: 'sticky',
                top: `${stickyTop}px`,
                alignSelf: 'start'
            }}
        >
            {/* Identity Card */}
            <Card className="p-0 overflow-hidden">
                <div className="h-10 bg-gradient-to-r from-primary/10 to-blue-600/10" />
                <div className="px-6 pb-6 -mt-10 relative">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md mb-3">
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-black text-2xl">
                            {initials}
                        </div>
                    </div>
                    <h2 className="text-l font-black text-foreground">{athlete?.firstName}</h2>
                    {latestActivity && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-neutral-400 group">
                            {/* <Activity size={10} className="text-primary/60" /> */}
                            <Link
                                href={`/activities/${latestActivity.id}`}
                                className="hover:text-primary transition-colors truncate"
                                title={`View ${latestActivity.name}`}
                            >
                                {latestActivity.name} - {new Date(latestActivity.startTime).toLocaleDateString(undefined, {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}
                            </Link>
                            <ChevronRight size={10} className="text-neutral-300 group-hover:text-primary transition-colors" />
                        </div>
                    )}
                    <div className="flex gap-4 pt-4 mt-4 border-t border-neutral-100">
                        <div>
                            <p className="text-xl font-black text-foreground">{stats.totalActivities || 0}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Activities</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-foreground">{stats.thisMonth || 0}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Last 30d</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Streak Module */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Flame size={14} className="text-primary" />
                        Activity Streak
                    </h3>
                </div>
                <div className="flex justify-between gap-1">
                    {displayStreak.map((active, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={cn(
                                "w-full aspect-square rounded-md transition-all",
                                active ? "bg-primary" : "bg-neutral-100"
                            )} />
                            <span className="text-[8px] font-bold text-neutral-300 uppercase">
                                {displayLabels[i]}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Training Snapshot */}
            <Card>
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    Training Status
                </h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-foreground">Fitness (CTL)</span>
                            <span className="font-bold text-primary">{Math.round(dailyMetric?.ctl || 0)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, ((dailyMetric?.ctl || 0) / 100) * 100)}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-foreground">Fatigue (ATL)</span>
                            <span className="font-bold text-purple-500">{Math.round(dailyMetric?.atl || 0)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, ((dailyMetric?.atl || 0) / 150) * 100)}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-foreground">Form (TSB)</span>
                            <span className={cn(
                                "font-bold",
                                (dailyMetric?.tsb || 0) >= 0 ? "text-success" : "text-warning"
                            )}>{Math.round(dailyMetric?.tsb || 0)}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden relative">
                            {/* Center mark */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-300 z-10" />

                            {/* TSB Bar */}
                            <div
                                className={cn(
                                    "absolute h-full",
                                    (dailyMetric?.tsb || 0) >= 0 ? "bg-success" : "bg-warning"
                                )}
                                style={{
                                    left: (dailyMetric?.tsb || 0) >= 0 ? '50%' : `${50 + Math.max(-50, (dailyMetric?.tsb || 0))}%`,
                                    width: `${Math.min(50, Math.abs(dailyMetric?.tsb || 0))}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                            (dailyMetric?.acwr || 1) >= 0.8 && (dailyMetric?.acwr || 1) <= 1.3
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                        )}>
                            {(dailyMetric?.acwr || 0).toFixed(2)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">
                                {(dailyMetric?.acwr || 1) >= 0.8 && (dailyMetric?.acwr || 1) <= 1.3 ? "Optimal Load" : "Risk of Injury"}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">ACWR Ratio</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Goals CTA */}
            <Link href="/training" className="block">
                <Card className="bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                        <Trophy size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Next Goal</h3>
                    </div>
                    {activeGoal ? (
                        <>
                            <p className="font-bold text-sm mb-4 leading-snug">{activeGoal.name}</p>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '40%' }} />
                                </div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                    {new Date(activeGoal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="py-2">
                            <p className="font-bold text-sm mb-1">No active goal</p>
                            <p className="text-[10px] text-neutral-400 font-medium">Set a goal to start training.</p>
                        </div>
                    )}
                </Card>
            </Link>

            <p className="text-center text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                Khronos v0.9 Beta
            </p>
        </div>
    );
}
