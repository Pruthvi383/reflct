import { NextResponse } from "next/server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validators";
import type { Database } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ available: false }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();

  return NextResponse.json({ available: !data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data as Database["public"]["Tables"]["profiles"]["Update"];

  const { data, error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
