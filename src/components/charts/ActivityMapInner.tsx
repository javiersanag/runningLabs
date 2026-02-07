"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Sample {
    lat: number | null;
    lng: number | null;
    [key: string]: any;
}

interface ActivityMapProps {
    samples: Sample[];
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    if (bounds) {
        map.fitBounds(bounds, { padding: [20, 20] });
    }
    return null;
}

export default function ActivityMap({ samples }: ActivityMapProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const path = samples
        .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number')
        .map(s => [s.lat!, s.lng!] as [number, number]);

    if (!isClient || path.length === 0) {
        return (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/40">
                <p>No map data available</p>
            </div>
        );
    }

    const bounds = L.latLngBounds(path);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-white/10">
            <MapContainer
                bounds={bounds}
                style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Polyline
                    positions={path}
                    pathOptions={{
                        color: "#00E5FF",
                        weight: 4,
                        opacity: 0.8,
                        lineJoin: "round"
                    }}
                />
                <ChangeView bounds={bounds} />
            </MapContainer>
        </div>
    );
}
