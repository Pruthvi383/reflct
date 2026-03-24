import { formatISO } from "date-fns";

import { getCurrentWeekStart, getWeekWindow, hasMissedLastWeek } from "@/lib/date";
import type { DashboardSnapshot, EntryStatus } from "@/types/app";
import type { Profile } from "@/types/database";
import type { Database } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

export async function getDashboardSnapshot(
  supabase: SupabaseClient,
  profile: Profile
): Promise<DashboardSnapshot> {
  const weekStart = formatISO(getCurrentWeekStart(), { representation: "date" });
  const weekWindow = getWeekWindow();

  const [{ data: currentEntry }, { data: recentEntries }, { data: currentWeekSessions }] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", profile.id)
      .eq("week_start", weekStart)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("week_start", { ascending: false })
      .limit(4),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", profile.id)
      .gte("started_at", weekWindow.start.toISOString())
      .lte("started_at", weekWindow.end.toISOString())
      .order("started_at", { ascending: false })
  ]);

  const lastGoal = recentEntries?.[0]?.next_goal ?? null;
  const hasHistory = (recentEntries?.length ?? 0) > 0;
  const missed = hasHistory ? hasMissedLastWeek(profile.last_entry_date) : false;
  const entryStatus: EntryStatus = currentEntry?.is_locked ? "DONE" : missed ? "MISSED" : "PENDING";

  return {
    profile,
    currentEntry: currentEntry ?? null,
    recentEntries: recentEntries ?? [],
    currentWeekSessions: currentWeekSessions ?? [],
    lastGoal,
    entryStatus
  };
}

export async function ensureMonthlyFreezeReset(
  supabase: SupabaseClient,
  profile: Profile
) {
  const now = new Date();
  if (now.getDate() !== 1) return profile;

  if (profile.streak_freezes === 1) return profile;

  const { data } = await supabase
    .from("profiles")
    .update({ streak_freezes: 1 })
    .eq("id", profile.id)
    .select("*")
    .single();

  return data ?? profile;
}

export async function applyDashboardStreakGuard(
  supabase: SupabaseClient,
  profile: Profile
) {
  const today = new Date();
  if (today.getDay() !== 1 || !hasMissedLastWeek(profile.last_entry_date, today)) {
    return profile;
  }

  const nextValues =
    (profile.streak_freezes ?? 0) > 0
      ? {
          streak_freezes: Math.max((profile.streak_freezes ?? 1) - 1, 0)
        }
      : {
          streak_count: 0
        };

  const { data } = await supabase
    .from("profiles")
    .update(nextValues satisfies Database["public"]["Tables"]["profiles"]["Update"])
    .eq("id", profile.id)
    .select("*")
    .single();

  return data ?? profile;
}
