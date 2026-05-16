export function DevLoginHint() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-medium">Udvikler: kom ind i medlemsområdet</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-900/90">
        <li>
          <code className="rounded bg-amber-100 px-1">npm run dev:invite</code>{" "}
          (mens <code className="rounded bg-amber-100 px-1">npm run dev</code>{" "}
          kører)
        </li>
        <li>Åbn invite-linket → udfyld navn + e-mail → Send login-link</li>
        <li>
          <code className="rounded bg-amber-100 px-1">
            npm run dev:magic-link -- din@email.dk
          </code>
        </li>
        <li>Åbn det printede link → du lander på /hjem (første bruger = admin)</li>
      </ol>
    </div>
  );
}
