import { formatISO } from "date-fns";

import { EntryWorkspace } from "@/components/entry/entry-workspace";
import { Card } from "@/components/ui/card";
import { getCurrentWeekStart, getEntryCountdownCopy, getWeekWindow, isEntryWindowOpen } from "@/lib/date";
import { requireCompletedProfile } from "@/lib/auth";
import type { Entry as EntryRow, FocusSession as FocusSessionRow } from "@/types/database";

export default async function EntryPage() {
  const { supabase, profile } = await requireCompletedProfile();
  const weekStart = formatISO(getCurrentWeekStart(), { representation: "date" });
  const weekWindow = getWeekWindow();

  const [currentEntryResult, previousEntriesResult, sessionsResult] = await Promise.all([
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

  const currentEntry = (currentEntryResult.data ?? null) as EntryRow | null;
  const previousEntries = (previousEntriesResult.data ?? []) as EntryRow[];
  const sessions = (sessionsResult.data ?? []) as FocusSessionRow[];

  const hasHistory = previousEntries.length > 0;
  const hasOpenDraft = currentEntry?.is_locked === false;
  const allowAnytimeEntry = !hasHistory || hasOpenDraft;

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
      currentEntry={currentEntry}
      previousEntry={previousEntries.find((entry) => entry.week_start !== weekStart) ?? null}
      sessions={sessions}
      weekStart={weekStart}
    />
  );
}
