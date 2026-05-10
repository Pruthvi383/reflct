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

      <section className="mx-auto mt-20 grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-lens">AI spend audit for startups</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
            Find the messy overlap hiding inside your AI subscriptions.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Enter your team size, seats, plans, and monthly spend. SpendLens will
            estimate where the stack is overconfigured once the audit engine is in
            place.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-md border border-dashed border-slate-300 bg-mist px-5 py-16 text-center text-sm font-medium text-slate-500">
            Form goes here
          </div>
        </div>
      </section>
    </main>
  );
}
