import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { WrappedDetail } from "@/components/wrapped/wrapped-detail";
import { getSession } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Wrapped } from "@/types/database";

function parseMonthYear(slug: string) {
  const [year, month] = slug.split("-");
  const parsedYear = Number(year);
  const parsedMonth = Number(month);

  if (!parsedYear || !parsedMonth) return null;
  return { year: parsedYear, month: parsedMonth };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ monthYear: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const parsed = parseMonthYear(resolved.monthYear);

  if (!parsed) return {};

  const title = new Date(parsed.year, parsed.month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  return {
    title: `${title} Wrapped`,
    openGraph: {
      title: `${title} Wrapped`,
      description: "A calm monthly story of your learning and focus.",
      url: absoluteUrl(`/wrapped/${resolved.monthYear}`)
    }
  };
}

export default async function WrappedDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ monthYear: string }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const resolved = await params;
  const resolvedSearchParams = await searchParams;
  const parsed = parseMonthYear(resolved.monthYear);

  if (!parsed) notFound();

  const { user, supabase } = await getSession();

  if (user) {
    const profileResult = await supabase.from("profiles").select("username").eq("id", user.id).single();
    const wrappedResult = await supabase
      .from("wrapped")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", parsed.year)
      .eq("month", parsed.month)
      .single();

    const profile = (profileResult.data ?? null) as { username: string } | null;
    const wrapped = (wrappedResult.data ?? null) as Wrapped | null;

    if (!wrapped) notFound();

    return <WrappedDetail wrapped={wrapped} username={profile?.username} isOwner />;
  }

  if (!resolvedSearchParams.user) {
    redirect("/auth/signin");
  }

  const publicSupabase = await createClient();
  const profileResult = await publicSupabase
    .from("profiles")
    .select("id, username")
    .eq("username", resolvedSearchParams.user)
    .single();

  const profile = (profileResult.data ?? null) as { id: string; username: string } | null;

  if (!profile) notFound();

  const wrappedResult = await publicSupabase
    .from("wrapped")
    .select("*")
    .eq("user_id", profile.id)
    .eq("year", parsed.year)
    .eq("month", parsed.month)
    .eq("is_public", true)
    .single();

  const wrapped = (wrappedResult.data ?? null) as Wrapped | null;

  if (!wrapped) notFound();

  return <WrappedDetail wrapped={wrapped} username={profile.username} isOwner={false} />;
}
