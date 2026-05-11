"use client";

import { useEffect, useState, useCallback } from "react";
import { getSystemHealth, triggerCronManual } from "@/lib/admin-actions";
import type { SystemHealth } from "@/types";
import {
  Database, Server, Clock, Activity, Loader2, RefreshCw, Zap, Users,
  CheckCircle2, AlertTriangle, XCircle, Bell, Play, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

function StatusBadge({ status }: { status: "operational" | "degraded" | "down" }) {
  const config = {
    operational: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Hoạt động" },
    degraded: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Chậm" },
    down: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Lỗi" },
  };
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", c.bg, c.color)}>
      <c.icon size={14} />
      {c.label}
    </span>
  );
}

export default function SystemPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cronLoading, setCronLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getSystemHealth();
    if (result.data) setHealth(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTriggerCron = async () => {
    setCronLoading(true);
    const result = await triggerCronManual();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Đã gửi ${result.sent} nhắc nhở`);
      loadData();
    }
    setCronLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!health) return null;

  const statusCards = [
    { label: "Cơ sở dữ liệu", icon: Database, status: health.dbStatus, detail: `${health.dbLatencyMs}ms phản hồi` },
    { label: "API Server", icon: Server, status: "operational" as const, detail: "Next.js 16" },
    { label: "Cron Jobs", icon: Clock, status: health.lastCronRun ? "operational" as const : "degraded" as const, detail: health.lastCronRun ? `Chạy lúc ${format(parseISO(health.lastCronRun), "HH:mm dd/MM")}` : "Chưa chạy" },
    { label: "Tổng sự kiện", icon: Activity, status: "operational" as const, detail: `${health.totalEvents} sự kiện` },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trạng thái hệ thống</h1>
          <p className="text-muted-foreground text-sm">Theo dõi sức khỏe và hiệu suất hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button onClick={handleTriggerCron} disabled={cronLoading} className="bg-primary text-primary-foreground gap-2">
            {cronLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Chạy cron thủ công
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border p-5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-secondary rounded-lg">
                <card.icon size={18} className="text-foreground" />
              </div>
              <StatusBadge status={card.status} />
            </div>
            <h3 className="text-sm font-bold text-foreground">{card.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Panel */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Tổng quan hệ thống</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tổng người dùng</span>
              </div>
              <span className="text-sm font-bold text-foreground">{health.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tổng sự kiện</span>
              </div>
              <span className="text-sm font-bold text-foreground">{health.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Độ trễ DB</span>
              </div>
              <span className={cn("text-sm font-bold", health.dbLatencyMs < 200 ? "text-emerald-500" : "text-amber-500")}>
                {health.dbLatencyMs}ms
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cron chạy gần nhất</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {health.lastCronRun ? format(parseISO(health.lastCronRun), "HH:mm dd/MM/yyyy") : "Chưa chạy"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Hoạt động gần đây</h3>
            <Bell size={18} className="text-muted-foreground" />
          </div>
          {health.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {health.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="p-1.5 bg-primary/10 rounded-md shrink-0 mt-0.5">
                    <Bell size={12} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(parseISO(activity.timestamp), "HH:mm dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Chưa có hoạt động nào</p>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="text-lg font-bold text-foreground mb-6">Thông tin hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Framework</h4>
            <p className="text-sm text-foreground">Next.js 16 (App Router)</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Database</h4>
            <p className="text-sm text-foreground">Supabase (PostgreSQL)</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Cron Interval</h4>
            <p className="text-sm text-foreground">Mỗi 10 phút (Vercel Cron)</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Auth</h4>
            <p className="text-sm text-foreground">Supabase Auth + RLS</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Email Service</h4>
            <p className="text-sm text-foreground">Resend</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Reminders</h4>
            <p className="text-sm text-foreground">5m, 15m, 30m, 1h, 1d, 2d</p>
          </div>
        </div>
      </div>
    </div>
  );
}
