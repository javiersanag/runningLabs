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
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: -10, right: 40, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#ffffff40"
                        fontSize={12}
                        width={40}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: "rgba(13, 13, 13, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                        }}
                        itemStyle={{ fontSize: '12px', color: '#fff' }}
                        formatter={(value: number | undefined) => [
                            value ? `${Math.round(value / 60)} min (${total > 0 ? Math.round((value / total) * 100) : 0}%)` : "0 min (0%)",
                            "Duration"
                        ]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Legend with percentages */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
                {data.map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-white/40 text-right h-[20px] flex items-center justify-end"
                        style={{ height: '24px' }} /* Match bar height/spacing roughly */
                    >
                        {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                    </div>
                ))}
            </div>
        </div>
    );
}
