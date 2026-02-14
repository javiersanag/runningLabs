"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useState, useRef, useEffect, useCallback } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
    /** The content to display inside the tooltip */
    content: string;
    /** The element that triggers the tooltip */
    children: ReactNode;
    /** Position relative to the trigger element */
    position?: TooltipPosition;
    /** Delay before showing (ms) */
    delay?: number;
    /** Additional CSS classes for the wrapper */
    className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles: Record<TooltipPosition, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-900 border-y-transparent border-l-transparent",
};

/**
 * General-purpose Tooltip that wraps any interactive element.
 * Triggers on hover and focus for full accessibility.
 * Uses CSS transforms for positioning and supports 4 directions.
 */
export function Tooltip({ content, children, position = "top", delay = 200, className }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback(() => {
        timeoutRef.current = setTimeout(() => setVisible(true), delay);
    }, [delay]);

    const hide = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setVisible(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div
            className={cn("relative inline-flex", className)}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {visible && (
                <div
                    role="tooltip"
                    className={cn(
                        "absolute z-50 px-3 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-lg shadow-xl border border-neutral-800 whitespace-nowrap pointer-events-none",
                        "animate-in fade-in zoom-in-95 duration-150",
                        positionStyles[position]
                    )}
                >
                    {content}
                    <div className={cn("absolute border-4", arrowStyles[position])} />
                </div>
            )}
        </div>
    );
}
