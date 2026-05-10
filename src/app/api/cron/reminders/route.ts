import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendReminderEmail } from "@/lib/resend";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lookAhead = new Date(now.getTime() + 15 * 60 * 1000); // Next 15 min window

  // Fetch events with reminders that haven't been sent
  const { data: events, error: fetchError } = await supabase
    .from("events")
    .select("id, user_id, title, description, start_time, end_time, all_day, category, reminders")
    .gt("start_time", now.toISOString())
    .lt("start_time", lookAhead.toISOString())
    .neq("reminders", "[]");

  if (fetchError) {
    console.error("Error fetching events:", fetchError);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sentCount = 0;

  for (const event of events) {
    const eventStart = new Date(event.start_time);
    const reminderMinutes: number[] = event.reminders || [];

    for (const minutes of reminderMinutes) {
      const reminderTime = new Date(
        eventStart.getTime() - minutes * 60 * 1000
      );

      // Check if we should send this reminder (within the current window)
      const timeDiff = reminderTime.getTime() - now.getTime();
      if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
        // Check if already sent
        const { data: existing } = await supabase
          .from("reminder_logs")
          .select("id")
          .eq("event_id", event.id)
          .eq("reminder_minutes", minutes)
          .single();

        if (!existing) {
          // Get user email
          const {
            data: { user },
          } = await supabase.auth.admin.getUserById(event.user_id);

          if (user?.email) {
            const result = await sendReminderEmail({
              userEmail: user.email,
              eventTitle: event.title,
              eventDescription: event.description,
              eventStartTime: event.start_time,
              reminderMinutes: minutes,
              category: event.category,
            });

            if (result.success) {
              // Log the reminder
              await supabase.from("reminder_logs").insert({
                event_id: event.id,
                user_id: event.user_id,
                reminder_minutes: minutes,
              });
              sentCount++;
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ sent: sentCount, checked: events.length });
}
