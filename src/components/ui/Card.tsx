import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
}

/**
 * Premium Card component following the design style guide.
 * Clean background, subtle shadow, and mild border radius.
 */
export function Card({ children, className, hoverable = false }: CardProps) {
    return (
        <div
            className={cn(
                "bg-card border border-card-border rounded-xl p-6 shadow-premium transition-all duration-300",
                hoverable && "hover:shadow-lg hover:border-primary/20",
                className
            )}
        >
            {children}
        </div>
    );
}
