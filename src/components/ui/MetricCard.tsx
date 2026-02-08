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
    primary = false
}: MetricCardProps) {
    return (
        <Card className={cn("flex flex-col gap-1 min-w-[160px]", className)} hoverable>
            <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    {icon && <span>{icon}</span>}
                    {label}
                </span>
                {trend}
            </div>
            <div className="flex items-baseline gap-1">
                <span className={cn(
                    "text-3xl font-bold tracking-tight",
                    primary ? "text-primary" : "text-foreground"
                )}>
                    {value}
                </span>
                {unit && (
                    <span className="text-sm font-bold text-neutral-300">
                        {unit}
                    </span>
                )}
            </div>
        </Card>
    );
}
