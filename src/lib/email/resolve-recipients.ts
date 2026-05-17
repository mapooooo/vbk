import { escapeHtml } from "@/lib/email/escape-html";

export type ResolvedRecipients = {
  to: string[];
  subjectPrefix: string;
  devBannerHtml: string;
};

function normalizeList(intended: string | string[]): string[] {
  const list = (Array.isArray(intended) ? intended : [intended])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(list)];
}

/** I test: omdiriger alle Resend-mails til RESEND_DEV_REDIRECT_TO. */
export function resolveRecipients(
  intended: string | string[]
): ResolvedRecipients {
  const intendedList = normalizeList(intended);
  const redirect = process.env.RESEND_DEV_REDIRECT_TO?.trim().toLowerCase();

  if (!redirect || intendedList.length === 0) {
    return { to: intendedList, subjectPrefix: "", devBannerHtml: "" };
  }

  const alreadyTarget =
    intendedList.length === 1 && intendedList[0] === redirect;
  if (alreadyTarget) {
    return { to: intendedList, subjectPrefix: "", devBannerHtml: "" };
  }

  return {
    to: [redirect],
    subjectPrefix: "[TEST] ",
    devBannerHtml: `
      <p style="margin: 0 0 16px; padding: 12px; background: #fff8e6; border: 1px solid #e6c200; border-radius: 8px; font-size: 14px; color: #664d00;">
        <strong>Test-omdirigering:</strong> denne mail skulle oprindeligt til
        <strong>${escapeHtml(intendedList.join(", "))}</strong>.
      </p>
    `.trim(),
  };
}
