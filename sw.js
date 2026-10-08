// DanoGames service worker — every game is same-origin, so the whole site (games included) works offline.
const CACHE_NAME = "danogames-v8";
const GAME_SLUGS = ["snake","2048","memory","tictactoe","breakout","minesweeper","whackamole","flappy","simon","fifteen","mathsprint","rps","pong","spacedefender","connectfour","sudoku","wordguess","hangman","reaction","colorrush","asteroids","blockdrop","bubbleshooter","checkers","match3","solitaire","trivia","typingtest","candyduel","airhockey","mazerunner","towerstack","taptiles","fruitslice","skyhopper","battleship","dotsboxes","snakesladders"];
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/games-data.js",
  "./manifest.json",
  "./assets/favicon.svg",
  "./assets/icon-192.svg",
  "./assets/icon-512.svg",
  "./offline.html",
  "./games/shared.css",
  "./games/shared.js",
  ...GAME_SLUGS.flatMap((slug) => [`./games/${slug}/index.html`, `./games/${slug}/thumb.svg`])
];

self.addEventListener("install", (event) => {
  // cache: "reload" bypasses the browser's HTTP cache so a new deploy never gets cached stale.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network first so players always get the latest version; the cache is only the offline fallback.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (req.mode === "navigate") return caches.match("./offline.html");
          return Response.error();
        })
      )
  );
});
