"use client";

import type { RequestLoginDebug } from "@/lib/auth/login-debug";

export function LoginDebugPanel({ debug }: { debug: RequestLoginDebug }) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <details className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800">
      <summary className="cursor-pointer font-medium">
        Udvikler: hvad skete der?
      </summary>
      <dl className="mt-2 space-y-1">
        <Row label="E-mail" value={<span className="font-mono">{debug.email}</span>} />
        <Row label="Auth-bruger" value={debug.userFound ? "ja" : "nej"} />
        <Row label="Godkendt medlem" value={debug.approved ? "ja" : "nej"} />
        <Row label="Mail sendt" value={debug.emailSent ? "ja" : "nej"} />
        <Row label="Tilstand" value={debug.emailMode} />
        {debug.supabaseError && (
          <Row
            label="Supabase-fejl"
            value={
              <span className="font-mono text-red-700">{debug.supabaseError}</span>
            }
          />
        )}
      </dl>
      {debug.hints.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {debug.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </details>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="inline font-medium">{label}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  );
}
