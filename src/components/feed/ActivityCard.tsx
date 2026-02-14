"use client";

import Link from "next/link";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { Activity, MapPin, Clock, Zap, TrendingUp, Sparkles, MessageSquare, Heart, RefreshCw, Trophy } from "lucide-react";
import dynamic from "next/dynamic";

const ActivityMapInner = dynamic(
    () => import("@/components/charts/ActivityMapInner"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-neutral-50 flex items-center justify-center text-neutral-400">
                <p className="text-xs font-bold uppercase tracking-widest">Loading Map...</p>
            </div>
        )
    }
);

import { MetricCard } from "@/components/ui/MetricCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateActivityInsight } from "@/app/actions/activities";
import { useState, useTransition } from "react";

interface ActivityCardProps {
    activity: any;
}

export function ActivityCard({ activity }: ActivityCardProps) {
    const samples = activity.samples ? JSON.parse(activity.samples) : [];
    const [isPending, startTransition] = useTransition();

    // Quick helpers for formatting
    const isRun = activity.type?.toLowerCase() === 'run' || activity.type?.toLowerCase() === 'running';
    const isRide = activity.type?.toLowerCase() === 'ride' || activity.type?.toLowerCase() === 'cycling';

    const distanceKm = activity.distance ? (activity.distance / 1000).toFixed(2) : "-";
    const pace = isRun && activity.distance && activity.duration
        ? formatPace(activity.distance / activity.duration)
        : "-";
    const power = isRide ? (activity.averagePower || "-") : null;

    const handleGenerateInsight = () => {
        startTransition(async () => {
            const result = await generateActivityInsight(activity.id);
            if (!result.success) {
                console.error(result.error);
                // Optionally show a toast error here
            }
        });
    };

    return (
        <Card className="mb-6 overflow-hidden flex flex-col p-0">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg leading-tight hover:text-primary transition-colors">
                            <Link href={`/activities/${activity.id}`}>{activity.name}</Link>
                        </h3>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                            {new Date(activity.startTime).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })} • {activity.type}
                            {activity.isRace && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black border border-amber-200">
                                    <Trophy size={10} />
                                    Race Event
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Distance</span>
                        <span className="text-xl font-black text-foreground">{distanceKm} <span className="text-xs font-bold text-neutral-400">km</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Time</span>
                        <span className="text-xl font-black text-foreground">{formatDuration(activity.duration)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{power ? 'Power' : 'Pace'}</span>
                        <span className="text-xl font-black text-foreground">
                            {power ? `${power}w` : pace} <span className="text-xs font-bold text-neutral-400">{!power ? '/km' : ''}</span>
                        </span>
                    </div>
                </div>

                {/* Map Preview (Aggressively truncated for feed) */}
                {samples.length > 0 && (
                    <div className="h-48 rounded-xl overflow-hidden border border-neutral-100 relative mb-4">
                        <ActivityMapInner samples={samples} />
                    </div>
                )}

                {/* AI Insight Strip */}
                {activity.aiInsight ? (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 items-start animate-in fade-in duration-500">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={12} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-primary mb-0.5">AI Analysis</p>
                                <button
                                    onClick={handleGenerateInsight}
                                    disabled={isPending}
                                    className="h-6 w-6 rounded-md flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
                                    title="Regenerate Insight"
                                >
                                    <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
                                </button>
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                                {activity.aiInsight}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <Button
                            variant="primary" // Changed to primary for visibility in this demo
                            className="text-xs h-8 px-3 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 shadow-none border border-neutral-200"
                            onClick={handleGenerateInsight}
                            disabled={isPending}
                        >
                            <Sparkles size={12} className={`mr-1.5 ${isPending ? 'animate-spin' : ''}`} />
                            {isPending ? 'Analyzing...' : 'AI Analysis'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {/* <div className="px-4 py-3 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between text-neutral-400">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors">
                        <Heart size={14} /> Like
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors">
                        <MessageSquare size={14} /> Comment
                    </button>
                </div>
                <Link href={`/activities/${activity.id}`} className="text-xs font-bold hover:text-primary transition-colors">
                    View Details
                </Link>
            </div>
            */}
        </Card>
    );
}

