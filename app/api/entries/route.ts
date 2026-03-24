import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { entryDraftSchema, entrySubmitSchema } from "@/lib/validators";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = (body?.is_locked ? entrySubmitSchema : entryDraftSchema).safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message =
      fieldErrors.learnings?.[0] ??
      fieldErrors.next_goal?.[0] ??
      fieldErrors.focus_rating?.[0] ??
      "Please complete the required fields before locking this week.";

    return NextResponse.json({ error: message, fields: fieldErrors }, { status: 422 });
  }

  const payload = {
    ...parsed.data,
    user_id: user.id,
    learnings: parsed.data.learnings.trim(),
    next_goal: parsed.data.next_goal.trim(),
    blocker: parsed.data.blocker?.trim() || null
  };

  const { data: existingEntry } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", payload.week_start)
    .maybeSingle();

  const { data, error } = await supabase
    .from("entries")
    .upsert(payload, { onConflict: "user_id,week_start" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (payload.is_locked && !existingEntry?.is_locked) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, longest_streak")
      .eq("id", user.id)
      .single();

    const nextStreak = (profile?.streak_count ?? 0) + 1;
    await supabase
      .from("profiles")
      .update({
        streak_count: nextStreak,
        longest_streak: Math.max(profile?.longest_streak ?? 0, nextStreak),
        last_entry_date: new Date().toISOString()
      })
      .eq("id", user.id);
  }

  return NextResponse.json(data);
}
