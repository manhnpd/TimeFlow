"use server";

import { createClient } from "@/lib/supabase/server";
import { type EventCategory } from "@/types";

export async function getUserRole(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return data?.role ?? 0;
}

export async function getEvents(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { events: [] };

  let query = supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });

  if (startDate && endDate) {
    query = query
      .gte("end_time", startDate)
      .lte("start_time", endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching events:", error);
    return { events: [] };
  }
  return { events: data ?? [] };
}

export async function createEvent(formData: {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  category: EventCategory;
  reminders: number[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...formData,
      user_id: user.id,
      reminders: formData.reminders,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { event: data };
}

export async function updateEvent(
  id: string,
  formData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    color: string;
    category: EventCategory;
    reminders: number[];
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("events")
    .update(formData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { event: data };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function moveEvent(id: string, startTime: string, endTime: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("events")
    .update({ start_time: startTime, end_time: endTime })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { event: data };
}

export async function getUserPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { preferences: null };

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // No preferences yet, create defaults
    const { data: newData } = await supabase
      .from("user_preferences")
      .insert({ user_id: user.id })
      .select()
      .single();
    return { preferences: newData };
  }

  return { preferences: data };
}

export async function updateUserPreferences(formData: {
  timezone: string;
  theme: string;
  default_view: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      ...formData,
    });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAnalytics() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null };

  const { data: events, error } = await supabase
    .from("events")
    .select("start_time, end_time, category, color, all_day")
    .eq("user_id", user.id);

  if (error) return { data: null };

  const now = new Date();
  const totalEvents = events.length;
  const thisMonth = events.filter((e) => {
    const d = new Date(e.start_time);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const categoryMap: Record<string, number> = {};
  events.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
  });

  const dailyData: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = events.filter((e) => e.start_time.startsWith(dateStr)).length;
    dailyData.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count });
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDayData = weekDays.map((day, i) => ({
    day,
    count: events.filter((e) => ((new Date(e.start_time).getDay() + 6) % 7) === i).length,
  }));

  const hourData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    count: events.filter((e) => new Date(e.start_time).getHours() === h).length,
  })).filter((h) => h.count > 0);

  const totalHours = events.reduce((sum, e) => {
    const diff = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
    return sum + Math.max(0, diff / (1000 * 60 * 60));
  }, 0);

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
    weeklyData.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      count,
    });
  }

  return {
    data: {
      totalEvents,
      thisMonth,
      totalHours: Math.round(totalHours),
      avgPerDay: totalEvents > 0 ? (totalEvents / 30).toFixed(1) : "0",
      categoryDistribution: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      dailyTrend: dailyData,
      weekDayDistribution: weekDayData,
      hourlyDistribution: hourData,
      weeklyTrend: weeklyData,
    },
  };
}
