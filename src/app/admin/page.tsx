"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminStats, getAllUsers, updateUserRole, deleteUser } from "@/lib/admin-actions";
import type { AdminStats, AdminUser } from "@/types";
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
import { toast } from "sonner";

const notifications = [
  { icon: CheckCircle2, color: "text-emerald-400", title: "Hệ thống backup hoàn tất", desc: "2 phút trước", time: "" },
  { icon: AlertTriangle, color: "text-amber-400", title: "Cảnh báo: Phản hồi API chậm", desc: "Endpoint /api/events phản hồi > 2s", time: "15 phút trước" },
  { icon: Info, color: "text-blue-400", title: "Cập nhật phiên bản v2.1.0", desc: "Tính năng mới: Dark mode + Reminder", time: "1 giờ trước" },
  { icon: ShieldCheck, color: "text-purple-400", title: "Kiểm tra bảo mật đạt yêu cầu", desc: "Không phát hiện lỗ hổng", time: "3 giờ trước" },
];

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [statsResult, usersResult] = await Promise.all([
      getAdminStats(),
      getAllUsers({ page: 1, pageSize: 5 }),
    ]);
    if (statsResult.data) setStats(statsResult.data);
    if (usersResult.users) {
      setUsers(usersResult.users);
      setTotalUsers(usersResult.total ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const systemStats = stats
    ? [
        { label: "Tổng người dùng", value: stats.totalUsers.toString(), change: `+${stats.newUsersThisWeek}`, color: "border-blue-500", icon: Users },
        { label: "Sự kiện hôm nay", value: stats.eventsToday.toString(), change: `${stats.totalEvents} tổng`, color: "border-purple-500", icon: Calendar },
        { label: "Hoạt động tuần", value: stats.activeUsersThisWeek.toString(), change: `trong ${stats.totalUsers} users`, color: "border-emerald-500", icon: TrendingUp },
        { label: "Người dùng mới", value: stats.newUsersThisWeek.toString(), change: "tuần này", color: "border-amber-500", icon: AlertTriangle },
      ]
    : [];

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    const result = await deleteUser(userId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đã xóa người dùng");
      loadData();
    }
  };

  const handleToggleRole = async (userId: string, currentRole: number) => {
    const newRole = currentRole === 1 ? 0 : 1;
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(newRole === 1 ? "Đã cấp quyền Admin" : "Đã hạ quyền User");
      loadData();
    }
  };

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
          <a href="/admin/users" className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm">
            <UserPlus size={18} />
            Quản lý người dùng
          </a>
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
              <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
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
              <AreaChart data={stats?.weeklyActivity ?? []}>
                <defs>
                  <linearGradient id="adminComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)", fontSize: "13px" }}
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
          <span className="text-xs text-muted-foreground">Hiển thị {users.length > 0 ? `1-${users.length}` : 0} của {totalUsers}</span>
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
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{u.fullName}</div>
                        <div className="text-xs text-muted-foreground">{u.eventCount} sự kiện</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      u.role === 1 ? "bg-amber-400/10 text-amber-500" : "bg-secondary text-muted-foreground"
                    )}>
                      {u.role === 1 ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", u.lastActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <span className="text-sm text-foreground">{u.lastActive ? "Hoạt động" : "Ngoại tuyến"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleRole(u.userId, u.role)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg"
                        title={u.role === 1 ? "Hạ quyền User" : "Cấp quyền Admin"}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.userId)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-secondary/30 border-t border-border flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Hiển thị 1 - {users.length} của {totalUsers} kết quả</p>
          <a href="/admin/users" className="text-xs text-primary font-bold hover:underline">Xem tất cả →</a>
        </div>
      </div>
    </div>
  );
}
