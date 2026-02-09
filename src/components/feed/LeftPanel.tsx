"use client";
import React, { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Activity, Bike, Calendar, ChevronRight, Flame, Heart, TrendingUp, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeftPanel({ athlete, stats, dailyMetric }: { athlete: any, stats: any, dailyMetric: any }) {
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

    const initials = athlete?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "RL";

    // Mock streak data for visualization
    const streakDays = [true, true, false, true, true, true, false]; // Last 7 days

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
                <div className="h-20 bg-gradient-to-r from-primary/10 to-blue-600/10" />
                <div className="px-6 pb-6 -mt-10 relative">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md mb-3">
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-black text-2xl">
                            {initials}
                        </div>
                    </div>
                    <h2 className="text-xl font-black text-foreground">{athlete?.name}</h2>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-4">Endurance Athlete</p>

                    <div className="flex gap-4 pt-4 border-t border-neutral-100">
                        <div>
                            <p className="text-2xl font-black text-foreground">{stats.totalActivities || 0}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Activities</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-foreground">{stats.thisMonth || 0}</p>
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
                    <span className="text-xs font-bold text-foreground">4 Weeks</span>
                </div>
                <div className="flex justify-between gap-1">
                    {streakDays.map((active, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={cn(
                                "w-full aspect-square rounded-md transition-all",
                                active ? "bg-primary" : "bg-neutral-100"
                            )} />
                            <span className="text-[8px] font-bold text-neutral-300 uppercase">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
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
                            <div className="h-full bg-primary" style={{ width: '65%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-foreground">Fatigue (ATL)</span>
                            <span className="font-bold text-purple-500">{Math.round(dailyMetric?.atl || 0)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '40%' }} />
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
                        <div className="flex items-center gap-1 mt-1">
                            <div className="h-1.5 w-1/2 bg-neutral-100 rounded-l-full overflow-hidden flex justify-end">
                                {/* Negative bars logic would go here */}
                            </div>
                            <div className="h-2 w-[1px] bg-neutral-200" />
                            <div className="h-1.5 w-1/2 bg-neutral-100 rounded-r-full overflow-hidden">
                                {/* Positive bars logic */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                            0.9
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">Optimal Load</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">ACWR Ratio</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Goals CTA */}
            <Card className="bg-neutral-900 text-white border-neutral-800">
                <div className="flex items-center gap-3 mb-3">
                    <Trophy size={16} className="text-yellow-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Next Goal</h3>
                </div>
                <p className="font-bold text-sm mb-4">Sub-20 5K Attempt</p>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 mb-2">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-[10px] text-neutral-400 text-right font-bold uppercase tracking-wider">Week 6 of 8</p>
            </Card>

            <p className="text-center text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                Khronos v0.9 Beta
            </p>
        </div>
    );
}
