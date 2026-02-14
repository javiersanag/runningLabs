"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Target, Trophy, MapPin, Sparkles, Loader2, Link as LinkIcon, ChevronRight } from "lucide-react";
import { createGoalAction, analyzeRaceAction } from "@/app/actions/goals";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GoalManager() {
    const [mode, setMode] = useState<'selection' | 'personal' | 'race'>('selection');
    const [isLoading, setIsLoading] = useState(false);
    const [raceUrl, setRaceUrl] = useState("");
    const [analyzedDetails, setAnalyzedDetails] = useState<any>(null);
    const [selectedDistance, setSelectedDistance] = useState<any>(null);
    const router = useRouter();

    const handleAnalyze = async () => {
        if (!raceUrl) return;
        setIsLoading(true);
        const result = await analyzeRaceAction(raceUrl);
        setIsLoading(false);
        if (result.success) {
            setAnalyzedDetails(result.data);
            if (result.data.distances?.length > 0) {
                setSelectedDistance(result.data.distances[0]);
            }
        } else {
            alert(result.error);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        if (analyzedDetails) {
            const finalDetails = {
                ...analyzedDetails,
                distance: selectedDistance?.distance || analyzedDetails.distance,
                distanceLabel: selectedDistance?.label || ""
            };
            formData.append("raceDetails", JSON.stringify(finalDetails));
        }

        const result = await createGoalAction(formData);
        setIsLoading(false);
        if (result.success) {
            router.refresh();
            setMode('selection');
            setAnalyzedDetails(null);
            setSelectedDistance(null);
            setRaceUrl("");
        }
    };

    if (mode === 'selection') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setMode('personal')}
                    className="flex flex-col items-center p-8 rounded-[2rem] border-2 border-neutral-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                        <Target size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Personal Goal</h3>
                    <p className="text-xs text-neutral-500 mt-2">Set a target distance, pace, or weight by a specific date.</p>
                </button>

                <button
                    onClick={() => setMode('race')}
                    className="flex flex-col items-center p-8 rounded-[2rem] border-2 border-dashed border-neutral-100 hover:border-amber-500/50 hover:bg-amber-50 transition-all text-center group"
                >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                        <Trophy size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Race Event</h3>
                    <p className="text-xs text-neutral-500 mt-2">Paste a race URL and let the AI analyze the course and build your plan.</p>
                </button>
            </div>
        );
    }

    return (
        <Card padding="normal" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-foreground">
                    {mode === 'personal' ? 'Set a Personal Goal' : 'Add a Race Event'}
                </h3>
                <Button variant="secondary" onClick={() => {
                    setMode('selection');
                    setAnalyzedDetails(null);
                    setSelectedDistance(null);
                }}>
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-6">
                <input type="hidden" name="type" value={mode === 'personal' ? 'Personal' : 'Race'} />

                {mode === 'race' && !analyzedDetails && (
                    <div className="space-y-4">
                        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Race Website URL</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="https://example-marathon.com/event-details"
                                className="flex-1 bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                value={raceUrl}
                                onChange={(e) => setRaceUrl(e.target.value)}
                                name="raceUrl"
                            />
                            <Button type="button" onClick={handleAnalyze} disabled={isLoading || !raceUrl}>
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="mr-2" />}
                                Analyze
                            </Button>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium italic">
                            Gemini will scan the website to find date, distance, and elevation profile.
                        </p>
                    </div>
                )}

                {(mode === 'personal' || analyzedDetails) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Goal Name</label>
                            <input
                                required
                                name="name"
                                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                defaultValue={analyzedDetails?.name || ""}
                                placeholder={mode === 'personal' ? "e.g. Sub-20 5K" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Target Date</label>
                            <input
                                required
                                type="date"
                                name="targetDate"
                                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                defaultValue={analyzedDetails?.date ? new Date(analyzedDetails.date).toISOString().split('T')[0] : ""}
                            />
                        </div>

                        {analyzedDetails?.distances?.length > 1 && (
                            <div className="space-y-2 col-span-full">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Select Your Distance</label>
                                <div className="flex flex-wrap gap-2">
                                    {analyzedDetails.distances.map((dist: any, idx: number) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedDistance(dist)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                selectedDistance?.label === dist.label
                                                    ? "bg-primary text-white"
                                                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                                            )}
                                        >
                                            {dist.label} ({dist.distance}km)
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Pace Goal</label>
                            <input
                                required
                                name="targetMetric"
                                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                placeholder="MM:SS (min/km)"
                                pattern="^[0-5]?[0-9]:[0-5][0-9]$"
                                title="Please enter pace in MM:SS format (e.g., 4:30 or 12:45)"
                                key={selectedDistance?.label || 'default'}
                                defaultValue=""
                            />
                        </div>

                        {analyzedDetails && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Course Profile</label>
                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-[10px] font-bold text-amber-800">
                                    <p>{analyzedDetails.profile}</p>
                                    <p className="mt-1 flex items-center gap-1">
                                        <MapPin size={10} /> {analyzedDetails.location} • {analyzedDetails.elevationGain}m Gain
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(mode === 'personal' || analyzedDetails) && (
                    <div className="pt-4 border-t border-neutral-100">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create Goal & Generate Plan'}
                        </Button>
                    </div>
                )}
            </form>
        </Card>
    );
}
