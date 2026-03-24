import { NextResponse } from "next/server";

import type { PublicProfilePayload } from "@/types/app";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> }
) {
  const supabase = await createClient();
  const { username } = await context.params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, username, image, streak_count, longest_streak, learning_goal")
    .eq("username", username)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
    totalWeeks: count ?? 0
  };

  return NextResponse.json(payload);
}
