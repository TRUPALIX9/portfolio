# UI/UX Pro Max For This Portfolio

Use this skill when the task is to improve UI/UX, choose a visual direction, review a page, or generate a design system for this portfolio.

## Canonical Source

The searchable database lives in the sibling project:

`/Users/trupal/Projects/ui-ux-pro-max-skill`

This repo intentionally keeps the full dataset separate so the portfolio can reference it without copying the whole project.

## When To Use It

- Redesigning a page in `/Users/trupal/Projects/portfolio/src/app`
- Improving shared components in `/Users/trupal/Projects/portfolio/src/components`
- Choosing colors, typography, or motion direction
- Reviewing a page for layout, conversion, accessibility, or visual polish
- Tuning arcade/game surfaces with Framer Motion

## Primary Workflow

1. Generate the design system first.

```bash
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "software engineer portfolio gaming interactive" --design-system -p "Trupal Portfolio"
```

2. Run focused searches for detail when needed.

```bash
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "portfolio grid storytelling" --domain landing
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "retro futurism accessible" --domain style
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "motion hierarchy hover transition" --domain ux
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "nextjs framer motion performance" --stack nextjs
```

3. Apply the output to this repo with these house rules:

- Prefer reusable CSS tokens and shared section patterns over one-off inline styling
- Keep the site coherent across `/about`, `/projects`, `/experience`, `/contact`, and `/game`
- Use Framer Motion to reinforce hierarchy and transitions, not to create noise
- Respect reduced motion when adding movement
- Avoid generic purple AI gradients unless the page explicitly calls for them
- Treat project pages as case studies, not just screenshot galleries

## Portfolio-Specific Direction

Current preferred direction for this repo:

- Pattern: portfolio grid + narrative proof
- Style: retro-futurist / technical editorial
- Typography: Archivo + Space Grotesk
- Motion: subtle lift, staged reveals, card-to-detail transitions
- Accent balance: green + cyan + indigo over deep navy backgrounds

## Quick Reference

- Main visual system: `/Users/trupal/Projects/portfolio/src/app/globals.css`
- Hero and homepage voice: `/Users/trupal/Projects/portfolio/src/components/HeroSection.tsx`
- Case-study listing: `/Users/trupal/Projects/portfolio/src/components/ProjectsGallery.tsx`
- Story page: `/Users/trupal/Projects/portfolio/src/components/AboutSection.tsx`
- Proof page: `/Users/trupal/Projects/portfolio/src/components/ExperienceTimeline.tsx`
- Contact conversion surface: `/Users/trupal/Projects/portfolio/src/components/ContactSection.tsx`
- Arcade polish: `/Users/trupal/Projects/portfolio/src/components/GameHub.tsx`
