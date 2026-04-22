import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getAdminSnapshot } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser, Draw, Winner } from "@/types/app";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const [snapshot, { data: recentDraws }, { data: recentWinners }] = await Promise.all([
    getAdminSnapshot(),
    admin.from("draws").select("*").order("draw_month", { ascending: false }).limit(4),
    admin.from("winners").select("*, users(email)").order("created_at", { ascending: false }).limit(5)
  ]);
  const drawRows = ((recentDraws as Draw[] | null) ?? []);
  const winnerRows = ((recentWinners as Array<Winner & { users: Pick<AppUser, "email"> | null }> | null) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Admin overview</p>
        <h1 className="serif mt-3 text-4xl">Platform health, prize exposure, and pending verification at a glance.</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Users</p>
          <p className="mt-3 text-3xl font-semibold">{snapshot.totalUsers}</p>
          <p className="mt-2 text-sm text-muted-foreground">{snapshot.activeSubscribers} active subscribers</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Prize pool</p>
          <p className="mt-3 text-3xl font-semibold">{formatCurrency(snapshot.totalPrizePool)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{snapshot.publishedDraws} published draws</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="eyebrow">Charity totals</p>
          <p className="mt-3 text-3xl font-semibold">{formatCurrency(snapshot.totalCharityCommitted)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{snapshot.pendingWinnerReviews} pending winner reviews</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent draws</h2>
            <Link href="/admin/draws" className="text-sm underline underline-offset-4">
              Manage draws
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {drawRows.map((draw) => (
              <div key={draw.id} className="rounded-2xl bg-foreground/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{formatDate(draw.draw_month)}</p>
                  <span className="text-sm text-muted-foreground">{draw.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{draw.winning_numbers?.join(", ") ?? "No numbers published yet"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-[30px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent winners</h2>
            <Link href="/admin/winners" className="text-sm underline underline-offset-4">
              Review winners
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {winnerRows.map((winner) => (
              <div key={winner.id} className="rounded-2xl bg-foreground/5 px-4 py-3">
                <p className="font-medium">{winner.users?.email ?? "Unknown user"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {winner.match_type.replace("_", " ")} · {formatCurrency(Number(winner.amount))} · {winner.status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
