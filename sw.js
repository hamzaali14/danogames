// DanoGames service worker — caches the app shell so browsing the site works offline.
// Games themselves are loaded from third-party servers (GameMonetize) and need internet.
const CACHE_NAME = "danogames-shell-v4";
const GAME_SLUGS = ["snake","2048","memory","tictactoe","breakout","minesweeper","whackamole","flappy","simon","fifteen","mathsprint","rps","pong","spacedefender","connectfour","sudoku","wordguess","hangman","reaction","colorrush"];
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
  ...GAME_SLUGS.flatMap((slug) => [`./games/${slug}/index.html`, `./games/${slug}/thumb.svg`])
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
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

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never intercept third-party game requests

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") return caches.match("./offline.html");
        });
    })
  );
});
