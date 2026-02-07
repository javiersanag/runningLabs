import { Activity, Zap, TrendingUp, Clock, TrendingDown, Minus, Bot, Sparkles, RotateCw } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { FitnessChart } from "@/components/charts/FitnessChart";
import { IntensityChart } from "@/components/charts/IntensityChart";
import { refreshAiInsightAction } from "@/app/actions/activities";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period = '7d' } = await searchParams;
  const daysToShow = period === '30d' ? 30 : 7;

  const athlete = await db.query.athletes.findFirst({
    where: (t, { eq }) => eq(t.id, "default_athlete")
  });

  let chartData: any[] = [];
  let today: any = null;
  let periodHistory: any[] = [];

  try {
    const history = await db.query.dailyMetrics.findMany({
      where: (t, { eq }) => eq(t.athleteId, "default_athlete"),
      orderBy: [desc(dailyMetrics.date)],
      limit: 90
    });

    chartData = history.reverse();
    today = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    periodHistory = chartData.slice(-daysToShow);
  } catch (e) {
    console.error("Failed to fetch metrics", e);
  }

  // Calculate performance data for the selected period
  const totalDistance = periodHistory.reduce((acc, d) => acc + (d.totalDistance || 0), 0);
  const totalDuration = periodHistory.reduce((acc, d) => acc + (d.totalDuration || 0), 0);
  const avgPace = totalDistance > 0 ? totalDuration / (totalDistance / 1000) : 0;

  const validHrDays = periodHistory.filter(d => d.averageHr);
  const avgHr = validHrDays.length > 0 ? validHrDays.reduce((acc, d) => acc + d.averageHr, 0) / validHrDays.length : null;

  // Calculate Max HR in period from daily maxes
  const maxHr = periodHistory.length > 0 ? Math.max(...periodHistory.map(d => d.maxHr || 0)) : null;

  const fmt = (n: number | null | undefined) => n !== null && n !== undefined ? Math.round(n) : "-";

  // Prep Intensity Data based on period
  const intensityData = [
    { name: "Z1", value: periodHistory.reduce((acc, d) => acc + (d.z1Time || 0), 0), color: "#3b82f6" },
    { name: "Z2", value: periodHistory.reduce((acc, d) => acc + (d.z2Time || 0), 0), color: "#22c55e" },
    { name: "Z3", value: periodHistory.reduce((acc, d) => acc + (d.z3Time || 0), 0), color: "#eab308" },
    { name: "Z4", value: periodHistory.reduce((acc, d) => acc + (d.z4Time || 0), 0), color: "#f97316" },
    { name: "Z5", value: periodHistory.reduce((acc, d) => acc + (d.z5Time || 0), 0), color: "#ef4444" },
  ];

  // Dynamic Tendency logic
  const currWindowSize = period === '30d' ? 7 : 3;
  const prevWindowSize = period === '30d' ? 30 : 7;

  const currWindow = chartData.slice(-currWindowSize);
  const prevWindow = chartData.slice(-(currWindowSize + prevWindowSize), -currWindowSize);

  const getAvg = (days: any[], key: string) =>
    days.length > 0 ? days.reduce((acc, d) => acc + (d[key] || 0), 0) / days.length : 0;

  const getTendency = (key: string) => {
    const currAvg = getAvg(currWindow, key);
    const prevAvg = getAvg(prevWindow, key);
    const diff = currAvg - prevAvg;

    if (Math.abs(diff) < 0.1) return <Minus size={12} className="text-white/20" />;
    if (key === 'atl') return diff > 0 ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-green-500" />;
    return diff > 0 ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />;
  };

  // Calculate dynamic readiness based on TSB
  const tsb = today?.tsb || 0;
  // If TSB is very low (-30), readiness is low (~50%). If TSB is positive, readiness is high.
  // Base 80 at TSB 0.
  let readiness = 80 + tsb; 
  if (readiness > 100) readiness = 100;
  if (readiness < 0) readiness = 0;
  
  // Color coding for readiness
  let readinessColor = "text-green-400";
  if (readiness < 70) readinessColor = "text-yellow-400";
  if (readiness < 50) readinessColor = "text-red-400";

  const performanceStats = [
    { label: "Distance", value: (totalDistance / 1000).toFixed(1), unit: "km", icon: "📍" },
    { label: "Avg Pace", value: avgPace > 0 ? `${Math.floor(avgPace / 60)}:${Math.floor(avgPace % 60).toString().padStart(2, '0')}` : "-", unit: "/km", icon: "⏱" },
    { label: "Avg HR", value: fmt(avgHr), unit: "bpm", icon: "❤️" },
    { label: "Max HR", value: fmt(maxHr), unit: "bpm", icon: "🔥" },
  ];

  const trainingStats = [
    { label: "Fitness", sublabel: "CTL", value: fmt(today?.ctl), color: "text-blue-400", tendency: getTendency('ctl') },
    { label: "Fatigue", sublabel: "ATL", value: fmt(today?.atl), color: "text-purple-400", tendency: getTendency('atl') },
    { label: "Form", sublabel: "TSB", value: fmt(today?.tsb), color: (today?.tsb || 0) >= 0 ? "text-green-400" : "text-yellow-400", tendency: getTendency('tsb') },
    { label: "Readiness", sublabel: "", value: `${Math.round(readiness)}%`, color: readinessColor, tendency: <Minus size={12} className="text-white/20" /> },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, {athlete?.name || "Performance Athlete"}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <Link
              href="/?period=7d"
              className={`px-3 py-1 text-xs font-bold rounded transition ${period === '7d' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              7d
            </Link>
            <Link
              href="/?period=30d"
              className={`px-3 py-1 text-xs font-bold rounded transition ${period === '30d' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              30d
            </Link>
          </div>
          <Link href="/upload">
            <button className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition">
              + Upload Activity
            </button>
          </Link>
        </div>
      </div>

      {/* Unified Metrics Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
        {/* Performance Section */}
        <div className="flex-1 flex items-center justify-around xl:justify-start xl:gap-12">
          {performanceStats.map((stat, i) => (
            <div key={i} className="flex flex-col items-start">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span>{stat.icon}</span> {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-white/20">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-12 bg-white/5 shrink-0" />

        {/* Training Status Section */}
        <div className="flex-1 flex items-center justify-around xl:justify-start xl:gap-12">
          {trainingStats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center xl:items-start">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                  {stat.sublabel && <span className={`text-[10px] font-bold ${stat.color}`}>{stat.sublabel}</span>}
                </div>
                {stat.tendency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-white/60 mb-3">Fitness & Freshness</h3>
          <div className="flex-1 min-h-0 bg-white/[0.02] rounded-xl p-4">
            <FitnessChart data={periodHistory} />
          </div>
        </div>
        <div className="h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-white/60 mb-3">Intensity Distribution</h3>
          <div className="flex-1 min-h-0 bg-white/[0.02] rounded-xl p-4">
            <IntensityChart data={intensityData} />
          </div>
        </div>
      </div>

      {/* Secondary Row - Training Insight */}
      <div className="w-full">
        <div className="h-[250px] flex flex-col items-center justify-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 overflow-hidden border border-white/5">
          {athlete?.lastAiInsight ? (
            (() => {
              const insight = JSON.parse(athlete.lastAiInsight);
              return (
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-primary" size={20} />
                    <h3 className="text-lg font-bold text-white">AI Training Insight</h3>
                    <form action={refreshAiInsightAction} className="ml-1">
                      <button type="submit" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white" title="Refresh Insight">
                        <RotateCw size={14} />
                      </button>
                    </form>
                    {athlete.lastAiInsightDate && (
                      <span className="text-[10px] text-white/20 ml-auto">
                        Updated {new Date(athlete.lastAiInsightDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm mb-4 max-w-3xl">
                    {insight.message}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {insight.actionItems?.map((action: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <Sparkles size={10} />
                        {action}
                      </div>
                    ))}
                    <Link href="/coach" className="text-[11px] font-bold text-white/40 hover:text-white px-3 py-1.5 ml-auto flex items-center gap-1">
                      Full Coach <Bot size={12} />
                    </Link>
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              <Zap className="text-primary mb-2" size={24} />
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Training Insight
                <form action={refreshAiInsightAction}>
                  <button type="submit" className="p-1 hover:bg-white/10 rounded transition-colors">
                    <RotateCw size={14} className="text-white/40" />
                  </button>
                </form>
              </h3>
              <p className="text-white/50 text-sm text-center mb-6 max-w-md">
                Analyzing your data to provide personalized training advice...
              </p>
              <Link href="/coach" className="px-5 py-2 bg-primary text-black rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] transition">
                Discuss with AI Coach
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
