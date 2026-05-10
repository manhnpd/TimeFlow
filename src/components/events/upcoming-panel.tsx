"use client";

import { useMemo } from "react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";
import { type CalendarEvent, CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

interface UpcomingPanelProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

function getTimeLabel(date: string) {
  const d = parseISO(date);
  if (isToday(d)) return "Hôm nay";
  if (isTomorrow(d)) return "Ngày mai";
  return format(d, "EEE, d MMM");
}

export function UpcomingPanel({ events, onEventClick }: UpcomingPanelProps) {
  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);
  }, [events]);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Không có sự kiện sắp tới</p>
        <button className="w-full mt-6 py-3 border border-dashed border-border rounded-xl text-xs text-muted-foreground font-bold hover:border-muted-foreground hover:text-foreground transition-all">
          + Thêm việc cho ngày hôm nay
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {upcoming.map((event) => (
        <button
          key={event.id}
          onClick={() => onEventClick(event)}
          className="flex gap-4 items-center group cursor-pointer hover:translate-x-1 transition-transform text-left w-full"
        >
          <div className={cn("w-1 h-12 rounded-full shrink-0")} style={{ backgroundColor: event.color }} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground leading-none truncate">{event.title}</h4>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Clock size={12} />
              {!event.all_day
                ? `${format(parseISO(event.start_time), "HH:mm")} - ${format(parseISO(event.end_time), "HH:mm")}`
                : "Cả ngày"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{getTimeLabel(event.start_time)}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      ))}
      <button className="w-full mt-4 py-3 border border-dashed border-border rounded-xl text-xs text-muted-foreground font-bold hover:border-muted-foreground hover:text-foreground transition-all">
        + Thêm việc cho ngày hôm nay
      </button>
    </div>
  );
}
