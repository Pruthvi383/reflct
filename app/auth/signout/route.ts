import { NextResponse } from "next/server";

import { EMERGENCY_ADMIN_COOKIE } from "@/lib/emergency-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(EMERGENCY_ADMIN_COOKIE);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Fall back to cookie-only logout when Supabase is unavailable.
  }

  return response;
}
