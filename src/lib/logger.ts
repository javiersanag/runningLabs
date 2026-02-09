/**
 * Lightweight logger abstraction.
 * Replaces raw console.log/error calls in production code.
 * In production, log output goes to the platform's log collector (e.g., Vercel Logs).
 * Can be extended to structured JSON logging or external services.
 */

type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
    /** Informational messages — suppressed in production unless needed */
    info(message: string, meta?: unknown) {
        if (process.env.NODE_ENV !== "production") {
            console.log(formatMessage("info", message, meta));
        }
    },

    /** Warning-level messages */
    warn(message: string, meta?: unknown) {
        console.warn(formatMessage("warn", message, meta));
    },

    /** Error-level messages — always logged */
    error(message: string, meta?: unknown) {
        console.error(formatMessage("error", message, meta));
    },
};
