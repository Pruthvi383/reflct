import { NextResponse } from "next/server";

import type { PublicProfilePayload } from "@/types/app";
import { createClient } from "@/lib/supabase/server";
import type { Wrapped } from "@/types/database";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> }
) {
  const supabase = await createClient();
  const { username } = await context.params;

  const profileResult = await supabase
    .from("profiles")
    .select("id, name, username, image, streak_count, longest_streak, learning_goal, created_at, is_public")
    .eq("username", username)
    .single();

  const profile = (profileResult.data ?? null) as PublicProfilePayload["profile"] | null;

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [wrappedResult, entriesCountResult] = await Promise.all([
    supabase
      .from("wrapped")
      .select("*")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    supabase.from("entries").select("*", { count: "exact", head: true }).eq("user_id", profile.id)
  ]);

  const wrapped = (wrappedResult.data ?? []) as Wrapped[];
  const count = entriesCountResult.count ?? 0;

  const payload: PublicProfilePayload = {
    profile,
    wrapped,
    totalWeeks: count,
    totalWrapped: wrapped.length
  };

  return NextResponse.json(payload);
}
