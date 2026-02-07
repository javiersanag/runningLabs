import { Activity, Zap, TrendingUp, Clock, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { FitnessChart } from "@/components/charts/FitnessChart";
import { ACWRChart } from "@/components/charts/ACWRChart";
import { IntensityChart } from "@/components/charts/IntensityChart";
import { PerformanceStrip } from "@/components/layout/PerformanceStrip";

export const dynamic = "force-dynamic";

export default async function Home() {
  const athlete = await db.query.athletes.findFirst({
    where: (t, { eq }) => eq(t.id, "default_athlete")
  });

  let chartData: any[] = [];
  let today: any = null;
  let last7Days: any[] = [];
  let last30Days: any[] = [];

  try {
    const history = await db.query.dailyMetrics.findMany({
      where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
      orderBy: [desc(dailyMetrics.date)],
      limit: 90
    });

    chartData = history.reverse();
    today = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    last7Days = chartData.slice(-7);
    last30Days = chartData.slice(-30);
  } catch (e) {
    console.error("Failed to fetch metrics", e);
  }

  // Calculate performance data for both periods
  const calcPerformance = (days: any[]) => {
    const avgDistance = days.reduce((acc, d) => acc + (d.totalDistance || 0), 0) / days.length;
    const validHrDays = days.filter(d => d.averageHr);
    const avgHr = validHrDays.length > 0 ? validHrDays.reduce((acc, d) => acc + d.averageHr, 0) / validHrDays.length : null;
    const totalDuration = days.reduce((acc, d) => acc + (d.totalDuration || 0), 0);
    const totalDistance = days.reduce((acc, d) => acc + (d.totalDistance || 0), 0);
    const avgPace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;
    return { avgDistance, avgPace, avgHr };
  };

  const perf7d = calcPerformance(last7Days);
  const perf30d = calcPerformance(last30Days);

  const fmt = (n: number | null | undefined) => n !== null && n !== undefined ? Math.round(n) : "-";

  // Prep Intensity Data
  const intensityData = [
    { name: "Z1", value: last7Days.reduce((acc, d) => acc + (d.z1Time || 0), 0), color: "#3b82f6" },
    { name: "Z2", value: last7Days.reduce((acc, d) => acc + (d.z2Time || 0), 0), color: "#22c55e" },
    { name: "Z3", value: last7Days.reduce((acc, d) => acc + (d.z3Time || 0), 0), color: "#eab308" },
    { name: "Z4", value: last7Days.reduce((acc, d) => acc + (d.z4Time || 0), 0), color: "#f97316" },
    { name: "Z5", value: last7Days.reduce((acc, d) => acc + (d.z5Time || 0), 0), color: "#ef4444" },
  ];

  const last3Days = chartData.slice(-3);
  const prev7Days = chartData.slice(-10, -3);

  const getAvg = (days: any[], key: string) =>
    days.length > 0 ? days.reduce((acc, d) => acc + (d[key] || 0), 0) / days.length : 0;

  const getTendency = (key: string) => {
    const currAvg = getAvg(last3Days, key);
    const prevAvg = getAvg(prev7Days, key);
    const diff = currAvg - prevAvg;

    if (Math.abs(diff) < 0.1) return <Minus size={12} className="text-white/20" />;

    // For ATL, increasing (positive diff) is red/up
    if (key === 'atl') {
      return diff > 0 ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-green-500" />;
    }

    // For CTL and TSB, increasing is green/up
    return diff > 0 ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />;
  };

  const trainingStats = [
    {
      label: "Fitness",
      sublabel: "CTL",
      value: fmt(today?.ctl),
      color: "text-blue-400",
      tendency: getTendency('ctl')
    },
    {
      label: "Fatigue",
      sublabel: "ATL",
      value: fmt(today?.atl),
      color: "text-purple-400",
      tendency: getTendency('atl')
    },
    {
      label: "Form",
      sublabel: "TSB",
      value: fmt(today?.tsb),
      color: (today?.tsb || 0) >= 0 ? "text-green-400" : "text-yellow-400",
      tendency: getTendency('tsb')
    },
    { label: "Readiness", sublabel: "", value: "84%", color: "text-green-400", tendency: <Minus size={12} className="text-white/20" /> },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-white/40 text-sm">Welcome back, {athlete?.name || "Performance Athlete"}</p>
        </div>
        <Link href="/upload">
          <button className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
            + Upload Activity
          </button>
        </Link>
      </div>

      {/* Performance Strip with 7d/30d toggle */}
      <PerformanceStrip last7Days={perf7d} last30Days={perf30d} />

      {/* Training Status Bar */}
      <div className="flex items-center justify-center gap-12 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-4 mb-6 relative">
        <span className="absolute left-6 text-[10px] font-bold text-white/20 uppercase tracking-widest hidden xl:block">Training Status</span>
        <div className="flex items-center gap-10">
          {trainingStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-10">
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                    {stat.sublabel && <span className={`text-[10px] font-bold ${stat.color}`}>{stat.sublabel}</span>}
                  </div>
                  {stat.tendency}
                </div>
              </div>
              {i < trainingStats.length - 1 && <div className="w-px h-8 bg-white/5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-white/60 mb-3">Fitness & Freshness</h3>
          <div className="flex-1 min-h-0 bg-white/[0.02] rounded-xl p-4">
            <FitnessChart data={chartData} />
          </div>
        </div>
        <div className="h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-white/60 mb-3">Intensity Distribution</h3>
          <div className="flex-1 min-h-0 bg-white/[0.02] rounded-xl p-4">
            <IntensityChart data={intensityData} />
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-[250px] flex flex-col">
          <h3 className="text-sm font-bold text-white/60 mb-3">ACWR</h3>
          <div className="flex-1 min-h-0 bg-white/[0.02] rounded-xl p-4">
            <ACWRChart data={chartData} />
          </div>
        </div>

        <div className="lg:col-span-2 h-[250px] flex flex-col items-center justify-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6">
          <Zap className="text-primary mb-2" size={24} />
          <h3 className="text-lg font-bold text-white mb-1">Training Insight</h3>
          <p className="text-white/50 text-sm text-center mb-4 max-w-md">
            Your ACWR is currently <strong className="text-white">{(today?.acwr || 1.1).toFixed(2)}</strong>.
            {(today?.acwr || 1.1) > 1.3 ? " You are increasing load rapidly." : " You are in the optimal training zone."}
          </p>
          <Link href="/coach" className="px-5 py-2 bg-primary text-black rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] transition">
            Discuss with AI Coach
          </Link>
        </div>
      </div>
    </>
  );
}
