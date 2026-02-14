import { Zap, TrendingUp, TrendingDown, Minus, Bot, Sparkles, RotateCw, MapPin, Timer, Heart, Flame, Upload, Rocket } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { dailyMetrics } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { FitnessChart } from "@/components/charts/FitnessChart";
import { IntensityChart } from "@/components/charts/IntensityChart";
import { refreshAiInsightAction } from "@/app/actions/activities";
import { MetricCard } from "@/components/ui/MetricCard";
import { logger } from "@/lib/logger";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period = '7d' } = await searchParams;
  const daysToShow = period === '30d' ? 30 : 7;

  const athlete = await getCurrentUser();
  if (!athlete) return null;

  let chartData: any[] = [];
  let today: any = null;
  let periodHistory: any[] = [];

  try {
    const data = await db.query.dailyMetrics.findMany({
      where: (t, { eq }) => eq(t.athleteId, athlete.id),
      orderBy: [desc(dailyMetrics.date)],
      limit: 90
    });

    // Serialize to plain objects (removes Date objects)
    const history: any[] = JSON.parse(JSON.stringify(data));

    chartData = history.reverse();
    today = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    periodHistory = chartData.slice(-daysToShow);
  } catch (e) {
    logger.error("Failed to fetch metrics", e);
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
    { name: "Z4", value: periodHistory.reduce((acc, d) => acc + (d.z4Time || 0), 0), color: "#a855f7" },
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

    if (Math.abs(diff) < 0.1) return <Minus size={12} className="text-neutral-300" />;
    if (key === 'atl') return diff > 0 ? <TrendingUp size={12} className="text-danger" /> : <TrendingDown size={12} className="text-success" />;
    return diff > 0 ? <TrendingUp size={12} className="text-success" /> : <TrendingDown size={12} className="text-danger" />;
  };

  // Calculate dynamic readiness based on TSB
  const tsb = today?.tsb || 0;
  let readiness = 80 + tsb;
  if (readiness > 100) readiness = 100;
  if (readiness < 0) readiness = 0;

  // Color coding for readiness
  let readinessColor = "text-success";
  if (readiness < 70) readinessColor = "text-warning";
  if (readiness < 50) readinessColor = "text-danger";

  const performanceStats = [
    { label: "Distance", value: (totalDistance / 1000).toFixed(1), unit: "km", icon: <MapPin size={12} />, tendency: getTendency('totalDistance') },
    { label: "Avg Pace", value: Math.floor(avgPace / 60) + ":" + Math.floor(avgPace % 60).toString().padStart(2, "0"), unit: "/km", icon: <Timer size={12} />, tendency: <Minus size={12} className="text-neutral-300" /> },
    { label: "Avg HR", value: fmt(avgHr), unit: "bpm", icon: <Heart size={12} />, tendency: getTendency('averageHr') },
    { label: "Max HR", value: fmt(maxHr), unit: "bpm", icon: <Flame size={12} />, tendency: <Minus size={12} className="text-neutral-300" /> }, // New Max HR
  ];

  const trainingStats = [
    { label: "Fitness", unit: "CTL", value: fmt(today?.ctl), tendency: getTendency('ctl'), color: "text-primary", tooltip: "Chronic Training Load (42-day avg). Your long-term fitness base." },
    { label: "Fatigue", unit: "ATL", value: fmt(today?.atl), tendency: getTendency('atl'), color: "text-purple-500", tooltip: "Acute Training Load (7-day avg). Recent fatigue accumulation." },
    { label: "Form", unit: "TSB", value: fmt(today?.tsb), tendency: getTendency('tsb'), color: "text-success", tooltip: "Training Stress Balance. Positive = Fresh, Negative = Building." },
    { label: "Readiness", unit: "Score", value: Math.round(readiness), tendency: <Minus size={12} className="text-neutral-300" />, color: readinessColor, tooltip: "Estimated race readiness based on Form and Fatigue." },
  ];

  if (!today && chartData.length === 0) {
    return (
      <EmptyState
        icon={<Rocket size={32} className="text-neutral-400" />}
        title="Start Your Journey"
        description="Upload your first activity to unlock AI-powered insights, fitness tracking, and performance analytics."
        action={{ label: "Upload First Activity", href: "/upload" }}
        className="mt-12"
      />
    );
  }

  return (
    <>
      {chartData.length === 0 ? (
        <EmptyState
          icon={<Rocket size={32} className="text-neutral-400" />}
          title="Start Your Journey"
          description="Upload your first activity to unlock AI-powered insights, fitness tracking, and performance analytics."
          action={{ label: "Upload First Activity", href: "/upload" }}
          className="mt-12"
        />
      ) : (
        <>
          {/* Header with Upload & Period Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <PageHeader
              title="Dashboard"
              subtitle="Your training status and AI insights at a glance."
              className="mb-0"
            />
            <div className="flex items-center gap-3">
              <Link href="/upload">
                <Button variant="secondary" className="h-9 text-xs gap-2 hidden md:flex">
                  <Upload size={14} />
                  Upload
                </Button>
              </Link>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg flex items-center">
                <Link href="/?period=7d">
                  <button className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${period === '7d' ? 'bg-white dark:bg-neutral-700 text-primary shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}>
                    7 Days
                  </button>
                </Link>
                <Link href="/?period=30d">
                  <button className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${period === '30d' ? 'bg-white dark:bg-neutral-700 text-primary shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'}`}>
                    30 Days
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Performance Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-visible">
              {performanceStats.map((stat) => (
                <MetricCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  icon={stat.icon}
                  trend={stat.tendency}
                  compact
                  primary={stat.label === "Distance"}
                />
              ))}
            </div>

            {/* Training Status Strip - Uses Combined Component */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-visible">
              {trainingStats.map((stat) => (
                <MetricCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  trend={stat.tendency}
                  className={stat.color}
                  compact
                  tooltip={stat.tooltip}
                />
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 flex flex-col h-[250px] md:h-[320px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Fitness & Freshness</h3>
                  <InfoTooltip content="Long-term relationship between Fitness (CTL), Fatigue (ATL), and Form (TSB/Bars)." />
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <FitnessChart data={periodHistory} />
              </div>
            </Card>
            <Card className="flex flex-col h-[250px] md:h-[320px]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Intensity Distribution</h3>
                <InfoTooltip content="Time spent in each heart rate zone during the selected period." />
              </div>
              <div className="flex-1 min-h-0">
                <IntensityChart data={intensityData} />
              </div>
            </Card>
          </div>

          {/* Secondary Row - Training Insight */}
          <div className="w-full">
            <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot size={120} className="text-primary" />
              </div>

              {athlete?.lastAiInsight ? (
                (() => {
                  let insight = { message: "", actionItems: [] };
                  try {
                    insight = JSON.parse(athlete.lastAiInsight);
                  } catch (e) {
                    console.error("Failed to parse AI insight", e);
                  }

                  if (!insight || !insight.message) return null;

                  return (
                    <div className="w-full relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Zap size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">AI Training Insight</h3>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Analyzed {athlete.lastAiInsightDate ? new Date(athlete.lastAiInsightDate).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                        <form action={refreshAiInsightAction} className="ml-auto">
                          <button type="submit" className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary" title="Refresh Insight">
                            <RotateCw size={16} />
                          </button>
                        </form>
                      </div>

                      <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed max-w-4xl font-medium">
                        {insight.message}
                      </p>

                      <div className="flex flex-wrap gap-2 items-center">
                        {insight.actionItems?.map((action: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-white dark:bg-neutral-800 border border-primary/20 dark:border-primary/10 px-4 py-2 rounded-full shadow-sm">
                            <Sparkles size={10} />
                            {action}
                          </div>
                        ))}
                        <Link href={`/coach?initial_message=${encodeURIComponent(insight.message)}&actions=${encodeURIComponent(JSON.stringify(insight.actionItems || []))}`}>
                          <Button variant="ghost" className="text-xs ml-2">
                            Discuss with Coach <Bot size={14} className="ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready for deeper insights?</h3>
                  <p className="text-neutral-500 text-sm mb-8 max-w-sm font-medium">
                    Our AI coach is ready to analyze your recent performance and provide personalized training advice.
                  </p>
                  <div className="flex items-center gap-3">
                    <form action={refreshAiInsightAction}>
                      <Button type="submit">
                        Generate First Insight
                      </Button>
                    </form>
                    <Link href="/coach">
                      <Button variant="secondary">
                        Open AI Coach
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
