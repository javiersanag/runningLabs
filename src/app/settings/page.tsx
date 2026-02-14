import { db } from "@/lib/db";
import { athletes } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { Shield, Bell, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const athlete = await getCurrentUser();
    if (!athlete) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PageHeader
                title="Settings"
                subtitle="Manage your account security and application preferences."
                className="mb-0"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold text-sm transition-all border border-primary/10">
                        <Shield size={18} />
                        Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-foreground hover:bg-neutral-50 rounded-xl font-bold text-sm transition-all">
                        <Bell size={18} />
                        Notifications
                    </button>
                </div>

                <div className="md:col-span-3 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-neutral-100">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Key size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Account Access</h3>
                                <p className="text-xs text-neutral-400 font-medium">Update your password or manage your primary email.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Email Address</label>
                                <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-xl">
                                    <span className="text-foreground font-medium">{athlete.email}</span>
                                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200 px-2 py-1 rounded uppercase tracking-wider">Primary</span>
                                </div>
                                <p className="text-xs text-neutral-400 ml-1">To change your email, please contact support.</p>
                            </div>

                            <ChangePasswordSection />
                        </div>
                    </Card>

                    <Card className="p-8 border-red-100 bg-red-50/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Danger Zone</h3>
                                <p className="text-xs text-neutral-400 font-medium">Permanently delete your account and all data.</p>
                            </div>
                        </div>
                        <DeleteAccountSection />
                    </Card>
                </div>
            </div>
        </div>
    );
}
