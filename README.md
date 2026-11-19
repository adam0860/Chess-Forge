# Chess Forge

**Get noticeably stronger at chess.** Chess Forge is a Windows and Android app that takes you from the rules to strong club play: an opening library with every move explained, spaced-repetition drills, a full curriculum of interactive lessons, engine-verified puzzles, and computer opponents with real personalities. It is part of the Forge family alongside STEM Forge, Python Forge and C++ Forge, and shares their look, progress system and build pipeline.

## What’s inside

- **20 openings** (10 for White, 10 for Black), each with an overview, both sides’ goals, typical plans, a main line where *every move is explained*, 2–4 key variations, traps to set and traps to avoid, common mistakes, an idea quiz, and (for several) a famous model game.
  - White: Italian, Ruy Lopez, Scotch, Vienna, King’s Gambit, Queen’s Gambit, London, Catalan, English, Réti.
  - Black: Sicilian Najdorf, French, Caro-Kann, Petrov, Pirc, Scandinavian, King’s Indian, Queen’s Gambit Declined, Nimzo-Indian, Slav.
- **Opening drills**: line trainer with spaced repetition (a position is “mastered” after three correct answers spaced over days), deviation drill, trap spotting, idea quiz, 90-second speed round, and a memory round where the pieces fade.
- **Core curriculum**: 11 modules, 64 lessons, each module ending with a checkpoint (80% to pass): rules and notation, opening principles, tactics, checkmate patterns, calculation, pawn structure, strategy, middlegame planning, endgames (opposition, the square, Lucena, Philidor…), thinking and time, and game review.
- **Five lesson step types**: explanations with arrows and highlights, step-through demos, “find the move” exercises (wrong moves are shown, then taken back), quizzes where every answer explains itself, and tap-the-square questions. Tactics lessons also pull practice positions from the puzzle set by theme.
- **Puzzles**: rated puzzles with your own puzzle rating, 12 themes, a daily puzzle, Puzzle Storm (3 minutes, mistakes cost time), and **your mistakes**, positions from your own games, reviewed with spaced repetition.
- **Play**: seven opponents from ~400 to full-strength Stockfish (Pip, Bramble, Vesna, Iron Bishop, Stonewall, Tempest, The Oracle), each with a playing style. Clocks from 3+2 to 15+10, opening practice (the bot follows a chosen opening), hints, takebacks, live move-quality flags and an evaluation bar.
- **Game review**: accuracy for both sides, a winning-chances graph, every move graded (best, good, book, inaccuracy, mistake, blunder), the three key moments explained, and mistakes sent to your puzzle queue.
- **Progress**: XP and levels, five stages (Foundations → Strong), a daily goal, a streak calendar with streak freezes, 28 trophies, and cosmetic unlocks (board themes and piece sets).
- **Feel**: animated pieces with drag or tap-to-move, legal-move dots, arrows (right-click drag), synthesized wooden move sounds, haptics on Android, confetti, light/dark/midnight themes, five accent colours, eight boards and five piece sets. Fully offline.

## Getting the apps

The GitHub Actions workflow (`.github/workflows/build.yml`) builds everything on each push:

| Artifact | Contains | Use it for |
|---|---|---|
| `windows-installer-x64` | `ChessForge-Setup-<version>-x64.exe` | Most Windows 10/11 PCs |
| `windows-installer-arm64` | `ChessForge-Setup-<version>-arm64.exe` | Windows on ARM |
| `windows-portable-x64` | `ChessForge-Portable-<version>.exe` | Running without installing |
| `android` | `ChessForge-debug.apk` | Android 7.0+; sideload with “Install unknown apps” on |

Open the repository’s **Actions** tab, pick the latest **Build apps** run, and download from **Artifacts**. Pushing a tag like `v1.0.0` also publishes a GitHub release with all the files.

## Developing

```bash
npm install
npm run dev            # web version at http://localhost:5173
npm run check          # type-check + content validation
npm run electron:dev   # Windows desktop build, unpackaged
npm run dist:win       # Windows installer + portable exe (needs Windows, or Wine for the installer)
npm run android:sync   # copy the web build into android/, then open it in Android Studio
```

### Content

- Openings: `src/content/openings/*.ts`. Lines are written as `1. e4 {note} e5 2. Nf3 …`.
- Lessons: `src/content/curriculum/*.ts`. Positions can be FENs or piece lists like `W: Kg1 Rf1 f2 g2; B: Kg8 f7 g7; w`.
- `npx tsx scripts/validate-content.ts` checks every move is legal, every position valid, and every quiz has one right answer. Add `--engine` to have Stockfish check main lines, traps, mistakes and every “find the move” answer (takes a few minutes).

### Puzzles

Puzzles are generated, not copied: `node tools/gen-puzzles.mjs <out.jsonl> <minutes> <seed> [hard]` plays imperfect Stockfish games and keeps a position only when the opponent has just blundered and there is **exactly one** winning line, verified at depth 16. `npx tsx tools/build-puzzles.ts` then tags themes (fork, pin, skewer, discovered attack, sacrifice, mate in N, back-rank, smothered…) and assigns ratings, writing `src/content/puzzles.json`. Run the generator longer to grow the set.

### Icons

`python3 tools/gen-icons.py` renders `build/icons/icon.svg` into the Windows and Android icons (needs Playwright and Chrome).

## Licences

Chess Forge bundles **Stockfish** (the stockfish.js WASM build by Nathan Rugg, GPL v3), so the app as a whole is distributed under the **GPL v3** (see `public/stockfish/COPYING.txt`). This is fine for a free, open-source app; a closed-source or paid release would need a different engine. Piece artwork is the **cburnett** set by Colin M. L. Burnett (CC BY-SA 3.0). All lessons, opening notes and puzzles are original.
