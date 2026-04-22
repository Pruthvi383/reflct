import { Resend } from "resend";

import { APP_NAME } from "@/lib/constants";
import { absoluteUrl, formatCurrency, formatMonth } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? `${APP_NAME} <updates@example.com>`;

function shell({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return `
    <div style="background:#f8f0e8;padding:32px;font-family:Space Grotesk,system-ui,sans-serif;color:#11212d;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:28px;padding:32px;border:1px solid rgba(17,33,45,0.08);">
        <p style="text-transform:uppercase;letter-spacing:0.24em;font-size:11px;color:#5f707d;margin:0 0 14px;">${eyebrow}</p>
        <h1 style="font-family:Fraunces,Georgia,serif;font-size:38px;line-height:1.1;margin:0 0 16px;">${title}</h1>
        <p style="font-size:16px;line-height:1.75;color:#32424d;margin:0 0 28px;">${body}</p>
        <a href="${ctaHref}" style="display:inline-block;background:#f46524;color:#fff7f2;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600;">
          ${ctaLabel}
        </a>
      </div>
    </div>
  `;
}

async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) return;

  await resend.emails.send({
    from,
    to,
    subject,
    html
  });
}

export async function sendDrawPublishedEmail({
  email,
  drawMonth
}: {
  email: string;
  drawMonth: string;
}) {
  await sendEmail({
    to: email,
    subject: `${APP_NAME}: ${formatMonth(drawMonth)} results are live`,
    html: shell({
      eyebrow: "Draw results",
      title: "This month's draw has been published.",
      body: "Log in to see the winning numbers, your participation summary, and the latest charity impact totals.",
      ctaLabel: "Open dashboard",
      ctaHref: absoluteUrl("/dashboard/draws")
    })
  });
}

export async function sendWinnerAlertEmail({
  email,
  amount,
  drawMonth
}: {
  email: string;
  amount: number;
  drawMonth: string;
}) {
  await sendEmail({
    to: email,
    subject: `${APP_NAME}: you have a verified win pending`,
    html: shell({
      eyebrow: "Winner alert",
      title: `You're provisionally owed ${formatCurrency(amount)}.`,
      body: `Your scores matched a prize tier in the ${formatMonth(drawMonth)} draw. Upload your proof so the team can review and release payment.`,
      ctaLabel: "Upload proof",
      ctaHref: absoluteUrl("/dashboard/winnings")
    })
  });
}

export async function sendSystemUpdateEmail({
  email,
  title,
  message
}: {
  email: string;
  title: string;
  message: string;
}) {
  await sendEmail({
    to: email,
    subject: `${APP_NAME}: ${title}`,
    html: shell({
      eyebrow: "Platform update",
      title,
      body: message,
      ctaLabel: "Open platform",
      ctaHref: absoluteUrl("/dashboard")
    })
  });
}
