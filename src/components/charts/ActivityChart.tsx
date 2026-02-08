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
            <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold uppercase tracking-widest text-xs">
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
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="distance"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(val) => `${(val / 1000).toFixed(1)}km`}
                        stroke="#e5e5e5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        tick={{ fill: '#888888', fontWeight: 600 }}
                    />

                    {/* HR Axis */}
                    <YAxis yAxisId="hr" domain={['dataMin - 10', 'dataMax + 10']} hide />
                    {/* Pace Axis (Reversed) */}
                    <YAxis yAxisId="pace" domain={[3, 10]} orientation="right" hide reversed />
                    {/* Altitude Axis */}
                    <YAxis yAxisId="alt" domain={['dataMin - 5', 'dataMax + 5']} hide />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #f0f0f0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                        labelStyle={{ color: '#888888', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
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
                        stroke="#10b981"
                        strokeWidth={1}
                        fillOpacity={1}
                        fill="url(#colorAlt)"
                    />

                    {/* Heart Rate */}
                    <Line
                        yAxisId="hr"
                        type="monotone"
                        dataKey="hr"
                        name="hr"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                    />

                    {/* Pace */}
                    <Line
                        yAxisId="pace"
                        type="monotone"
                        dataKey="pace"
                        name="pace"
                        stroke="#ff6d00"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: '#ff6d00', strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
