import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSiteName, getBaseUrl } from "@/lib/utils";

const SMTP_FROM = process.env.SMTP_FROM || "status@example.com";

let _transporter: nodemailer.Transporter | null | undefined;

function getTransporter() {
  if (_transporter !== undefined) return _transporter;

  const host = process.env.SMTP_HOST;
  if (!host) {
    _transporter = null;
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
}

async function sendToAllSubscribers(subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const allSubscribers = db
    .select({ email: subscribers.email, token: subscribers.token })
    .from(subscribers)
    .where(eq(subscribers.verified, true))
    .all();

  const baseUrl = getBaseUrl();

  for (const sub of allSubscribers) {
    const unsubLink = `${baseUrl}/unsubscribe?token=${sub.token}`;
    const fullHtml = `${html}<hr style="margin-top:32px;border-color:#eee"><p style="color:#999;font-size:12px"><a href="${unsubLink}">Unsubscribe</a></p>`;

    try {
      await transporter.sendMail({ from: SMTP_FROM, to: sub.email, subject, html: fullHtml });
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err);
    }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const baseUrl = getBaseUrl();
  const verifyLink = `${baseUrl}/subscribe?verify=${token}`;
  const siteName = getSiteName();

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: `Confirm your subscription to ${siteName}`,
    html: `<p>Click the link below to confirm your subscription:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
  });
}

export async function notifyIncidentCreated(title: string, impact: string, message: string) {
  const siteName = getSiteName();
  await sendToAllSubscribers(
    `[${siteName}] New Incident: ${title}`,
    `<h2>New Incident: ${title}</h2><p><strong>Impact:</strong> ${impact}</p><p>${message}</p>`
  );
}

export async function notifyIncidentUpdated(title: string, status: string, message: string) {
  const siteName = getSiteName();
  await sendToAllSubscribers(
    `[${siteName}] Update: ${title}`,
    `<h2>${title}</h2><p><strong>Status:</strong> ${status}</p><p>${message}</p>`
  );
}

export async function notifyIncidentResolved(title: string) {
  const siteName = getSiteName();
  await sendToAllSubscribers(
    `[${siteName}] Resolved: ${title}`,
    `<h2>${title}</h2><p>This incident has been resolved.</p>`
  );
}

export async function notifyMaintenanceScheduled(
  title: string,
  start: string,
  end: string
) {
  const siteName = getSiteName();
  await sendToAllSubscribers(
    `[${siteName}] Scheduled Maintenance: ${title}`,
    `<h2>Scheduled Maintenance: ${title}</h2><p><strong>Start:</strong> ${start}</p><p><strong>End:</strong> ${end}</p>`
  );
}
