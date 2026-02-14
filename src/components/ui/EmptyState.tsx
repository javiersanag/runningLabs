"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    /** Main illustration icon */
    icon: React.ReactNode;
    /** Header text */
    title: string;
    /** Subtitle/body text */
    description: string;
    /** Primary call-to-action props */
    action?: {
        label: string;
        href: string;
    };
    /** Secondary action (optional) */
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Reusable Empty State component for consistently handling zero-data scenarios.
 * Uses a large icon, clear title/description, and prominent call-to-action.
 */
export function EmptyState({ icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-neutral-100 rounded-3xl bg-neutral-50/50 animate-in fade-in zoom-in-95 duration-500",
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-neutral-500 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {action && (
                    <Link href={action.href} className="w-full sm:w-auto">
                        <Button variant="primary" className="w-full sm:w-auto justify-center">
                            {action.label}
                        </Button>
                    </Link>
                )}
                {secondaryAction && (
                    <Button
                        variant="ghost"
                        onClick={secondaryAction.onClick}
                        className="w-full sm:w-auto justify-center"
                    >
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
