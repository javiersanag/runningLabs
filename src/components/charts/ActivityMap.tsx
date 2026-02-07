"use client";

import dynamic from "next/dynamic";

const ActivityMapInner = dynamic(() => import("./ActivityMapInner"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center">
            <p className="text-white/20 text-sm">Loading Map...</p>
        </div>
    )
});

interface Sample {
    lat: number | null;
    lng: number | null;
    [key: string]: any;
}

export default function ActivityMap({ samples }: { samples: Sample[] }) {
    return <ActivityMapInner samples={samples} />;
}
