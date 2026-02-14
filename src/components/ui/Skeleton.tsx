import { cn } from "@/lib/utils";

interface SkeletonProps {
    /** Width class (e.g., "w-24", "w-full") */
    width?: string;
    /** Height class (e.g., "h-4", "h-8") */
    height?: string;
    /** Whether to render as a circle */
    circle?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Skeleton loading placeholder.
 * Provides a shimmer animation to indicate content is loading.
 */
export function Skeleton({ width = "w-full", height = "h-4", circle = false, className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-neutral-100",
                circle ? "rounded-full" : "rounded-lg",
                width,
                height,
                className
            )}
            aria-hidden="true"
        />
    );
}

/**
 * Pre-composed skeleton for a metric card placeholder.
 */
export function MetricCardSkeleton() {
    return (
        <div className="bg-card border border-card-border rounded-xl p-3 space-y-2 min-w-[140px]">
            <Skeleton width="w-16" height="h-3" />
            <Skeleton width="w-20" height="h-7" />
            <Skeleton width="w-10" height="h-3" />
        </div>
    );
}

/**
 * Pre-composed skeleton for a generic card placeholder.
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-3">
            <Skeleton width="w-1/3" height="h-5" />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} width={i === lines - 1 ? "w-2/3" : "w-full"} height="h-4" />
            ))}
        </div>
    );
}
