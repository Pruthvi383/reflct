import { formatISO } from "date-fns";

import { EntryWorkspace } from "@/components/entry/entry-workspace";
import { Card } from "@/components/ui/card";
import { getCurrentWeekStart, getEntryCountdownCopy, getWeekWindow, isEntryWindowOpen } from "@/lib/date";
import { requireCompletedProfile } from "@/lib/auth";

export default async function EntryPage() {
  const { supabase, profile } = await requireCompletedProfile();
  const weekStart = formatISO(getCurrentWeekStart(), { representation: "date" });
  const weekWindow = getWeekWindow();

  const [{ data: currentEntry }, { data: previousEntries }, { data: sessions }] = await Promise.all([
    supabase.from("entries").select("*").eq("user_id", profile.id).eq("week_start", weekStart).maybeSingle(),
    supabase.from("entries").select("*").eq("user_id", profile.id).order("week_start", { ascending: false }).limit(2),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", profile.id)
      .gte("started_at", weekWindow.start.toISOString())
      .lte("started_at", weekWindow.end.toISOString())
      .order("started_at", { ascending: false })
  ]);

  const hasHistory = (previousEntries?.length ?? 0) > 0;
  const allowAnytimeEntry = !hasHistory || Boolean(currentEntry && !currentEntry.is_locked);

  if (!isEntryWindowOpen() && !allowAnytimeEntry) {
    return (
      <Card className="mx-auto mt-16 max-w-2xl rounded-[36px] p-10 text-center">
        <p className="serif text-4xl">Entry opens Friday. Come back then.</p>
        <p className="mt-4 text-sm text-muted-foreground">{getEntryCountdownCopy()}</p>
      </Card>
    );
  }

  return (
    <EntryWorkspace
      currentEntry={currentEntry ?? null}
      previousEntry={previousEntries?.find((entry) => entry.week_start !== weekStart) ?? null}
      sessions={sessions ?? []}
      weekStart={weekStart}
    />
  );
}
