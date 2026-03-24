import { endOfWeek, startOfWeek } from "date-fns";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (scope !== "all") {
    query = query
      .gte("started_at", startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString())
      .lte("started_at", endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
