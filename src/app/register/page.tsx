"use client";

import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterPage() {
    async function handleSubmit(formData: FormData) {
        const result = await registerUser(formData);
        if (result?.error) {
            alert(result.error);
        } else if (result?.errors) {
            // Zod errors
            const messages = Object.values(result.errors).flat().join("\n");
            alert(messages);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-neutral-500">Join the performance lab</p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold block ml-1 mb-2">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

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
                                autoComplete="new-password"
                                required
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-foreground font-medium focus:border-primary/30 outline-none transition-all shadow-sm"
                                placeholder="Min 8 chars, 1 upper, 1 number"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-6 text-base">
                        Register
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-neutral-500">Already have an account? </span>
                    <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
