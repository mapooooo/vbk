import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();
  const full_name = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = body.phone ? String(body.phone).trim() : null;
  const message = String(body.message ?? "").trim();
  const dog_info = body.dog_info ? String(body.dog_info).trim() : null;

  if (!full_name || full_name.length < 2) {
    return NextResponse.json(
      { error: "Angiv dit fulde navn." },
      { status: 400 }
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Angiv en gyldig e-mail." },
      { status: 400 }
    );
  }

  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Skriv lidt om dig og din hund (mindst 10 tegn)." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("membership_applications").insert({
    full_name,
    email,
    phone,
    message,
    dog_info,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
