import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Trophy, X, Calendar as CalendarIcon, Check } from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from "date-fns";
import { cn } from "@/lib/utils";

interface RaceCalendarProps {
    goals: any[];
    activities: any[];
    isOpen: boolean;
    onClose: () => void;
}

export function RaceCalendar({ goals, activities, isOpen, onClose }: RaceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (!isOpen) return null;

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const raceGoals = goals.filter(g => g.type === 'Race');
    const raceActivities = activities.filter(a => a.isRace);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-none">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Race Calendar</h2>
                            <p className="text-xs text-neutral-500 font-medium">Your upcoming events and key race dates.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-neutral-50 rounded-full p-1 border border-neutral-200">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-neutral-500">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-4 text-xs font-black text-foreground min-w-[120px] text-center uppercase tracking-widest">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-neutral-500">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-auto p-6 bg-neutral-50/30">
                    <div className="grid grid-cols-7 mb-4">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div key={day} className="text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                        {calendarDays.map((day, idx) => {
                            const dayRaces = raceGoals.filter(goal => isSameDay(new Date(goal.targetDate), day));
                            const dayActivities = raceActivities.filter(act => isSameDay(new Date(act.startTime), day));
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "min-h-[100px] p-2 flex flex-col transition-colors",
                                        isCurrentMonth ? "bg-white" : "bg-neutral-50/50",
                                        isToday(day) && "bg-blue-50/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={cn(
                                            "text-[10px] font-black p-1 rounded-md min-w-[20px] text-center",
                                            isToday(day) ? "bg-primary text-white" : (isCurrentMonth ? "text-neutral-400" : "text-neutral-300")
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        {/* Goals */}
                                        {dayRaces.map((race, rIdx) => (
                                            <div
                                                key={`goal-${rIdx}`}
                                                className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-0.5 animate-in zoom-in-95"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Trophy size={8} className="text-amber-500" />
                                                    <p className="text-[9px] font-black text-amber-900 leading-tight line-clamp-1">
                                                        {race.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Completed Activities */}
                                        {dayActivities.map((act, aIdx) => (
                                            <div
                                                key={`act-${aIdx}`}
                                                className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg flex flex-col gap-0.5 animate-in slide-in-from-bottom-1"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Check size={8} className="text-blue-500" />
                                                    <p className="text-[9px] font-black text-blue-900 leading-tight line-clamp-1">
                                                        {act.name}
                                                    </p>
                                                </div>
                                                <p className="text-[7px] font-bold text-blue-700 uppercase">
                                                    {(act.distance / 1000).toFixed(1)}km • {act.type}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Legend */}
                <div className="p-4 border-t border-neutral-100 bg-white flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            Confirmed Race
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Today
                        </div>
                    </div>
                    <div>
                        {raceGoals.length} Upcoming Events
                    </div>
                </div>
            </Card>
        </div>
    );
}
