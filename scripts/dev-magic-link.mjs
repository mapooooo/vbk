/**
 * Kræver: du har lige sendt login fra /invite/... (cookies sættes)
 * Brug: npm run dev:magic-link -- din@email.dk
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

const email = process.argv[2];
if (!email) {
  console.error("Brug: npm run dev:magic-link -- din@email.dk");
  process.exit(1);
}

const env = loadEnvLocal();
const base = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const res = await fetch(`${base}/api/dev/magic-link`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Fejl:", data);
  process.exit(1);
}

console.log("\n✓ Magic link (kun dev):\n");
console.log(data.url);
console.log("\nÅbn linket i samme browser hvor du lige har brugt invite-siden.\n");
