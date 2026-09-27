# DanoGames

A free, premium-feeling, **completely ad-free** online games site — built for Daniyah.
Every game is built from scratch: no third-party ad networks, no preroll videos, no
trackers, no signup. Just play.

Live at: **https://hamzaali14.github.io/danogames/**

## What's already done

- 20 original games, all self-contained HTML/CSS/JS, zero external dependencies:
  Snake, 2048, Memory Match, Tic-Tac-Toe (unbeatable AI), Breakout, Minesweeper,
  Whack-a-Mole, Flappy Block, Simon Says, 15 Puzzle, Math Sprint, Rock Paper Scissors,
  Pong, Space Defender, Connect Four, Sudoku, Word Guess, Hangman, Reaction Test, Color Rush
- Full site shell: `index.html`, `css/style.css`, `js/app.js`
- Search, category filters, trending rail, favorites (saved in the browser via
  localStorage), "continue playing" history, light/dark theme toggle
- PWA support (`manifest.json` + `sw.js`) — visitors can "Install" the site to their
  home screen/desktop, and since every game is original code (not a third-party
  iframe), the whole site — games included — is cached for genuine offline play
- Each game lives in `games/<slug>/index.html`, loaded in the same player modal as
  before, but same-origin now, so there's no ad network in the loop at all

## Why the pivot from the first version

The original launch used the GameMonetize free game-syndication feed to get to
"thousands of games" quickly. Testing it live showed those games ship with a forced
~23-second preroll ad before you can play — that's baked into the third-party game
files themselves, not something a website embedding them can strip out. Since the
ask was ad-free games, that catalog was removed entirely and replaced with original,
hand-built games instead. The tradeoff: fewer games than a syndicated feed, but every
single one is genuinely ad-free, offline-capable, and fully within our control. The
catalog keeps growing over time — it started at 12 games and is now at 20.

## Run it locally

```
cd D:\danogames
npx serve .
```

Then open the printed URL (e.g. `http://localhost:3000`). Opening `index.html`
directly also works since game data loads as a plain `<script>` tag.

## Deploying changes

The site is already live on GitHub Pages under the `hamzaali14/danogames` repo. To
publish any future changes:

```
git add -A
git commit -m "your message"
git push
```

GitHub Pages redeploys automatically within a minute or two of every push to `main`.

## Adding more original games

To add a new ad-free game:

1. Create a folder `games/<slug>/` with a self-contained `index.html` (see any
   existing game for the shared HUD styling in `games/shared.css`).
2. Generate or add a `thumb.svg` (or any small image) in that folder.
3. Add an entry to the `GAMES_DATA` array in `js/games-data.js` with the game's
   `id`, `title`, `slug`, `category`, `tags`, `desc`, `thumb`, `url` (pointing to
   `games/<slug>/index.html`), and canvas size (`w`/`h`).
4. Add the new game's files to `GAME_SLUGS` / `SHELL_ASSETS` in `sw.js` so it gets
   cached for offline play, and bump `CACHE_NAME` so returning visitors pick up
   the update.

Just say the word and more games can be added this way over time.

## Project structure

```
index.html          Main page (search, categories, grid, player modal)
404.html             Fallback for GitHub Pages (same as index)
offline.html         Shown when offline and a page isn't cached
manifest.json        PWA manifest (installable app)
sw.js                Service worker (offline caching — app shell + every game)
css/style.css        All styling — dark/light premium theme
js/app.js            All interactivity (search, filters, favorites, player)
js/games-data.js      Catalog of the 20 original games
games/shared.css      Shared HUD styling used by every game
games/<slug>/         One self-contained folder per original game
assets/               Icons/favicon (SVG)
```
