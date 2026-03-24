import { endOfDay, startOfDay } from "date-fns";

import { TimerWorkspace } from "@/components/timer/timer-workspace";
import { requireCompletedProfile } from "@/lib/auth";

export default async function TimerPage({
  searchParams
}: {
  searchParams: Promise<{ label?: string; duration?: string }>;
}) {
  const { supabase, profile } = await requireCompletedProfile();
  const resolvedSearchParams = await searchParams;

  const { data: sessions } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", profile.id)
    .gte("started_at", startOfDay(new Date()).toISOString())
    .lte("started_at", endOfDay(new Date()).toISOString())
    .order("started_at", { ascending: false });

  return (
    <TimerWorkspace
      initialSessions={sessions ?? []}
      initialLabel={resolvedSearchParams.label ?? ""}
      initialDuration={Number(resolvedSearchParams.duration ?? 25)}
    />
  );
}
