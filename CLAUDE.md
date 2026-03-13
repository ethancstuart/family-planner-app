# Family Planner App

## Project Overview
Open-source family command center. Recipe vault with AI-powered import (URLs, TikTok/YouTube videos, screenshots), meal planning, grocery list generation, calendar sync, and shared to-dos. Multi-tenant SaaS — each household is a tenant. Built entirely with Claude Code.

## Tech Stack
- Next.js 15+ (App Router)
- TypeScript (strict)
- Tailwind v4 + shadcn/ui
- Supabase (Postgres + Row Level Security + Auth + Realtime)
- Claude API (recipe extraction from video/image/unstructured text)
- Spoonacular API (recipe discovery)
- Google Calendar API (OAuth 2.0)
- Vercel (hosting)

## Architecture
- Multi-tenant: every query scoped to household via Supabase RLS
- Auth: Supabase Auth with Google OAuth. User profile auto-created via DB trigger.
- Household model: User signs up → creates or joins household → all data scoped to household
- API keys: Claude API key stored per-household (encrypted), used server-side only
- AI import pipeline: Input (URL/video/image) → content extraction → Claude API → structured recipe JSON → user review → save
- Middleware: protects all routes except / and /auth/callback

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `vercel` — deploy to Vercel

## File Structure
```
src/
  app/                    # Next.js App Router pages
    auth/callback/        # Supabase OAuth callback
    dashboard/            # Main dashboard + onboarding
    recipes/              # Recipe vault (Phase 1)
    meal-planner/         # Weekly meal planner (Phase 2)
    grocery/              # Grocery lists (Phase 3)
    calendar/             # Calendar hub (Phase 4)
    todos/                # Family to-dos (Phase 5)
    settings/             # Household settings, API keys
  components/
    layout/               # App shell, nav, login
    ui/                   # shadcn/ui components
    recipes/              # Recipe-specific components
    meal-planner/         # Meal planner components
    grocery/              # Grocery list components
    calendar/             # Calendar components
    todos/                # To-do components
  lib/
    supabase/             # Supabase client (browser), server, middleware
    hooks/                # React hooks
  types/                  # TypeScript interfaces
supabase/
  schema.sql              # Full DB schema with RLS policies
```

## Database
- Schema defined in supabase/schema.sql
- All tables have RLS enabled
- Household scoping via user_household_ids() helper function
- Triggers: auto-create user profile on signup, auto-update updated_at on recipes

## Conventions
- Dark theme by default (html class="dark")
- Mobile-first responsive design
- TypeScript strict, never JavaScript
- Components: PascalCase in appropriate feature folder
- Server components by default, "use client" only when needed
- All external API calls through Next.js API routes (keys stay server-side)
- Supabase client: use server client in Server Components, browser client in Client Components

## Phased Roadmap
- Phase 1: Foundation + Recipe Vault + AI Import
- Phase 2: Recipe Discovery (Spoonacular) + Meal Planner
- Phase 3: Grocery List Generator
- Phase 4: Calendar Hub (Google Calendar)
- Phase 5: Family To-Do + SaaS Polish

## Shared Context — home-base
This project is part of a portfolio managed from ~/Projects/home-base.
Before planning features or making architectural decisions, reference:
- `~/Projects/home-base/registry.md` — project registry, status, and cross-project alignment
- `~/Projects/home-base/apis/catalog.md` — curated API catalog (food, nutrition, recipe APIs)
- `~/Projects/home-base/standards/quality.md` — shared quality standards
- `~/Projects/home-base/standards/design-principles.md` — shared design philosophy
- `~/Projects/home-base/personal/CLAUDE.local.md` — who Ethan is, how he works

When planning new features, check the API catalog for food/nutrition/recipe integrations.

## Important Notes
- `.env.local` is gitignored — copy `.env.example` and add Supabase keys
- `CLAUDE.local.md` is gitignored — personal context
- Claude API key stored per-household in DB, never in env vars (except for development)
- Recipe import from video uses transcript extraction → Claude for parsing
- Recipe import from image uses Claude vision API
- Run supabase/schema.sql in Supabase SQL Editor to initialize the database
