"use client";

import dynamic from "next/dynamic";

const ActivityMapInner = dynamic(() => import("./ActivityMapInner"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-neutral-50 animate-pulse rounded-2xl border border-neutral-100 flex items-center justify-center">
            <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Loading Map...</p>
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
