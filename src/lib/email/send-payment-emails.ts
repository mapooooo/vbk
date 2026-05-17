import { escapeHtml } from "@/lib/email/escape-html";
import { sendResendEmail, type SendEmailResult } from "@/lib/email/send-resend";
import { MOBILEPAY_NUMBER } from "@/lib/payments";
import { formatEventDate } from "@/lib/utils/date";

export type { SendEmailResult };

/** Besked til admin om ny MobilePay-tilmelding der skal godkendes. */
export async function sendPaymentPendingAdminEmail(params: {
  adminEmails: string[];
  memberName: string;
  memberEmail: string;
  eventTitle: string;
  eventDate: string;
  amountKr: number;
  registrationStatus: string;
}): Promise<SendEmailResult> {
  if (params.adminEmails.length === 0) {
    return { sent: false, reason: "not_configured" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const statusLabel =
    params.registrationStatus === "waitlist" ? "venteliste" : "tilmeldt";

  return sendResendEmail({
    to: params.adminEmails,
    subject: `Ny MobilePay-tilmelding: ${params.eventTitle}`,
    html: `
      <p>Hej,</p>
      <p><strong>${escapeHtml(params.memberName)}</strong> (${escapeHtml(params.memberEmail)}) er ${statusLabel} på holdet <strong>${escapeHtml(params.eventTitle)}</strong>.</p>
      <p>Forventet betaling: <strong>${params.amountKr} kr</strong> via MobilePay til ${MOBILEPAY_NUMBER}.</p>
      <p>Holdstart: ${escapeHtml(formatEventDate(params.eventDate))}</p>
      <p style="margin: 24px 0;">
        <a href="${appUrl}/admin" style="display: inline-block; padding: 12px 24px; background-color: #5B9BD5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Godkend betaling i admin
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">Når du har modtaget MobilePay, klik «Betaling modtaget» — medlemmet får en bekræftelse på mail.</p>
    `.trim(),
  });
}

/** Bekræftelse til medlem når admin har godkendt MobilePay. */
export async function sendPaymentConfirmedMemberEmail(params: {
  to: string;
  memberName: string;
  eventTitle: string;
  eventDate: string;
  amountKr: number;
}): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return sendResendEmail({
    to: params.to,
    subject: `Din plads er godkendt — ${params.eventTitle}`,
    html: `
      <p>Hej ${escapeHtml(params.memberName)},</p>
      <p>Vi har modtaget din betaling på <strong>${params.amountKr} kr</strong> via MobilePay.</p>
      <p>Din plads på <strong>${escapeHtml(params.eventTitle)}</strong> er nu godkendt.</p>
      <p>Holdstart: ${escapeHtml(formatEventDate(params.eventDate))}</p>
      <p style="margin: 24px 0;">
        <a href="${appUrl}/tilmelding/mine" style="display: inline-block; padding: 12px 24px; background-color: #5B9BD5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Se mine tilmeldinger
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">Vi glæder os til at se jer!</p>
      <p style="font-size: 14px; color: #666;">Vandel Brugshundeklub</p>
    `.trim(),
  });
}
