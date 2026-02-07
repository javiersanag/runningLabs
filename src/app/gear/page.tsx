import { db } from "@/lib/db";
import { gear, activities } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Footprints, Bike, Plus } from "lucide-react";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export default async function GearPage() {
    const allGearRaw = await db.query.gear.findMany({
        where: (t, { eq }) => eq(t.athleteId, "default_athlete")
    });

    const gearStats = await Promise.all(allGearRaw.map(async (item) => {
        const activityStats = await db.select({
            total: sql<number>`sum(${activities.distance})`
        })
            .from(activities)
            .where(eq(activities.gearId, item.id));

        return {
            ...item,
            realDistance: activityStats[0]?.total || 0
        };
    }));

    async function addGear(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const brand = formData.get("brand") as string;
        const model = formData.get("model") as string;

        await db.insert(gear).values({
            id: randomUUID(),
            athleteId: "default_athlete",
            name,
            type,
            brand,
            model,
            totalDistance: 0
        });

        revalidatePath("/gear");
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Gear Tracking</h2>
                    <p className="text-white/50">Manage your equipment and monitor usage</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {gearStats.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
                            <Footprints className="mx-auto text-white/10 mb-4" size={48} />
                            <p className="text-white/30">No gear added yet.</p>
                        </div>
                    ) : (
                        gearStats.map((item) => (
                            <div key={item.id} className="glass-card flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                        {item.type === "Ride" ? <Bike size={24} /> : <Footprints size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <p className="text-xs text-white/40">{item.brand} {item.model}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-white">{(item.realDistance / 1000).toFixed(1)} km</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Total Distance</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="glass-panel p-6 rounded-2xl h-fit sticky top-8">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus size={18} className="text-primary" />
                        Add New Gear
                    </h3>
                    <form action={addGear} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Type</label>
                            <select name="type" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none">
                                <option value="Run" className="bg-background">Running Shoes</option>
                                <option value="Ride" className="bg-background">Bike</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Name</label>
                            <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Brand</label>
                            <input name="brand" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Model</label>
                            <input name="model" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none" />
                        </div>
                        <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition mt-4">
                            Add Gear
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
