# LumaChess 1.4.0 — Focus & polish upgrade

## Added
- Focus mode: one tap hides the settings sidebar and expands the board area; tap again to restore the full interface.
- Board coordinates can be switched on/off for a cleaner board or easier notation learning.
- Both preferences persist locally on the device.
- Service-worker cache version bumped so returning visitors can receive the new shell.

## Included from 1.3.0
- Four named local bot personalities (Milo, Nova, Rook, Shadow).
- Drag-and-drop with legal destination hints and tap-to-move fallback.
- Three mate-in-one puzzles, puzzle progress memory, clocks, four board themes, PGN/FEN export, and local session statistics.

## Verification
- `node --check app.js`, `node --check chess-core.js`, and `node --check service-worker.js` passed.
- `node scripts/test-core.cjs` passed: opening legal moves, turns/undo, FEN validation, castling, en passant, promotion, and all three puzzle solutions.
- ZIP integrity checked after packaging.

## Honest limitations
- This is a static web/PWA project. No signed Android APK/AAB was built.
- No real-browser or physical-device QA was run in this update.
- Online rooms are experimental and depend on a third-party PeerJS signaling service; they are not a dedicated reliable game server.
- Bots are lightweight local heuristics, not tournament engines or trained AI models.
