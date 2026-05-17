/**
 * Test Resend invitationsmail (samme som ved godkendelse af ansøgning).
 * Brug: npm run test:resend -- din@email.dk
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("Mangler .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, i).trim()] = value;
  }
  return env;
}

const to = process.argv[2];
if (!to) {
  console.error("Brug: npm run test:resend -- din@email.dk");
  process.exit(1);
}

const env = loadEnvLocal();
const apiKey = env.RESEND_API_KEY;
const from = env.RESEND_FROM_EMAIL ?? "VBK <onboarding@resend.dev>";
const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!apiKey) {
  console.error("RESEND_API_KEY mangler i .env.local");
  process.exit(1);
}

const inviteUrl = `${appUrl}/invite/test-token-ikke-gyldig`;
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 14);

console.log("Sender test-mail...");
console.log("  Fra:", from);
console.log("  Til:", to);
console.log("  (Dette er kun en test — linket i mailen er ikke en rigtig invitation)\n");

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "[TEST] Velkommen til Vandel Brugshundeklub",
    html: `<p>Hej,</p><p>Dette er en test af Resend fra VBK-platformen.</p><p>Eksempel-link: <a href="${inviteUrl}">${inviteUrl}</a></p>`,
  }),
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Fejl fra Resend:", res.status, data);
  console.error(
    "\nTip: Med onboarding@resend.dev kan du ofte kun sende til den e-mail, du brugte da du oprettede Resend-kontoen."
  );
  console.error(
    "Til andre modtagere: verificér et domæne under resend.com → Domains."
  );
  process.exit(1);
}

console.log("OK — mail sendt. Tjek indbakke (og spam) for:", to);
console.log("Resend id:", data.id ?? "(se dashboard)");
