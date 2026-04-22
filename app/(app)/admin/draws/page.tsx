import { publishDrawAction, simulateDrawAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Draw, DrawResult } from "@/types/app";

export default async function AdminDrawsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: draws } = await admin
    .from("draws")
    .select("*, draw_results(*)")
    .order("draw_month", { ascending: false });
  const drawRows = ((draws as Array<Draw & { draw_results: DrawResult[] | null }> | null) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Draw management</p>
        <h1 className="serif mt-3 text-4xl">Simulate, inspect, and publish monthly draw results.</h1>
      </div>

      <Card className="rounded-[30px] p-6">
        <h2 className="text-xl font-semibold">Run simulation</h2>
        <form action={simulateDrawAction} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Draw month</label>
              <Input name="drawMonth" type="date" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Logic type</label>
              <select name="logicType" className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                <option value="random">random</option>
                <option value="algorithmic">algorithmic</option>
              </select>
            </div>
          </div>
          <Textarea name="notes" placeholder="Add admin notes for the draw" className="min-h-[120px]" />
          <Button type="submit">Simulate draw</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {drawRows.map((draw) => (
          <Card key={draw.id} className="rounded-[30px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">{formatDate(draw.draw_month)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {draw.logic_type} · {draw.status} · pool {formatCurrency(Number(draw.pool_amount))}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Winning numbers: {draw.winning_numbers?.join(", ") ?? "Not generated"}
                </p>
              </div>
              <form action={publishDrawAction}>
                <input type="hidden" name="drawId" value={draw.id} />
                <Button type="submit">Publish results</Button>
              </form>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {(draw.draw_results ?? []).map((result) => (
                <div key={result.id} className="rounded-2xl bg-foreground/5 p-4">
                  <p className="eyebrow">{result.match_type.replace("_", " ")}</p>
                  <p className="mt-3 text-xl font-semibold">{formatCurrency(Number(result.pool_amount))}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.winner_count} winner(s)
                    {result.rollover ? ` · rollover ${formatCurrency(Number(result.rollover_amount ?? 0))}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
