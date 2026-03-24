import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageTransition } from "@/components/ui/page-transition";

const wrappedSamples = [
  { month: "January", theme: "Systems thinking", tone: "up 18%" },
  { month: "February", theme: "Deeper focus", tone: "4 of 4 goals" },
  { month: "March", theme: "Creative momentum", tone: "best week Mar 10" }
];

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="relative overflow-hidden">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-8">
          <header className="flex items-center justify-between">
            <LogoMark />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/auth/signin" className="text-sm text-muted-foreground transition hover:text-foreground">
                Sign in
              </Link>
              <Link href="/auth/signup" className="inline-flex">
                <Button>Start for free</Button>
              </Link>
            </div>
          </header>

          <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                <Sparkles className="size-4 text-accent" />
                Weekly reflection, focus, and growth
              </div>
              <div className="space-y-6">
                <h1 className="serif max-w-3xl text-6xl leading-none md:text-8xl">
                  Reflect weekly. Grow yearly.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  A calm space to log what you learned, track your focus, and see your growth.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/auth/signup" className="inline-flex">
                  <Button size="lg" className="inline-flex items-center gap-2">
                    Start for free
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/wrapped" className="text-sm text-muted-foreground underline decoration-accent/60 underline-offset-4">
                  See a sample Wrapped
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-10 hidden h-72 w-72 rounded-full bg-accent/10 blur-3xl lg:block" />
              <Card className="relative overflow-hidden rounded-[36px] p-0">
                <div className="grid gap-4 p-4 md:grid-cols-[1.1fr_0.9fr] md:p-6">
                  <div className="rounded-[28px] bg-[#0d1018] p-5">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dashboard</p>
                        <p className="mt-2 text-2xl font-medium">This week feels steady.</p>
                      </div>
                      <div className="rounded-full bg-accent/16 px-3 py-1 text-sm text-accent">7 day streak</div>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[24px] bg-white/5 p-4">
                        <p className="text-sm text-muted-foreground">Focus timer</p>
                        <p className="serif mt-3 text-5xl">24:37</p>
                      </div>
                      <div className="rounded-[24px] bg-white/5 p-4">
                        <p className="text-sm text-muted-foreground">Last learning</p>
                        <p className="mt-3 text-sm leading-7 text-[#f8f8f2]/80">
                          I noticed that shipping faster got easier once I named the one thing that mattered each week.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {wrappedSamples.map((sample, index) => (
                      <div
                        key={sample.month}
                        className="animate-float rounded-[28px] bg-gradient-to-br from-white/10 to-white/5 p-5"
                        style={{ animationDelay: `${index * 0.6}s` }}
                      >
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{sample.month}</p>
                        <p className="serif mt-4 text-3xl">{sample.theme}</p>
                        <p className="mt-6 text-sm text-accent">{sample.tone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <footer className="flex flex-col items-start justify-between gap-3 border-t border-white/5 py-6 text-sm text-muted-foreground md:flex-row">
            <p>Built for quiet momentum.</p>
            <div className="flex gap-4">
              <Link href="/auth/signup">Start free</Link>
              <Link href="/auth/signin">Sign in</Link>
            </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}
