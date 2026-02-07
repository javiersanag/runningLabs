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
            <div className="h-full w-full flex items-center justify-center text-white/30 text-sm">
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
                            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAtl" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                    />
                    <YAxis
                        yAxisId="load"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                        label={{ value: 'Load', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis
                        yAxisId="form"
                        orientation="right"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                        labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    <Area
                        yAxisId="load"
                        type="monotone"
                        dataKey="ctl"
                        name="Fitness (CTL)"
                        stroke="#00e5ff"
                        fillOpacity={1}
                        fill="url(#colorCtl)"
                    />
                    <Line
                        yAxisId="load"
                        type="monotone"
                        dataKey="atl"
                        name="Fatigue (ATL)"
                        stroke="#d946ef"
                        strokeWidth={1}
                        dot={false}
                    />
                    <Bar
                        yAxisId="form"
                        dataKey="tsb"
                        name="Form (TSB)"
                        fill="#eab308"
                        opacity={0.6}
                        barSize={4}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
