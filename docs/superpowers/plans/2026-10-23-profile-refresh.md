# Personal developer profile refresh

Approved scope: rebuild the home page in one pass, with backend development first and a small personal gear corner. Hide games from the introduction and navigation; retain all game routes, APIs, admin tools and stored data.

## Implementation

- [x] Record the existing page. Work in the current checkout because its uncommitted UI is the starting point; do not reset, stash, commit or migrate dependencies.
- [x] Replace the home presentation and its sole navigation caller. Keep existing profile, project, gear and social APIs; preserve the session cache and background refresh. Scope new styles to the home page to avoid changing admin and gear views.
- [x] Show actual project content, prioritize featured projects without dropping others, normalize public links, and preview three distinct categories of active gear. Keep missing-image states honest; do not invent project screenshots, achievements or personal reviews.
- [x] Verify populated, empty, failed, malformed and cached data; clipboard success/failure; theme switching; all navigation anchors; game links absent. Check desktop, tablet and mobile including reduced motion and keyboard navigation.
- [x] Run TypeScript, production build, visual inspection and final diff review. Record remaining limitations in docs/profile-refresh-validation.md.

## Design decisions

Use existing Inter/Jakarta typography, a large personal name, charcoal and sage with a paper light theme. The name and handle identify the owner; real project descriptions and his audio equipment carry the substance. Plain navigation replaces the floating glass bar. Motion stays subtle and respects reduced motion.

Initial direction seed 398629434 (physical stationery) contradicted the approved restraint and required imagery not available. Replaced by a dealt editorial option: type-only-statement, seed 1439448014. Adapt section blueprints to actual project and equipment content, not decorative props or made-up forms.

## Risks and checks

Existing database descriptions may mention the former gaming profile. Keep stored descriptions intact; no remote writes are authorized. Public project links may be bare domains: accept HTTP(S) only and prepend HTTPS for valid bare hostnames. Do not show retired equipment as current. API failure must not be presented as a genuine empty collection. A failed refresh must preserve cached data.
