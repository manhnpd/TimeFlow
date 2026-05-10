"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/actions";
import {
  Calendar, Clock, TrendingUp, Users, ShieldCheck, AlertTriangle,
  CheckCircle2, Info, Edit, Trash2, UserPlus, Filter, ChevronLeft,
  ChevronRight, Loader2, MoreVertical,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Separator } from "@/components/ui/separator";

// Dummy data cho admin dashboard
const systemStats = [
  { label: "Tổng người dùng", value: "1,248", change: "+12%", color: "border-blue-500", icon: Users },
  { label: "Sự kiện hôm nay", value: "14", change: "+2", color: "border-purple-500", icon: Calendar },
  { label: "Tỷ lệ hoàn thành", value: "94%", change: "+5%", color: "border-emerald-500", icon: TrendingUp },
  { label: "Báo cáo vấn đề", value: "3", change: "-2", color: "border-amber-500", icon: AlertTriangle },
];

const weeklyActivity = [
  { name: "T2", completed: 40, pending: 24 },
  { name: "T3", completed: 30, pending: 13 },
  { name: "T4", completed: 20, pending: 98 },
  { name: "T5", completed: 27, pending: 39 },
  { name: "T6", completed: 18, pending: 48 },
  { name: "T7", completed: 23, pending: 38 },
  { name: "CN", completed: 34, pending: 43 },
];

const mockUsers = [
  { name: "An Nguyễn", id: "SM-9021", email: "an.nguyen@schedulme.io", role: "Admin", status: "Hoạt động", avatar: "A" },
  { name: "Linh Trần", id: "SM-8824", email: "linh.tran@schedulme.io", role: "User", status: "Ngoại tuyến", avatar: "L" },
  { name: "Minh Tú", id: "SM-7731", email: "minh.tu@gmail.com", role: "User", status: "Hoạt động", avatar: "M" },
  { name: "Hoàng Vũ", id: "SM-6120", email: "vu.hoang@enterprise.com", role: "Admin", status: "Hoạt động", avatar: "H" },
  { name: "Phương Anh", id: "SM-5542", email: "anh.phuong@gmail.com", role: "User", status: "Ngoại tuyến", avatar: "P" },
];

const notifications = [
  { icon: CheckCircle2, color: "text-emerald-400", title: "Hệ thống backup hoàn tất", desc: "2 phút trước", time: "" },
  { icon: AlertTriangle, color: "text-amber-400", title: "Cảnh báo: Phản hồi API chậm", desc: "Endpoint /api/events phản hồi > 2s", time: "15 phút trước" },
  { icon: Info, color: "text-blue-400", title: "Cập nhật phiên bản v2.1.0", desc: "Tính năng mới: Dark mode + Reminder", time: "1 giờ trước" },
  { icon: ShieldCheck, color: "text-purple-400", title: "Kiểm tra bảo mật đạt yêu cầu", desc: " Không phát hiện lỗ hổng", time: "3 giờ trước" },
];

export default function AdminPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản trị hệ thống</h1>
          <p className="text-muted-foreground text-sm">Tổng quan hoạt động và quản lý người dùng.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-secondary text-foreground font-bold px-4 py-2 rounded-lg flex items-center gap-2 border border-border hover:bg-accent transition-all text-sm">
            <Filter size={18} />
            Lọc
          </button>
          <button className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm">
            <UserPlus size={18} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat, i) => (
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
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                stat.change.startsWith("+") ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
              )}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Hoạt động tuần này</h3>
            <div className="flex gap-4 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Hoàn thành</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />Đang chờ</span>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="adminComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#e2e8f0", fontSize: "13px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={1} fill="url(#adminComp)" strokeWidth={3} name="Hoàn thành" />
                <Area type="monotone" dataKey="pending" stroke="#a855f7" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Đang chờ" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Thông báo hệ thống</h3>
          <div className="space-y-4">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="p-2 bg-secondary rounded-lg shrink-0">
                  <n.icon size={16} className={n.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Quản lý người dùng</h3>
          <span className="text-xs text-muted-foreground">Hiển thị 1-5 của 128</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Người dùng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((u, i) => (
                <tr key={i} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      u.role === "Admin" ? "bg-amber-400/10 text-amber-500" : "bg-secondary text-muted-foreground"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", u.status === "Hoạt động" ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <span className="text-sm text-foreground">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Hiển thị 1 - 5 của 128 kết quả</p>
          <div className="flex gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
              <ChevronLeft size={20} />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  n === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {n}
              </button>
            ))}
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
