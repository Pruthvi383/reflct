# SpendLens

SpendLens is a web-based AI tool spend auditor for startups. A founder enters team size, AI subscriptions, seat counts, billing cadence, and monthly spend, then gets deterministic savings findings, an AI-written summary, a lead capture form, and a shareable results URL.

## Screenshot

Add a production screenshot after the final Vercel deployment.

## Local Setup

```bash
cd spendlens
npm install
npm run dev
```

The app works in demo mode without service credentials. In demo mode, audit results are stored in memory and copied to localStorage before redirecting to the results page.

## Environment Variables

`NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.

`SUPABASE_SERVICE_ROLE_KEY`: Service role key used by API routes to insert audits and leads.

`ANTHROPIC_API_KEY`: Enables the `/api/summary` Anthropic call. Without it, SpendLens returns a deterministic fallback summary.

`RESEND_API_KEY`: Enables lead confirmation email.

`RESEND_FROM_EMAIL`: Optional sender address for Resend.

## Decisions

Deterministic rules, not AI, run the audit. The math has to be repeatable and defensible, so the engine lives in TypeScript and always returns the same result for the same input.

The summary is async and non-blocking. The results page should be useful even if Anthropic times out, so the fallback summary is always available.

The deployed app has a demo fallback for storage and email. Supabase and Resend are still supported, but the core audit can be tried before production credentials are configured.
