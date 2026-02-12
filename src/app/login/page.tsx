"use client";

import { loginUser } from "@/app/actions/auth";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const initialState = {
    message: "",
};

export default function LoginPage() {
    // Basic form action or useTransition?
    // Since loginUser redirects on success, we just need to handle errors.
    // If loginUser returns { success: false, error: ... }, we can display it.

    // Simple implementation without useActionState for now to avoid complexity if not needed?
    // Actually useActionState is good for handling server action results.
    // But loginUser signature I wrote is `async function loginUser(formData: FormData)`.
    // It returns a promise.

    async function handleSubmit(formData: FormData) {
        const result = await loginUser(formData);
        if (result?.error) {
            alert(result.error); // Simple for MVP. Ideally use state for error message.
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-neutral-500">Sign in to your Khronos account</p>
                </div>

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

                    <Button type="submit" className="w-full py-6 text-base">
                        Sign in
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
