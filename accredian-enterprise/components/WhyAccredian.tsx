import { CheckCircle2 } from "lucide-react";

const uspItems = [
  "Cohort-based learning crafted with business-aligned outcomes",
  "Live sessions, office hours, and mentor touchpoints for deep engagement",
  "Dedicated account support, learner success tracking, and quarterly reviews",
  "Enterprise dashboards for participation, completion, and skill adoption insights"
];

const stats = [
  { label: "Completion Rate", value: "95%" },
  { label: "Expert Mentors", value: "200+" },
  { label: "Learning Hours", value: "1M+" }
];

export const WhyAccredian = () => {
  return (
    <section id="why-accredian" className="section-shell">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <h2 className="section-heading">Why Accredian</h2>
          <p className="section-copy">
            We combine enterprise-grade delivery, practitioner-led instruction, and measurable outcomes so your teams gain skills that matter to the business.
          </p>

          <div className="mt-10 space-y-5">
            {uspItems.map((item) => (
              <div key={item} className="flex items-start gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-brand" />
                <p className="text-base leading-7 text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="enterprise-card overflow-hidden bg-gradient-to-br from-slate-900 to-brand p-8 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Results Snapshot</p>
          <h3 className="mt-4 text-3xl font-semibold">Built for capability building that executives can measure.</h3>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-sm text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5">
            <p className="text-sm text-blue-100">
              Leadership teams get weekly visibility into activation, cohort attendance, assignment completion, and post-program readiness indicators.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
