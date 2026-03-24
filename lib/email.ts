import { format } from "date-fns";
import { Resend } from "resend";

import { absoluteUrl } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = "Reflct <hello@reflct.app>";

function shell({
  title,
  eyebrow,
  body,
  ctaLabel,
  ctaHref
}: {
  title: string;
  eyebrow: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return `
    <div style="background:#0a0a0f;padding:32px;font-family:Geist,system-ui,sans-serif;color:#f8f8f2;">
      <div style="max-width:560px;margin:0 auto;background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border-radius:28px;padding:32px;">
        <p style="text-transform:uppercase;letter-spacing:0.28em;font-size:11px;color:#b6ad97;margin:0 0 16px;">${eyebrow}</p>
        <h1 style="font-family:Lora, Georgia, serif;font-size:40px;line-height:1.1;margin:0 0 18px;">${title}</h1>
        <p style="font-size:16px;line-height:1.8;color:#ddd7c5;margin:0 0 28px;">${body}</p>
        <a href="${ctaHref}" style="display:inline-block;background:#c9a84c;color:#0a0a0f;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600;">
          ${ctaLabel}
        </a>
      </div>
    </div>
  `;
}

export async function sendFridayReminderEmail({
  email,
  lastGoal
}: {
  email: string;
  lastGoal: string | null;
}) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to: email,
    subject: "Your Friday reflection is open",
    html: shell({
      eyebrow: "Friday reminder",
      title: "Your weekly reflection is ready.",
      body: `Last week you wanted to: "${lastGoal ?? "Set one clear goal."}" Take four calm minutes and close the loop.`,
      ctaLabel: "Open entry",
      ctaHref: absoluteUrl("/entry")
    })
  });
}

export async function sendSundayLastChanceEmail({
  email,
  streakCount
}: {
  email: string;
  streakCount: number;
}) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to: email,
    subject: "A gentle nudge before the week closes",
    html: shell({
      eyebrow: "Sunday last chance",
      title: "Your week is still waiting for a closing note.",
      body: `You’re carrying a ${streakCount}-week reflection streak. If this week mattered, give it one calm paragraph before Sunday night.`,
      ctaLabel: "Finish this week",
      ctaHref: absoluteUrl("/entry")
    })
  });
}

export async function sendMonthlyWrappedReadyEmail({
  email,
  month,
  year,
  topTheme
}: {
  email: string;
  month: number;
  year: number;
  topTheme: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to: email,
    subject: `${format(new Date(year, month - 1, 1), "MMMM")} Wrapped is ready`,
    html: shell({
      eyebrow: "Monthly Wrapped",
      title: "Your month has a shape now.",
      body: `One theme rose above the rest: ${topTheme}. Your Wrapped is ready with focus trends, goals, and the week that stood out most.`,
      ctaLabel: "Open Wrapped",
      ctaHref: absoluteUrl(`/wrapped/${year}-${String(month).padStart(2, "0")}`)
    })
  });
}
