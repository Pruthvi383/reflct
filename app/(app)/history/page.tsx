import { HistoryTimeline } from "@/components/history/history-timeline";
import { requireCompletedProfile } from "@/lib/auth";

export default async function HistoryPage() {
  const { supabase, profile } = await requireCompletedProfile();
  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", profile.id)
    .order("week_start", { ascending: false });

  return <HistoryTimeline entries={entries ?? []} />;
}
