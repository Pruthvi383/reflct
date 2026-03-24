import { formatISO } from "date-fns";
import { NextResponse } from "next/server";

import { getCurrentWeekStart } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = formatISO(getCurrentWeekStart(), { representation: "date" });

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
