import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    children: ReactNode;
}

/**
 * Premium Button component following the design style guide.
 * Primary: Solid Vibrant Blue.
 * Secondary: Outlined/Neutral.
 */
export function Button({ variant = "primary", size = "default", children, className, ...props }: ButtonProps) {
    const variants = {
        primary: "bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:bg-accent active:scale-[0.98]",
        secondary: "bg-white dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-[0.98]",
        ghost: "text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
    };

    const sizes = {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 p-0 items-center justify-center flex",
    };

    return (
        <button
            className={cn(
                "rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none press-scale items-center justify-center inline-flex",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
