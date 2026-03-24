import { NextResponse } from "next/server";

import { sendMonthlyWrappedReadyEmail } from "@/lib/email";
import { generateWrappedSummary } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import type { Database, Entry, FocusSession } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { month?: number; year?: number };
  const month = body.month ?? new Date().getMonth() + 1;
  const year = body.year ?? new Date().getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [entriesResult, sessionsResult] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", monthStart.toISOString().slice(0, 10))
      .lte("week_start", monthEnd.toISOString().slice(0, 10))
      .order("week_start", { ascending: true }),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", monthStart.toISOString())
      .lte("started_at", monthEnd.toISOString())
  ]);

  const entries = (entriesResult.data ?? []) as Entry[];
  const sessions = (sessionsResult.data ?? []) as FocusSession[];

  const entriesText = entries
    .map(
      (entry) =>
        `Week ${entry.week_start}\nLearnings: ${entry.learnings}\nBlocker: ${entry.blocker ?? "None"}\nNext goal: ${entry.next_goal ?? "None"}`
    )
    .join("\n\n");

  const sessionStats = JSON.stringify(
    {
      totalSessions: sessions.length,
      productiveSessions: sessions.filter((session) => session.quality === "PRODUCTIVE").length,
      totalMinutes: sessions.reduce((sum, session) => sum + session.duration, 0)
    },
    null,
    2
  );

  const prompt = `
You are an insightful learning coach. A user has shared their weekly learning journal entries for ${
    monthStart.toLocaleString("en-US", { month: "long", year: "numeric" })
  }. Analyze them and return ONLY a valid JSON object with no markdown, no backticks, no explanation.

Weekly entries:
${entriesText}

Focus session stats:
${sessionStats}

Return this exact JSON structure:
{
  "themes": ["theme1", "theme2", "theme3"],
  "focusTrend": "improving" | "declining" | "consistent",
  "insight": "2-3 warm, personal sentences like a mentor. Reference specific things they learned.",
  "bestWeek": "ISO date string of week_start with most productive sessions",
  "goalsHit": number,
  "totalGoals": number
}
`;

  try {
    const summary = await generateWrappedSummary(prompt);
    const payload: Database["public"]["Tables"]["wrapped"]["Insert"] = {
      user_id: user.id,
      month,
      year,
      summary
    };

    const { data, error } = await supabase
      .from("wrapped")
      .upsert(payload as never, { onConflict: "user_id,month,year" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (user.email) {
      await sendMonthlyWrappedReadyEmail({
        email: user.email,
        month,
        year,
        topTheme: summary.themes[0] ?? "Reflective growth"
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wrapped generation failed" },
      { status: 500 }
    );
  }
}
