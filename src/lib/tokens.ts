/**
 * Design tokens for the Khronos design system.
 * Centralizes spacing, typography, and color values
 * to prevent ad-hoc magic numbers across the codebase.
 */

/** 8pt baseline grid spacing scale */
export const spacing = {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
} as const;

/** Typography scale — standardized heading sizes */
export const typography = {
    /** Page-level heading (h1) */
    pageTitle: "text-3xl font-bold tracking-tight",
    /** Section heading (h2) */
    sectionTitle: "text-xl font-bold",
    /** Card/widget heading (h3) */
    cardTitle: "text-sm font-bold text-neutral-400 uppercase tracking-widest",
    /** KPI / metric value */
    metricValue: "text-3xl font-black",
    /** Body text */
    body: "text-sm font-medium",
    /** Caption / sublabel */
    caption: "text-xs font-medium text-neutral-500",
    /** Micro label (used sparingly) */
    micro: "text-[10px] font-bold text-neutral-400 uppercase tracking-widest",
} as const;

/** Semantic color class names */
export const colors = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    muted: "text-neutral-500",
    subtle: "text-neutral-400",
} as const;

/** Standard border radius values */
export const radii = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
} as const;
