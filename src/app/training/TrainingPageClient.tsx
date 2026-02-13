"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Target, Trophy, Sparkles, MapPin, Zap, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { GoalManager } from "@/components/training/GoalManager";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";
import { PredictionCard } from "@/components/training/PredictionCard";
import { generatePlanAction } from "@/app/actions/goals";

export function TrainingPageClient({ initialGoals, activePlan, latestActiveGoal }: { initialGoals: any[], activePlan: any, latestActiveGoal: any }) {
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePlan = async (goalId: string) => {
        setIsGenerating(true);
        const result = await generatePlanAction(goalId);
        setIsGenerating(false);
        if (!result.success) {
            alert(result.error);
        } else {
            window.location.reload(); // Refresh to show new plan
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Training & Goals</h1>
                    <p className="text-neutral-500 font-medium leading-relaxed">Plan your season, set objectives, and track your progress.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <CalendarIcon size={16} className="mr-2" />
                        Race Calendar
                    </Button>
                    <Button onClick={() => setIsAddingGoal(!isAddingGoal)} variant={isAddingGoal ? "secondary" : "primary"}>
                        {isAddingGoal ? "Back to Dashboard" : (
                            <>
                                <Target size={16} className="mr-2" />
                                Set a Goal
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {isAddingGoal ? (
                <div className="max-w-2xl mx-auto py-8">
                    <GoalManager />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Active Plan & Calendar */}
                    <div className="lg:col-span-2 space-y-8">
                        {activePlan ? (
                            <TrainingCalendar plan={activePlan} />
                        ) : (
                            <Card padding="normal" className="min-h-[500px] flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-100">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                                    <Sparkles size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Generate Your First Plan</h3>
                                <p className="text-neutral-500 max-w-sm mb-8 font-medium">
                                    Select an active goal to build a customized, AI-driven 8-week training progression.
                                </p>

                                {latestActiveGoal ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Goal: {latestActiveGoal.name}</p>
                                        <Button onClick={() => handleGeneratePlan(latestActiveGoal.id)} disabled={isGenerating}>
                                            {isGenerating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Zap size={18} className="mr-2" />}
                                            Generate Plan for this Goal
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setIsAddingGoal(true)}>
                                        <Target size={18} className="mr-2" />
                                        Set a Goal to Start
                                    </Button>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right: Goals & Predictions */}
                    <div className="space-y-8">
                        {/* Performance Predictions */}
                        <PredictionCard goal={latestActiveGoal} />

                        {/* Active Goals */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} className="text-primary" />
                                    Active Goals
                                </h3>
                                <button className="text-[10px] font-black text-primary uppercase" onClick={() => setIsAddingGoal(true)}>+ Add</button>
                            </div>

                            <div className="space-y-4">
                                {initialGoals.length > 0 ? (
                                    initialGoals.map(goal => (
                                        <Card key={goal.id} padding="compact" hoverable className={goal.id === latestActiveGoal?.id ? "border-primary/20 bg-primary/[0.02]" : ""}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-[9px] font-black text-primary uppercase tracking-wider">{goal.type}</p>
                                                        <div className="w-1 h-1 rounded-full bg-neutral-300" />
                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{goal.status}</p>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-foreground leading-tight">{goal.name}</h4>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                                                        {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-foreground">{goal.targetMetric}</div>
                                                    {goal.id !== latestActiveGoal?.id && (
                                                        <button
                                                            className="text-[9px] font-black text-primary uppercase mt-2 hover:underline"
                                                            onClick={() => {/* setActiveGoal logic if needed */ }}
                                                        >
                                                            Make Active
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-xs text-neutral-400 font-medium text-center py-10 border-2 border-dashed border-neutral-100 rounded-[2rem]">
                                        No active goals.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
