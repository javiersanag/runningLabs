"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
    /** Page title — rendered as h1 */
    title: string;
    /** Optional subtitle text */
    subtitle?: string;
    /** Optional action buttons (right-aligned) */
    actions?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Standardized page header component.
 * Enforces a consistent h1 → subtitle → actions layout across all routes.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-8", className)}>
            <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-neutral-500 font-medium text-sm mt-1">{subtitle}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
