"use client";

import { FormEvent, useMemo, useState } from "react";
import { Building2, CheckCircle2, LoaderCircle } from "lucide-react";

const teamSizes = ["1-50", "51-200", "201-500", "501-1000", "1000+"];

const initialState = {
  name: "",
  email: "",
  company: "",
  teamSize: teamSizes[0],
  message: ""
};

export const LeadForm = () => {
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const isSubmitting = useMemo(() => status === "loading", [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      const result = (await response.json()) as { success: boolean; message: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setStatus("success");
      setFeedback(result.message);
      setFormState(initialState);

      window.setTimeout(() => {
        setStatus("idle");
        setFeedback("");
      }, 3500);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <section id="lead-form" className="section-shell bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
            Let&apos;s Talk
          </span>
          <h2 className="mt-6 section-heading">Bring enterprise learning to your workforce.</h2>
          <p className="section-copy">
            Tell us about your team, goals, and timeline. Our enterprise specialists will get back with a customized recommendation.
          </p>

          <div className="mt-8 enterprise-card p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-50 p-3 text-brand">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">What happens next?</p>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  We review your requirements, schedule a discovery call, and recommend the best combination of programs, cohorts, and reporting flows for your business.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="enterprise-card p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none ring-0 transition focus:border-brand"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Work Email
                <input
                  required
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition focus:border-brand"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Company Name
                <input
                  required
                  type="text"
                  value={formState.company}
                  onChange={(event) => setFormState((current) => ({ ...current, company: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition focus:border-brand"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Team Size
                <select
                  value={formState.teamSize}
                  onChange={(event) => setFormState((current) => ({ ...current, teamSize: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition focus:border-brand"
                >
                  {teamSizes.map((teamSize) => (
                    <option key={teamSize} value={teamSize}>
                      {teamSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Message
              <textarea
                required
                rows={5}
                minLength={10}
                value={formState.message}
                onChange={(event) => setFormState((current) => ({ ...current, message: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand"
                placeholder="Tell us about your learning goals, hiring plans, or business transformation priorities."
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>

          {feedback ? (
            <div
              className={`mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              <span>{feedback}</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
