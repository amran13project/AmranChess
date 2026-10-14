# LumaChess 1.1.0 — Board interaction update

## Included
- Drag-and-drop piece movement using Pointer Events (mouse and touch). Tap/click-to-move remains supported.
- Floating dragged-piece preview, drag target highlight, and legal-move validation before a move is committed.
- Short travel animation for a moved piece and capture feedback. Reduced-motion preferences are respected.
- Three named difficulty presets: Milo the Curious, Nova the Tactician, and Rook the Challenger. They share the same lightweight heuristic bot; the names are personalities, not separate AI models or rating claims.
- Updated service worker cache version to encourage browsers to fetch the new assets.
- Online room mode checks now recognise the existing host/join modes for turn restrictions and move messages. Online play still relies on PeerJS public signalling and is experimental.

## Deployment
Upload the replacement root files from `LumaChess-Update-1.1.0.zip` (`app.js`, `styles.css`, `service-worker.js`) to the repository root and commit. Wait for GitHub Pages deployment to succeed. Then open the site and hard refresh with Ctrl+F5.

## Verification
JavaScript syntax and chess-core smoke tests should be run before considering this production-ready. Browser/device drag testing and Android packaging are still separate tasks.
