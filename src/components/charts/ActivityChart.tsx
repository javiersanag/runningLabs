"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

interface ActivityChartProps {
    samples: any[];
}

export function ActivityChart({ samples }: ActivityChartProps) {
    if (!samples || samples.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white/20">
                No telemetry data available for this activity.
            </div>
        );
    }

    // Process samples for display
    const data = samples.map((s, i) => {
        // Convert speed (m/s) to pace (min/km)
        const pace = s.speed > 0 ? 1000 / (s.speed * 60) : null;
        return {
            index: i,
            hr: s.heartRate,
            altitude: s.altitude,
            pace: pace && pace < 15 ? pace : null, // Filter crazy outliers
            power: s.power,
            distance: s.distance
        };
    });

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="distance"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(val) => `${(val / 1000).toFixed(1)}km`}
                        stroke="#ffffff40"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />

                    {/* HR Axis */}
                    <YAxis yAxisId="hr" domain={['dataMin - 10', 'dataMax + 10']} hide />
                    {/* Pace Axis (Reversed) */}
                    <YAxis yAxisId="pace" domain={[3, 10]} orientation="right" hide reversed />
                    {/* Altitude Axis */}
                    <YAxis yAxisId="alt" domain={['dataMin - 5', 'dataMax + 5']} hide />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(13, 13, 13, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px' }}
                        labelFormatter={(val) => `Distance: ${(val / 1000).toFixed(2)} km`}
                        formatter={(value: any, name: string | undefined) => {
                            if (name === "hr") return [`${Math.round(value)} bpm`, "Heart Rate"];
                            if (name === "alt") return [`${Math.round(value)} m`, "Elevation"];
                            if (name === "pace") {
                                const mins = Math.floor(value);
                                const secs = Math.floor((value - mins) * 60);
                                return [`${mins}:${secs.toString().padStart(2, '0')} /km`, "Pace"];
                            }
                            return [value, name || "Value"];
                        }}
                    />

                    {/* Elevation Background */}
                    <Area
                        yAxisId="alt"
                        type="monotone"
                        dataKey="altitude"
                        name="alt"
                        stroke="#ffffff20"
                        fillOpacity={1}
                        fill="url(#colorAlt)"
                    />

                    {/* Heart Rate */}
                    <Line
                        yAxisId="hr"
                        type="monotone"
                        dataKey="hr"
                        name="hr"
                        stroke="#ff4d4d"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#ff4d4d' }}
                    />

                    {/* Pace */}
                    <Line
                        yAxisId="pace"
                        type="monotone"
                        dataKey="pace"
                        name="pace"
                        stroke="#00e5ff"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#00e5ff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
