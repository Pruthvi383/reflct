import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { PLAN_CONFIG } from "@/lib/constants";
import type { AppUser, Subscription, SubscriptionStatus } from "@/types/app";

const ACTIVE_SUBSCRIPTION_STATES = new Set<SubscriptionStatus>(["active", "trialing"]);

function resolveRoleForEmail(email: string | undefined) {
  if (!email) return "subscriber";

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase()) ? "admin" : "subscriber";
}

async function ensureAppUser(user: User): Promise<AppUser> {
  const admin = createAdminClient();
  const seed = {
    id: user.id,
    email: user.email ?? "",
    full_name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      null,
    role: resolveRoleForEmail(user.email)
  } as const;

  const { data, error } = await admin.from("users").upsert(seed).select("*").single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to sync application user.");
  }

  return data as AppUser;
}

export async function getSessionContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      authUser: null,
      appUser: null,
      subscription: null as Subscription | null
    };
  }

  const appUser = await ensureAppUser(user);
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    authUser: user,
    appUser,
      subscription: (subscription as Subscription | null) ?? null
  };
}

export async function requireUser() {
  const context = await getSessionContext();

  if (!context.authUser || !context.appUser) {
    redirect("/auth/signin");
  }

  return context as typeof context & {
    authUser: User;
    appUser: AppUser;
  };
}

export async function requireSubscriber() {
  const context = await requireUser();

  if (context.appUser.role === "admin") {
    return context;
  }

  if (!context.subscription || !ACTIVE_SUBSCRIPTION_STATES.has(context.subscription.status)) {
    redirect("/subscribe");
  }

  return context;
}

export async function requireAdmin() {
  const context = await requireUser();

  if (context.appUser.role !== "admin") {
    redirect("/dashboard");
  }

  return context;
}

export function hasActiveSubscription(subscription: Subscription | null) {
  return Boolean(subscription && ACTIVE_SUBSCRIPTION_STATES.has(subscription.status));
}

export function getPlanAmount(plan: "monthly" | "yearly") {
  return PLAN_CONFIG[plan].amount;
}
