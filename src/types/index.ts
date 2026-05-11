export type EventCategory =
  | "work"
  | "personal"
  | "health"
  | "study"
  | "entertainment"
  | "other";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  category: EventCategory;
  reminders: number[];
  created_at: string;
  updated_at: string;
}

export interface CalendarEventForm {
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  all_day: boolean;
  color: string;
  category: EventCategory;
  reminders: number[];
}

export const EVENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Orange", value: "#f97316" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Pink", value: "#ec4899" },
  { name: "Yellow", value: "#eab308" },
] as const;

export const CATEGORIES: { value: EventCategory; label: string; color: string }[] = [
  { value: "work", label: "Công việc", color: "#3b82f6" },
  { value: "personal", label: "Cá nhân", color: "#8b5cf6" },
  { value: "health", label: "Sức khỏe", color: "#10b981" },
  { value: "study", label: "Học tập", color: "#f97316" },
  { value: "entertainment", label: "Giải trí", color: "#ec4899" },
  { value: "other", label: "Khác", color: "#06b6d4" },
];

export const REMINDER_OPTIONS = [
  { label: "5 phút", value: 5 },
  { label: "15 phút", value: 15 },
  { label: "30 phút", value: 30 },
  { label: "1 giờ", value: 60 },
  { label: "1 ngày", value: 1440 },
  { label: "2 ngày", value: 2880 },
] as const;

export interface AdminUser {
  userId: string;
  fullName: string;
  email: string;
  role: number;
  createdAt: string;
  eventCount: number;
  lastActive: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  eventsToday: number;
  newUsersThisWeek: number;
  activeUsersThisWeek: number;
  weeklyActivity: { name: string; completed: number; pending: number }[];
}

export interface AdminAnalyticsData {
  totalEvents: number;
  totalHours: number;
  avgPerUser: string;
  categoryDistribution: { name: string; value: number }[];
  dailyTrend: { date: string; count: number }[];
  weeklyTrend: { week: string; count: number }[];
  topUsers: { userId: string; fullName: string; eventCount: number; totalHours: number }[];
}

export interface SystemHealth {
  dbStatus: "operational" | "degraded" | "down";
  dbLatencyMs: number;
  totalUsers: number;
  totalEvents: number;
  lastCronRun: string | null;
  recentActivity: { id: string; action: string; timestamp: string; details: string }[];
}
