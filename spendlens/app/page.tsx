import { AuditFormShell } from "@/components/audit-form-shell";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 text-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lens">
            SpendLens
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Know if your AI stack is costing you
          </p>
        </div>
      </header>

      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-lens">AI spend audit for startups</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Find the messy overlap hiding inside your AI subscriptions.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Enter your team size, seats, plans, and monthly spend. SpendLens will
            estimate where the stack is overconfigured and produce a shareable
            report in under two minutes.
          </p>
        </div>

        <AuditFormShell />
      </section>
    </main>
  );
}
