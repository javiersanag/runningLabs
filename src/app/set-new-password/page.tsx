"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Loader2, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { setNewPassword } from "@/app/actions/set-new-password";

export default function SetNewPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        const result = await setNewPassword(formData);
        setIsSubmitting(false);

        if (result?.success) {
            router.push("/");
        } else if (result?.errors) {
            setFieldErrors(result.errors as Record<string, string[]>);
        } else if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        You logged in with a temporary password. Please create a new one to continue.
                    </p>
                </div>

                {error && (
                    <div
                        className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 pl-12 pr-12 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.newPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {fieldErrors.newPassword[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 pl-12 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    placeholder="Re-enter your new password"
                                />
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                    {fieldErrors.confirmPassword[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-xs text-neutral-500 space-y-1">
                        <p className="font-bold text-neutral-600 mb-2">Password requirements:</p>
                        <p>• At least 8 characters</p>
                        <p>• At least one uppercase letter</p>
                        <p>• At least one number</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-base"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "Set New Password"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
