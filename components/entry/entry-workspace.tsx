"use client";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageTransition } from "@/components/ui/page-transition";
import { Textarea } from "@/components/ui/textarea";
import { ENTRY_AUTOSAVE_INTERVAL_MS } from "@/lib/constants";
import { formatWeekLabel } from "@/lib/date";
import { useAutosave } from "@/lib/hooks/use-autosave";
import { useUiStore } from "@/store/use-ui-store";
import type { Entry, FocusSession } from "@/types/database";

type EntryDraft = {
  week_start: string;
  learnings: string;
  focus_rating: number | null;
  blocker: string | null;
  next_goal: string;
  prev_goal_met: boolean | null;
  is_locked?: boolean;
};

export function EntryWorkspace({
  currentEntry,
  previousEntry,
  sessions,
  weekStart
}: {
  currentEntry: Entry | null;
  previousEntry: Entry | null;
  sessions: FocusSession[];
  weekStart: string;
}) {
  const [draft, setDraft] = useState<EntryDraft>({
    week_start: currentEntry?.week_start ?? weekStart,
    learnings: currentEntry?.learnings ?? "",
    focus_rating: currentEntry?.focus_rating ?? null,
    blocker: currentEntry?.blocker ?? "",
    next_goal: currentEntry?.next_goal ?? "",
    prev_goal_met: currentEntry?.prev_goal_met ?? null,
    is_locked: currentEntry?.is_locked ?? false
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);

  useEffect(() => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  const averageFocus = useMemo(() => {
    if (!sessions.length) return null;
    const productive = sessions.filter((session) => session.quality === "PRODUCTIVE").length;
    return Math.max(1, Math.min(5, Math.round((productive / sessions.length) * 5)));
  }, [sessions]);

  useEffect(() => {
    if (!draft.focus_rating && averageFocus) {
      setDraft((current) => ({ ...current, focus_rating: averageFocus }));
    }
  }, [averageFocus, draft.focus_rating]);

  async function getResponseMessage(response: Response, fallback: string) {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function persist(nextDraft = draft) {
    if (!nextDraft.learnings.trim() && !nextDraft.next_goal.trim()) return;
    setSaving(true);

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nextDraft)
    });

    setSaving(false);

    if (!response.ok) {
      const message = await getResponseMessage(response, "Draft not saved yet.");
      toast.error(message);
      return;
    }
  }

  useAutosave(() => persist(), ENTRY_AUTOSAVE_INTERVAL_MS);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        setConfirmOpen(true);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function lockEntry() {
    const payload = {
      ...draft,
      is_locked: true
    };
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await getResponseMessage(
        response,
        "We couldn't lock this week yet."
      );
      toast.error(message);
      return;
    }

    toast.success("This week is locked in.");
    setDraft((current) => ({ ...current, is_locked: true }));
    setConfirmOpen(false);
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
              {formatWeekLabel(draft.week_start)}
            </p>
            <h1 className="serif mt-3 text-5xl">Weekly reflection</h1>
          </div>
          <p className="text-sm text-muted-foreground">~4 mins {saving ? "· saving..." : ""}</p>
        </div>

        <Card className="rounded-[32px] bg-accent/10">
          <p className="text-sm text-muted-foreground">Last week you wanted to:</p>
          <p className="serif mt-3 text-2xl">{previousEntry?.next_goal ?? "Set one clear goal."}</p>
          <div className="mt-5 flex gap-3">
            <Button
              variant={draft.prev_goal_met === true ? "primary" : "secondary"}
              onClick={() => setDraft((current) => ({ ...current, prev_goal_met: true }))}
              disabled={draft.is_locked}
            >
              Yes
            </Button>
            <Button
              variant={draft.prev_goal_met === false ? "primary" : "secondary"}
              onClick={() => setDraft((current) => ({ ...current, prev_goal_met: false }))}
              disabled={draft.is_locked}
            >
              No
            </Button>
          </div>
        </Card>

        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Learnings</p>
          <Textarea
            value={draft.learnings}
            onChange={(event) => setDraft((current) => ({ ...current, learnings: event.target.value }))}
            onBlur={() => void persist()}
            placeholder="What did you learn this week?"
            className="serif min-h-[260px] text-2xl"
            disabled={draft.is_locked}
          />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Focus</p>
              <h2 className="serif mt-2 text-3xl">How focused were you?</h2>
            </div>
            <p className="text-sm text-muted-foreground">Based on {sessions.length} focus sessions this week</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const active = value === draft.focus_rating;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={draft.is_locked}
                  onClick={() => setDraft((current) => ({ ...current, focus_rating: value }))}
                  className={`flex size-14 items-center justify-center rounded-full text-lg transition ${
                    active ? "bg-accent text-accent-foreground" : "bg-white/6 text-muted-foreground"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Blocker</p>
          <Input
            value={draft.blocker ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, blocker: event.target.value }))}
            onBlur={() => void persist()}
            placeholder="What held you back?"
            className="h-14"
            disabled={draft.is_locked}
          />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Next goal</p>
          <Input
            value={draft.next_goal}
            onChange={(event) => setDraft((current) => ({ ...current, next_goal: event.target.value }))}
            onBlur={() => void persist()}
            placeholder="What’s your one goal for next week?"
            className="h-14 text-base font-medium"
            disabled={draft.is_locked}
          />
        </motion.section>

        {!draft.is_locked ? (
          <Button className="h-14 w-full text-base" size="lg" onClick={() => setConfirmOpen(true)}>
            Lock in this week →
          </Button>
        ) : (
          <Card className="rounded-[28px] bg-white/6 text-center text-sm text-muted-foreground">
            This entry is locked. You can read it, but not edit it.
          </Card>
        )}

        <Modal
          open={confirmOpen}
          title="Lock in this week?"
          description="You’ll still be able to read this reflection, but editing will close once it’s locked."
          confirmLabel="Lock it in"
          onConfirm={() => void lockEntry()}
          onClose={() => setConfirmOpen(false)}
        />
      </div>
    </PageTransition>
  );
}
