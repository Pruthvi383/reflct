"use client";

import { format } from "date-fns";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import type { Wrapped } from "@/types/database";

export function WrappedGrid({ wrappeds }: { wrappeds: Wrapped[] }) {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Wrapped</p>
          <h1 className="serif mt-3 text-5xl">Monthly snapshots of your growth.</h1>
        </div>

        {wrappeds.length === 0 ? (
          <Card className="rounded-[32px] p-10 text-center">
            <p className="serif text-3xl">Your first Wrapped generates on Dec 1st</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Once you have enough entries and sessions, Reflct can turn them into a calm monthly story.
            </p>
          </Card>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {wrappeds.map((wrapped) => (
            <Link key={wrapped.id} href={`/wrapped/${wrapped.year}-${String(wrapped.month).padStart(2, "0")}`}>
              <Card className="h-full rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {format(new Date(wrapped.year, wrapped.month - 1, 1), "MMMM yyyy")}
                </p>
                <p className="serif mt-5 text-3xl">{wrapped.summary.themes.join(" · ")}</p>
                <div className="mt-8 flex items-end justify-between text-sm text-muted-foreground">
                  <p>{wrapped.summary.focusTrend} focus trend</p>
                  <p>
                    {wrapped.summary.goalsHit} / {wrapped.summary.totalGoals} goals
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
