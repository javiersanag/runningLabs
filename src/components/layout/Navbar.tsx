"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bot, Settings, LayoutDashboard, Footprints, Layers, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const items = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Feed", href: "/feed", icon: Layers },
    { label: "Activities", href: "/activities", icon: Activity },
    { label: "Gear", href: "/gear", icon: Footprints },
    { label: "Coach", href: "/coach", icon: Bot },
];

export function Navbar({ athlete }: { athlete: any }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const initials = athlete?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "RL";

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 z-50 px-4 md:px-8 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                        Khronos
                    </h1>
                </Link>
                <div className="hidden md:block h-6 w-[1px] bg-neutral-200" />
                <p className="hidden md:block text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">Alpha</p>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-neutral-500 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Right Side: Profile & Settings */}
            <div className="flex items-center gap-4">
                <Link href="/settings" className="text-neutral-400 hover:text-primary transition-colors hidden md:block">
                    <Settings size={20} />
                </Link>

                <div className="flex items-center gap-3 pl-4 border-l border-neutral-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-foreground leading-none">{athlete?.name || "Athlete"}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider leading-none mt-1">Free Plan</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-200">
                        {initials}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-neutral-500"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-neutral-100 p-4 flex flex-col gap-2 md:hidden shadow-xl animate-in slide-in-from-top-2">
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-blue-200/50"
                                        : "text-neutral-500 hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-primary hover:bg-primary/5 transition-all duration-200 border-t border-neutral-100 mt-2 pt-4"
                    >
                        <Settings size={20} />
                        Settings
                    </Link>
                </div>
            )}
        </header>
    );
}
