import { endOfMonth, startOfMonth } from "date-fns";

import { createAdminClient } from "@/lib/supabase/server";
import { getBaseMonthlyAmount } from "@/lib/utils";
import type { DrawResult, MatchType, Score, Subscription } from "@/types/app";
import type { Database } from "@/types/database";

function uniqueRandomNumbers(count: number, min = 1, max = 45) {
  const numbers = new Set<number>();

  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

function algorithmicNumbers(scores: number[]) {
  const counts = new Map<number, number>();

  scores.forEach((score) => {
    counts.set(score, (counts.get(score) ?? 0) + 1);
  });

  const sorted = Array.from(counts.entries()).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const leastFrequent = sorted.slice(0, 3).map(([score]) => score);
  const mostFrequent = sorted.slice(-2).map(([score]) => score);
  const pool = Array.from(new Set([...leastFrequent, ...mostFrequent])).slice(0, 5);

  while (pool.length < 5) {
    const candidate = Math.floor(Math.random() * 45) + 1;
    if (!pool.includes(candidate)) {
      pool.push(candidate);
    }
  }

  return pool.sort((a, b) => a - b);
}

export async function simulateDraw({
  drawMonth,
  logicType
}: {
  drawMonth: string;
  logicType: "algorithmic" | "random";
}) {
  const admin = createAdminClient();
  const rangeStart = startOfMonth(new Date(drawMonth));
  const rangeEnd = endOfMonth(rangeStart);

  const [{ data: subscriptions }, { data: allScores }, { data: prizeConfig }, { data: previousDraw }] =
    await Promise.all([
      admin
        .from("subscriptions")
        .select("user_id, plan, amount")
        .in("status", ["active", "trialing"]),
      admin
        .from("scores")
        .select("user_id, score, played_at")
        .gte("played_at", rangeStart.toISOString().slice(0, 10))
        .lte("played_at", rangeEnd.toISOString().slice(0, 10))
        .order("played_at", { ascending: false }),
      admin.from("prize_pool_config").select("*"),
      admin
        .from("draw_results")
        .select("rollover_amount, draws!inner(draw_month)")
        .eq("match_type", "match_5")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

  const participantScores = new Map<string, number[]>();
  const allScoreValues: number[] = [];
  const resolvedScores = ((allScores as Pick<Score, "user_id" | "score">[] | null) ?? []);
  const resolvedSubscriptions = ((subscriptions as Pick<Subscription, "plan" | "amount">[] | null) ?? []);
  const resolvedPrizeConfig =
    ((prizeConfig as Array<Pick<Database["public"]["Tables"]["prize_pool_config"]["Row"], "match_type" | "percentage">> | null) ??
      []);
  const previousJackpot = previousDraw as Pick<DrawResult, "rollover_amount"> | null;

  resolvedScores.forEach((entry) => {
    const current = participantScores.get(entry.user_id) ?? [];
    if (current.length < 5) {
      current.push(entry.score);
      participantScores.set(entry.user_id, current);
      allScoreValues.push(entry.score);
    }
  });

  const winningNumbers =
    logicType === "algorithmic" && allScoreValues.length > 0
      ? algorithmicNumbers(allScoreValues)
      : uniqueRandomNumbers(5);

  const basePool = resolvedSubscriptions.reduce(
    (sum, subscription) => sum + getBaseMonthlyAmount(subscription.plan, Number(subscription.amount ?? 0)),
    0
  );

  const carryoverAmount = Number(previousJackpot?.rollover_amount ?? 0);
  const poolAmount = basePool + carryoverAmount;
  const configMap = new Map(resolvedPrizeConfig.map((config) => [config.match_type, Number(config.percentage)]));

  const winnersByMatch = {
    match_5: [] as string[],
    match_4: [] as string[],
    match_3: [] as string[]
  };

  participantScores.forEach((scores, userId) => {
    const matches = scores.filter((score) => winningNumbers.includes(score)).length;

    if (matches >= 5) {
      winnersByMatch.match_5.push(userId);
      return;
    }

    if (matches === 4) {
      winnersByMatch.match_4.push(userId);
      return;
    }

    if (matches === 3) {
      winnersByMatch.match_3.push(userId);
    }
  });

  const results = (["match_5", "match_4", "match_3"] as MatchType[]).map((matchType) => {
    const winners = winnersByMatch[matchType];
    const percentage = configMap.get(matchType) ?? 0;
    const shareAmount = (poolAmount * percentage) / 100;
    const isJackpotRollover = matchType === "match_5" && winners.length === 0;

    return {
      matchType,
      winnerIds: winners,
      totalAmount: shareAmount,
      amountPerWinner: winners.length > 0 ? shareAmount / winners.length : 0,
      rollover: isJackpotRollover,
      rolloverAmount: isJackpotRollover ? shareAmount : 0
    };
  });

  return {
    drawMonth: rangeStart.toISOString(),
    winningNumbers,
    activeSubscriberCount: resolvedSubscriptions.length,
    carryoverAmount,
    poolAmount,
    results
  };
}
