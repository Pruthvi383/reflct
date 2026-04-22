import Link from "next/link";

import { createBillingPortalAction, createCheckoutSessionAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_CONFIG } from "@/lib/constants";
import { getSessionContext, hasActiveSubscription } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SubscribePage() {
  const { authUser, appUser, subscription } = await getSessionContext();
  const isActive = hasActiveSubscription(subscription);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow">Subscription</p>
        <h1 className="serif mt-4 text-5xl">Choose the cadence that keeps you in the draw and keeps giving moving.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Members unlock score tracking, monthly draw eligibility, charity selection, and winner verification.
        </p>
      </div>

      {authUser ? (
        <Card className="mt-8 rounded-[30px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">{appUser?.full_name ?? authUser.email}</p>
              <p className="text-sm text-muted-foreground">{authUser.email}</p>
            </div>
            {subscription ? (
              <div className="flex items-center gap-3">
                <Badge variant={isActive ? "green" : "danger"}>{subscription.status}</Badge>
                {subscription.current_period_end ? (
                  <span className="text-sm text-muted-foreground">
                    Renews {formatDate(subscription.current_period_end)}
                  </span>
                ) : null}
              </div>
            ) : (
              <Badge variant="muted">No active plan yet</Badge>
            )}
          </div>
          {subscription?.stripe_customer_id ? (
            <form action={createBillingPortalAction} className="mt-5">
              <Button type="submit" variant="secondary">
                Manage billing
              </Button>
            </form>
          ) : null}
        </Card>
      ) : (
        <Card className="mt-8 rounded-[30px] p-6">
          <p className="text-sm text-muted-foreground">
            Create an account first so we can link your charity, scores, and subscription state.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/auth/signup" className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">
              Create account
            </Link>
            <Link href="/auth/signin" className="inline-flex rounded-full border border-foreground/10 bg-white px-5 py-3 text-sm font-medium text-foreground">
              Sign in
            </Link>
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Object.entries(PLAN_CONFIG).map(([planKey, plan]) => (
          <Card key={planKey} className="mesh-panel rounded-[32px] p-8">
            <p className="eyebrow">{plan.label}</p>
            <h2 className="mt-4 text-3xl font-semibold">{formatCurrency(plan.amount)}</h2>
            <p className="mt-2 text-muted-foreground">per {plan.cadence}</p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Active draw participation each month</li>
              <li>Charity allocation starting at 10%</li>
              <li>Subscriber dashboard, score management, and winner workflows</li>
            </ul>
            {authUser ? (
              <form action={createCheckoutSessionAction} className="mt-8">
                <input type="hidden" name="plan" value={planKey} />
                <Button type="submit" className="w-full">
                  Continue with {plan.label.toLowerCase()}
                </Button>
              </form>
            ) : (
              <Link href="/auth/signup" className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">
                Start with {plan.label.toLowerCase()}
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
