import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireSubscriber } from "@/lib/auth";
import { getSubscriberSnapshot } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { authUser, subscription } = await requireSubscriber();
  const snapshot = await getSubscriberSnapshot(authUser.id);

  if (!snapshot) return null;

  const totalWon = snapshot.winnings.reduce((sum, winner) => sum + Number(winner.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Subscriber dashboard</p>
        <h1 className="serif mt-3 text-4xl">Everything tied to your impact and your next draw.</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Subscription</p>
          <p className="mt-3 text-2xl font-semibold capitalize">{subscription?.status ?? "inactive"}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {subscription?.current_period_end ? `Renews ${formatDate(subscription.current_period_end)}` : "Billing not active yet"}
          </p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Latest scores</p>
          <p className="mt-3 text-2xl font-semibold">{snapshot.scores.length}/5</p>
          <p className="mt-2 text-sm text-muted-foreground">Stored in reverse chronological order.</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Charity share</p>
          <p className="mt-3 text-2xl font-semibold">{snapshot.selectedCharity?.contribution_percentage ?? 10}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{snapshot.selectedCharity?.charity?.name ?? "No charity selected yet"}</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Total won</p>
          <p className="mt-3 text-2xl font-semibold">{formatCurrency(totalWon)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{snapshot.winnings.length} prize record(s)</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Score summary</p>
              <h2 className="mt-3 text-2xl font-semibold">Your current five-number set</h2>
            </div>
            <Link href="/dashboard/scores" className="text-sm underline underline-offset-4">
              Manage
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.scores.length > 0 ? (
              snapshot.scores.map((score) => (
                <div key={score.id} className="flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-3">
                  <span className="font-medium">{score.score} Stableford</span>
                  <span className="text-sm text-muted-foreground">{formatDate(score.played_at)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Add your first score to start building your draw entry.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Participation</p>
              <h2 className="mt-3 text-2xl font-semibold">Recent draw activity</h2>
            </div>
            <Link href="/dashboard/draws" className="text-sm underline underline-offset-4">
              Open draws
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.recentDraws.map((draw) => (
              <div key={draw.id} className="rounded-2xl bg-foreground/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{formatDate(draw.draw_month)}</p>
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{draw.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pool {formatCurrency(Number(draw.pool_amount))} with {draw.active_subscriber_count} active subscribers.
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
