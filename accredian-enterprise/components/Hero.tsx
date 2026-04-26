import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ink via-slate-900 to-brand">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_30%)]" />
      <div className="section-shell relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
            Enterprise Learning Reimagined
          </span>
          <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Transform Your Workforce with World-Class Learning
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/90">
            Build future-ready teams with industry-led programs, custom learning pathways, and enterprise reporting designed for measurable business outcomes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand transition hover:bg-blue-50"
            >
              Partner with Us
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#programs"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Programs
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="enterprise-card relative overflow-hidden border border-white/10 bg-white/10 p-8 text-white shadow-soft backdrop-blur">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Enterprise Impact</p>
                <h2 className="mt-3 text-2xl font-semibold">Learning that scales with your business.</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <BarChart3 className="h-6 w-6 text-blue-100" />
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-blue-100">Average program engagement</p>
                <p className="mt-3 text-3xl font-semibold">87%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-blue-100">Leadership cohorts launched</p>
                <p className="mt-3 text-3xl font-semibold">120+</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-4 top-10 rounded-2xl bg-white px-5 py-4 shadow-soft md:-left-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-brand">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">500+ Corporate Partners</p>
                <p className="text-xs text-gray-500">Across BFSI, Tech, FMCG, and Consulting</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -bottom-6 right-2 rounded-2xl bg-white px-5 py-4 shadow-soft [animation-delay:0.8s] md:right-8">
            <p className="text-sm font-semibold text-gray-900">50,000+ Employees Trained</p>
            <p className="mt-1 text-xs text-gray-500">Driving measurable capability uplift worldwide</p>
          </div>
        </div>
      </div>
    </section>
  );
};
