# DEVLOG

## 2026-05-10

Set up the SpendLens folder as a separate Next.js app inside the larger Reflct workspace. The first pass was intentionally thin: App Router, TypeScript, Tailwind, starter pricing data, and placeholder form UI.

Blocker: `npm` was not available on the shell path, so the scaffold had to be created manually instead of through `create-next-app`.

## 2026-05-12

Built the initial audit engine tests and then expanded the app into a functional MVP: all seven audit rules, Zod validation, API routes, local demo fallback storage, results page, summary endpoint, lead capture, docs, and CI.

Blocker: adding the later rules broke earlier tests because the old fixtures started triggering annual-billing and credit-opportunity findings. I fixed that by making the old tests opt into annual billing or mark startup credits as already used so each test isolates one rule.

Note: this is an honest catch-up log. It is not a fabricated seven-day devlog.
