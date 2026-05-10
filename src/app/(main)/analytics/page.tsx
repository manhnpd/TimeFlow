"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { CATEGORIES } from "@/types";

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#eab308"];

interface AnalyticsData {
  totalEvents: number;
  thisMonth: number;
  totalHours: number;
  avgPerDay: string;
  categoryDistribution: { name: string; value: number }[];
  dailyTrend: { date: string; count: number }[];
  weekDayDistribution: { day: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  weeklyTrend: { week: string; count: number }[];
}

const RADIAN = Math.PI / 180;
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
    </text>
  );
}

function getCategoryColor(name: string) {
  const cat = CATEGORIES.find((c) => c.value === name);
  return cat?.color ?? "#6b7280";
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-headline-sm font-semibold text-on-surface mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getAnalytics();
      setData(result.data ?? null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-md font-bold text-primary">Analytics</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Phân tích chi tiết lịch trình của bạn
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: data.totalEvents, icon: "event", color: "text-primary" },
          { label: "This Month", value: data.thisMonth, icon: "calendar_month", color: "text-chart-3" },
          { label: "Total Hours", value: `${data.totalHours}h`, icon: "schedule", color: "text-chart-2" },
          { label: "Avg / Day", value: data.avgPerDay, icon: "trending_up", color: "text-chart-4" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
              <span className="text-label-md text-on-surface-variant uppercase">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Daily Trend (spans 2 cols) */}
        <ChartCard title="Daily Trend (30 days)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.dailyTrend}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8c909f" }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#8c909f" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#201f1f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCount)"
                name="Events"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart - Category Distribution */}
        <ChartCard title="By Category">
          {data.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  stroke="none"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#201f1f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-on-surface-variant text-sm">No data yet</p>
            </div>
          )}
          {/* Category legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {data.categoryDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(entry.name) }} />
                <span className="text-xs text-on-surface-variant capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Week Day Distribution */}
        <ChartCard title="Events by Day of Week">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.weekDayDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8c909f" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8c909f" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#201f1f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line Chart - Weekly Trend */}
        <ChartCard title="Weekly Trend (12 weeks)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8c909f" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8c909f" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#201f1f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 3 }}
                activeDot={{ r: 5 }}
                name="Events"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Hour Distribution */}
      {data.hourlyDistribution.length > 0 && (
        <ChartCard title="Events by Hour of Day">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#8c909f" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8c909f" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#201f1f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
