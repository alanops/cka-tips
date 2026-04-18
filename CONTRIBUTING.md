# Contributing tips

## Checklist for a new tip
- [ ] `id` is kebab-case, stable, unique.
- [ ] `domain` matches one of the 5 CKA exam domains (`cluster`, `workloads`, `networking`, `storage`, `troubleshooting`).
- [ ] `principle` is one sentence and teaches a single idea.
- [ ] `prompt` is unambiguous — a human could answer without guessing.
- [ ] `answer` is the canonical imperative form.
- [ ] `alternates` covers plausible aliases (e.g. `deployment` vs `deploy`).
- [ ] `docs` links to official Kubernetes / Helm docs, not blogs.
- [ ] `difficulty` calibrated: 1 = reflex, 2 = applied, 3 = nuanced.
- [ ] `missions` populated if any existing CKArcade mission exercises this tip.
- [ ] `npm run validate` passes.
- [ ] `npm test` passes.

## Cadence
Target: +10 tips per week, weighted toward weak exam domains per mastery data.

## Design
See full design spec in the ckarcade repo: `docs/superpowers/specs/2026-04-18-cka-tips-system-design.md`.
