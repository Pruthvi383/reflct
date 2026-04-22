"use server";

import { addMonths, addYears } from "date-fns";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireSubscriber, requireUser } from "@/lib/auth";
import { simulateDraw } from "@/lib/draw";
import {
  createEmergencyAdminCookieValue,
  EMERGENCY_ADMIN_COOKIE,
  matchesEmergencyAdminCredentials
} from "@/lib/emergency-admin";
import { sendDrawPublishedEmail, sendWinnerAlertEmail } from "@/lib/email";
import { DEFAULT_CHARITY_PERCENTAGE } from "@/lib/constants";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getStripePriceId, stripe } from "@/lib/stripe";
import type { Database } from "@/types/database";
import type { AppUser, Draw, DrawResult } from "@/types/app";
import {
  authSchema,
  charitySelectionSchema,
  checkoutSchema,
  donationSchema,
  drawConfigSchema,
  scoreSchema,
  signInSchema,
  winnerReviewSchema
} from "@/lib/validators";
import { absoluteUrl, getBaseMonthlyAmount, slugify } from "@/lib/utils";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function upsertSubscriptionDates(plan: "monthly" | "yearly") {
  const start = new Date();
  return {
    current_period_end:
      plan === "yearly" ? addYears(start, 1).toISOString() : addMonths(start, 1).toISOString()
  };
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: asString(formData.get("email")),
    password: asString(formData.get("password"))
  });

  if (!parsed.success) {
    redirect("/auth/signin?error=invalid_credentials");
  }

  if (matchesEmergencyAdminCredentials(parsed.data.email, parsed.data.password)) {
    const cookieStore = await cookies();
    cookieStore.set(EMERGENCY_ADMIN_COOKIE, createEmergencyAdminCookieValue(parsed.data.email), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/subscribe");
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    fullName: asString(formData.get("fullName")),
    email: asString(formData.get("email")),
    password: asString(formData.get("password")),
    charityId: asString(formData.get("charityId")),
    contributionPercentage: asString(formData.get("contributionPercentage"))
  });

  if (!parsed.success) {
    redirect("/auth/signup?error=invalid_input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName
      }
    }
  });

  if (error || !data.user) {
    redirect(`/auth/signup?error=${encodeURIComponent(error?.message ?? "Unable to create account")}`);
  }

  const admin = createAdminClient();
  await admin.from("users").upsert({
    id: data.user.id,
    email: parsed.data.email,
    full_name: parsed.data.fullName
  } satisfies Database["public"]["Tables"]["users"]["Insert"]);
  await admin.from("user_charity").upsert(
    {
      user_id: data.user.id,
      charity_id: parsed.data.charityId,
      contribution_percentage: parsed.data.contributionPercentage
    } satisfies Database["public"]["Tables"]["user_charity"]["Insert"],
    { onConflict: "user_id" }
  );

  redirect("/subscribe?welcome=1");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(EMERGENCY_ADMIN_COOKIE);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Fall back to cookie-only logout when Supabase is unavailable.
  }

  redirect("/");
}

export async function createCheckoutSessionAction(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    plan: asString(formData.get("plan"))
  });

  if (!parsed.success) {
    redirect("/subscribe?error=invalid_plan");
  }

  const { authUser, appUser, subscription } = await requireUser();
  const priceId = getStripePriceId(parsed.data.plan);
  const admin = createAdminClient();

  if (!stripe || !priceId) {
    await admin.from("subscriptions").upsert(
      {
        user_id: authUser.id,
        plan: parsed.data.plan,
        amount: parsed.data.plan === "yearly" ? 240 : 24,
        status: "active",
        ...upsertSubscriptionDates(parsed.data.plan)
      } satisfies Database["public"]["Tables"]["subscriptions"]["Insert"],
      { onConflict: "user_id" }
    );

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription?.stripe_customer_id ?? undefined,
    customer_email: subscription?.stripe_customer_id ? undefined : authUser.email,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    allow_promotion_codes: true,
    success_url: absoluteUrl("/dashboard?checkout=success"),
    cancel_url: absoluteUrl("/subscribe?checkout=canceled"),
    client_reference_id: authUser.id,
    metadata: {
      user_id: authUser.id,
      role: appUser.role,
      plan: parsed.data.plan
    }
  });

  redirect(session.url ?? "/subscribe");
}

export async function createBillingPortalAction() {
  const { subscription } = await requireUser();

  if (!subscription?.stripe_customer_id || !stripe) {
    redirect("/subscribe");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: absoluteUrl("/subscribe")
  });

  redirect(portal.url);
}

export async function upsertScoreAction(formData: FormData) {
  const { authUser, supabase } = await requireSubscriber();
  const parsed = scoreSchema.safeParse({
    playedAt: asString(formData.get("playedAt")),
    score: asString(formData.get("score"))
  });

  if (!parsed.success) return;

  const scoreId = asString(formData.get("scoreId"));

  if (scoreId) {
    await supabase
      .from("scores")
      .update({
        played_at: parsed.data.playedAt,
        score: parsed.data.score
      } as never)
      .eq("id", scoreId)
      .eq("user_id", authUser.id);
  } else {
    await supabase.from("scores").insert({
      user_id: authUser.id,
      played_at: parsed.data.playedAt,
      score: parsed.data.score
    } as never);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/scores");
}

export async function deleteScoreAction(formData: FormData) {
  const { authUser, supabase } = await requireSubscriber();
  const scoreId = asString(formData.get("scoreId"));

  if (!scoreId) return;

  await supabase.from("scores").delete().eq("id", scoreId).eq("user_id", authUser.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/scores");
}

export async function updateCharitySelectionAction(formData: FormData) {
  const { authUser, supabase } = await requireUser();
  const parsed = charitySelectionSchema.safeParse({
    charityId: asString(formData.get("charityId")),
    contributionPercentage: asString(formData.get("contributionPercentage"))
  });

  if (!parsed.success) return;

  await supabase.from("user_charity").upsert(
    {
      user_id: authUser.id,
      charity_id: parsed.data.charityId,
      contribution_percentage: parsed.data.contributionPercentage
    } as never,
    { onConflict: "user_id" }
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charity");
}

export async function createIndependentDonationAction(formData: FormData) {
  const { authUser, supabase } = await requireUser();
  const parsed = donationSchema.safeParse({
    charityId: asString(formData.get("charityId")),
    amount: asString(formData.get("amount")),
    note: asString(formData.get("note"))
  });

  if (!parsed.success) return;

  await supabase.from("donations").insert({
    user_id: authUser.id,
    charity_id: parsed.data.charityId,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
    source: "independent"
  } as never);

  revalidatePath("/dashboard/charity");
}

export async function uploadWinnerProofAction(formData: FormData) {
  const { authUser, supabase } = await requireUser();
  const winnerId = asString(formData.get("winnerId"));
  const file = formData.get("proof");

  if (!winnerId || !(file instanceof File) || file.size === 0) return;

  const filePath = `${authUser.id}/${winnerId}-${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const contentType = file.type || "image/png";

  const { error: uploadError } = await supabase.storage
    .from("winner-proofs")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  await supabase
    .from("winners")
    .update({
      proof_url: filePath,
      status: "pending_verification"
    } as never)
    .eq("id", winnerId)
    .eq("user_id", authUser.id);

  revalidatePath("/dashboard/winnings");
}

export async function simulateDrawAction(formData: FormData) {
  await requireAdmin();
  const parsed = drawConfigSchema.safeParse({
    drawMonth: asString(formData.get("drawMonth")),
    logicType: asString(formData.get("logicType")),
    notes: asString(formData.get("notes"))
  });

  if (!parsed.success) return;

  const admin = createAdminClient();
  const simulation = await simulateDraw(parsed.data);

  const { data: draw } = await admin
    .from("draws")
    .upsert(
      {
        draw_month: parsed.data.drawMonth,
        logic_type: parsed.data.logicType,
        notes: parsed.data.notes ?? null,
        status: "simulated",
        winning_numbers: simulation.winningNumbers,
        active_subscriber_count: simulation.activeSubscriberCount,
        pool_amount: simulation.poolAmount,
        carryover_amount: simulation.carryoverAmount
      } satisfies Database["public"]["Tables"]["draws"]["Insert"],
      { onConflict: "draw_month" }
    )
    .select("*")
    .single();

  if (!draw) return;
  const resolvedDraw = draw as Draw;

  await admin.from("draw_results").delete().eq("draw_id", resolvedDraw.id);
  await admin.from("draw_results").insert(
    simulation.results.map((result) => ({
      draw_id: resolvedDraw.id,
      match_type: result.matchType,
      winner_user_ids: result.winnerIds,
      winner_count: result.winnerIds.length,
      pool_amount: result.totalAmount,
      rollover: result.rollover,
      rollover_amount: result.rolloverAmount
    })) as Database["public"]["Tables"]["draw_results"]["Insert"][]
  );

  revalidatePath("/admin");
  revalidatePath("/admin/draws");
}

export async function publishDrawAction(formData: FormData) {
  await requireAdmin();
  const drawId = asString(formData.get("drawId"));
  if (!drawId) return;

  const admin = createAdminClient();
  const [{ data: draw }, { data: results }, { data: activeUsers }] = await Promise.all([
    admin.from("draws").select("*").eq("id", drawId).single(),
    admin.from("draw_results").select("*").eq("draw_id", drawId),
    admin
      .from("users")
      .select("id, email")
      .order("created_at", { ascending: false })
  ]);

  if (!draw) return;
  const resolvedDraw = draw as Draw;
  const resolvedResults = (results as DrawResult[] | null) ?? [];
  const resolvedUsers = (activeUsers as Pick<AppUser, "id" | "email">[] | null) ?? [];

  await admin.from("winners").delete().eq("draw_id", drawId);

  const winnerRows =
    resolvedResults.flatMap((result) => {
      const winnerIds = result.winner_user_ids ?? [];
      const amountPerWinner = winnerIds.length > 0 ? Number(result.pool_amount) / winnerIds.length : 0;

      return winnerIds.map((winnerId) => ({
        user_id: winnerId,
        draw_id: drawId,
        match_type: result.match_type,
        amount: amountPerWinner,
        status: "pending_verification" as const
      }));
    }) as Database["public"]["Tables"]["winners"]["Insert"][];

  if (winnerRows.length > 0) {
    await admin.from("winners").insert(winnerRows);
  }

  await admin
    .from("draws")
    .update({
      status: "published",
      published_at: new Date().toISOString()
    } satisfies Database["public"]["Tables"]["draws"]["Update"])
    .eq("id", drawId);

  const winnerMap = new Map(winnerRows.map((row) => [row.user_id, row.amount]));

  await Promise.all(
    resolvedUsers.map(async (user) => {
      await sendDrawPublishedEmail({
        email: user.email,
        drawMonth: resolvedDraw.draw_month
      });

      if (winnerMap.has(user.id)) {
        await sendWinnerAlertEmail({
          email: user.email,
          amount: winnerMap.get(user.id) ?? 0,
          drawMonth: resolvedDraw.draw_month
        });
      }
    })
  );

  revalidatePath("/admin");
  revalidatePath("/admin/draws");
  revalidatePath("/dashboard/draws");
  revalidatePath("/dashboard/winnings");
}

export async function updateWinnerStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = winnerReviewSchema.safeParse({
    winnerId: asString(formData.get("winnerId")),
    status: asString(formData.get("status"))
  });

  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin
    .from("winners")
    .update({
      status: parsed.data.status,
      reviewed_at: new Date().toISOString()
    } satisfies Database["public"]["Tables"]["winners"]["Update"])
    .eq("id", parsed.data.winnerId);

  revalidatePath("/admin/winners");
  revalidatePath("/dashboard/winnings");
}

export async function upsertCharityAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const charityId = asString(formData.get("charityId"));
  const name = asString(formData.get("name"));

  if (!name) return;

  await admin.from("charities").upsert({
    id: charityId || undefined,
    name,
    slug: slugify(name),
    description: asString(formData.get("description")),
    impact_blurb: asString(formData.get("impactBlurb")) || null,
    image_url: asString(formData.get("imageUrl")) || null,
    event_blurb: asString(formData.get("eventBlurb")) || null,
    location: asString(formData.get("location")) || null,
    website_url: asString(formData.get("websiteUrl")) || null,
    featured: asString(formData.get("featured")) === "on",
    tags: asString(formData.get("tags"))
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  } satisfies Database["public"]["Tables"]["charities"]["Insert"]);

  revalidatePath("/charities");
  revalidatePath("/admin/charities");
}

export async function deleteCharityAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const charityId = asString(formData.get("charityId"));

  if (!charityId) return;

  await admin.from("charities").delete().eq("id", charityId);
  revalidatePath("/charities");
  revalidatePath("/admin/charities");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const userId = asString(formData.get("userId"));

  if (!userId) return;

  await admin
    .from("users")
    .update({
      full_name: asString(formData.get("fullName")) || null,
      role: asString(formData.get("role")) === "admin" ? "admin" : "subscriber"
    } satisfies Database["public"]["Tables"]["users"]["Update"])
    .eq("id", userId);

  const plan = asString(formData.get("plan")) as "monthly" | "yearly";
  const status = asString(formData.get("status"));
  const amount = Number(asString(formData.get("amount")) || 0);

  if (plan && status) {
    await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status:
          status === "trialing" ||
          status === "active" ||
          status === "past_due" ||
          status === "canceled" ||
          status === "incomplete" ||
          status === "incomplete_expired" ||
          status === "unpaid" ||
          status === "paused"
            ? status
            : "incomplete",
        amount: amount || getBaseMonthlyAmount(plan, plan === "yearly" ? 240 : 24) * (plan === "yearly" ? 12 : 1),
        current_period_end: asString(formData.get("currentPeriodEnd")) || null
      } satisfies Database["public"]["Tables"]["subscriptions"]["Insert"],
      { onConflict: "user_id" }
    );
  }

  const charityId = asString(formData.get("charityId"));
  if (charityId) {
    await admin.from("user_charity").upsert(
      {
        user_id: userId,
        charity_id: charityId,
        contribution_percentage:
          Number(asString(formData.get("contributionPercentage")) || DEFAULT_CHARITY_PERCENTAGE)
      } satisfies Database["public"]["Tables"]["user_charity"]["Insert"],
      { onConflict: "user_id" }
    );
  }

  revalidatePath("/admin/users");
}
