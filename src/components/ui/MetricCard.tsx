import { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: ReactNode;
    icon?: string;
    className?: string;
    primary?: boolean;
    compact?: boolean;
}

/**
 * MetricCard for displaying athletic KPIs.
 * Follows the visual hierarchy: KPI title -> large value -> context indicator.
 */
export function MetricCard({
    label,
    value,
    unit,
    trend,
    icon,
    className,
    primary = false,
    compact = false
}: MetricCardProps) {
    return (
        <Card
            className={cn("flex flex-col gap-0.5 min-w-[120px]", className)}
            hoverable
            padding={compact ? "compact" : "normal"}
        >
            <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={cn(
                    "font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5",
                    compact ? "text-[10px]" : "text-xs"
                )}>
                    {icon && <span>{icon}</span>}
                    {label}
                </span>
                {trend}
            </div>
            <div className="flex items-baseline gap-1">
                <span className={cn(
                    "font-bold tracking-tight",
                    compact ? "text-xl" : "text-3xl",
                    primary ? "text-primary" : "text-foreground"
                )}>
                    {value}
                </span>
                {unit && (
                    <span className={cn(
                        "font-bold text-neutral-300",
                        compact ? "text-[10px]" : "text-sm"
                    )}>
                        {unit}
                    </span>
                )}
            </div>
        </Card>
    );
}
