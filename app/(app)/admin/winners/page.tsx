import { updateWinnerStatusAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser, Draw, Winner } from "@/types/app";

export default async function AdminWinnersPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: winners } = await admin
    .from("winners")
    .select("*, users(email), draws(draw_month)")
    .order("created_at", { ascending: false });
  const winnerRows = ((winners as Array<Winner & { users: Pick<AppUser, "email"> | null; draws: Pick<Draw, "draw_month"> | null }> | null) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Winner verification</p>
        <h1 className="serif mt-3 text-4xl">Approve proof, reject unsupported claims, and mark payouts as paid.</h1>
      </div>

      <div className="grid gap-4">
        {winnerRows.map((winner) => (
          <Card key={winner.id} className="rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xl font-semibold">{winner.users?.email ?? "Unknown user"}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {winner.match_type.replace("_", " ")} · {formatCurrency(Number(winner.amount))} ·{" "}
                  {winner.draws?.draw_month ? formatDate(winner.draws.draw_month) : "Draw"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Proof: {winner.proof_url ?? "Not uploaded"}</p>
              </div>
              <form action={updateWinnerStatusAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="winnerId" value={winner.id} />
                <select name="status" defaultValue={winner.status} className="h-11 rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                  <option value="pending_verification">pending_verification</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="paid">paid</option>
                </select>
                <Button type="submit">Update status</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
