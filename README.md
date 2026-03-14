# Family Planner

Your family's recipes, meal plans, grocery lists, and to-dos — finally organized in one place.

## Features

- **AI Recipe Import** — Paste a TikTok, YouTube, or recipe blog URL and get a structured recipe in seconds. Or snap a photo of a recipe card.
- **Meal Planner** — Drag-and-drop weekly planner with breakfast, lunch, dinner, and snack slots. Save template weeks for reuse.
- **Smart Grocery Lists** — Auto-generate from your meal plan with ingredient merging, aisle grouping, and a tap-to-check shopping mode.
- **Calendar Sync** — Connect Google Calendar to see meals alongside your family's schedule.
- **Shared To-Dos** — Task lists with assignments, due dates, and progress tracking for the whole household.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (Postgres + Row Level Security + Auth + Realtime)
- **AI**: Claude API (recipe extraction from video/image/unstructured text)
- **APIs**: Spoonacular (recipe discovery), Google Calendar (OAuth 2.0)
- **Hosting**: Vercel

## Quick Start

```bash
git clone https://github.com/ethancstuart/family-planner-app.git
cd family-planner-app
cp .env.example .env.local   # fill in your Supabase keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## Architecture

- **Multi-tenant** — Every query scoped to household via Supabase Row Level Security. Users create or join a household; all data is isolated per-household.
- **AI Import Pipeline** — Input (URL / video link / photo) → content extraction → Claude API → structured recipe JSON → user review → save.
- **Google Calendar OAuth** — Server-side token management with automatic refresh. Meal plan events sync bidirectionally.
- **Realtime** — Grocery lists update live across devices via Supabase Realtime subscriptions.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## License

MIT — see [LICENSE](LICENSE).

---

Built with [Claude Code](https://claude.ai/claude-code).
