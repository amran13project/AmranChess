# LumaChess 1.5.0 — Real engine upgrade

## What's new
- Added Stockfish 19 as a distinct opponent card, separate from the four local heuristic bots.
- Added browser-worker UCI integration: initialization handshake, ready checks, strength levels, move selection, timeouts and error-state feedback.
- Stockfish moves are checked against legal moves from the local rules engine before they are applied.
- If the external engine cannot load, the game displays an explicit warning and uses a local heuristic for that turn instead of silently pretending the genuine engine responded.
- Added a real-engine status panel and strength selector; strength is saved locally.
- Improved Stockfish card treatment and panel styling for desktop and mobile.
- Bumped service-worker cache name to `lumachess-shell-v5`.

## External runtime dependency
- Stockfish 19 Lite single-threaded WASM is loaded on demand from the jsDelivr CDN (about 1.7 MB according to its project README). This runtime CDN URL, browser CORS behavior, and first-time download could not be verified from the offline build container.
- The Stockfish engine is GPL-3.0; details are in `THIRD-PARTY-NOTICES.md`.

## Validation performed
- JavaScript syntax checks: app.js, chess-core.js, service-worker.js.
- Existing core test suite.
- Additional UCI parsing / legal-move mapping smoke tests.
- ZIP integrity validation.

## Not yet verified
- Real browser network loading of Stockfish WASM, because this build environment does not have working external DNS.
- Full visual/device QA and Android APK/AAB build.
