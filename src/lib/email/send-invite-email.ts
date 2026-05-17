import { escapeHtml } from "@/lib/email/escape-html";
import { sendResendEmail, type SendEmailResult } from "@/lib/email/send-resend";

export type SendInviteEmailResult = SendEmailResult;

export async function sendInviteEmail(params: {
  to: string;
  fullName: string;
  inviteUrl: string;
  expiresAt: Date;
}): Promise<SendInviteEmailResult> {
  const expiresLabel = params.expiresAt.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return sendResendEmail({
    to: params.to,
    subject: "Velkommen til Vandel Brugshundeklub",
    html: `
      <p>Hej ${escapeHtml(params.fullName)},</p>
      <p>Din ansøgning om medlemskab er godkendt. Klik på knappen nedenfor for at oprette din konto og komme i gang på medlemsplatformen.</p>
      <p style="margin: 24px 0;">
        <a href="${params.inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #5B9BD5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Aktivér min konto
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Eller kopier dette link: <a href="${params.inviteUrl}">${params.inviteUrl}</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Linket udløber ${expiresLabel}.
      </p>
      <p style="font-size: 14px; color: #666;">
        Med venlig hilsen<br />
        Vandel Brugshundeklub
      </p>
    `.trim(),
  });
}
