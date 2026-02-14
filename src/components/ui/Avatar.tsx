import { cn } from "@/lib/utils";

interface AvatarProps {
    /** Full name or display name — used to generate initials */
    name?: string;
    /** Optional image URL */
    src?: string;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
}

const sizeMap = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-base",
};

/**
 * Reusable Avatar component.
 * Renders an image if `src` is provided, otherwise displays initials from `name`.
 */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    if (src) {
        return (
            <img
                src={src}
                alt={name || "User avatar"}
                className={cn(
                    "rounded-full object-cover",
                    sizeMap[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200",
                sizeMap[size],
                className
            )}
            aria-label={name || "User avatar"}
        >
            {initials}
        </div>
    );
}
