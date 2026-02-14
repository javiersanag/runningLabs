import { db } from "@/lib/db";
import { gear, activities } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Footprints, Bike, Plus, Trash2, ChevronRight } from "lucide-react";
import { randomUUID } from "crypto";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function GearPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const allGearRaw = await db.query.gear.findMany({
        where: (t, { eq }) => eq(t.athleteId, user.id)
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
        const sessionUser = await getCurrentUser();
        if (!sessionUser) return;

        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const brand = formData.get("brand") as string;
        const model = formData.get("model") as string;

        await db.insert(gear).values({
            id: randomUUID(),
            athleteId: sessionUser.id,
            name,
            type,
            brand,
            model,
            totalDistance: 0
        });

        revalidatePath("/gear");
    }

    return (
        <div className="max-w-5xl mx-auto">
            <PageHeader
                title="Gear Tracking"
                subtitle="Monitor equipment mileage and performance stats."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {gearStats.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-neutral-100 p-16 text-center bg-neutral-50/50">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                <Footprints size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No Gear Tracked</h3>
                            <p className="text-neutral-500 max-w-xs mx-auto mb-0 font-medium">Add your first pair of shoes or bike to start tracking metrics.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {gearStats.map((item) => (
                                <Card key={item.id} className="group hover:border-primary/20 transition-all p-5 hover-lift">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                {item.type === "Ride" ? <Bike size={24} /> : <Footprints size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-lg mb-0.5">{item.name}</h4>
                                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{item.brand} {item.model}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <span className="block text-2xl font-black text-foreground">{(item.realDistance / 1000).toFixed(0)}</span>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">KILOMETERS</span>
                                            </div>
                                            <ChevronRight size={20} className="text-neutral-200 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <Card className="sticky top-8">
                        <h3 className="font-bold text-foreground mb-6 text-sm flex items-center gap-2 uppercase tracking-widest">
                            <Plus size={14} className="text-primary" />
                            Add Equipment
                        </h3>
                        <form action={addGear} className="space-y-5">
                            <div>
                                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block">Category</label>
                                <select name="type" className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary/30 transition-colors appearance-none">
                                    <option value="Run">Running Shoes</option>
                                    <option value="Ride">Bike / Cycling</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block">Nickname</label>
                                <input name="name" placeholder="e.g. My Racing Flats" required className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary/30 transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block">Brand</label>
                                    <input name="brand" placeholder="Nike" className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary/30 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block">Model</label>
                                    <input name="model" placeholder="Vaporfly" className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-foreground text-sm outline-none focus:border-primary/30 transition-colors" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-4 mt-2">
                                Register Gear
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
