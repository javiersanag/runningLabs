"use client";

import { Info } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
    content: string | ReactNode;
    className?: string;
}

/**
 * A lightweight, CSS-only tooltip for technical metrics.
 * Follows the premium design style guide (energetic yet clean).
 */
export function InfoTooltip({ content, className }: InfoTooltipProps) {
    return (
        <div className={cn("group relative inline-block", className)}>
            <Info size={12} className="text-neutral-300 hover:text-primary transition-colors cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-neutral-800 font-medium leading-relaxed">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
            </div>
        </div>
    );
}
