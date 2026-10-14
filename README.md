# LumaChess

**A quiet mind wins games.** LumaChess is a mobile-friendly chess web app with an animated interface, a built-in lightweight chess rules engine, local play, and a Progressive Web App (PWA) shell.

## Features in this project
- Responsive desktop and mobile layout with subtle motion and reduced-motion support.
- Interactive board, legal-move highlighting, check indication, move history, promotion choice, undo, flip board, hint, and game status.
- Play against a lightweight browser bot with three styles, or pass-and-play on one device.
- Session stats stored locally in this browser.
- Installable PWA metadata, app icons, and a basic offline shell cache.
- Experimental peer-to-peer rooms. They depend on PeerJS's public signalling service and network conditions; they are not a guaranteed online service.
- Capacitor configuration and scripts to create an Android Studio project.

## Test locally
The app uses local HTML, CSS, JavaScript and `chess-core.js`. For full PWA behaviour, serve it over `localhost` or HTTPS. You can use any static file server. With Node.js installed:

```bash
npm install
npm run serve
```

Then open `http://localhost:8080`.

## Publish as a website on GitHub Pages
1. Upload the contents of this folder to the **root** of your GitHub repository (the `index.html` file must be at the root).
2. In repository **Settings → Pages**, select **GitHub Actions** or configure `main` + `/(root)` as the source.
3. Wait for the deployment to finish and open the repository's Pages URL.

## Android app / Google Play preparation
This ZIP is a web app plus a Capacitor wrapper configuration; it is **not yet a signed Android APK/AAB** and has not been submitted to Google Play.

Requirements: Node.js, Android Studio, Android SDK, a compatible JDK, and a Google Play Console developer account for publication.

1. Extract the ZIP.
2. Open a terminal in this folder and run `npm install`.
3. Run `npm run android:add` to generate the native `android/` project.
4. Run `npm run android:sync` and `npm run android:open`.
5. In Android Studio, test on a real device/emulator, set app icon/version/privacy details, and fix any platform-specific issues.
6. Use Android Studio's **Build → Generate Signed Bundle / APK** to create a signed Android App Bundle (`.aab`). Keep the signing key safe.
7. Create the Play Console listing, privacy policy, screenshots, content rating, data safety form and testing track; submit the signed bundle for Google's review.

The Play Store may require account verification and testing requirements that depend on your developer account. Uploading a ZIP to GitHub alone does not publish an Android app.

## Honest limitations
- The bot is a small heuristic opponent, not Stockfish and not tournament-strength AI.
- Online play is experimental and peer-to-peer. There is no managed game server, accounts, ratings, matchmaking, moderation, or anti-cheat system.
- The built-in rules engine is a compact project engine, not a substitute for full independent chess-engine conformance testing. Test castling, en passant, repetition, promotion and checkmate carefully before public release.
- No browser/device QA or Android build has been completed in this packaging environment. Treat this as a testable project starter, not a production-certified release.
