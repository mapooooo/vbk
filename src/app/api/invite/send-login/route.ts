import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  createDirectLoginLink,
  setInviteSetupCookies,
} from "@/lib/auth/account-setup";

/** Opretter login-link via service role — bruger omdirigeres direkte. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!token || !email || !fullName) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: invites, error: validateError } = await service.rpc(
    "validate_invite",
    { p_token: token }
  );

  if (validateError) {
    console.error("validate_invite:", validateError);
    return NextResponse.json({ error: "validate_failed" }, { status: 500 });
  }

  const invite = invites?.[0];
  if (!invite?.valid) {
    return NextResponse.json({ error: "invalid_invite" }, { status: 400 });
  }

  const lockedEmail = invite.email as string | null;
  if (lockedEmail && lockedEmail.toLowerCase() !== email) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 400 });
  }

  try {
    await setInviteSetupCookies(token, fullName);
    const actionLink = await createDirectLoginLink(email);
    return NextResponse.json({ ok: true, url: actionLink });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kunne ikke fortsætte";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
