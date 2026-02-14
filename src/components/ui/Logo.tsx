import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-primary", className)}
        >
            <path
                d="M6 4C6 2.89543 6.89543 2 8 2H10C11.1046 2 12 2.89543 12 4V12.1716L22.5858 2.58579C23.3668 1.80474 24.6332 1.80474 25.4142 2.58579L26.8284 4C27.6095 4.78105 27.6095 6.04738 26.8284 6.82843L18.8284 14.8284C18.0474 15.6095 18.0474 16.8758 18.8284 17.6569L26.8284 25.6569C27.6095 26.4379 27.6095 27.7042 26.8284 28.4853L25.4142 29.9999C24.6332 30.781 23.3668 30.781 22.5858 29.9999L12 20.3137V28C12 29.1046 11.1046 30 10 30H8C6.89543 30 6 29.1046 6 28V4Z"
                fill="currentColor"
            />
        </svg>
    );
}
