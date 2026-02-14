import { db } from "@/lib/db";
import { athletes, dailyMetrics } from "@/lib/schema";
import { User, Save, Mail, Calendar, Weight, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/session";
import { updateProfileAction } from "@/app/actions/profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const athlete = await getCurrentUser();
    if (!athlete) return null;

    // Fetch latest metrics for the visual card
    const latestMetrics = await db.query.dailyMetrics.findFirst({
        where: eq(dailyMetrics.athleteId, athlete.id),
        orderBy: [desc(dailyMetrics.date)]
    });

    const ctl = latestMetrics?.ctl || 0;
    const currentWeight = athlete.weight || null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PageHeader
                title="Your Profile"
                subtitle="Manage your physiological data and personal information to keep your training insights accurate."
                className="mb-0"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 text-center overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30 ring-4 ring-primary/10">
                                {(athlete.firstName?.[0] || "") + (athlete.lastName?.[0] || "")}
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                {athlete.firstName} {athlete.lastName}
                            </h3>
                            <p className="text-sm text-neutral-400 font-medium mb-6">{athlete.email}</p>

                            <div className="grid grid-cols-2 gap-3 text-left">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-[10px] text-primary uppercase tracking-widest font-black mb-1">Fitness</p>
                                    <p className="text-2xl font-black text-primary">{Math.round(ctl)} <span className="text-[10px] font-bold opacity-70">CTL</span></p>
                                </div>
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black mb-1">Weight</p>
                                    <p className="text-2xl font-black text-foreground">{currentWeight || "--"} <span className="text-[10px] font-bold opacity-40">kg</span></p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-bold text-neutral-500 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                                <Mail size={14} />
                            </div>
                            <span className="truncate">{athlete.email}</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-bold text-neutral-500 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                                <Calendar size={14} />
                            </div>
                            <span>Member since {new Date(athlete.createdAt || Date.now()).getFullYear()}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <Card className="lg:col-span-2 p-8 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Physiological Metrics</h3>
                            <p className="text-xs text-neutral-400 font-medium">These parameters define your training zones and stress scores.</p>
                        </div>
                    </div>

                    <form action={updateProfileAction} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    defaultValue={athlete.firstName}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    defaultValue={athlete.lastName || ""}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">Age</label>
                                <div className="relative">
                                    <input
                                        name="age"
                                        type="number"
                                        defaultValue={athlete.age || 30}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 pl-12 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">Weight (kg)</label>
                                <div className="relative">
                                    <input
                                        name="weight"
                                        type="number"
                                        step="0.1"
                                        defaultValue={athlete.weight || 70}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 pl-12 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">FTP (Threshold Power)</label>
                                <div className="relative">
                                    <input
                                        name="ftp"
                                        type="number"
                                        defaultValue={athlete.ftp || 250}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 pl-12 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black block ml-1">Max HR (bpm)</label>
                                <div className="relative">
                                    <input
                                        name="maxHr"
                                        type="number"
                                        defaultValue={athlete.maxHr || 190}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-4 pl-12 text-foreground font-bold focus:border-primary/50 outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary/5"
                                    />
                                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" className="w-full py-6 flex items-center justify-center gap-3 text-base shadow-lg shadow-primary/20">
                                <Save size={20} />
                                Save Profile Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
