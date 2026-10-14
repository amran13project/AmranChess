# LumaChess 1.6.0

**Make every move matter.** LumaChess is a responsive, installable chess web app with a compact custom rules engine, four local bot personalities plus Stockfish 19 real chess engine (loaded from CDN), daily mate-in-one puzzles, chess clocks, custom board colours, and game export tools.

## What's included

- **Four named local opponents:** Milo (Easy), Nova (Medium), Rook (Hard), and Shadow (Expert). Shadow evaluates a shortlist and looks one reply ahead; these are handcrafted heuristics, not trained models or official rating levels.
- **Real chess engine:** Stockfish 19 Lite single-threaded WASM is loaded from the jsDelivr npm CDN on first selection (about 1.7 MB). Choose a Skill Level from 4 to 20. It requires internet access for engine download and falls back to the local heuristic if the engine cannot load. Once downloaded, caching behavior is controlled by the browser/CDN rather than included as a bundled engine asset.
- **Play styles:** play against a bot or pass-and-play on one device. Experimental room hosting/joining is included through PeerJS, but it depends on internet access and a public signalling service.
- **Board interaction:** drag-and-drop with mouse or touch, tap-to-select fallback, legal destination hints, move/capture animations, last-move highlights, check indication, board flipping, promotion choice, and reduced-motion support.
- **Tactical practice:** three built-in mate-in-one puzzles. The puzzle rotates by UTC date and can be changed with **Next puzzle**. Completed puzzles are remembered locally.
- **Chess clocks:** untimed, 3+2, 5-minute, and 10-minute settings for bot and local games. A chosen control applies to the next game. Online rooms and puzzles stay untimed because their clock state is not synchronised.
- **Appearance and settings:** Classic, Ocean, Orchid, and Forest board themes, saved locally; sound preference saved locally.
- **Game tools:** legal-move hints, undo, move history, capture/check counters, locally stored session stats, copy PGN, download PGN, and copy the current FEN position.
- **PWA support:** app manifest, icons, install prompt, offline app-shell caching, and cache-version updates.
- **Android wrapper setup:** Capacitor configuration and npm scripts are included. This is source code, not a signed APK/AAB.

## Test the chess rules core

Node.js is required for these source tests; no extra test framework is installed.

```bash
npm test
```

The test script checks starting legal moves, alternating turns, undo/reset, malformed and valid FEN, castling, en passant, promotion, and the three puzzle solutions. It does **not** replace independent chess-engine conformance testing or browser/device QA.

## Run locally

With Node.js available:

```bash
npm install
npm run serve
```

Open `http://localhost:8080`. The app is plain HTML/CSS/JavaScript and works without installing an AI model. Google Fonts and PeerJS are external network dependencies. Stockfish requires a first-time network download from jsDelivr; local heuristic bots remain available offline.

You can also serve the folder with any static HTTP server. For PWA install/offline functionality, use `localhost` or HTTPS rather than opening `index.html` directly as a file.

## Publish on GitHub Pages

1. Put the project files at the repository root, with `index.html` at the root.
2. Ensure GitHub Pages is configured to deploy through **GitHub Actions**.
3. Push/commit the files and wait for the Pages workflow to pass.
4. Open the repository's GitHub Pages URL and refresh with `Ctrl+F5` if an older service-worker cache appears.

The included workflow uploads this repository as a static site. If your repository already contains a Pages workflow that works, keep one deployment workflow rather than running duplicate workflows.

## Android / Google Play status

This repository has a Capacitor wrapper configuration, but **it does not contain a built, signed Android APK/AAB and has not been submitted to Google Play**. Building for Android requires Node.js, Android Studio, an Android SDK and a compatible JDK. See `docs/PLAY-STORE-CHECKLIST.md` before attempting a store release.

## Known limitations

- Milo, Nova, Rook and Shadow are small JavaScript heuristics. Stockfish 19 is the separate real chess engine; online loading has not been end-to-end verified in this build environment.
- The included puzzle collection is small and local, not an online daily-puzzle feed.
- Peer-to-peer rooms have no managed server, accounts, matchmaking, persistent rooms, synced clocks, anti-cheat, or guaranteed availability. Do not use them as a production multiplayer service.
- The custom rules engine is compact project code. Test uncommon rule combinations and edge cases before presenting the app as tournament-grade.
- Core rules tests have been run in Node.js. A full interactive browser/device test and Android build have not been completed in this environment.
