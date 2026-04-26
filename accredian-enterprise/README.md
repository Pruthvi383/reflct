# Accredian Enterprise Clone

Partial clone of the Accredian Enterprise landing experience, built with Next.js App Router, TypeScript, and Tailwind CSS.

## Setup Instructions

1. Change into the project directory:

```bash
cd accredian-enterprise
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Approach

- Built the page as a composition of reusable section components.
- Stored static content and UI collections in `lib/mockData.ts`.
- Implemented a sticky, responsive navbar with a mobile drawer.
- Added a lead capture form with client-side submission UX and a server-side API route.
- Used an in-memory store for submitted leads to keep the API simple and Vercel-friendly for demo use.
- Used `next/font` with Inter for a clean enterprise look.

## AI Usage

AI assistance was used to help plan the component structure, generate boilerplate quickly, and refine copy/layout decisions. The final code was organized, reviewed, and assembled into a working Next.js app structure.

## Improvements

- Replace placeholder logo boxes with actual brand-approved assets.
- Connect `/api/leads` to a real CRM or database such as HubSpot, Supabase, or PostgreSQL.
- Add animations with more nuanced motion states and section reveal effects.
- Introduce richer accessibility checks, unit tests, and form validation feedback states.
- Add CMS-driven content for programs, testimonials, and case studies.
