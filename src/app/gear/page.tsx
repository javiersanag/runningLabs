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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Gear Tracking</h2>
                    <p className="text-white/40 text-sm">Manage your equipment and monitor usage</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {gearStats.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                            <Footprints className="mx-auto text-white/10 mb-4" size={48} />
                            <p className="text-white/30">No gear added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {gearStats.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                                            {item.type === "Ride" ? <Bike size={16} /> : <Footprints size={16} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                            <p className="text-xs text-white/40">{item.brand} {item.model}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{(item.realDistance / 1000).toFixed(1)} km</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white/[0.02] rounded-xl p-5 h-fit sticky top-8">
                    <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                        <Plus size={14} className="text-primary" />
                        Add New Gear
                    </h3>
                    <form action={addGear} className="space-y-3">
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Type</label>
                            <select name="type" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none mt-1">
                                <option value="Run" className="bg-background">Running Shoes</option>
                                <option value="Ride" className="bg-background">Bike</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Name</label>
                            <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Brand</label>
                            <input name="brand" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Model</label>
                            <input name="model" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none mt-1" />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-primary text-black font-bold rounded-lg text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] transition mt-2">
                            Add Gear
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
