export default function LoadingResults() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-ink">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-5 h-14 w-72 rounded bg-slate-200" />
          <div className="mt-5 h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
