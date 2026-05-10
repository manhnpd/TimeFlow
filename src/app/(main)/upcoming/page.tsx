"use client";

import { useEffect, useMemo, useState } from "react";
import { getEvents } from "@/lib/actions";
import { useEventStore } from "@/stores/event-store";
import { EventModal } from "@/components/events/event-modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO, isThisWeek } from "date-fns";
import { type CalendarEvent, CATEGORIES } from "@/types";

type FilterPeriod = "all" | "today" | "tomorrow" | "week" | "month";

function EventCard({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: () => void;
}) {
  const startTime = parseISO(event.start_time);
  const dayLabel = isToday(startTime)
    ? "Today"
    : isTomorrow(startTime)
    ? "Tomorrow"
    : format(startTime, "EEE, MMM d");

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-card hover:bg-accent transition-colors group border border-border"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: event.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {event.title}
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] shrink-0"
              style={{
                borderColor: event.color,
                color: event.color,
              }}
            >
              {CATEGORIES.find((c) => c.value === event.category)?.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dayLabel}
            </span>
            {!event.all_day && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(startTime, "HH:mm")} -{" "}
                {format(parseISO(event.end_time), "HH:mm")}
              </span>
            )}
            {event.all_day && (
              <span className="flex items-center gap-1">All day</span>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {event.description}
            </p>
          )}

          {event.reminders?.length > 0 && (
            <div className="flex gap-1 mt-2">
              {event.reminders.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {r < 60
                    ? `${r}m`
                    : r < 1440
                    ? `${r / 60}h`
                    : `${r / 1440}d`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function UpcomingPage() {
  const { events, setEvents, openEventModal } = useEventStore();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<FilterPeriod>("all");
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { events: data } = await getEvents();
      setEvents(data ?? []);
      setLoading(false);
    }
    load();
  }, [setEvents]);

  const filtered = useMemo(() => {
    const now = new Date();
    let result = events.filter((e) => new Date(e.start_time) >= now);

    // Filter by period
    if (period === "today") {
      result = result.filter((e) => isToday(parseISO(e.start_time)));
    } else if (period === "tomorrow") {
      result = result.filter((e) => isTomorrow(parseISO(e.start_time)));
    } else if (period === "week") {
      result = result.filter((e) => isThisWeek(parseISO(e.start_time)));
    } else if (period === "month") {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      result = result.filter(
        (e) => new Date(e.start_time) <= monthEnd
      );
    }

    // Filter by category
    if (category !== "all") {
      result = result.filter((e) => e.category === category);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }

    return result.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events, period, category, search]);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Upcoming Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-surface-container dark:bg-surface-container-low border-outline-variant/30"
          />
        </div>
        <Select value={period} onValueChange={(v) => v && setPeriod(v as FilterPeriod)}>
          <SelectTrigger className="w-[140px] h-9 bg-surface-container dark:bg-surface-container-low border-outline-variant/30">
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-[150px] h-9 bg-surface-container dark:bg-surface-container-low border-outline-variant/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No events found</p>
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => openEventModal(event)}
            />
          ))
        )}
      </div>

      <EventModal />
    </div>
  );
}
