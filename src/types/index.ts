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
  { value: "work", label: "Work", color: "#3b82f6" },
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "health", label: "Health", color: "#10b981" },
  { value: "study", label: "Study", color: "#f97316" },
  { value: "entertainment", label: "Entertainment", color: "#ec4899" },
  { value: "other", label: "Other", color: "#06b6d4" },
];

export const REMINDER_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1 day", value: 1440 },
  { label: "2 days", value: 2880 },
] as const;
