import { Resend } from "resend";
import { resolveRecipients } from "@/lib/email/resolve-recipients";

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "send_failed"; error?: string };

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "VBK <onboarding@resend.dev>";
  if (!apiKey) return null;
  return { resend: new Resend(apiKey), from };
}

export async function sendResendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) return { sent: false, reason: "not_configured" };

  const { to, subjectPrefix, devBannerHtml } = resolveRecipients(params.to);
  if (to.length === 0) return { sent: false, reason: "not_configured" };

  const html = devBannerHtml
    ? `${devBannerHtml}\n${params.html}`
    : params.html;

  const { error } = await client.resend.emails.send({
    from: client.from,
    to,
    subject: `${subjectPrefix}${params.subject}`,
    html,
  });

  if (error) {
    console.error("sendResendEmail:", error);
    return { sent: false, reason: "send_failed", error: error.message };
  }
  return { sent: true };
}
