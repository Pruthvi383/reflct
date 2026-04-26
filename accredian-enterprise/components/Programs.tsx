import { Clock3, Layers3, Sparkles } from "lucide-react";

import { programs } from "@/lib/mockData";

export const Programs = () => {
  return (
    <section id="programs" className="section-shell bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="section-heading">Explore Our Enterprise Programs</h2>
          <p className="section-copy">
            Choose high-impact learning journeys across fast-growing business domains, each tailored for workforce transformation at scale.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <div key={program.title} className="enterprise-card p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  {program.domain}
                </span>
                <Sparkles className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-gray-900">{program.title}</h3>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
                  <Clock3 className="h-4 w-4" />
                  {program.duration}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
                  <Layers3 className="h-4 w-4" />
                  {program.level}
                </span>
              </div>
              <button
                type="button"
                className="mt-8 inline-flex rounded-full border border-brand px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
              >
                Know More
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
