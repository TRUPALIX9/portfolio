# Trupal Patel Portfolio

A personal portfolio built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, and MongoDB.

It contains:

- a single-page home (hero, about, education, certifications, experience timeline, tech stack, work, contact)
- story-style project case studies (problem → solution → integration → challenges → learnings → status)
- a certifications page with verified credential links
- a memory game with a global leaderboard, plus signed arcade-only share links
- a protected admin playground (leaderboard moderation, contact inbox, visitor analytics)
- Playwright end-to-end smoke tests

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4 + a small token-based design system (`src/app/globals.css`)
- Framer Motion
- MongoDB
- Three.js / React Three Fiber (hero starfield)
- Playwright

## Live Links & Repositories

### Portfolio & Credentials
- **Personal Portfolio**: [https://trupalpatel.com/](https://trupalpatel.com/)
- **GitHub Profile**: [https://github.com/TRUPALIX9](https://github.com/TRUPALIX9)
- **Meta Front-End Developer Badge (Credly)**: [View Credential](https://www.credly.com/badges/8acca941-de83-466e-b754-0518b0f25e25)
- **All certifications**: `/certifications` on the site (data in [src/data/certifications.ts](src/data/certifications.ts))

### Projects & Repositories
- **StoreDesk Ecosystem**: [GitHub](https://github.com/TRUPALIX9/StoreDesk) | [storedesk.net](https://storedesk.net) | [Product page](https://trupalpatel.com/products/storedesk)
- **LogicSprint: Brain Games**: [logicsprint.trupalpatel.com](https://logicsprint.trupalpatel.com)
- **RetailSync SaaS Monorepo**: [GitHub](https://github.com/comp596-spring-2026/RetailSync)
- **AWS Bedrock Shipping & Logistics Agent**: [GitHub](https://github.com/TRUPALIX9/Shipping-Agent-AWS)
- **Card Vault Mobile OCR Scanner (React Native Expo)**: [GitHub](https://github.com/TRUPALIX9/card-snap-frontend)
- **Logic Sprint Offline Brain-Training Game (Flutter)**: [GitHub](https://github.com/TRUPALIX9/logic-sprint)
- **Web-Warehouse 3D (Next.js 15 + Three.js)**: [GitHub](https://github.com/TRUPALIX9/web-warehouse)
- **Fire Forecasting ML Pipeline & API**: [GitHub](https://github.com/TRUPALIX9/fire-forecasting)
- **Motion Detection VMS (C# WinForms + ONVIF)**: [GitHub](https://github.com/TRUPALIX9/Motion-Detection-Windows-App)
- **Vehicle Log Management System (C# + Windows Service)**: [GitHub](https://github.com/TRUPALIX9/Vehicle-Log-Managment-System)

## Routes

Public pages:

- `/` — home (sections: `#about`, `#certifications`, `#experience`, `#tech-stack`, `#projects`, `#contact`)
- `/projects` and `/projects/[slug]` — project gallery and case studies
- `/experience/[slug]` — experience deep dives
- `/certifications` — all credentials
- `/social`, `/social-only` — link hub (not indexed)
- `/game`, `/game-only` — memory game + leaderboard

Arcade / admin:

- `/playground` — protected admin dashboard
- `/arcade/[token]` — signed arcade-only mode
- `/api/leaderboard` — leaderboard read/write/admin moderation
- `/api/contact-submissions` — contact form submissions
- `/api/visitor-analytics` — first-party visitor analytics
- `/api/playground/session`, `/api/playground/share-link` — admin session and signed share links

## Content

Most copy lives in data files, not components:

- [src/data/projects.ts](src/data/projects.ts) — project facts, tech, milestones
- [src/data/project-stories.ts](src/data/project-stories.ts) — case-study narrative (integration, challenges, learnings)
- [src/data/master.json](src/data/master.json) — bio and experience
- [src/data/certifications.ts](src/data/certifications.ts) — credentials, including the Meta course-certificate carousel
- [src/data/site-config.tsx](src/data/site-config.tsx) — nav and social links

## Environment Variables

Create `.env.local`:

```env
MONGODB_URI=...
KEY=...
SHARE_LINK_SECRET=...
NEXT_PUBLIC_GA_ID=...
```

- `MONGODB_URI` — MongoDB connection (leaderboard, contact submissions, analytics).
- `KEY` — protects the admin playground and admin API actions.
- `SHARE_LINK_SECRET` — signs arcade-only URLs; falls back to `KEY` if omitted.
- `NEXT_PUBLIC_GA_ID` — optional Google Analytics ID; GA only loads when it's set.

## Local Development

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint 9 (flat config)
npm run test:e2e   # Playwright smoke tests — see TESTING.md
```

## Design System

`src/app/globals.css` defines the tokens every component uses:

- Text tiers: `text-ink-1` (headings), `text-ink-2` (body), `text-ink-3` (meta) — all ≥ 4.5:1 on the dark surfaces
- Elevation: `bg-surface-0/1/2/3` with `border-line-1/2` and `--shadow-card` / `--shadow-raised`
- Components: `.card`, `.card-interactive`, `.spotlight` (cursor-following glow), `.eyebrow`, `.measure`
- Motion: `Reveal`, `Stagger`, `StaggerItem` in `src/components/motion/`; `MotionConfig` respects the OS reduced-motion setting

## Admin Playground

The dashboard at `/playground` supports key-based access (httpOnly session cookie), leaderboard insights and moderation,
player renaming, a contact inbox, a visitor analytics explorer, and signed arcade-only share links. Key files:

- [src/app/playground/page.tsx](src/app/playground/page.tsx)
- [src/components/admin/MasterVisitorExplorer.tsx](src/components/admin/MasterVisitorExplorer.tsx)
- [src/utils/admin.ts](src/utils/admin.ts) and [src/utils/arcade-share.ts](src/utils/arcade-share.ts)

## Maintainer Docs

- [TESTING.md](TESTING.md)
- [.agents/docs/arcade-system.md](.agents/docs/arcade-system.md)
- [.agents/workflows/portfolio-site-maintenance.md](.agents/workflows/portfolio-site-maintenance.md)
- [.agents/workflows/arcade-maintenance.md](.agents/workflows/arcade-maintenance.md)
- [.agents/workflows/game-development.md](.agents/workflows/game-development.md)
