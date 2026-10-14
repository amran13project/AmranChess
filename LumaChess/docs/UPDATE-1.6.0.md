# LumaChess 1.6.0 — Aurora polish + genuine chess engine

## Updates
- Refined premium Aurora visual treatment: layered ambient background, translucent panels, more consistent hover/focus states, board depth and legal-move highlights.
- Added clearer reduced-motion handling and keyboard focus visibility.
- Preserved named local bots and Stockfish 19 as a separate real chess-engine option.
- Bumped service-worker cache to `lumachess-shell-v6` to avoid stale CSS/JS after deployment.

## Real AI explanation
Stockfish is a genuine open-source chess engine (search/evaluation engine, not a conversational AI model). LumaChess loads it in the browser from jsDelivr on demand and requires internet for the first load. If the CDN/WASM fails, the app reports the problem and uses the local heuristic fallback for that turn.

## Validation
- `node --check app.js`, `node --check chess-core.js`, `node --check service-worker.js`
- `node scripts/test-core.cjs`
- ZIP integrity check

## Not verified
No real browser/device QA, external CDN runtime test, or signed Android APK/AAB build was performed in this environment.
