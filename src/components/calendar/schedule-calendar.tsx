"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type SlotInfo,
  type EventProps,
  type ToolbarProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { moveEvent } from "@/lib/actions";
import { useEventStore } from "@/stores/event-store";
import { type CalendarEvent } from "@/types";
import { toast } from "sonner";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

function CustomEvent({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="flex flex-col overflow-hidden px-3 py-1.5">
      <span className="font-medium text-[11px] leading-tight truncate">
        {event.title}
      </span>
      {!event.all_day && (
        <span className="text-[10px] opacity-70 leading-tight">
          {format(new Date(event.start_time), "HH:mm")} -{" "}
          {format(new Date(event.end_time), "HH:mm")}
        </span>
      )}
    </div>
  );
}

function CustomToolbar() {
  return null;
}

interface ScheduleCalendarProps {
  defaultView?: View;
}

export function ScheduleCalendar({ defaultView: initialView = "week" }: ScheduleCalendarProps) {
  const { events, openEventModal } = useEventStore();
  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState(new Date());

  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: `${event.color}20`,
        borderLeft: `4px solid ${event.color}`,
        color: event.color,
        borderRadius: "4px",
        border: "none",
        boxShadow: "none",
      },
    }),
    []
  );

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        title: e.title,
      })),
    [events]
  );

  const onSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      openEventModal(null);
    },
    [openEventModal]
  );

  const onSelectEvent = useCallback(
    (event: CalendarEvent) => {
      openEventModal(event);
    },
    [openEventModal]
  );

  const onEventDrop = useCallback(
    async ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: Date | string;
      end: Date | string;
    }) => {
      try {
        const startTime = new Date(start).toISOString();
        const endTime = new Date(end).toISOString();
        const result = await moveEvent(event.id, startTime, endTime);
        if (result.error) {
          toast.error("Failed to move event");
        } else if (result.event) {
          useEventStore.getState().updateEvent(result.event);
          toast.success("Event moved");
        }
      } catch {
        toast.error("Failed to move event");
      }
    },
    []
  );

  return (
    <div className="h-full">
      <DnDCalendar
        localizer={localizer}
        events={calendarEvents}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        onEventDrop={onEventDrop}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar as never,
        }}
        step={60}
        timeslots={1}
        defaultView={initialView}
        style={{ height: "100%" }}
      />
    </div>
  );
}
