import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";
import type { AppUser, Subscription } from "@/types/app";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthPath = pathname.startsWith("/auth");
  const isSubscriberPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!user && (isSubscriberPath || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const [{ data: appUser }, { data: subscription }] = await Promise.all([
      supabase.from("users").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle()
    ]);

    const resolvedUser = appUser as Pick<AppUser, "role"> | null;
    const resolvedSubscription = subscription as Pick<Subscription, "status"> | null;
    const isActiveSubscriber = ["active", "trialing"].includes(resolvedSubscription?.status ?? "");

    if (isAdminPath && resolvedUser?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isSubscriberPath && resolvedUser?.role !== "admin" && !isActiveSubscriber) {
      return NextResponse.redirect(new URL("/subscribe", request.url));
    }

    if (isAuthPath) {
      const destination =
        resolvedUser?.role === "admin" ? "/admin" : isActiveSubscriber ? "/dashboard" : "/subscribe";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return supabaseResponse;
}
