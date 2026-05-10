import { create } from "zustand";
import { type CalendarEvent } from "@/types";

interface EventState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isEventModalOpen: boolean;
  isQuickAddOpen: boolean;
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  removeEvent: (id: string) => void;
  selectEvent: (event: CalendarEvent | null) => void;
  openEventModal: (event?: CalendarEvent | null) => void;
  closeEventModal: () => void;
  toggleQuickAdd: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedEvent: null,
  isEventModalOpen: false,
  isQuickAddOpen: false,

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  updateEvent: (event) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    })),

  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

  selectEvent: (event) => set({ selectedEvent: event }),

  openEventModal: (event) =>
    set({ isEventModalOpen: true, selectedEvent: event ?? null }),

  closeEventModal: () =>
    set({ isEventModalOpen: false, selectedEvent: null }),

  toggleQuickAdd: () =>
    set((state) => ({ isQuickAddOpen: !state.isQuickAddOpen })),
}));
