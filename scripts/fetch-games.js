// Refreshes js/games-data.js from the free GameMonetize public game feed.
// Run with: node scripts/fetch-games.js
// (Needs internet access. Safe to re-run any time to pull in new/updated games.)
const https = require("https");
const fs = require("fs");
const path = require("path");

const FEED_URL = "https://gamemonetize.com/feed.php?format=0&amount=2000";
const OUT_FILE = path.join(__dirname, "..", "js", "games-data.js");

function stripHtml(s) {
  return (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

https.get(FEED_URL, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("Feed did not return valid JSON (possibly rate-limited). Try again in a minute.");
      console.error(body.slice(0, 300));
      process.exit(1);
    }
    const seen = new Set();
    const clean = [];
    for (const g of data) {
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      clean.push({
        id: g.id,
        title: g.title.trim(),
        slug: slugify(g.title) + "-" + g.id,
        category: g.category,
        tags: (g.tags || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
        desc: stripHtml(g.description).slice(0, 220),
        thumb: g.thumb,
        url: g.url,
        w: parseInt(g.width) || 1280,
        h: parseInt(g.height) || 720
      });
    }
    const cats = {};
    for (const g of clean) cats[g.category] = (cats[g.category] || 0) + 1;
    const catList = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const out =
      "window.GAMES_DATA = " + JSON.stringify(clean) + ";\n" +
      "window.CATEGORIES = " + JSON.stringify(catList) + ";\n";
    fs.writeFileSync(OUT_FILE, out);
    console.log(`Wrote ${clean.length} games across ${catList.length} categories to ${OUT_FILE}`);
  });
}).on("error", (e) => {
  console.error("Request failed:", e.message);
  process.exit(1);
});
