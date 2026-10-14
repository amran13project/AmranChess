# AmranChess

A responsive chess web app with a dark interface and bright lime accents.

## Included
- Interactive chessboard with legal moves and check/checkmate/draw detection.
- Pawn promotion selection, move history, undo, board flipping, and move suggestions.
- Browser-based computer opponent with Easy / Medium / Hard settings.
- Local two-player mode on the same device.
- Experimental peer-to-peer rooms using PeerJS.
- Responsive layout for desktop and mobile screens.

## Run locally
Open `index.html` in a modern browser while connected to the internet. The page loads `chess.js`, `PeerJS`, and Google Fonts from public CDNs. The game won't fully load offline unless those library files are hosted locally.

## Publish to GitHub Pages
1. Extract this ZIP.
2. Open your repository: https://github.com/amran13project/AmranChess
3. Use **Add file → Upload files**.
4. Upload `index.html`, `styles.css`, `app.js`, `README.md`, and `.nojekyll` from this folder into the repository root.
5. Commit to the `main` branch.
6. Go to **Settings → Pages**.
7. Select **Deploy from a branch**, choose branch `main` and folder `/(root)`, then Save.
8. When the deployment completes, the site should be available at `https://amran13project.github.io/AmranChess/`.

## Known limitations
- The computer player is a lightweight move-scoring opponent, not Stockfish and not a strong tournament engine.
- Online play relies on PeerJS's public signalling service and direct browser connections. Some school, public, or restrictive networks may block it. There is no dedicated matchmaking/server infrastructure here.
- No accounts, saved profiles, official rating system, server-side anti-cheat, chat moderation, or admin panel are included.
- This package's JavaScript syntax is checked during creation, but a full browser test and real two-device online test have not been completed here. Test it before promoting it as a finished online service.
