# LumaChess 1.2.0 — Drag, motion and named bots

## Improvements
- Drag-and-drop supports mouse and touch; click/tap-to-move remains available.
- Invalid drops keep the selected piece and show legal destinations so the player can try again.
- Move travel, drag-lift, legal-target, and capture animations are included; reduced-motion preferences are respected.
- Added four named opponents: Milo (Easy), Nova (Medium), Rook (Hard), and Shadow (Expert).
- Shadow uses a lightweight one-reply lookahead with material/position evaluation. The others use simpler selection heuristics.
- Updated service worker cache version to encourage browsers to fetch current files.

## Honest limitations
- These are lightweight local bots, not separate trained AI models, official ratings, or tournament engines.
- The custom chess rules engine still needs broad independent conformance testing.
- Online play remains experimental.

## Deploy
Upload the replacement root files from `LumaChess-Update-1.2.0.zip` (`app.js`, `index.html`, `styles.css`, `service-worker.js`) to the repository root, commit, wait for Pages deployment, then hard-refresh with Ctrl+F5.
