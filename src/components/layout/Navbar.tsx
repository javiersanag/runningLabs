"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bot, Settings, LayoutDashboard, Footprints, Layers, Menu, X, Calendar, BarChart3, Upload, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { logoutUser } from "@/app/actions/auth";
import { Tooltip } from "@/components/ui/Tooltip";
import { Logo } from "@/components/ui/Logo";
import { useTheme } from "next-themes";

const items = [
    { label: "Feed", href: "/feed", icon: Layers },
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Activities", href: "/activities", icon: Activity },
    { label: "Training", href: "/training", icon: Calendar },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Gear", href: "/gear", icon: Footprints },
    { label: "Coach", href: "/coach", icon: Bot },
];

export function Navbar({ athlete }: { athlete: any }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const { firstName, lastName } = athlete || {};
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Athlete";
    const initials = (firstName?.[0] || "") + (lastName?.[0] || "") || "RL";

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown when path changes
    useEffect(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 z-50 px-4 md:px-8 flex items-center justify-between transition-colors duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                    <Logo size={28} className="text-primary" />
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight hidden sm:block">
                        Khronos
                    </h1>
                </Link>
                <div className="hidden md:block h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
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
                                    : "text-neutral-500 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                        >
                            <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Right Side: Profile Dropdown & Actions */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-full text-neutral-500 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>
                )}

                <Link href="/upload" className="hidden md:block">
                    <Button variant="primary" className="h-9 px-4 text-xs gap-2 shadow-blue-200/50 hover:shadow-blue-300">
                        <Upload size={14} />
                        Upload
                    </Button>
                </Link>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                        aria-label="User menu"
                        className="flex items-center gap-3 pl-4 border-l border-neutral-100 dark:border-neutral-800 hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-foreground leading-none">{fullName}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-200">
                            {initials}
                        </div>
                    </button>

                    {/* Desktop Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                            <div className="px-4 py-2 border-b border-neutral-50 md:hidden">
                                <p className="text-sm font-bold text-foreground">{fullName}</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Free Plan</p>
                            </div>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-600 hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Settings size={16} />
                                Settings
                            </Link>
                            <button
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                                onClick={async () => {
                                    await logoutUser();
                                }}
                            >
                                <X size={16} />
                                Logout
                            </button>

                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <Tooltip content={isMobileMenuOpen ? "Close menu" : "Open menu"} position="bottom">
                    <button
                        className="md:hidden text-neutral-500 p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </Tooltip>
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
