"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/forgot-password";

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await requestPasswordReset(formData);

            if (result.success) {
                setIsSent(true);
            } else {
                setError(result.error || "Something went wrong. Please try again.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                {!isSent ? (
                    <>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">Recover Password</h2>
                            <p className="mt-2 text-sm text-neutral-500">Enter your email to receive a temporary password</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl" role="alert">
                                {error}
                            </div>
                        )}

                        <form action={handleSubmit} className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                        placeholder="athlete@example.com"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-6 text-base" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Request Temporary Password"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary transition-colors">
                                <ArrowLeft size={16} />
                                Back to Sign in
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Request Sent!</h2>
                            <p className="mt-2 text-sm text-neutral-500 max-w-xs mx-auto">
                                If an account exists for that email, we&apos;ve sent a temporary password. Please check your inbox.
                            </p>
                        </div>
                        <Link href="/login" className="block w-full">
                            <Button variant="secondary" className="w-full py-6">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
