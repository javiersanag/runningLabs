"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Layers, Calendar, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom tab bar configuration.
 * Limited to 5 items for optimal thumb-zone usability.
 */
const tabs = [
    { label: "Feed", href: "/feed", icon: Layers },
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Activities", href: "/activities", icon: Activity },
    { label: "Training", href: "/training", icon: Calendar },
    { label: "Coach", href: "/coach", icon: Bot },
];

/**
 * Fixed bottom navigation bar for mobile viewports.
 * Provides single-tap access to the 5 most critical routes.
 * Hidden on md+ breakpoints where the top Navbar is visible.
 */
export function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-neutral-100 md:hidden"
            aria-label="Mobile navigation"
        >
            <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-neutral-400 active:text-primary active:scale-95"
                            )}
                        >
                            <tab.icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 1.8}
                                className={cn(
                                    "transition-transform duration-200",
                                    isActive && "scale-110"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider transition-colors",
                                    isActive ? "text-primary" : "text-neutral-400"
                                )}
                            >
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
            {/* Safe area for iPhone notch */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}
