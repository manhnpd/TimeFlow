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
  if (minutes < 60) return `${minutes} phút`;
  if (minutes < 1440) return `${minutes / 60} giờ`;
  return `${minutes / 1440} ngày`;
}

const CATEGORY_LABELS: Record<string, string> = {
  work: "Công việc",
  personal: "Cá nhân",
  health: "Sức khỏe",
  study: "Học tập",
  entertainment: "Giải trí",
  other: "Khác",
};

export async function sendReminderEmail({
  userEmail,
  eventTitle,
  eventDescription,
  eventStartTime,
  reminderMinutes,
  category,
}: ReminderEmailProps) {
  const startTime = new Date(eventStartTime).toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { data, error } = await resend.emails.send({
    from: "ScheduleMe <onboarding@resend.dev>",
    to: userEmail,
    subject: `Nhắc nhở: ${eventTitle} - sau ${formatReminderLabel(reminderMinutes)}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #131313; border-radius: 12px; overflow: hidden;">
        <div style="background: #3b82f6; padding: 24px 32px;">
          <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 700;">Nhắc nhở ScheduleMe</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 8px; color: #e5e2e1; font-size: 18px; font-weight: 600;">${eventTitle}</h2>
          <p style="margin: 0 0 16px; color: #c2c6d6; font-size: 14px; line-height: 1.5;">
            Sự kiện này sẽ bắt đầu sau <strong style="color: #adc6ff;">${formatReminderLabel(reminderMinutes)}</strong>
          </p>

          <div style="background: #201f1f; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">Thời gian:</strong> ${startTime}
            </p>
            <p style="margin: 0 0 8px; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">Danh mục:</strong> ${CATEGORY_LABELS[category] || category}
            </p>
            ${eventDescription ? `<p style="margin: 0; color: #c2c6d6; font-size: 13px;">
              <strong style="color: #e5e2e1;">Ghi chú:</strong> ${eventDescription}
            </p>` : ""}
          </div>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Xem trong ScheduleMe
          </a>
        </div>
        <div style="padding: 16px 32px; border-top: 1px solid #424754;">
          <p style="margin: 0; color: #8c909f; font-size: 12px;">
            © 2024 ScheduleMe. Bạn nhận được email này vì đã đặt nhắc nhở cho sự kiện.
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
