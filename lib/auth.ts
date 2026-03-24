import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

function getProfileSeed(user: User) {
  const metadata = user.user_metadata ?? {};
  const metadataUsername =
    typeof metadata.username === "string" && metadata.username.length > 0 ? metadata.username : null;
  const fallback = `user_${user.id.replaceAll("-", "").slice(0, 12)}`;

  return {
    id: user.id,
    name:
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      null,
    image: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    username: (metadataUsername ?? fallback).toLowerCase()
  };
}

async function ensureProfile(user: User): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
}> {
  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return { supabase, profile: existingProfile };
  }

  const seed = getProfileSeed(user);
  const admin = createAdminClient();

  const { data: insertedProfile, error } = await admin
    .from("profiles")
    .upsert(seed, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !insertedProfile) {
    throw new Error(error?.message ?? "Unable to ensure profile");
  }

  return { supabase, profile: insertedProfile as Profile };
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSession();

  if (!user) {
    redirect("/auth/signin");
  }

  const ensured = await ensureProfile(user);

  return { supabase: ensured.supabase ?? supabase, user, profile: ensured.profile };
}

export async function requireCompletedProfile() {
  const { profile, user, supabase } = await requireUser();

  if (!profile?.username || !profile.learning_goal) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}

export async function getRedirectPathForSession() {
  const { user } = await getSession();

  if (!user) {
    return null;
  }

  const { profile } = await requireUser();
  return profile?.learning_goal && profile.username ? "/dashboard" : "/onboarding";
}
