"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { ReactNode } from "react";

/**
 * Client-side providers wrapper.
 * Wraps the app with all client-side context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}
