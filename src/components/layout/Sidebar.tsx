"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart2, Bot, Settings, LayoutDashboard, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Activities", href: "/activities", icon: Activity },
    { label: "Gear", href: "/gear", icon: Footprints },
    { label: "AI Coach", href: "/coach", icon: Bot },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ athlete }: { athlete: any }) {
    const pathname = usePathname();
    const initials = athlete?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "RL";

    return (
        <div className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 flex flex-col p-4 z-50">
            <div className="mb-8 px-4 py-2">
                <Link href="/">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        RunningLabs
                    </h1>
                </Link>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Beta 1.0</p>
            </div>

            <nav className="flex-1 space-y-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-black font-bold">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{athlete?.name || "New Athlete"}</p>
                        <p className="text-xs text-white/50 truncate">{athlete?.age ? `${athlete.age} yrs` : 'Profile Incomplete'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
