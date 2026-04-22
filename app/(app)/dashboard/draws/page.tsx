import { Card } from "@/components/ui/card";
import { requireSubscriber } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Draw, DrawResult, Winner } from "@/types/app";

export default async function DashboardDrawsPage() {
  const { authUser } = await requireSubscriber();
  const supabase = await createClient();
  const [{ data: draws }, { data: winners }] = await Promise.all([
    supabase.from("draws").select("*, draw_results(*)").order("draw_month", { ascending: false }),
    supabase.from("winners").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false })
  ]);
  const drawRows = ((draws as Array<Draw & { draw_results: DrawResult[] | null }> | null) ?? []);
  const winnerRows = ((winners as Winner[] | null) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Draw participation</p>
        <h1 className="serif mt-3 text-4xl">Track published draws, prize tiers, and the numbers that were pulled.</h1>
      </div>

      <div className="grid gap-4">
        {drawRows.map((draw) => (
          <Card key={draw.id} className="rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">{formatDate(draw.draw_month)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {draw.logic_type} logic · pool {formatCurrency(Number(draw.pool_amount))}
                </p>
              </div>
              <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                {draw.winning_numbers?.join(" · ") ?? "Awaiting numbers"}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(draw.draw_results ?? []).map((result) => (
                <div key={result.id} className="rounded-2xl bg-foreground/5 p-4">
                  <p className="eyebrow">{result.match_type.replace("_", " ")}</p>
                  <p className="mt-3 text-xl font-semibold">{formatCurrency(Number(result.pool_amount))}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.winner_count} winner(s)
                    {result.rollover ? ` · ${formatCurrency(Number(result.rollover_amount ?? 0))} rollover` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[30px] p-6">
        <p className="eyebrow">Your draw record</p>
        <h2 className="mt-3 text-2xl font-semibold">Winnings linked to your account</h2>
        <div className="mt-5 space-y-3">
          {winnerRows.map((winner) => (
            <div key={winner.id} className="flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-3">
              <div>
                <p className="font-medium">{winner.match_type.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{winner.status}</p>
              </div>
              <span className="font-semibold">{formatCurrency(Number(winner.amount))}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
