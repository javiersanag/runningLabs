"use client";

import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
    date: string;
    ctl: number;
    atl: number;
    tsb: number;
}

interface FitnessChartProps {
    data: DataPoint[];
}

export function FitnessChart({ data }: FitnessChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-neutral-300 text-sm font-bold uppercase tracking-widest">
                No data available. Upload activities to generate chart.
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCtl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAtl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        stroke="#e5e5e5"
                        tick={{ fontSize: 10, fill: '#888888', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="load"
                        stroke="#e5e5e5"
                        tick={{ fontSize: 10, fill: '#888888', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="form"
                        orientation="right"
                        stroke="#e5e5e5"
                        tick={{ fontSize: 10, fill: '#888888', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '12px',
                            boxShadow: 'var(--card-shadow)',
                            color: 'var(--foreground)'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)' }}
                        labelStyle={{ color: 'var(--secondary-foreground)', fontWeight: 700, marginBottom: '4px' }}
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingBottom: '10px' }}
                        iconType="circle"
                    />

                    <Area
                        yAxisId="load"
                        type="monotone"
                        dataKey="ctl"
                        name="Fitness"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCtl)"
                    />
                    <Line
                        yAxisId="load"
                        type="monotone"
                        dataKey="atl"
                        name="Fatigue"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Bar
                        yAxisId="form"
                        dataKey="tsb"
                        name="Form"
                        fill="#10b981"
                        opacity={0.3}
                        radius={[2, 2, 0, 0]}
                        barSize={6}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
