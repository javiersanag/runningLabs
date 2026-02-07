"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

interface ACWRChartProps {
    data: any[];
}

export function ACWRChart({ data }: ACWRChartProps) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="date"
                        hide
                    />
                    <YAxis
                        domain={[0, 2]}
                        stroke="#ffffff40"
                        fontSize={10}
                        tickFormatter={(v) => v.toFixed(1)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(13, 13, 13, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                        }}
                        itemStyle={{ fontSize: '12px', color: '#00e5ff' }}
                        labelStyle={{ fontSize: '10px', color: '#ffffff50' }}
                    />

                    {/* Optimal Zones */}
                    <ReferenceLine y={0.8} stroke="#ffffff20" strokeDasharray="3 3" label={{ position: 'right', value: 'Low', fill: '#ffffff30', fontSize: 10 }} />
                    <ReferenceLine y={1.3} stroke="#ffffff20" strokeDasharray="3 3" label={{ position: 'right', value: 'High', fill: '#ffffff30', fontSize: 10 }} />

                    <Line
                        type="monotone"
                        dataKey="acwr"
                        name="ACWR"
                        stroke="#00e5ff"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#00e5ff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
