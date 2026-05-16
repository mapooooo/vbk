import { NextResponse } from "next/server";
import { getStripe, isStripeEnabled } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: { registration_id?: string } };
    const registrationId = session.metadata?.registration_id;

    if (registrationId) {
      const supabase = await createServiceClient();
      await supabase
        .from("event_registrations")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: session.id,
        })
        .eq("id", registrationId);
    }
  }

  return NextResponse.json({ received: true });
}
