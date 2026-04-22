import { startOfMonth, subMonths } from "date-fns";

import { getBaseMonthlyAmount } from "@/lib/utils";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type {
  AdminSnapshot,
  Charity,
  Draw,
  Subscription,
  SubscriberSnapshot,
  UserCharity,
  Winner
} from "@/types/app";
import type { AppUser, Score } from "@/types/app";

export async function getFeaturedCharities(): Promise<Charity[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("charities").select("*").order("featured", { ascending: false }).limit(3);
  return ((data as Charity[] | null) ?? []);
}

export async function getCharityDirectory(search?: string): Promise<Charity[]> {
  const supabase = await createClient();
  let query = supabase.from("charities").select("*").order("featured", { ascending: false }).order("name");

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data } = await query;
  return ((data as Charity[] | null) ?? []);
}

export async function getSubscriberSnapshot(userId: string): Promise<SubscriberSnapshot | null> {
  const supabase = await createClient();
  const [{ data: user }, { data: subscription }, { data: scores }, { data: selection }, { data: draws }, { data: winnings }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("scores").select("*").eq("user_id", userId).order("played_at", { ascending: false }),
      supabase
        .from("user_charity")
        .select("*, charity:charities(*)")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("draws")
        .select("*")
        .order("draw_month", { ascending: false })
        .limit(6),
      supabase
        .from("winners")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ]);

  if (!user) return null;

  return {
    user: user as AppUser,
    subscription: (subscription as Subscription | null) ?? null,
    scores: (scores as Score[] | null) ?? [],
    selectedCharity: (selection as (UserCharity & { charity: Charity | null }) | null) ?? null,
    recentDraws: (draws as Draw[] | null) ?? [],
    winnings: (winnings as Winner[] | null) ?? []
  };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  try {
    const admin = createAdminClient();
    const start = startOfMonth(new Date());
    const previousMonth = subMonths(start, 1).toISOString();

    const [
      { count: totalUsers },
      { count: activeSubscribers },
      { data: subscriptions },
      { count: publishedDraws },
      { count: pendingWinnerReviews },
      { data: donations },
      { data: latestDraws }
    ] = await Promise.all([
      admin.from("users").select("*", { count: "exact", head: true }),
      admin
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "trialing"]),
      admin.from("subscriptions").select("plan, amount").in("status", ["active", "trialing"]),
      admin.from("draws").select("*", { count: "exact", head: true }).eq("status", "published"),
      admin
        .from("winners")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_verification"),
      admin.from("donations").select("amount"),
      admin.from("draws").select("pool_amount, draw_month").gte("draw_month", previousMonth)
    ]);

    const totalPrizePool = (((latestDraws as Draw[] | null) ?? [])).reduce(
      (sum, item) => sum + Number(item.pool_amount ?? 0),
      0
    );
    const totalCharityCommitted =
      (((subscriptions as Pick<Subscription, "plan" | "amount">[] | null) ?? [])).reduce(
        (sum, item) => sum + getBaseMonthlyAmount(item.plan, Number(item.amount ?? 0)) * 0.1,
        0
      ) +
      (((donations as Array<{ amount: number }> | null) ?? [])).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

    return {
      totalUsers: totalUsers ?? 0,
      activeSubscribers: activeSubscribers ?? 0,
      totalPrizePool,
      totalCharityCommitted,
      publishedDraws: publishedDraws ?? 0,
      pendingWinnerReviews: pendingWinnerReviews ?? 0
    };
  } catch {
    return {
      totalUsers: 0,
      activeSubscribers: 0,
      totalPrizePool: 0,
      totalCharityCommitted: 0,
      publishedDraws: 0,
      pendingWinnerReviews: 0
    };
  }
}
