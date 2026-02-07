"use client";

import { useState } from "react";

interface PerformanceStripProps {
    last7Days: {
        avgDistance: number;
        avgPace: number;
        avgHr: number | null;
    };
    last30Days: {
        avgDistance: number;
        avgPace: number;
        avgHr: number | null;
    };
}

/**
 * Compact performance strip with 7d/30d toggle.
 */
export function PerformanceStrip({ last7Days, last30Days }: PerformanceStripProps) {
    const [period, setPeriod] = useState<'7d' | '30d'>('7d');
    const data = period === '7d' ? last7Days : last30Days;

    const formatPace = (s: number) => {
        if (!s || s === 0) return "-";
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-between py-3 mb-4">
            <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-white/40">📍</span>
                    <span className="text-white font-bold">{(data.avgDistance / 1000).toFixed(1)}</span>
                    <span className="text-white/40 text-xs">km</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/40">⏱</span>
                    <span className="text-white font-bold">{formatPace(data.avgPace)}</span>
                    <span className="text-white/40 text-xs">/km</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/40">❤️</span>
                    <span className="text-white font-bold">{data.avgHr ? Math.round(data.avgHr) : '-'}</span>
                    <span className="text-white/40 text-xs">bpm</span>
                </div>
            </div>

            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                    onClick={() => setPeriod('7d')}
                    className={`px-3 py-1 text-xs font-bold rounded transition ${period === '7d'
                            ? 'bg-primary text-black'
                            : 'text-white/40 hover:text-white'
                        }`}
                >
                    7d
                </button>
                <button
                    onClick={() => setPeriod('30d')}
                    className={`px-3 py-1 text-xs font-bold rounded transition ${period === '30d'
                            ? 'bg-primary text-black'
                            : 'text-white/40 hover:text-white'
                        }`}
                >
                    30d
                </button>
            </div>
        </div>
    );
}
