"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Snowflake, Target } from "lucide-react";

import { QuickTimer } from "@/components/dashboard/quick-timer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { formatWeekLabel } from "@/lib/date";
import type { DashboardSnapshot } from "@/types/app";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 }
};

export function DashboardView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const productiveSessions = snapshot.currentWeekSessions.filter(
    (session) => session.quality === "PRODUCTIVE"
  ).length;
  const statusVariant =
    snapshot.entryStatus === "DONE" ? "green" : snapshot.entryStatus === "MISSED" ? "muted" : "amber";

  return (
    <PageTransition>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="space-y-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Dashboard</p>
            <h1 className="serif mt-3 text-5xl">Quiet momentum, week by week.</h1>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-7 text-muted-foreground md:block">
            Your calm system for noticing progress, honoring focus, and closing each week with clarity.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <motion.div variants={cardVariants}>
            <Card className="h-full space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Streak</p>
                <div className="rounded-full bg-accent/14 p-3 text-accent">
                  <Flame className="size-5" />
                </div>
              </div>
              <div className="flex items-end gap-4">
                <p className="serif text-7xl">{snapshot.profile.streak_count ?? 0}</p>
                <p className="pb-3 text-sm text-muted-foreground">weeks of reflection</p>
              </div>
              <div className="flex items-center justify-between rounded-[24px] bg-white/6 p-4">
                <div className="flex items-center gap-3">
                  <Snowflake className="size-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Streak freezes available</p>
                </div>
                <p className="text-lg font-medium">{snapshot.profile.streak_freezes ?? 0}</p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="h-full space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">This week</p>
                  <Badge variant={statusVariant}>{snapshot.entryStatus}</Badge>
                </div>
                <Target className="size-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last week’s goal</p>
                <blockquote className="serif mt-4 text-3xl leading-tight text-foreground/92">
                  “{snapshot.lastGoal ?? "Capture one clear learning."}”
                </blockquote>
              </div>
              <div className="flex items-center justify-between rounded-[24px] bg-white/6 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current entry</p>
                  <p className="mt-1 text-sm text-foreground">
                    {snapshot.currentEntry ? "Your draft is waiting." : "No reflection started yet."}
                  </p>
                </div>
                <Link className={buttonVariants()} href="/entry">
                  {snapshot.currentEntry ? "Continue" : "Write now"}
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={cardVariants}>
          <Card>
            <QuickTimer />
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent entries</p>
                <h2 className="serif mt-2 text-3xl">Your last four weeks</h2>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{snapshot.currentWeekSessions.length} sessions this week</p>
                <p>{productiveSessions} productive</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {snapshot.recentEntries.map((entry) => (
                <div key={entry.id} className="rounded-[24px] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {formatWeekLabel(entry.week_start)}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-foreground/82">
                    {entry.learnings}
                  </p>
                  <div className="mt-5 flex gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={`${entry.id}-${index}`}
                        className={`size-2.5 rounded-full ${
                          index < (entry.focus_rating ?? 0) ? "bg-accent" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {snapshot.recentEntries.length === 0 ? (
                <div className="rounded-[24px] bg-white/5 p-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
                  Start your first reflection any time. Once you write it, your weekly history will begin to take shape here.
                </div>
              ) : null}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
