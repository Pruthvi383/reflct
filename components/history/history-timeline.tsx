"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/ui/page-transition";
import type { Entry } from "@/types/database";

export function HistoryTimeline({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) =>
        `${entry.learnings} ${entry.next_goal ?? ""}`.toLowerCase().includes(query.toLowerCase())
      ),
    [entries, query]
  );

  const grouped = filteredEntries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const key = format(parseISO(entry.week_start), "MMMM yyyy");
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">History</p>
            <h1 className="serif mt-3 text-5xl">Every week, in one line of sight.</h1>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your learnings"
              className="pl-11"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <Card className="rounded-[32px] p-10 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white/6">
              <svg viewBox="0 0 120 120" className="size-10 text-accent" fill="none">
                <path d="M20 85C35 55 52 40 68 40C87 40 98 59 100 88" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M32 50L58 24L84 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="serif text-3xl">Start your first reflection today</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Once you begin reflecting, your weeks will stack up here with a smooth searchable timeline.
            </p>
          </Card>
        ) : null}

        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month} className="space-y-4">
              <div className="sticky top-6 z-10 inline-flex rounded-full bg-background/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground backdrop-blur-xl">
                {month}
              </div>
              <div className="space-y-3">
                {monthEntries.map((entry) => {
                  const isOpen = openId === entry.id;
                  return (
                    <Card key={entry.id} className="overflow-hidden rounded-[28px] p-0">
                      <button
                        type="button"
                        onClick={() => setOpenId((current) => (current === entry.id ? null : entry.id))}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {format(parseISO(entry.week_start), "MMM d")}
                          </p>
                          <p className="mt-2 font-medium">{entry.next_goal ?? "No goal captured"}</p>
                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-foreground/82">{entry.learnings}</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span
                              key={`${entry.id}-${index}`}
                              className={`size-2 rounded-full ${
                                index < (entry.focus_rating ?? 0) ? "bg-accent" : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                          >
                            <div className="space-y-4 p-5 text-sm leading-7 text-foreground/85">
                              <p>{entry.learnings}</p>
                              {entry.blocker ? <p className="text-muted-foreground">Blocker: {entry.blocker}</p> : null}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
