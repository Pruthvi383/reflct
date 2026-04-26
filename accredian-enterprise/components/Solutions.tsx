import { Activity, BadgeCheck, GraduationCap, Route } from "lucide-react";

import { solutions } from "@/lib/mockData";

const iconMap = {
  custom: Route,
  mentorship: GraduationCap,
  certification: BadgeCheck,
  analytics: Activity
} as const;

export const Solutions = () => {
  return (
    <section id="solutions" className="section-shell">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="section-heading">End-to-End Learning Solutions</h2>
          <p className="section-copy">
            From skilling strategy to learner engagement and executive reporting, every layer is designed to help enterprise teams move faster with confidence.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon];

            return (
              <div key={solution.title} className="enterprise-card p-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-brand">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{solution.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
