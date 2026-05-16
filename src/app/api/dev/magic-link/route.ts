import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Kun lokal udvikling — returnerer magic link i stedet for at vente på e-mail */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    return NextResponse.json(
      { error: "Could not generate link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: actionLink });
}
