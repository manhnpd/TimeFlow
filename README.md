# ScheduleMe - Smart Personal Schedule Planner

Ứng dụng quản lý lịch trình cá nhân với nhắc lịch thông minh qua email.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** + **Lucide React** icons
- **Supabase** (PostgreSQL + Auth + RLS)
- **react-big-calendar** with Drag & Drop
- **Resend** (email reminders)
- **Zustand** (state management)
- **Zod** + **React Hook Form** (validation)
- **Vercel Cron** (scheduled reminders)

## Features

- Authentication (email/password) with protected routes
- Calendar views: Month, Week, Day, Agenda
- Drag & Drop events to reschedule
- Full CRUD for events with color coding, categories, and reminders
- Smart email reminders (5m, 15m, 30m, 1h, 1d, 2d before)
- Mini calendar + category navigation sidebar
- Upcoming events with search and filters
- Dark/Light mode (dark default)
- Responsive design
- Settings page (timezone, theme, default view)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account (for email reminders)

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd scheduleme
npm install
```

### 3. Supabase Setup

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Run the contents of `supabase/schema.sql`

This creates:
- `events` table
- `reminder_logs` table
- `user_preferences` table
- Row Level Security policies
- Indexes for performance

### 4. Environment Variables

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_xxxxx
CRON_SECRET=a-random-secret-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `SUPABASE_SERVICE_ROLE_KEY` — find in Supabase Dashboard > Settings > API (only needed for cron job)
- `CRON_SECRET` — generate a random string, used to secure the cron endpoint

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your sending domain
3. Update the `from` address in `src/lib/resend.ts`:
   ```
   from: "ScheduleMe <noreply@yourdomain.com>"
   ```

### 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel Dashboard > Settings > Environment Variables.

The `vercel.json` configures a cron job that runs every 10 minutes to check and send reminders.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (no sidebar)
│   │   ├── login/
│   │   └── register/
│   ├── (main)/           # Protected pages (with sidebar)
│   │   ├── upcoming/
│   │   ├── settings/
│   │   └── page.tsx      # Dashboard (calendar)
│   ├── api/
│   │   └── cron/
│   │       └── reminders/ # Cron endpoint
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── calendar/         # Calendar component
│   ├── events/           # Event modal, upcoming panel
│   ├── layout/           # Sidebar, mini-calendar, theme provider
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── actions.ts        # Server Actions
│   ├── resend.ts         # Email sending
│   ├── supabase/         # Supabase clients
│   └── utils.ts
├── stores/
│   └── event-store.ts    # Zustand store
├── types/
│   └── index.ts
├── middleware.ts          # Auth middleware
supabase/
└── schema.sql             # Database schema + RLS
vercel.json                # Cron job config
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/cron/reminders` | POST | Cron job: check & send reminders |

Call with: `curl -X POST http://localhost:3000/api/cron/reminders -H "Authorization: Bearer YOUR_CRON_SECRET"`

## Database Schema

### Events
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Event title |
| description | TEXT | Optional description |
| start_time | TIMESTAMPTZ | Start time (UTC) |
| end_time | TIMESTAMPTZ | End time (UTC) |
| all_day | BOOLEAN | All-day event flag |
| color | TEXT | Hex color code |
| category | TEXT | work/personal/health/study/entertainment/other |
| reminders | JSONB | Array of minutes, e.g. [5, 30, 1440] |

### Reminder Logs
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| event_id | UUID | Foreign key to events |
| reminder_minutes | INTEGER | Minutes before event |
| sent_at | TIMESTAMPTZ | When reminder was sent |

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```
