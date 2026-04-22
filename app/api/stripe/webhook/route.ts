import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

function resolvePlan(priceId: string | null | undefined): "monthly" | "yearly" {
  return priceId === process.env.STRIPE_YEARLY_PRICE_ID ? "yearly" : "monthly";
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription, userId?: string | null) {
  const admin = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const subscriptionWithPeriod = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;

  let resolvedUserId = userId ?? null;

  if (!resolvedUserId && customerId) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    resolvedUserId = existing?.user_id ?? null;
  }

  if (!resolvedUserId) {
    return;
  }

  await admin.from("subscriptions").upsert(
    {
      user_id: resolvedUserId,
      plan: resolvePlan(priceId),
      status: subscription.status as
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "paused"
        | "trialing"
        | "unpaid",
      amount: (subscription.items.data[0]?.price.unit_amount ?? 0) / 100,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_end: new Date((subscriptionWithPeriod.current_period_end ?? 0) * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    },
    { onConflict: "user_id" }
  );
}

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe is not configured.", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature.", { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return new Response(`Webhook Error: ${(error as Error).message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await upsertSubscriptionFromStripe(subscription, session.metadata?.user_id ?? session.client_reference_id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(subscription);
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
