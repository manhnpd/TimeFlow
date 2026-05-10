@AGENTS.md

# ScheduleMe

## Setup
1. Copy `.env.local` and replace placeholder values with real Supabase/Resend credentials
2. Run `supabase/schema.sql` in Supabase SQL Editor
3. `npm run dev` to start

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture
- **App Router** with route groups: `(auth)` for login/register, `(main)` for protected pages with sidebar
- **Supabase** client in `src/lib/supabase/` — browser client, server client, middleware
- **Server Actions** in `src/lib/actions.ts` — all CRUD operations for events and preferences
- **Zustand store** in `src/stores/event-store.ts` — client-side event state
- **shadcn/ui** components in `src/components/ui/` — Select uses `(value: string | null) => void` for onValueChange
- **react-big-calendar** with DnD in `src/components/calendar/schedule-calendar.tsx`
- **Reminder cron** at `/api/cron/reminders` — runs every 10min via Vercel Cron
- **Design system**: colors match the Figma mockups in `../stitch_personal_schedule_planner/`
- Dark mode default, using `next-themes` with class-based toggling
