"use client";

import { useState } from "react";
import { X, Trash2, Check, Target, Type, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateGoalAction, deleteGoalAction } from "@/app/actions/goals";
import { cn } from "@/lib/utils";

interface EditGoalDialogProps {
    goal: {
        id: string;
        name: string;
        type: string;
        targetMetric: string | null;
        targetValue: number | null;
    };
    isOpen: boolean;
    onClose: () => void;
}

/**
 * A premium edit dialog for goal details.
 */
export function EditGoalDialog({ goal, isOpen, onClose }: EditGoalDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [name, setName] = useState(goal.name);
    const [targetMetric, setTargetMetric] = useState(goal.targetMetric || "");
    const [targetValue, setTargetValue] = useState(goal.targetValue?.toString() || "");

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateGoalAction(goal.id, {
                name,
                targetMetric,
                targetValue: parseFloat(targetValue) || 0
            });
            if (result.success) {
                onClose();
            } else {
                alert("Failed to update goal");
            }
        } catch (error) {
            console.error("Failed to update goal", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this goal? This will also remove any associated training plans.")) {
            setIsDeleting(true);
            try {
                const result = await deleteGoalAction(goal.id);
                if (result.success) {
                    onClose();
                } else {
                    alert("Failed to delete goal");
                }
            } catch (error) {
                console.error("Failed to delete goal", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-2xl shadow-neutral-900/20"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                                    <Target size={28} />
                                </div>
                                Manage Goal
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-neutral-100 rounded-full text-neutral-300 hover:text-neutral-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Goal Name */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                    <Type size={14} />
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 text-foreground font-bold placeholder:text-neutral-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-inner"
                                    placeholder="Spring Marathon..."
                                />
                            </div>

                            {/* Pace Goal */}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        <Trophy size={14} />
                                        Pace Goal
                                    </label>
                                    <input
                                        type="text"
                                        value={targetMetric}
                                        onChange={(e) => setTargetMetric(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-inner"
                                        placeholder="e.g. Sub 20:00"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        <Target size={14} />
                                        Target Value (Optional km/h or Numeric)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={targetValue}
                                        onChange={(e) => setTargetValue(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-inner"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-100">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2.5 px-5 py-3 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-red-100"
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                Delete Goal
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all text-[11px] disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check size={18} />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
