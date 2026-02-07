"use client";

import { useState } from "react";
import { Settings, X, Trash2, Check, Footprints, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateActivity, deleteActivity } from "@/app/actions/activities";

interface Gear {
    id: string;
    name: string;
    brand: string | null;
}

interface EditActivityDialogProps {
    activity: {
        id: string;
        name: string;
        gearId: string | null;
    };
    allGear: Gear[];
}

/**
 * A premium edit dialog for activity details.
 */
export function EditActivityDialog({ activity, allGear }: EditActivityDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [name, setName] = useState(activity.name);
    const [gearId, setGearId] = useState(activity.gearId || "");

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateActivity(activity.id, {
                name,
                gearId: gearId === "" ? null : gearId
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update activity", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this activity? This cannot be undone.")) {
            setIsDeleting(true);
            try {
                await deleteActivity(activity.id);
            } catch (error) {
                console.error("Failed to delete activity", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all duration-300 border border-white/5 hover:border-white/20"
            >
                <Settings size={16} />
                <span className="text-sm font-medium">Edit Activity</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                        <Settings size={18} />
                                    </div>
                                    Edit Activity
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Type size={12} />
                                        Activity Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition"
                                        placeholder="Morning Run..."
                                    />
                                </div>

                                {/* Gear Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Footprints size={12} />
                                        Gear Used
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={gearId}
                                            onChange={(e) => setGearId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50 transition"
                                        >
                                            <option value="" className="bg-background">No Gear Assigned</option>
                                            {allGear.map((g) => (
                                                <option key={g.id} value={g.id} className="bg-background">
                                                    {g.name} ({g.brand})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                            <Footprints size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-10">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-lg transition font-medium text-sm"
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    Delete
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-6 py-2 text-sm font-medium text-white/40 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition text-sm disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
