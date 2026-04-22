import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Trophy } from "lucide-react";

import { HeroScene } from "@/components/marketing/hero-scene";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, APP_TAGLINE, PLAN_CONFIG } from "@/lib/constants";
import { getFeaturedCharities } from "@/lib/data";
import { getSessionContext } from "@/lib/auth";
import { cn, formatCurrency } from "@/lib/utils";

const steps = [
  {
    title: "Join with a charity",
    body: "Pick a cause as part of signup and set the percentage of every payment you want committed to them."
  },
  {
    title: "Keep five recent scores live",
    body: "Add Stableford scores over time. The platform keeps only your latest five, with one score allowed per date."
  },
  {
    title: "Enter each monthly draw",
    body: "Your active subscription feeds the prize pool while the draw engine evaluates 3, 4, and 5-score matches."
  }
];

export default async function LandingPage() {
  const [charities, session] = await Promise.all([getFeaturedCharities(), getSessionContext()]);
  const primaryHref =
    session.appUser?.role === "admin" ? "/admin" : session.authUser ? "/subscribe" : "/auth/signup";

  return (
    <div className="pb-20">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/charities" className="hidden text-sm text-muted-foreground sm:inline">
              Charities
            </Link>
            <Link href="/auth/signin" className="text-sm text-muted-foreground">
              Sign in
            </Link>
            <Link href={primaryHref} className={buttonVariants({ variant: "primary" })}>
              Subscribe
            </Link>
          </div>
        </header>

        <div className="grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="space-y-8">
            <Badge variant="amber">Impact-led membership</Badge>
            <div className="space-y-6">
              <h1 className="serif max-w-4xl text-5xl leading-none sm:text-6xl lg:text-7xl">
                A monthly golf draw that starts with charity, not competition.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{APP_TAGLINE}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href={primaryHref} className={buttonVariants({ variant: "primary", size: "lg" })}>
                Join the club
                <ArrowRight className="ml-2 inline size-4" />
              </Link>
              <Link href="/charities" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Explore charities
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="mesh-panel rounded-[28px] p-5">
                <HeartHandshake className="size-5 text-accent" />
                <p className="mt-4 text-3xl font-semibold">10%+</p>
                <p className="mt-2 text-sm text-muted-foreground">Minimum charity allocation from every membership.</p>
              </Card>
              <Card className="mesh-panel rounded-[28px] p-5">
                <Trophy className="size-5 text-accent" />
                <p className="mt-4 text-3xl font-semibold">40/35/25</p>
                <p className="mt-2 text-sm text-muted-foreground">Prize pool split across 5, 4, and 3-score match tiers.</p>
              </Card>
              <Card className="mesh-panel rounded-[28px] p-5">
                <ShieldCheck className="size-5 text-accent" />
                <p className="mt-4 text-3xl font-semibold">Verified</p>
                <p className="mt-2 text-sm text-muted-foreground">Only winners upload score proof and go through review.</p>
              </Card>
            </div>
          </div>

          <HeroScene />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="rounded-[30px] p-6">
              <p className="eyebrow">Step 0{index + 1}</p>
              <h2 className="mt-4 text-2xl font-semibold">{step.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured charities</p>
            <h2 className="serif mt-3 text-4xl">Choose where your membership matters.</h2>
          </div>
          <Link href="/charities" className="text-sm text-muted-foreground underline underline-offset-4">
            View directory
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="mesh-panel rounded-[30px] p-6">
              <div className="rounded-[24px] bg-white/80 p-5">
                <p className="eyebrow">{charity.location ?? "Featured cause"}</p>
                <h3 className="mt-3 text-2xl font-semibold">{charity.name}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{charity.impact_blurb ?? charity.description}</p>
              </div>
              <Link href={`/charities/${charity.slug}`} className={cn(buttonVariants({ variant: "ghost" }), "mt-5")}>
                View profile
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="brand-gradient rounded-[36px] p-8 text-accent-foreground">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <p className="eyebrow text-accent-foreground/70">Membership plans</p>
              <h2 className="serif mt-3 text-4xl">Built for recurring impact and recurring chances to win.</h2>
            </div>
            {Object.entries(PLAN_CONFIG).map(([key, plan]) => (
              <div key={key} className="rounded-[28px] bg-black/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-accent-foreground/70">{plan.label}</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(plan.amount)}</p>
                <p className="mt-2 text-sm text-accent-foreground/80">per {plan.cadence}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/subscribe" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "bg-white text-foreground")}>
              See full pricing
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
