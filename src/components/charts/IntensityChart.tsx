"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface IntensityChartProps {
    data: { name: string, value: number, color: string }[];
}

export function IntensityChart({ data }: IntensityChartProps) {
    const total = data.reduce((acc, d) => acc + d.value, 0);

    return (
        <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#e5e5e5"
                        fontSize={10}
                        width={40}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#888888', fontWeight: 600 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        dataKey="name"
                        type="category"
                        tickFormatter={(name) => {
                            const item = data.find(d => d.name === name);
                            return item && total > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%";
                        }}
                        stroke="#e5e5e5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                        tick={{ fill: '#888888', fontWeight: 800 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #f0f0f0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#111' }}
                        labelStyle={{ fontSize: '10px', color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}
                        formatter={(value: number | undefined) => [
                            value ? `${Math.round(value / 60)} min (${total > 0 ? Math.round((value / total) * 100) : 0}%)` : "0 min (0%)",
                            "Duration"
                        ]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
