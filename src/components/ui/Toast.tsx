"use client";

import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access the toast notification system.
 * Must be used within a ToastProvider.
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

/**
 * Provider component that enables toast notifications throughout the app.
 * Wrap your layout with this component.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <ToastItem key={t.id} data={t} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const iconMap: Record<ToastType, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styleMap: Record<ToastType, string> = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconColorMap: Record<ToastType, string> = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
};

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(data.id), 300);
        }, data.duration || 4000);
        return () => clearTimeout(timer);
    }, [data.id, data.duration, onDismiss]);

    const Icon = iconMap[data.type];

    return (
        <div
            role="alert"
            aria-live="polite"
            className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[320px] max-w-[420px] font-medium text-sm transition-all duration-300",
                styleMap[data.type],
                isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0 animate-in slide-in-from-right-5"
            )}
        >
            <Icon size={18} className={cn("shrink-0", iconColorMap[data.type])} />
            <span className="flex-1">{data.message}</span>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onDismiss(data.id), 300);
                }}
                className="shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </div>
    );
}
