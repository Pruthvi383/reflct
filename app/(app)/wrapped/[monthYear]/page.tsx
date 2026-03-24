import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { WrappedDetail } from "@/components/wrapped/wrapped-detail";
import { getSession } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

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
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    const { data: wrapped } = await supabase
      .from("wrapped")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", parsed.year)
      .eq("month", parsed.month)
      .single();

    if (!wrapped) notFound();

    return <WrappedDetail wrapped={wrapped} username={profile?.username} isOwner />;
  }

  if (!resolvedSearchParams.user) {
    redirect("/auth/signin");
  }

  const publicSupabase = await createClient();
  const { data: profile } = await publicSupabase
    .from("profiles")
    .select("id, username")
    .eq("username", resolvedSearchParams.user)
    .single();

  if (!profile) notFound();

  const { data: wrapped } = await publicSupabase
    .from("wrapped")
    .select("*")
    .eq("user_id", profile.id)
    .eq("year", parsed.year)
    .eq("month", parsed.month)
    .eq("is_public", true)
    .single();

  if (!wrapped) notFound();

  return <WrappedDetail wrapped={wrapped} username={profile.username} isOwner={false} />;
}
