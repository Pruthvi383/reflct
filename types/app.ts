import type { Entry, FocusSession, Profile, Wrapped } from "@/types/database";

export type EntryStatus = "PENDING" | "DONE" | "MISSED";

export type DashboardSnapshot = {
  profile: Profile;
  currentEntry: Entry | null;
  recentEntries: Entry[];
  currentWeekSessions: FocusSession[];
  lastGoal: string | null;
  entryStatus: EntryStatus;
};

export type PublicProfilePayload = {
  profile: Pick<
    Profile,
    | "id"
    | "name"
    | "username"
    | "image"
    | "streak_count"
    | "longest_streak"
    | "learning_goal"
    | "created_at"
    | "is_public"
  >;
  wrapped: Wrapped[];
  totalWeeks: number;
  totalWrapped: number;
};
