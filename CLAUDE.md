# Family Planner App

## Project Overview
Personal family command center for the Stuart family. Recipe vault with AI-powered import (URLs, TikTok/YouTube videos, screenshots), meal planning, grocery list generation, calendar view, and shared to-dos. Built entirely with Claude Code.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind v4 + shadcn/ui
- Supabase (Postgres — RLS disabled, used as simple database)
- Claude API (recipe extraction from URL/video/image)
- Vercel (hosting)

## Architecture
- **Personal family tool** — no multi-tenant, no auth system
- **PIN lock**: Simple 4-digit PIN gate (hardcoded "1234") via cookie-based middleware
- **Supabase**: Used as a database only (RLS disabled). Service role client for server-side, anon client for client-side.
- **AI import pipeline**: Input (URL/video/image) → content extraction → Claude API → structured recipe JSON → user review → save
- **Middleware**: checks `family-pin` cookie; redirects to PIN screen if not set

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript check

## File Structure
```
src/
  app/                    # Next.js App Router pages
    api/auth/pin/         # PIN verification endpoint
    dashboard/            # Main dashboard
    recipes/              # Recipe vault
    meal-planner/         # Weekly meal planner
    grocery/              # Grocery lists
    calendar/             # Calendar view
    todos/                # Family to-dos
    settings/             # Configuration info
  components/
    layout/               # App shell, nav
    ui/                   # shadcn/ui components
    recipes/              # Recipe-specific components
    meal-planner/         # Meal planner components
    grocery/              # Grocery list components
    calendar/             # Calendar components
    todos/                # To-do components
  lib/
    supabase/             # Supabase clients
      family.ts           # Family client (admin/service role, fixed household ID)
      admin.ts            # Admin client (service role)
      client.ts           # Browser client (anon key)
    hooks/                # React hooks
  types/                  # Re-exports from @family-planner/shared
supabase/
  schema.sql              # Original DB schema
  family-mode-migration.sql  # Run this to convert to personal mode (disables RLS, creates family household)
```

## Database
- Schema defined in supabase/schema.sql
- **Run supabase/family-mode-migration.sql** to disable RLS and set up for family use
- Fixed household ID: `00000000-0000-0000-0000-000000000001`
- No auth — `created_by` is nullable after migration

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CLAUDE_API_KEY=sk-ant-...
FAMILY_HOUSEHOLD_ID=00000000-0000-0000-0000-000000000001
```

## Conventions
- Light theme by default (family app)
- Primary color: vivid purple (OKLCH hue 285) with teal accent (hue 180)
- iPad-optimized (touch targets, responsive at 1024x768 and 1366x1024)
- TypeScript strict, never JavaScript
- Components: PascalCase in appropriate feature folder
- Server components by default, "use client" only when needed
- Server-side data: use `createFamilyClient()` from `lib/supabase/family.ts`
- Client-side data: use `createClient()` from `lib/supabase/client.ts`

## PIN Lock
- PIN: "1234" (hardcoded in `src/middleware.ts` and `src/app/api/auth/pin/route.ts`)
- Cookie: `family-pin`, httpOnly, 30-day expiry
- To change: update PIN in both files

## Shared Package
Types, constants, and utils come from `@family-planner/shared`. Next.js transpiles it via `transpilePackages` in `next.config.ts`.
