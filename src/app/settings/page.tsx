import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { User, Settings, Save, Shield, Activity, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const athlete = await db.query.athletes.findFirst({
        where: (t, { eq }) => eq(t.id, "default_athlete")
    });

    async function updateProfile(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const age = parseInt(formData.get("age") as string);
        const ftp = parseInt(formData.get("ftp") as string);
        const maxHr = parseInt(formData.get("maxHr") as string);
        const weight = parseFloat(formData.get("weight") as string);

        await db.insert(athletes).values({
            id: "default_athlete",
            name: name || "Performance Athlete",
            age,
            ftp,
            maxHr,
            weight
        }).onConflictDoUpdate({
            target: athletes.id,
            set: { name, age, ftp, maxHr, weight }
        });

        revalidatePath("/settings");
        revalidatePath("/");
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Account Settings</h2>
                <p className="text-sm text-neutral-500 font-medium">Configure your physiological profile and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold text-sm transition-all border border-primary/10">
                        <User size={18} />
                        Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-foreground hover:bg-neutral-50 rounded-xl font-bold text-sm transition-all">
                        <Activity size={18} />
                        Training
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-foreground hover:bg-neutral-50 rounded-xl font-bold text-sm transition-all">
                        <Bell size={18} />
                        Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-foreground hover:bg-neutral-50 rounded-xl font-bold text-sm transition-all">
                        <Shield size={18} />
                        Security
                    </button>
                </div>

                <div className="md:col-span-3">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-neutral-100">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Physiological Profile</h3>
                                <p className="text-xs text-neutral-400 font-medium">These values are used for TSS and load calculations.</p>
                            </div>
                        </div>

                        <form action={updateProfile} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Display Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={athlete?.name || "Performance Athlete"}
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Current Age</label>
                                    <input
                                        name="age"
                                        type="number"
                                        defaultValue={athlete?.age || 30}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Weight (kg)</label>
                                    <input
                                        name="weight"
                                        type="number"
                                        step="0.1"
                                        defaultValue={athlete?.weight || 70}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">FTP (Threshold Power)</label>
                                    <input
                                        name="ftp"
                                        type="number"
                                        defaultValue={athlete?.ftp || 250}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Max Heart Rate</label>
                                    <input
                                        name="maxHr"
                                        type="number"
                                        defaultValue={athlete?.maxHr || 190}
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full py-5 flex items-center justify-center gap-2">
                                    <Save size={18} />
                                    Update Profile Data
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
