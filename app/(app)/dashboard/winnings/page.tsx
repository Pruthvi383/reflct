import { uploadWinnerProofAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Draw, Winner } from "@/types/app";

export default async function DashboardWinningsPage() {
  const { authUser } = await requireUser();
  const supabase = await createClient();
  const { data: winners } = await supabase
    .from("winners")
    .select("*, draws(draw_month)")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false });
  const winnerRows = ((winners as Array<Winner & { draws: Pick<Draw, "draw_month"> | null }> | null) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Winnings overview</p>
        <h1 className="serif mt-3 text-4xl">Upload proof only when you win, then track payment through review.</h1>
      </div>

      <div className="grid gap-4">
        {winnerRows.map((winner) => (
          <Card key={winner.id} className="rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">{formatCurrency(Number(winner.amount))}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {winner.match_type.replace("_", " ")} · {winner.draws?.draw_month ? formatDate(winner.draws.draw_month) : "Draw"}
                </p>
              </div>
              <Badge variant={winner.status === "paid" ? "green" : winner.status === "rejected" ? "danger" : "amber"}>
                {winner.status}
              </Badge>
            </div>

            <form action={uploadWinnerProofAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <input type="hidden" name="winnerId" value={winner.id} />
              <div>
                <label className="mb-2 block text-sm font-medium">Screenshot proof</label>
                <input
                  name="proof"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="block w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm"
                />
              </div>
              <Button type="submit">Upload proof</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
