# LumaChess 1.3.0 — Full Project Upgrade

## Added
- Three mate-in-one puzzles with FEN loading, validated move answers, saved solved-puzzle IDs, puzzle rotation by UTC date, and a next-puzzle button.
- Four selectable board themes (Classic, Ocean, Orchid, Forest) persisted in browser storage.
- Configurable chess clocks: untimed, 3+2, 5+0 and 10+0 for bot and pass-and-play games. Time increments are applied after moves; online rooms and puzzles remain untimed.
- PGN copy and download, including game result headers and FEN setup tags for puzzle positions.
- FEN copy, stored sound settings and a cache-version bump so service workers can pick up the upgraded shell.
- Core test suite runnable with `npm test`.

## Fixed / improved
- Replaced the old `game._resigned` marker—which did not actually end the game—with explicit terminal state, result messaging and local win/loss/draw accounting.
- Bot expert move ranking now evaluates a short heuristic shortlist once instead of repeatedly running the expensive look-ahead inside the sort comparator.
- Clock ticks no longer run expensive complete game-over checks every 100 ms.
- A bad puzzle attempt is undone immediately, so the player can retry without mutating the challenge position.
- Online new-game action keeps an active room connection and notifies the peer instead of destroying the room immediately.
- Added strict basic FEN parsing validation for puzzle loading.

## Test results
Run `npm test`. It currently passes checks for the 20-move opening position, move/turn/undo behaviour, valid and malformed FEN, castling, en passant, promotion options, and mate-in-one solutions for all three puzzles.

## Boundaries
No browser/device QA or Android build is claimed here. Online multiplayer remains experimental. Bots are not tournament engines and puzzle content is not fetched from the internet.
