# cka-tips

Shared tip corpus + Leitner spaced-repetition module for [CKArcade](https://github.com/alanops/ckarcade) and [Kube-Blitz](https://github.com/alanops/kube-blitz).

## Structure
- `tips.json` — authoritative tip array
- `tip-schema.json` — JSON Schema
- `leitner.js` — pure spaced-repetition module (vendored into each game)

## Contributing a tip
1. Add an object to `tips.json` matching the schema.
2. Run `npm run validate`.
3. PR.

## Leitner logic
Edit `leitner.js`. Write tests first. `npm test`.

## Design
See spec: ckarcade repo `docs/superpowers/specs/2026-04-18-cka-tips-system-design.md`.
