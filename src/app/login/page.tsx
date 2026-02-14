"use client";

import { loginUser } from "@/app/actions/auth";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setIsSubmitting(true);
        const result = await loginUser(formData);
        setIsSubmitting(false);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-neutral-500">Sign in to your Khronos account</p>
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
                                autoComplete="email"
                                required
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                placeholder="athlete@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-6 text-base" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Sign in"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-neutral-500">Don't have an account? </span>
                    <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                        Register now
                    </Link>
                </div>
            </div>
        </div>
    );
}
