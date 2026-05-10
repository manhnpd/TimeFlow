import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailProps {
  userEmail: string;
  eventTitle: string;
  eventDescription?: string | null;
  eventStartTime: string;
  reminderMinutes: number;
  category: string;
}

function formatReminderLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${minutes / 60} hour(s)`;
  return `${minutes / 1440} day(s)`;
}

export async function sendReminderEmail({
  userEmail,
  eventTitle,
  eventDescription,
  eventStartTime,
  reminderMinutes,
  category,
}: ReminderEmailProps) {
  const startTime = new Date(eventStartTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { data, error } = await resend.emails.send({
    from: "ScheduleMe <noreply@yourdomain.com>",
    to: userEmail,
    subject: `Reminder: ${eventTitle} - in ${formatReminderLabel(reminderMinutes)}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #131313; border-radius: 12px; overflow: hidden;">
        <div style="background: #3b82f6; padding: 24px 32px;">
          <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 700;">ScheduleMe Reminder</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 8px; color: #e5e2e1; font-size: 18px; font-weight: 600;">${eventTitle}</h2>
          <p style="margin: 0 0 16px; color: #c2c6d6; font-size: 14px; line-height: 1.5;">
            This event starts in <strong style="color: #adc6ff;">${formatReminderLabel(reminderMinutes)}</strong>
          </p>

          <div style="background: #201f1f; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">When:</strong> ${startTime}
            </p>
            <p style="margin: 0 0 8px; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">Category:</strong> ${category}
            </p>
            ${eventDescription ? `<p style="margin: 0; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">Notes:</strong> ${eventDescription}
            </p>` : ""}
          </div>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            View in ScheduleMe
          </a>
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid #424754;">
          <p style="margin: 0; color: #8c909f; font-size: 12px;">
            © 2024 ScheduleMe. You received this because you set a reminder for this event.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send reminder email:", error);
    return { success: false, error };
  }
  return { success: true, data };
}
