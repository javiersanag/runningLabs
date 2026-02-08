import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    padding?: "none" | "compact" | "normal" | string;
}

/**
 * Premium Card component following the design style guide.
 * Clean background, subtle shadow, and mild border radius.
 */
export function Card({ children, className, hoverable = false, padding = "normal" }: CardProps) {
    const paddingMap: Record<string, string> = {
        none: "p-0",
        compact: "p-1",
        normal: "p-6",
    };

    const paddingClass = paddingMap[padding] || padding;

    return (
        <div
            className={cn(
                "bg-card border border-card-border rounded-xl shadow-premium transition-all duration-300",
                paddingClass,
                hoverable && "hover:shadow-lg hover:border-primary/20",
                className
            )}
        >
            {children}
        </div>
    );
}
