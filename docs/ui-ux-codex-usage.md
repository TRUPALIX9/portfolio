# UI/UX Pro Max With Codex

The upstream project is cloned separately at:

`/Users/trupal/Projects/ui-ux-pro-max-skill`

This portfolio now references it through a local Codex skill at:

`/Users/trupal/Projects/portfolio/.codex/skills/ui-ux-pro-max/SKILL.md`

## How To Refer To It In Codex

Use prompts like:

- `Use the ui-ux-pro-max skill to redesign the projects page.`
- `Use ui-ux-pro-max and improve the contact page conversion flow.`
- `Use ui-ux-pro-max to review the arcade UI and tighten the Framer Motion transitions.`

## Useful Commands

Generate the portfolio design system:

```bash
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "software engineer portfolio gaming interactive" --design-system -p "Trupal Portfolio"
```

Run focused lookups:

```bash
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "portfolio storytelling" --domain landing
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "accessible retro futurism" --domain style
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "framer motion hierarchy" --domain ux
python3 /Users/trupal/Projects/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "nextjs motion performance" --stack nextjs
```

## Why This Setup

- The full dataset stays in its own project and can be updated independently.
- The portfolio gets a Codex-native entry point instead of Claude-only instructions.
- The skill is tailored to this repo’s actual pages, components, and Framer Motion usage.
