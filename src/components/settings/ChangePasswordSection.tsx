"use client";

import { useState } from "react";
import { Lock, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { changePassword } from "@/app/actions/auth";

export function ChangePasswordSection() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    async function handleSubmit(formData: FormData) {
        setStatus("loading");
        setMessage("");
        setFieldErrors({});

        const result = await changePassword(formData);

        if (result.success) {
            setStatus("success");
            setMessage("Password changed successfully.");
            // Reset form
            const form = document.getElementById("change-password-form") as HTMLFormElement;
            form.reset();
        } else {
            setStatus("error");
            if (result.errors) {
                setFieldErrors(result.errors);
            } else {
                setMessage(result.error || "An unexpected error occurred.");
            }
        }
    }

    return (
        <Card className="p-8 mt-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Lock size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                    <p className="text-xs text-neutral-400 font-medium">Keep your account secure by updating your password periodically.</p>
                </div>
            </div>

            <form id="change-password-form" action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Current Password</label>
                    <input
                        name="currentPassword"
                        type="password"
                        required
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                        placeholder="••••••••"
                    />
                    {fieldErrors.currentPassword && (
                        <p className="text-xs text-red-500 font-bold ml-1">{fieldErrors.currentPassword[0]}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">New Password</label>
                        <input
                            name="newPassword"
                            type="password"
                            required
                            className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                        {fieldErrors.newPassword && (
                            <p className="text-xs text-red-500 font-bold ml-1">{fieldErrors.newPassword[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1">Confirm New Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="text-xs text-red-500 font-bold ml-1">{fieldErrors.confirmPassword[0]}</p>
                        )}
                    </div>
                </div>

                {status === "success" && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                        <CheckCircle size={18} />
                        <span className="text-sm font-bold">{message}</span>
                    </div>
                )}

                {status === "error" && message && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">{message}</span>
                    </div>
                )}

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-5 flex items-center justify-center gap-2"
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Change Password
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
