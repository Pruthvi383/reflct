import { deleteScoreAction, upsertScoreAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireSubscriber } from "@/lib/auth";
import { getSubscriberSnapshot } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardScoresPage() {
  const { authUser } = await requireSubscriber();
  const snapshot = await getSubscriberSnapshot(authUser.id);

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Score management</p>
        <h1 className="serif mt-3 text-4xl">Keep your latest five scores clean, current, and draw-ready.</h1>
      </div>

      <Card className="rounded-[30px] p-6">
        <h2 className="text-xl font-semibold">Add a score</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          One score per date. If you add a sixth, the oldest record is automatically removed.
        </p>
        <form action={upsertScoreAction} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>
            <Input name="playedAt" type="date" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Stableford score</label>
            <Input name="score" type="number" min={1} max={45} required />
          </div>
          <Button type="submit">Save score</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {snapshot.scores.map((score) => (
          <Card key={score.id} className="rounded-[28px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{score.score} Stableford</p>
                <p className="text-sm text-muted-foreground">{formatDate(score.played_at)}</p>
              </div>
              <form action={deleteScoreAction}>
                <input type="hidden" name="scoreId" value={score.id} />
                <Button type="submit" variant="ghost">
                  Delete
                </Button>
              </form>
            </div>
            <form action={upsertScoreAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <input type="hidden" name="scoreId" value={score.id} />
              <div>
                <label className="mb-2 block text-sm font-medium">Date</label>
                <Input name="playedAt" type="date" defaultValue={score.played_at} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Score</label>
                <Input name="score" type="number" min={1} max={45} defaultValue={score.score} required />
              </div>
              <Button type="submit" variant="secondary">
                Update
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
