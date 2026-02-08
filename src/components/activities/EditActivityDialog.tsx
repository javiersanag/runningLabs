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
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-foreground rounded-xl transition-all duration-300 font-bold border border-neutral-100 hover:border-neutral-300"
            >
                <Settings size={18} />
                <span className="text-sm">Manage Activity</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
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
                                        <Settings size={28} />
                                    </div>
                                    Settings
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 hover:bg-neutral-100 rounded-full text-neutral-300 hover:text-neutral-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Name Input */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        <Type size={14} />
                                        Activity Identifier
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 text-foreground font-bold placeholder:text-neutral-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-inner"
                                        placeholder="Morning Run..."
                                    />
                                </div>

                                {/* Gear Select */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                        <Footprints size={14} />
                                        Equipment Tracking
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={gearId}
                                            onChange={(e) => setGearId(e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-4 text-foreground font-bold appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm shadow-inner"
                                        >
                                            <option value="">No Gear Assigned</option>
                                            {allGear.map((g) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.name} ({g.brand})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300 group-focus-within:text-primary transition-colors">
                                            <Footprints size={20} />
                                        </div>
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
                                    Discard
                                </button>

                                <div className="flex gap-4">
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
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
