import { Activity, Zap, TrendingUp, Clock, MapPin, Gauge, Heart } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { FitnessChart } from "@/components/charts/FitnessChart";
import { ACWRChart } from "@/components/charts/ACWRChart";
import { IntensityChart } from "@/components/charts/IntensityChart";

export const dynamic = "force-dynamic";

export default async function Home() {
  const athlete = await db.query.athletes.findFirst({
    where: (t, { eq }) => eq(t.id, "default_athlete")
  });

  let chartData: any[] = [];
  let today: any = null;
  let last7Days: any[] = [];

  try {
    const history = await db.query.dailyMetrics.findMany({
      where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
      orderBy: [desc(dailyMetrics.date)],
      limit: 90
    });

    chartData = history.reverse();
    today = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    last7Days = chartData.slice(-7);
  } catch (e) {
    console.error("Failed to fetch metrics", e);
  }

  // Calculate Averages for the New Row (Last 7 Days)
  const avgDistance = last7Days.reduce((acc, d) => acc + (d.totalDistance || 0), 0) / 7;
  const validHrDays = last7Days.filter(d => d.averageHr);
  const avgHr = validHrDays.length > 0 ? validHrDays.reduce((acc, d) => acc + d.averageHr, 0) / validHrDays.length : null;

  // Avg Pace calculation (Duration / Distance)
  const totalDuration = last7Days.reduce((acc, d) => acc + (d.totalDuration || 0), 0);
  const totalDistance = last7Days.reduce((acc, d) => acc + (d.totalDistance || 0), 0);
  const avgPaceSec = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

  const formatPace = (s: number) => {
    if (!s) return "-";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fmt = (n: number | null | undefined) => n !== null && n !== undefined ? Math.round(n) : "-";

  // Prep Intensity Data
  const intensityData = [
    { name: "Z1", value: last7Days.reduce((acc, d) => acc + (d.z1Time || 0), 0), color: "#3b82f6" },
    { name: "Z2", value: last7Days.reduce((acc, d) => acc + (d.z2Time || 0), 0), color: "#22c55e" },
    { name: "Z3", value: last7Days.reduce((acc, d) => acc + (d.z3Time || 0), 0), color: "#eab308" },
    { name: "Z4", value: last7Days.reduce((acc, d) => acc + (d.z4Time || 0), 0), color: "#f97316" },
    { name: "Z5", value: last7Days.reduce((acc, d) => acc + (d.z5Time || 0), 0), color: "#ef4444" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-white/50">Welcome back, {athlete?.name || "Performance Athlete"}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/upload">
            <button className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
              + Upload Activity
            </button>
          </Link>
        </div>
      </div>

      {/* Row 1: Physiological Readiness/Status */}
      <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Training Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Fitness (CTL)", value: fmt(today?.ctl), unit: "TSS/d", icon: Activity, color: "text-blue-400" },
          { label: "Fatigue (ATL)", value: fmt(today?.atl), unit: "TSS/d", icon: TrendingUp, color: "text-purple-400" },
          { label: "Form (TSB)", value: fmt(today?.tsb), unit: "", icon: Zap, color: (today?.tsb || 0) >= 0 ? "text-green-400" : "text-yellow-400" },
          { label: "Readiness", value: today?.readinessScore ? `${today.readinessScore}%` : "84%", unit: "Ready", icon: Clock, color: "text-green-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-card flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <stat.icon size={48} />
            </div>
            <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-4xl font-bold tracking-tighter text-white`}>{stat.value}</span>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Performance Summary (New Row) */}
      <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">7-Day Performance Mean</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Avg Distance", value: (avgDistance / 1000).toFixed(1), unit: "km", icon: MapPin },
          { label: "Avg Pace", value: formatPace(avgPaceSec), unit: "/km", icon: Gauge },
          { label: "Avg Heart Rate", value: fmt(avgHr), unit: "bpm", icon: Heart },
        ].map((stat, i) => (
          <div key={i} className="glass-panel flex items-center justify-between p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-white/40">{stat.unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Fitness & Freshness</h3>
          <div className="flex-1 min-h-0">
            <FitnessChart data={chartData} />
          </div>
        </div>
        <div className="glass-card h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Intensity Distribution</h3>
          <p className="text-xs text-white/40 mb-4">Time in Heart Rate Zones (Last 7 Days)</p>
          <div className="flex-1 min-h-0">
            <IntensityChart data={intensityData} />
          </div>
        </div>
      </div>

      {/* Row 4: Secondary Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">ACWR</h3>
          <p className="text-xs text-white/40 mb-2">Acute:Chronic Workload Ratio</p>
          <div className="flex-1 min-h-0">
            <ACWRChart data={chartData} />
          </div>
        </div>

        <div className="lg:col-span-2 glass-card h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
          <div className="text-center relative z-10">
            <Zap className="mx-auto text-primary mb-2" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Training Insight</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Your ACWR is currently <strong className="text-white">{(today?.acwr || 1.1).toFixed(2)}</strong>.
              {(today?.acwr || 1.1) > 1.3 ? "You are increasing load rapidly. Watch for fatigue." : "You are in the optimal 'sweet spot' for training."}
            </p>
            <Link href="/coach" className="px-6 py-3 bg-primary text-black rounded-lg font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
              Discuss with AI Coach
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
