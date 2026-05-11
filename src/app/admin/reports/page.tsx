"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminAnalytics } from "@/lib/admin-actions";
import type { AdminAnalyticsData } from "@/types";
import {
  Calendar, Clock, TrendingUp, Users, BarChart3, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const CATEGORY_COLORS: Record<string, string> = {
  work: "#3b82f6",
  personal: "#8b5cf6",
  health: "#10b981",
  study: "#f97316",
  entertainment: "#ec4899",
  other: "#06b6d4",
};

const CATEGORY_LABELS: Record<string, string> = {
  work: "Công việc",
  personal: "Cá nhân",
  health: "Sức khỏe",
  study: "Học tập",
  entertainment: "Giải trí",
  other: "Khác",
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getAdminAnalytics(timeRange);
    if (result.data) setData(result.data);
    setLoading(false);
  }, [timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const completionRate = data.totalEvents > 0
    ? Math.round((data.dailyTrend.filter((d) => d.count > 0).length / data.dailyTrend.length) * 100)
    : 0;

  const metricCards = [
    { label: "Tổng sự kiện", value: data.totalEvents.toString(), sub: timeRange === "week" ? "7 ngày qua" : "Tháng này", color: "border-blue-500", icon: Calendar },
    { label: "Tổng giờ", value: `${data.totalHours}h`, sub: "Thời gian đã lên lịch", color: "border-purple-500", icon: Clock },
    { label: "TB/User", value: data.avgPerUser, sub: "Sự kiện/người dùng", color: "border-emerald-500", icon: TrendingUp },
    { label: "Tỷ lệ hoạt động", value: `${completionRate}%`, sub: "Ngày có sự kiện", color: "border-amber-500", icon: BarChart3 },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground text-sm">Thống kê tổng hợp toàn hệ thống.</p>
        </div>
        <div className="flex bg-secondary rounded-lg border border-border p-1">
          <button
            onClick={() => setTimeRange("week")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
              timeRange === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tuần này
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
              timeRange === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("bg-card p-6 rounded-xl border-l-4 shadow-sm", stat.color)}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon size={20} className="text-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1: Trend + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Xu hướng sự kiện</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyTrend}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)", fontSize: "13px" }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#reportGrad)" strokeWidth={3} name="Sự kiện" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Phân bổ danh mục</h3>
          {data.categoryDistribution.length > 0 ? (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.categoryDistribution.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)", fontSize: "13px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {data.categoryDistribution.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] || "#64748b" }} />
                      <span className="text-muted-foreground">{CATEGORY_LABELS[cat.name] || cat.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Weekly Trend */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="text-lg font-bold text-foreground mb-6">Xu hướng theo tuần</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)", fontSize: "13px" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Sự kiện" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers Table */}
      {data.topUsers.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">Người dùng tích cực nhất</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">#</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Người dùng</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sự kiện</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tổng giờ</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hiệu suất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.topUsers.map((user, i) => {
                  const efficiency = user.totalHours > 0 ? (user.eventCount / user.totalHours).toFixed(1) : "—";
                  return (
                    <tr key={user.userId} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          i === 0 ? "bg-amber-500/20 text-amber-500" : i === 1 ? "bg-slate-400/20 text-slate-400" : i === 2 ? "bg-orange-500/20 text-orange-500" : "bg-secondary text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-foreground">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{user.eventCount}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{user.totalHours}h</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (user.eventCount / (data.topUsers[0]?.eventCount || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{efficiency} ev/h</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
