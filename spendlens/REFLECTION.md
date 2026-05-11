# Reflection

## Q1: What was the hardest bug you hit this week?

The hardest bug in this compressed build was the audit engine test suite becoming misleading after I added the remaining rules. The symptom was simple: the original three tests started failing even though the original rules still worked. My first hypothesis was that the new `flatMap` logic was duplicating findings, so I checked whether `findClaudeTeamMinimum` or `findSeatExcess` was returning the same object twice. That was wrong. My second hypothesis was that the TypeScript price lookup was returning incorrect prices and causing savings assertions to drift. That was also wrong.

The actual cause was more boring: the old test fixtures were no longer neutral. A Claude test without `startupCreditsUsed: true` now correctly triggered the startup credit rule. A high-spend Cursor test now correctly triggered annual billing unless I marked it annual. The test named "no findings" used $190/month on monthly billing, which should be a finding under the new rules. I found it by reading the failure diff rather than the implementation. The fix was to update fixtures so each test says exactly what behavior it isolates.

## Q2: What decision did you reverse mid-week, and why?

I initially treated the database as a hard requirement for the results page. That is the clean production path, but it made the deployed demo brittle because Supabase credentials may not be present when the app is first deployed. I reversed that by keeping Supabase support in the API routes while also storing the returned audit result in localStorage before navigating to the share URL.

That is not the final architecture for a real production launch, but it is the right behavior for a demo build: the app remains usable, the API still returns a real `auditId`, and production storage becomes active as soon as env vars are configured. The lesson was that "works in production" and "works for a reviewer clicking the link right now" are related but not identical constraints.

## Q3: What would you build next if you had another week?

The next feature would be invoice import. The current form is useful, but it asks the founder to know seat counts and plan names. The fastest path to better completion would be a "paste invoice line items" parser that accepts Stripe, Ramp, Brex, or email receipt text and maps vendors to supported tools.

That would move the main metric I care about: completed audits. It would also improve accuracy because self-reported monthly spend is often fuzzy. I would keep the parser separate from the deterministic audit engine, then show a review step where the user confirms mapped tools before running the audit.

## Q4: How did you use AI tools during this build?

I used Codex for scaffolding, TypeScript implementation, tests, API routes, and docs. I did not use AI to invent user interviews or fake a seven-day git history. I also used live web checks for pricing rather than trusting model memory, because pricing pages change and AI tools are especially bad at remembering current SaaS plan details.

One concrete place AI/tooling was wrong was the original prompt's Windsurf and Gemini pricing. The current public Windsurf pricing page shows Pro and Teams prices that differ from the prompt, and Google Workspace pricing now bundles Gemini into Workspace tiers. I updated the code and pricing notes to reflect what I could verify instead of blindly preserving stale prompt values.
