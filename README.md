# Reflct

Calm, premium productivity journaling built with Next.js 15, TypeScript, Tailwind CSS, Supabase, Framer Motion, Zustand, React Hook Form, Zod, Resend, and Gemini.

## Setup

1. Copy `.env.example` to `.env.local` and fill in the Supabase, Gemini, Resend, and app URL values.
2. Run the SQL in [supabase/schema.sql](/Users/pruthvipatil/Reflct/supabase/schema.sql) inside the Supabase SQL editor.
3. Install dependencies with your preferred package manager.
4. Start the app with `npm run dev`.

## Included product areas

- Landing page, auth, OAuth callback, and onboarding flow
- Protected dashboard, timer, entry, history, wrapped, and settings areas
- Public profile pages and public Wrapped sharing via `?user=<username>`
- Supabase SSR clients, middleware session refresh, typed database models, and route handlers
- Gemini monthly wrapped generation and Resend email helpers

## Notes

- The supplied profile schema required a non-null `username`, so the included SQL trigger seeds a placeholder username for OAuth users and lets onboarding replace it later.
- I could not run `npm`, `next build`, or `tsc` here because Node.js/package managers are unavailable in this environment.
