import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { revalidatePath } from "next/cache";

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
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
                <p className="text-white/50">Configure your physiological profile</p>
            </div>

            <div className="max-w-xl">
                <div className="glass-card">
                    <h3 className="text-lg font-bold text-white mb-6">Athlete Profile</h3>
                    <form action={updateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Display Name</label>
                            <input
                                name="name"
                                type="text"
                                defaultValue={athlete?.name || "Performance Athlete"}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Age</label>
                                <input
                                    name="age"
                                    type="number"
                                    defaultValue={athlete?.age || 30}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Weight (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    defaultValue={athlete?.weight || 70}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">FTP (Watts)</label>
                                <input
                                    name="ftp"
                                    type="number"
                                    defaultValue={athlete?.ftp || 250}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Max Heart Rate</label>
                                <input
                                    name="maxHr"
                                    type="number"
                                    defaultValue={athlete?.maxHr || 190}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
