/**
 * Kræver: npm run dev kører, .env.local med ADMIN_SETUP_SECRET
 * Brug: npm run dev:invite
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
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const base = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const secret = env.ADMIN_SETUP_SECRET;

if (!secret) {
  console.error("Sæt ADMIN_SETUP_SECRET i .env.local");
  process.exit(1);
}

const res = await fetch(`${base}/api/dev/invite`, {
  method: "POST",
  headers: { "x-setup-secret": secret },
});

const data = await res.json();
if (!res.ok) {
  console.error("Fejl:", data);
  process.exit(1);
}

console.log("\n✓ Dev-invitation oprettet\n");
console.log("1. Åbn:", data.invite_url);
console.log("2. Udfyld navn + din e-mail, klik Send login-link");
console.log("3. Kør: npm run dev:magic-link din@email.dk");
console.log("4. Åbn det link der printes → du er inde på /hjem\n");
if (data.note) console.log(data.note, "\n");
