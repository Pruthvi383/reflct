import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { focusSessionSchema } from "@/lib/validators";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = focusSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const payload: Database["public"]["Tables"]["focus_sessions"]["Insert"] = {
    ...parsed.data,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert(payload as never)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
