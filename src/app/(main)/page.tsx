"use client";

import { useEffect } from "react";
import { getEvents } from "@/lib/actions";
import { useEventStore } from "@/stores/event-store";
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar";
import { EventModal } from "@/components/events/event-modal";
import { UpcomingPanel } from "@/components/events/upcoming-panel";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, TrendingUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { useState } from "react";
import { motion } from "motion/react";

export default function DashboardPage() {
  const { events, setEvents, openEventModal } = useEventStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    async function loadEvents() {
      const { events: data } = await getEvents();
      setEvents(data ?? []);
    }
    loadEvents();
  }, [setEvents]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const dateRangeLabel = `${format(weekStart, "d")} Tháng ${format(weekStart, "M")} - ${format(weekEnd, "d")} Tháng ${format(weekEnd, "M, yyyy")}`;

  const thisMonth = events.filter((e) => {
    const d = new Date(e.start_time);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const todayEvents = events.filter((e) => {
    const d = new Date(e.start_time);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const stats = [
    { label: "Tổng sự kiện", value: events.length.toString(), change: "+12%", color: "border-blue-500", icon: Calendar },
    { label: "Sự kiện hôm nay", value: todayEvents.toString(), change: `+${todayEvents}`, color: "border-purple-500", icon: Clock },
    { label: "Tháng này", value: thisMonth.toString(), change: "+5%", color: "border-emerald-500", icon: TrendingUp },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-muted-foreground text-sm">Chào mừng bạn quay lại, đây là lịch trình hôm nay của bạn.</p>
        </div>
        <button
          onClick={() => openEventModal(null)}
          className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={18} />
          Tạo lịch mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("bg-card p-6 rounded-xl border-l-4 shadow-sm", stat.color)}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-secondary rounded-lg">
                <stat.icon size={20} className="text-foreground" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-foreground">Lịch trình</h3>
              <div className="flex items-center bg-secondary px-3 py-1.5 rounded-full gap-4 border border-border">
                <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="text-muted-foreground hover:text-foreground transition-colors">
                  ←
                </button>
                <span className="text-sm font-bold text-foreground">{dateRangeLabel}</span>
                <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="text-muted-foreground hover:text-foreground transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="h-[500px]">
            <ScheduleCalendar />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Sắp tới</h3>
            <a href="/upcoming" className="text-xs text-primary font-bold hover:underline">Xem tất cả</a>
          </div>
          <UpcomingPanel events={events} onEventClick={openEventModal} />
        </div>
      </div>

      <EventModal />
    </div>
  );
}
