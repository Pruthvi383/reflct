import Link from "next/link";
import { format } from "date-fns";
import { Globe2, LockKeyhole, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import type { PublicProfilePayload } from "@/types/app";

export function PublicProfile({
  payload,
  isOwner = false
}: {
  payload: PublicProfilePayload;
  isOwner?: boolean;
}) {
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6 px-1 py-2 md:px-0 md:py-0">
        <Card className="rounded-[36px] p-6 md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex size-24 items-center justify-center rounded-[30px] bg-white/8 text-3xl font-semibold">
                {payload.profile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payload.profile.image}
                    alt={payload.profile.username}
                    className="size-24 rounded-[30px] object-cover"
                  />
                ) : (
                  payload.profile.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="serif text-4xl md:text-6xl">
                    {payload.profile.name ?? payload.profile.username}
                  </h1>
                  <div className="rounded-full bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    @{payload.profile.username}
                  </div>
                  <div className="rounded-full bg-accent/14 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent">
                    {isOwner ? "Your profile" : payload.profile.is_public ? "Public" : "Private"}
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {payload.profile.learning_goal
                    ? `Currently learning: ${payload.profile.learning_goal}`
                    : "A calm weekly ritual for learning, focus, and reflection."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined{" "}
                  {payload.profile.created_at
                    ? format(new Date(payload.profile.created_at), "MMMM yyyy")
                    : "recently"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
              <div className="rounded-[24px] bg-white/6 p-4">
                <p className="text-sm text-muted-foreground">Current streak</p>
                <p className="serif mt-2 text-4xl">{payload.profile.streak_count ?? 0}</p>
              </div>
              <div className="rounded-[24px] bg-white/6 p-4">
                <p className="text-sm text-muted-foreground">Longest streak</p>
                <p className="serif mt-2 text-4xl">{payload.profile.longest_streak ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="space-y-4 rounded-[32px]">
            <h2 className="serif text-3xl">Highlights</h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-[24px] bg-white/5 p-4">
                <Target className="mt-1 size-4 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Weeks reflected</p>
                  <p className="mt-1 text-2xl font-medium text-foreground">{payload.totalWeeks}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[24px] bg-white/5 p-4">
                <Sparkles className="mt-1 size-4 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Wrapped cards</p>
                  <p className="mt-1 text-2xl font-medium text-foreground">{payload.totalWrapped}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[24px] bg-white/5 p-4">
                {payload.profile.is_public ? (
                  <Globe2 className="mt-1 size-4 text-accent" />
                ) : (
                  <LockKeyhole className="mt-1 size-4 text-accent" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <p className="mt-1 text-base font-medium text-foreground">
                    {payload.profile.is_public ? "Open for sharing" : "Private by default"}
                  </p>
                </div>
              </div>
            </div>
            {isOwner ? (
              <Link href="/settings" className="inline-flex">
                <Button>Open settings</Button>
              </Link>
            ) : (
              <Link href="/auth/signup" className="inline-flex">
                <Button>Start your own</Button>
              </Link>
            )}
          </Card>

          <Card className="space-y-5 rounded-[32px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Wrapped</p>
                <h2 className="serif mt-2 text-3xl">Monthly growth snapshots</h2>
              </div>
              <p className="text-sm text-muted-foreground">{payload.totalWrapped} cards available</p>
            </div>
            {payload.wrapped.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {payload.wrapped.map((wrapped) => (
                  <Link
                    key={wrapped.id}
                    href={`/wrapped/${wrapped.year}-${String(wrapped.month).padStart(2, "0")}?user=${payload.profile.username}`}
                  >
                    <Card className="h-full rounded-[28px] bg-gradient-to-br from-white/10 to-white/5 transition hover:-translate-y-1">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {new Date(wrapped.year, wrapped.month - 1, 1).toLocaleString("en-US", {
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                      <p className="serif mt-4 text-3xl leading-tight">
                        {wrapped.summary.themes.join(" · ")}
                      </p>
                      <p className="mt-5 text-sm leading-7 text-muted-foreground">
                        {wrapped.summary.insight}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white/5 p-8 text-sm text-muted-foreground">
                {isOwner
                  ? "Your wrapped collection will start here once you generate your first monthly recap."
                  : "No public wrapped cards yet."}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
