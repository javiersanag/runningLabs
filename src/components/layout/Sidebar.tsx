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
        <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-neutral-100 flex flex-col p-4 z-50">
            <div className="mb-8 px-4 py-2">
                <Link href="/">
                    <h1 className="text-2xl font-bold text-primary tracking-tight">
                        RunningLabs
                    </h1>
                </Link>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1">Performance Beta</p>
            </div>

            <nav className="flex-1 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-neutral-500 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-neutral-100 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{athlete?.name || "New Athlete"}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">{athlete?.age ? `${athlete.age} yrs` : 'Profile Incomplete'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
