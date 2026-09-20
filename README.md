# DanoGames

A free, premium-feeling online games site — built for Daniyah. 2,000 free HTML5 games
across 18 categories (puzzle, racing, arcade, adventure, shooting, sports, and more),
searchable, favoritable, installable as an app, with an offline-friendly shell.

## What's already done

- Full site: `index.html`, `css/style.css`, `js/app.js`
- Game catalog baked into `js/games-data.js` (2,000 games, sourced from the free
  [GameMonetize](https://gamemonetize.com) publisher feed — see "About the games" below)
- Search, category filters, trending rail, favorites (saved in the browser via
  localStorage), "continue playing" history, light/dark theme toggle
- PWA support (`manifest.json` + `sw.js`) — visitors can "Install" the site to their
  home screen/desktop, and the app shell (UI, not the games themselves) loads offline
- `scripts/fetch-games.js` — re-run anytime to refresh the catalog with new games

## Run it locally right now

No build step needed — it's a static site.

```
cd D:\danogames
npx serve .
```

Then open the URL it prints (something like `http://localhost:3000`). Opening
`index.html` directly by double-clicking also works, since the game data loads as a
plain `<script>` tag rather than a fetch call.

## Getting your free domain live (GitHub Pages)

This is the one part that needs you personally, since it requires an account:

1. Go to **github.com** and click **Sign up** (free). Use whatever email you'd like —
   `hamza14@gmail.com` works fine.
2. Create a new repository, e.g. named `danogames` (or `daniyahgames` — your call).
   Keep it **Public** (required for free GitHub Pages).
3. Upload this whole `D:\danogames` folder into that repo. Easiest way if you don't
   know git yet:
   - On the repo page, click **Add file → Upload files**, drag in everything from
     `D:\danogames`, and commit.
   - Or, if you'd like, tell me and I'll walk you through `git init` / `git push`
     from this machine instead.
4. In the repo, go to **Settings → Pages**. Under "Build and deployment", set
   **Source: Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. GitHub gives you a free live URL in a minute or two:
   `https://<your-username>.github.io/<repo-name>/`
   That's your free domain — share it with anyone, works on phones and computers.

### Want a nicer free domain than `github.io`?

Once the GitHub Pages site above is working, you can point a free custom domain at it:
- **is-a.dev** or **js.org** — free subdomains for personal/open-source projects
  (e.g. `daniyah.is-a.dev`), via a short pull request to their GitHub repo.
- Some registrars occasionally run free promos, but there's no reliably free
  `.com`/`.net` registrar today — `github.io` (or a free subdomain above) is the
  realistic no-cost option. Happy to help wire up either once you've picked one.

## About the games

Games come from **GameMonetize**, a free game-syndication network — the same source
many small games sites use. Their public feed (`gamemonetize.com/feed.php`) lists
thousands of HTML5 games with direct embeddable URLs and thumbnails, free to embed;
GameMonetize monetizes via ads shown *inside* the games themselves, not through any
fee to you. No account was needed to pull the catalog used here.

If you later want your own ad revenue share, uninterrupted access, or a larger
catalog, you can create a free publisher account at gamemonetize.com yourself (needs
your own email/signup — I can't do that step for you) and swap in your publisher-
tagged feed URL inside `scripts/fetch-games.js`.

To pull a fresh batch of games at any time:

```
node scripts/fetch-games.js
```

## Adding original, fully offline games later

Right now the embedded games need an internet connection (they're loaded from
GameMonetize's servers in an iframe). If you want a few genuinely ad-free games that
work fully offline even without GameMonetize, the plan is: hand-build small HTML5/JS
games (Snake, 2048, Memory, Tic-Tac-Toe, etc.), drop them in a `/games/original/`
folder, and register them in `js/games-data.js` with a local `url` instead of a
GameMonetize one — the service worker will then cache them for true offline play.
Just say the word and I'll start adding these.

## Project structure

```
index.html          Main page (search, categories, grid, player modal)
404.html             Fallback for GitHub Pages (same as index)
offline.html         Shown when offline and a page isn't cached
manifest.json        PWA manifest (installable app)
sw.js                Service worker (offline app shell caching)
css/style.css        All styling — dark/light premium theme
js/app.js            All interactivity (search, filters, favorites, player)
js/games-data.js      2,000-game catalog + category list (regenerate via script below)
scripts/fetch-games.js  Re-pulls the latest games from GameMonetize's feed
assets/               Icons/favicon (SVG)
```
