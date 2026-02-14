import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

interface BadgeProps {
    /** Badge label text */
    children: ReactNode;
    /** Visual variant */
    variant?: BadgeVariant;
    /** Additional CSS classes */
    className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
    default: "bg-neutral-100 text-neutral-600",
    primary: "bg-primary/10 text-primary",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
};

/**
 * Standardized Badge/Tag component.
 * Replaces ad-hoc pill styling throughout the codebase.
 */
export function Badge({ children, variant = "default", className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                variantMap[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
