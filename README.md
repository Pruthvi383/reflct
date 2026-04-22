# Birdie for Good

Subscription-driven charity draw platform built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Supabase Auth/Postgres/Storage, Stripe subscriptions, and Resend email notifications.

## What’s Included

- Emotion-led marketing homepage with featured charities and subscription CTA
- Supabase schema with RLS, storage bucket policies, score/date uniqueness, and 5-score trimming trigger
- Email/password auth with charity selection at signup
- Subscription pricing flow with Stripe Checkout and webhook synchronization
- Protected subscriber dashboard modules for scores, charity settings, draws, and winnings
- Admin control surface for users, charities, draws, winners, and high-level analytics
- Seed data for prize pool configuration and starter charities

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAILS`

## Supabase Setup

1. Create a new Supabase project.
2. Run [supabase/schema.sql](/Users/pruthvipatil/Reflct/supabase/schema.sql).
3. Run [supabase/seed.sql](/Users/pruthvipatil/Reflct/supabase/seed.sql).
4. In Storage, confirm the `winner-proofs` bucket exists if your project policies block automatic creation.
5. Set the Postgres setting `app.settings.admin_emails` if you want DB-triggered admin assignment to match `ADMIN_EMAILS`.

## Local Commands

This workspace ships with a local Node binary in `.tools`, so the validated commands are:

```bash
./.tools/node-v20.19.5-darwin-arm64/bin/node ./.tools/node-v20.19.5-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js install
./.tools/node-v20.19.5-darwin-arm64/bin/node ./node_modules/eslint/bin/eslint.js .
./.tools/node-v20.19.5-darwin-arm64/bin/node ./node_modules/typescript/bin/tsc --noEmit
./.tools/node-v20.19.5-darwin-arm64/bin/node ./node_modules/next/dist/bin/next build --webpack
```

For normal development once Node is on your shell path:

```bash
npm install
npm run dev
```

## Stripe Notes

- `app/actions.ts` creates hosted Stripe Checkout sessions for monthly/yearly plans.
- `app/api/stripe/webhook/route.ts` syncs subscription state from Stripe back into Supabase.
- If Stripe keys are absent, checkout falls back to a local development subscription record so the protected app can still be exercised.

## Verification

The current codebase passes:

- ESLint
- TypeScript `--noEmit`
- `next build --webpack`

## Deployment

Deploy to a new Vercel project and set the same environment variables there. Point Stripe webhook events to:

- `/api/stripe/webhook`
