import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PublicProfile } from "@/components/profile/public-profile";
import type { PublicProfilePayload } from "@/types/app";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();
  const { username } = await params;
  const { user } = await getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, username, image, streak_count, longest_streak, learning_goal, created_at, is_public")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: wrapped }, { count }] = await Promise.all([
    supabase
      .from("wrapped")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    supabase.from("entries").select("*", { count: "exact", head: true }).eq("user_id", profile.id)
  ]);

  const payload: PublicProfilePayload = {
    profile,
    wrapped: wrapped ?? [],
    totalWeeks: count ?? 0,
    totalWrapped: wrapped?.length ?? 0
  };

  const isOwner = user?.id === profile.id;

  if (isOwner) {
    const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", profile.id).single();

    if (currentProfile) {
      return (
        <AppShell profile={currentProfile}>
          <PublicProfile payload={payload} isOwner />
        </AppShell>
      );
    }
  }

  return <PublicProfile payload={payload} isOwner={false} />;
}
