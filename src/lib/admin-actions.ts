"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUser, AdminStats, AdminAnalyticsData, SystemHealth } from "@/types";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Không có quyền truy cập" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== 1) return { error: "Không có quyền truy cập" };
  return { userId: user.id };
}

export async function getAdminStats(): Promise<{ data?: AdminStats; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  const admin = createAdminClient();
  const now = new Date();

  const [{ count: totalUsers }, { count: totalEvents }, { data: todayEvents }] = await Promise.all([
    admin.from("profiles").select("user_id", { count: "exact", head: true }),
    admin.from("events").select("id", { count: "exact", head: true }),
    admin
      .from("events")
      .select("id")
      .gte("start_time", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
      .lt("start_time", new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()),
  ]);

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [{ count: newUsersThisWeek }, { data: weekEvents }] = await Promise.all([
    admin.from("profiles").select("user_id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    admin
      .from("events")
      .select("user_id, start_time, end_time")
      .gte("start_time", weekAgo.toISOString()),
  ]);

  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    const completed = weekEvents?.filter(
      (e) => e.start_time >= dayStart && e.start_time < dayEnd && new Date(e.end_time) <= now
    ).length ?? 0;
    const pending = weekEvents?.filter(
      (e) => e.start_time >= dayStart && e.start_time < dayEnd && new Date(e.end_time) > now
    ).length ?? 0;
    weeklyActivity.push({ name: days[d.getDay()], completed, pending });
  }

  const activeUserIds = new Set(weekEvents?.map((e) => e.user_id));
  const activeUsersThisWeek = activeUserIds.size;

  return {
    data: {
      totalUsers: totalUsers ?? 0,
      totalEvents: totalEvents ?? 0,
      eventsToday: todayEvents?.length ?? 0,
      newUsersThisWeek: newUsersThisWeek ?? 0,
      activeUsersThisWeek,
      weeklyActivity,
    },
  };
}

export async function getAllUsers(params: {
  page: number;
  pageSize: number;
  search?: string;
  roleFilter?: number;
}): Promise<{ users?: AdminUser[]; total?: number; page?: number; totalPages?: number; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  const admin = createAdminClient();
  const { page, pageSize, search, roleFilter } = params;

  let query = admin.from("profiles").select("user_id, full_name, role, created_at", { count: "exact" });

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }
  if (roleFilter !== undefined && roleFilter !== null) {
    query = query.eq("role", roleFilter);
  }

  query = query.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);

  const { data: profiles, count } = await query;
  if (!profiles?.length) {
    return { users: [], total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / pageSize) };
  }

  const userIds = profiles.map((p) => p.user_id);

  const { data: eventCounts } = await admin
    .from("events")
    .select("user_id")
    .in("user_id", userIds);

  const countMap: Record<string, number> = {};
  eventCounts?.forEach((e) => {
    countMap[e.user_id] = (countMap[e.user_id] ?? 0) + 1;
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await admin
    .from("events")
    .select("user_id, start_time")
    .in("user_id", userIds)
    .gte("start_time", weekAgo);

  const activeMap: Record<string, string | null> = {};
  recentEvents?.forEach((e) => {
    if (!activeMap[e.user_id]) activeMap[e.user_id] = e.start_time;
  });

  const emailMap: Record<string, string> = {};
  const {
    data: { users: authUsers },
  } = await admin.auth.admin.listUsers();
  authUsers?.forEach((u) => {
    emailMap[u.id] = u.email ?? "";
  });

  const users: AdminUser[] = profiles.map((p) => ({
    userId: p.user_id,
    fullName: p.full_name || "Chưa đặt tên",
    email: emailMap[p.user_id] ?? "",
    role: p.role,
    createdAt: p.created_at,
    eventCount: countMap[p.user_id] ?? 0,
    lastActive: activeMap[p.user_id] ?? null,
  }));

  return { users, total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / pageSize) };
}

export async function updateUserRole(
  userId: string,
  role: number
): Promise<{ success?: boolean; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("user_id", userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ success?: boolean; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };
  if (check.userId === userId) return { error: "Không thể xóa chính mình" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getAdminAnalytics(
  timeRange: "week" | "month" = "week"
): Promise<{ data?: AdminAnalyticsData; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  const admin = createAdminClient();
  const now = new Date();
  const rangeStart = timeRange === "week"
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: events } = await admin
    .from("events")
    .select("user_id, start_time, end_time, category")
    .gte("start_time", rangeStart.toISOString());

  if (!events?.length) {
    return {
      data: {
        totalEvents: 0, totalHours: 0, avgPerUser: "0",
        categoryDistribution: [], dailyTrend: [], weeklyTrend: [], topUsers: [],
      },
    };
  }

  const categoryMap: Record<string, number> = {};
  events.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
  });

  const dailyData: { date: string; count: number }[] = [];
  const days = timeRange === "week" ? 7 : 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = events.filter((e) => e.start_time.startsWith(dateStr)).length;
    dailyData.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count });
  }

  const weeklyData: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    const count = events.filter((e) => {
      const d = new Date(e.start_time);
      return d >= weekStart && d <= weekEnd;
    }).length;
    weeklyData.push({ week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`, count });
  }

  const userStats: Record<string, { count: number; hours: number }> = {};
  events.forEach((e) => {
    if (!userStats[e.user_id]) userStats[e.user_id] = { count: 0, hours: 0 };
    userStats[e.user_id].count++;
    const diff = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
    userStats[e.user_id].hours += Math.max(0, diff / (1000 * 60 * 60));
  });

  const uniqueUsers = new Set(events.map((e) => e.user_id)).size;
  const totalHours = Math.round(
    events.reduce((sum, e) => {
      const diff = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
      return sum + Math.max(0, diff / (1000 * 60 * 60));
    }, 0)
  );

  const userIds = Object.keys(userStats);
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);

  const profileMap: Record<string, string> = {};
  profiles?.forEach((p) => { profileMap[p.user_id] = p.full_name || "Chưa đặt tên"; });

  const topUsers = userIds
    .map((uid) => ({
      userId: uid,
      fullName: profileMap[uid] ?? "Unknown",
      eventCount: userStats[uid].count,
      totalHours: Math.round(userStats[uid].hours),
    }))
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 10);

  return {
    data: {
      totalEvents: events.length,
      totalHours,
      avgPerUser: uniqueUsers > 0 ? (events.length / uniqueUsers).toFixed(1) : "0",
      categoryDistribution: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      dailyTrend: dailyData,
      weeklyTrend: weeklyData,
      topUsers,
    },
  };
}

export async function getSystemHealth(): Promise<{ data?: SystemHealth; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  const admin = createAdminClient();
  const start = Date.now();

  const { count: totalUsers, error: dbError } = await admin
    .from("profiles")
    .select("user_id", { count: "exact", head: true });

  const dbLatencyMs = Date.now() - start;

  const { count: totalEvents } = await admin
    .from("events")
    .select("id", { count: "exact", head: true });

  const { data: lastLog } = await admin
    .from("reminder_logs")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  const { data: recentLogs } = await admin
    .from("reminder_logs")
    .select("id, event_id, reminder_minutes, sent_at")
    .order("sent_at", { ascending: false })
    .limit(15);

  const recentActivity: SystemHealth["recentActivity"] = (recentLogs ?? []).map((log) => ({
    id: log.id,
    action: "Gửi nhắc nhở",
    timestamp: log.sent_at,
    details: `Nhắc nhở trước ${log.reminder_minutes} phút`,
  }));

  return {
    data: {
      dbStatus: dbError ? "degraded" : "operational",
      dbLatencyMs,
      totalUsers: totalUsers ?? 0,
      totalEvents: totalEvents ?? 0,
      lastCronRun: lastLog?.sent_at ?? null,
      recentActivity,
    },
  };
}

export async function triggerCronManual(): Promise<{ success?: boolean; sent?: number; error?: string }> {
  const check = await verifyAdmin();
  if (check.error) return { error: check.error };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/cron/reminders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    const data = await res.json();
    return { success: true, sent: data.sent ?? 0 };
  } catch {
    return { error: "Không thể chạy cron" };
  }
}
