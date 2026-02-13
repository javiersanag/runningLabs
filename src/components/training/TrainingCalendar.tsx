"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Calendar as CalendarIcon, Clock, Flame, Zap, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
    day: number;
    type: string;
    description: string;
    durationMinutes: number;
    intensity: 'base' | 'moderate' | 'hard';
    completed?: boolean;
}

interface Week {
    weekNumber: number;
    focus: string;
    sessions: Session[];
}

export function TrainingCalendar({ plan }: { plan: any }) {
    if (!plan) return null;

    const data = typeof plan.weeksJson === 'string' ? JSON.parse(plan.weeksJson) : plan.weeksJson;
    const weeks: Week[] = data.weeks || [];

    return (
        <div className="space-y-12 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-foreground">{data.planName || "Training Plan"}</h2>
                    <p className="text-neutral-500 font-medium text-sm">Follow your customized AI-generated progression.</p>
                </div>
            </div>

            <div className="space-y-8">
                {weeks.map((week) => (
                    <div key={week.weekNumber} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                                Week {week.weekNumber}
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{week.focus}</h3>
                            <div className="h-[1px] flex-1 bg-neutral-100" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                            {week.sessions.map((session, idx) => {
                                const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][session.day - 1];
                                return (
                                    <Card
                                        key={idx}
                                        padding="compact"
                                        className={cn(
                                            "min-h-[140px] flex flex-col border-2",
                                            session.type === "Rest" ? "bg-neutral-50/50 border-transparent opacity-60" : "bg-white border-neutral-50",
                                            session.completed ? "border-green-500/20 bg-green-50/10" : ""
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-neutral-400 uppercase">{dayName}</span>
                                            {session.completed && <CheckCircle2 size={12} className="text-green-500" />}
                                            {session.type !== "Rest" && !session.completed && (
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    session.intensity === 'hard' ? "bg-red-500" :
                                                        session.intensity === 'moderate' ? "bg-amber-500" : "bg-primary"
                                                )} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-foreground leading-tight uppercase mb-1">
                                                {session.type}
                                            </p>
                                            <p className="text-[10px] text-neutral-500 font-medium leading-[1.3] line-clamp-3">
                                                {session.description}
                                            </p>
                                        </div>

                                        {session.durationMinutes > 0 && (
                                            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-neutral-400">
                                                <Clock size={10} />
                                                {session.durationMinutes}m
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
