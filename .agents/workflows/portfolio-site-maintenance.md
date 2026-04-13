---
description: Maintainer guide for the portfolio site pages, shared UI, content sources, and end-to-end visitor journey.
---

# Portfolio Site Maintenance Workflow

Use this workflow whenever you are changing the portfolio pages, shared layout, content, navigation, social/contact surfaces, or case-study content.

This document is intentionally detailed. The portfolio is not just a codebase; it is a conversion funnel, credibility asset, and product demo. Changes should preserve clarity, trust, performance, and narrative flow.

## 1. Core Reality

From the visitor perspective, this site has four jobs:

1. Establish credibility quickly.
2. Explain who Trupal is and what kinds of systems he builds.
3. Provide proof through projects, experience, resume, and the interactive arcade.
4. Create a low-friction path to contact or social connection.

Every page should be judged against those jobs before being judged against code elegance.

## 2. Primary User Journey

### Home

Primary files:
- `src/app/page.tsx`
- `src/components/HeroSection.tsx`

Customer reality:
- Most visitors will land here first.
- The hero needs to answer within seconds:
  - Who is this?
  - What kind of engineer is he?
  - Where do I click next?

Maintenance expectations:
- Preserve a strong headline, short supporting paragraph, and immediate CTA buttons.
- The animated starfield is part of the “premium engineering” first impression, but it must not hurt readability or responsiveness.
- CTA integrity matters more than visual flourish. `View My Work` and `View Resume` must stay obvious.

Change risks:
- Over-designing the hero can reduce readability.
- Heavy Three.js changes can increase hydration/render cost.
- Altering copy without maintaining clarity can weaken recruiter conversion.

### About

Primary files:
- `src/app/about/page.tsx`
- `src/components/AboutSection.tsx`
- `src/components/effects/AboutBackground.tsx`
- `src/data/master.json`

Customer reality:
- This page sells depth and trust.
- It is where a visitor validates whether the engineering story is real and aligned with their needs.

Data model:
- Personal identity and narrative come from `src/data/master.json`.
- If facts change, update the JSON first and let components reflect it.

Maintenance expectations:
- Keep the page feeling personal, but structured.
- Story text should remain easy to scan, not a wall of text.
- Skills shown near the top should represent actual strengths, not just icon coverage.

Change risks:
- Hardcoding data here instead of using `master.json` will create drift with resume/experience content.
- Adding too many decorative elements can overwhelm the narrative.

### Projects Index

Primary files:
- `src/app/projects/page.tsx`
- `src/components/ProjectsGallery.tsx`
- `src/components/effects/ProjectsBackground.tsx`
- `src/data/projects.ts`

Customer reality:
- This page is proof of execution.
- The user is evaluating range, quality, and whether the work matches their domain or stack.

Maintenance expectations:
- Project cards should remain scannable and visually consistent.
- The most important signals are title, short description, stack, and links.
- Project images should load cleanly and not break layout.

Change risks:
- Missing live/demo links reduce trust.
- Weak descriptions make strong projects look shallow.
- Adding too many projects without prioritization reduces signal.

### Project Detail Pages

Primary files:
- `src/app/projects/[slug]/page.tsx`
- `src/data/projects.ts`

Customer reality:
- These pages support deeper review after the gallery earns interest.
- The audience is now more serious: recruiter, hiring manager, or technical peer.

Maintenance expectations:
- Each project must have:
  - strong overview,
  - clean imagery,
  - clear tech list,
  - working GitHub/live links when available.
- `generateStaticParams` must stay aligned with the project data source.

Change risks:
- Broken slugs or missing static params will break detail pages.
- If `projects.ts` changes structure, detail rendering must be updated together.

### Experience Index

Primary files:
- `src/app/experience/page.tsx`
- `src/components/ExperienceTimeline.tsx`
- `src/components/VoiceAssistant.tsx`
- `src/components/effects/ExperienceBackground.tsx`
- `src/data/master.json`

Customer reality:
- This page is resume-plus-story.
- It should make the career path feel real, not generic.

Maintenance expectations:
- Timeline items should highlight impact and progression.
- Company, role, period, and achievements must remain consistent with `master.json`.
- The voice assistant is optional delight, not the primary interaction. It should never block or confuse.

Change risks:
- Inconsistent dates or titles across experience, resume, and JSON damage credibility.
- The browser speech API is non-essential and should fail gracefully.

### Experience Detail Pages

Primary files:
- `src/app/experience/[slug]/page.tsx`
- `src/data/master.json`

Customer reality:
- These pages are portfolio case studies for work experience, not just job history.
- They are useful when the visitor wants to validate depth, ownership, and problem-solving.

Maintenance expectations:
- Preserve the structure:
  - system overview,
  - responsibilities,
  - challenges,
  - solutions,
  - impact.
- If experience copy changes, update the source JSON so all experience surfaces stay consistent.

Change risks:
- The current route reads from `master.json` directly; schema changes there require route updates.

### Resume

Primary files:
- `src/app/resume/page.tsx`
- `public/RESUME.pdf`
- `src/data/master.json`

Customer reality:
- Visitors expect both a readable web resume and a downloadable canonical PDF.
- This page is often the last checkpoint before outreach.

Maintenance expectations:
- Maintain both versions:
  - Digital Resume for quick scanning.
  - PDF Resume for download/share.
- The digital version should stay aligned with the PDF and source data.
- If the PDF changes materially, update the digital version too.

Change risks:
- Mismatch between digital and PDF resume hurts trust.
- Browser PDF rendering varies, so fallback/open/download affordances must remain available.

### Contact

Primary files:
- `src/app/contact/page.tsx`
- `src/components/ContactSection.tsx`

Customer reality:
- This is a direct CTA page.
- It should be low friction and emotionally simple.

Maintenance expectations:
- Keep the message short, inviting, and action-oriented.
- `mailto:` must remain working.
- Resume shortcut is useful here and should stay discoverable.

### Social

Primary files:
- `src/app/social/page.tsx`

Customer reality:
- This page is a trust/availability surface.
- Users expect all links to be real, current, and intentional.

Maintenance expectations:
- Keep every URL accurate.
- Placeholder social URLs should be replaced when real handles are known.
- The page should feel current, not decorative.

Change risks:
- Outdated LinkedIn, Instagram, Snapchat, or WhatsApp links hurt professionalism.

### Playground

Primary files:
- `src/app/playground/page.tsx`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/playground/share-link/route.ts`

Customer reality:
- This is not a normal visitor page.
- It is an operational admin surface for the arcade system.

Maintenance expectations:
- It must remain server-validated.
- Never convert it back into a purely client-side “fake lock”.
- All destructive actions should remain explicit and understandable.

### Arcade Share Route

Primary files:
- `src/app/arcade/[token]/page.tsx`
- `src/utils/arcade-share.ts`
- `src/components/Navbar.tsx`

Customer reality:
- This is a focused, game-only share experience.
- A shared visitor should land directly in the arcade without the rest of the portfolio distracting them.

Maintenance expectations:
- The token must remain signed and tamper-resistant.
- The navbar should stay hidden on these routes.
- If token semantics change, keep the route secure-by-default.

## 3. Shared Systems

### Layout And Navigation

Primary files:
- `src/app/layout.tsx`
- `src/components/Navbar.tsx`
- `src/app/globals.css`

Core behavior:
- `layout.tsx` wraps the entire app and mounts the shared navbar.
- `Navbar.tsx` hides itself on strict or arcade-only routes.
- Active link styling should highlight only the current page.

Maintenance rules:
- If new routes are added, decide whether they should appear in nav.
- If new isolated routes are added, decide whether nav should hide there too.
- Avoid route logic scattered across multiple components.

### Content Sources

Primary files:
- `src/data/master.json`
- `src/data/projects.ts`

Maintenance rules:
- Treat these as source-of-truth content files.
- Prefer changing these first instead of duplicating strings across components.
- When resume/about/experience content diverges from these files, drift begins.

### Visual Background Effects

Primary files:
- `src/components/effects/*`
- `src/components/HeroSection.tsx`

Maintenance rules:
- Effects should support the page story, not compete with it.
- Performance and readability always win over novelty.

## 4. End-To-End Customer Usage

Typical recruiter path:

1. Land on `/`
2. Read the hero headline and CTA
3. Visit `/projects` or `/resume`
4. Validate depth via `/experience`
5. Reach out via `/contact` or `/social`

Typical technical peer path:

1. Land on `/projects`
2. Open project details
3. Inspect `/experience/[slug]`
4. Explore `/game`
5. Review resume

Typical casual or shared-link path:

1. Open `/arcade/[token]`
2. Play a game
3. Optionally navigate later to the full site if the user finds the root domain separately

## 5. Maintenance Checklist

Before changing page-level content:
- Check if the same fact also exists in resume, `master.json`, or `projects.ts`.
- Verify active nav highlighting still makes sense.
- Verify mobile spacing and typography.

Before changing a route:
- Confirm whether it is static, dynamic, admin-only, or share-only.
- Confirm whether the navbar should show there.
- Confirm whether any CTA or deep link points to it.

Before shipping:
- Run `npm run build`.
- Click through the core recruiter journey:
  - `/`
  - `/projects`
  - one `/projects/[slug]`
  - `/experience`
  - one `/experience/[slug]`
  - `/resume`
  - `/contact`
  - `/social`

## 6. Golden Rules

- The portfolio is a product. Optimize for trust, clarity, and conversion.
- Source data should stay centralized.
- Resume, experience, and about copy must agree.
- Fancy visuals are allowed only when they do not weaken scanning or mobile use.
- New pages should fit the user journey, not just the component tree.
