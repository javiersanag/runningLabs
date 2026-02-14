import { ToastProvider } from "@/components/ui/Toast";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Client-side providers wrapper.
 * Wraps the app with all client-side context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}
