/* ===== DanoGames — app logic ===== */
(function () {
  "use strict";

  const GAMES = window.GAMES_DATA || [];
  const CATEGORIES = window.CATEGORIES || [];
  const PAGE_SIZE = 24;

  const state = {
    query: "",
    category: "All",
    visible: PAGE_SIZE,
    view: "home", // home | search | category
  };

  const els = {};
  document.addEventListener("DOMContentLoaded", init);

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  function init() {
    cacheEls();
    buildCategoryUI();
    renderHero();
    renderTrending();
    renderContinuePlaying();
    renderMainGrid();
    bindEvents();
    initTheme();
    initInstallPrompt();
    registerSW();
  }

  function cacheEls() {
    els.navCats = $("#navCats");
    els.pillRail = $("#pillRail");
    els.headerSearch = $("#headerSearchInput");
    els.heroSearch = $("#heroSearchInput");
    els.trendingRail = $("#trendingRail");
    els.continueSection = $("#continueSection");
    els.continueRail = $("#continueRail");
    els.grid = $("#mainGrid");
    els.gridTitle = $("#gridTitle");
    els.gridTag = $("#gridTag");
    els.loadMoreWrap = $("#loadMoreWrap");
    els.loadMoreBtn = $("#loadMoreBtn");
    els.emptyState = $("#emptyState");
    els.gameCount = $("#gameCount");
    els.categoryCount = $("#categoryCount");
    els.player = $("#playerOverlay");
    els.playerFrame = $("#playerFrame");
    els.playerTitle = $("#playerTitle");
    els.playerCat = $("#playerCat");
    els.playerThumb = $("#playerThumb");
    els.playerDesc = $("#playerDesc");
    els.playerTags = $("#playerTags");
    els.playerFav = $("#playerFav");
    els.playerLoading = $("#playerLoading");
    els.toast = $("#toast");
    els.themeToggle = $("#themeToggle");
    els.favToggle = $("#favToggle");
  }

  function renderHero() {
    $("#statGameCount").textContent = GAMES.length.toLocaleString() + "+";
    $("#statCatCount").textContent = CATEGORIES.length;
  }

  /* ---------------- Categories ---------------- */
  function buildCategoryUI() {
    const icons = {
      Puzzle: "🧩", Arcade: "🕹️", Strategy: "♟️", Skill: "🎯"
    };
    const navFrag = document.createDocumentFragment();
    const allNavBtn = navBtn("All", GAMES.length, true);
    navFrag.appendChild(allNavBtn);
    CATEGORIES.forEach(c => navFrag.appendChild(navBtn(c.name, c.count, false)));
    els.navCats.appendChild(navFrag);

    const pillFrag = document.createDocumentFragment();
    pillFrag.appendChild(pill("All", GAMES.length, "🎮", true));
    CATEGORIES.forEach(c => pillFrag.appendChild(pill(c.name, c.count, icons[c.name] || "🎲", false)));
    els.pillRail.appendChild(pillFrag);

    function navBtn(name, count, active) {
      const b = document.createElement("button");
      b.textContent = name;
      b.dataset.cat = name;
      if (active) b.classList.add("active");
      b.addEventListener("click", () => selectCategory(name));
      return b;
    }
    function pill(name, count, icon, active) {
      const b = document.createElement("button");
      b.className = "pill" + (active ? " active" : "");
      b.dataset.cat = name;
      b.innerHTML = `<span>${icon}</span><span>${name}</span><span class="count">${count}</span>`;
      b.addEventListener("click", () => selectCategory(name));
      return b;
    }
  }

  function selectCategory(name) {
    state.category = name;
    state.query = "";
    state.visible = PAGE_SIZE;
    state.view = name === "All" ? "home" : "category";
    els.headerSearch.value = "";
    els.heroSearch.value = "";
    $all("#navCats button").forEach(b => b.classList.toggle("active", b.dataset.cat === name));
    $all("#pillRail .pill").forEach(b => b.classList.toggle("active", b.dataset.cat === name));
    renderMainGrid();
    document.getElementById("mainGridSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- Trending / Continue Playing ---------------- */
  function renderTrending() {
    const shuffled = seededSample(GAMES, 14, "trend");
    els.trendingRail.innerHTML = "";
    shuffled.forEach((g, i) => els.trendingRail.appendChild(card(g, i < 3 ? "HOT" : null)));
  }

  function renderContinuePlaying() {
    const recent = getRecent();
    if (!recent.length) { els.continueSection.classList.add("hidden"); return; }
    els.continueSection.classList.remove("hidden");
    els.continueRail.innerHTML = "";
    recent.forEach(g => els.continueRail.appendChild(card(g, null)));
  }

  function seededSample(arr, n, seedStr) {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i) * (i + 1);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  /* ---------------- Main grid / search / filter ---------------- */
  function getFiltered() {
    let list = GAMES;
    if (state.view === "favorites") {
      const favs = getFavIds();
      return GAMES.filter(g => favs.has(g.id));
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    } else if (state.category !== "All") {
      list = list.filter(g => g.category === state.category);
    }
    return list;
  }

  function renderMainGrid() {
    const filtered = getFiltered();
    let title = "All Games";
    let tag = `${GAMES.length.toLocaleString()} games and counting`;
    if (state.view === "favorites") { title = "Your Favorites"; tag = `${filtered.length} saved game${filtered.length === 1 ? "" : "s"}`; }
    else if (state.query) { title = `Results for "${state.query}"`; tag = `${filtered.length} game${filtered.length === 1 ? "" : "s"} found`; }
    else if (state.category !== "All") { title = state.category; tag = `${filtered.length} games`; }
    els.gridTitle.textContent = title;
    els.gridTag.textContent = tag;

    els.grid.innerHTML = "";
    if (!filtered.length) {
      els.emptyState.classList.remove("hidden");
      els.loadMoreWrap.classList.add("hidden");
      return;
    }
    els.emptyState.classList.add("hidden");

    const slice = filtered.slice(0, state.visible);
    const frag = document.createDocumentFragment();
    slice.forEach(g => frag.appendChild(card(g, null)));
    els.grid.appendChild(frag);

    els.loadMoreWrap.classList.toggle("hidden", filtered.length <= state.visible);
  }

  function loadMore() {
    state.visible += PAGE_SIZE;
    renderMainGrid();
  }

  /* ---------------- Card ---------------- */
  function card(g, badge) {
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.id = g.id;
    const isFav = getFavIds().has(g.id);
    el.innerHTML = `
      <div class="thumb-wrap">
        <img src="${g.thumb}" alt="${escapeHtml(g.title)}" loading="lazy" width="300" height="225">
        <div class="play-overlay"><div class="play-btn">▶</div></div>
        ${badge ? `<div class="badge">${badge}</div>` : ""}
        <button class="fav-btn ${isFav ? "faved" : ""}" title="Save to favorites" aria-label="Favorite">${isFav ? "♥" : "♡"}</button>
      </div>
      <div class="meta">
        <h3>${escapeHtml(g.title)}</h3>
        <div class="cat">${g.category}</div>
      </div>`;
    el.querySelector(".fav-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(g, el.querySelector(".fav-btn"));
    });
    el.addEventListener("click", () => openPlayer(g));
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  /* ---------------- Favorites (localStorage) ---------------- */
  function getFavIds() {
    try { return new Set(JSON.parse(localStorage.getItem("dg_favs") || "[]")); }
    catch (e) { return new Set(); }
  }
  function setFavIds(set) {
    try { localStorage.setItem("dg_favs", JSON.stringify(Array.from(set))); } catch (e) {}
  }
  function toggleFav(g, btnEl) {
    const favs = getFavIds();
    let added;
    if (favs.has(g.id)) { favs.delete(g.id); added = false; }
    else { favs.add(g.id); added = true; }
    setFavIds(favs);
    if (btnEl) { btnEl.classList.toggle("faved", added); btnEl.textContent = added ? "♥" : "♡"; }
    if (els.playerFav && els.playerFav.dataset.id === String(g.id)) {
      els.playerFav.classList.toggle("faved", added);
      els.playerFav.textContent = added ? "♥ Saved" : "♡ Save";
    }
    showToast(added ? "Added to favorites" : "Removed from favorites");
    if (state.view === "favorites") renderMainGrid();
  }

  /* ---------------- Recently played ---------------- */
  function getRecent() {
    try {
      const ids = JSON.parse(localStorage.getItem("dg_recent") || "[]");
      return ids.map(id => GAMES.find(g => g.id === id)).filter(Boolean);
    } catch (e) { return []; }
  }
  function pushRecent(g) {
    try {
      let ids = JSON.parse(localStorage.getItem("dg_recent") || "[]");
      ids = ids.filter(id => id !== g.id);
      ids.unshift(g.id);
      ids = ids.slice(0, 12);
      localStorage.setItem("dg_recent", JSON.stringify(ids));
    } catch (e) {}
  }

  /* ---------------- Player modal ---------------- */
  let currentGame = null;
  function openPlayer(g) {
    currentGame = g;
    pushRecent(g);
    els.playerTitle.textContent = g.title;
    els.playerCat.textContent = g.category;
    els.playerThumb.src = g.thumb;
    els.playerDesc.textContent = g.desc || "";
    els.playerTags.innerHTML = g.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("");
    const isFav = getFavIds().has(g.id);
    els.playerFav.dataset.id = g.id;
    els.playerFav.classList.toggle("faved", isFav);
    els.playerFav.textContent = isFav ? "♥ Saved" : "♡ Save";

    els.playerLoading.classList.remove("hidden");
    els.playerFrame.onload = null;
    els.playerFrame.src = "about:blank";
    els.player.classList.add("open");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      els.playerFrame.onload = () => { els.playerLoading.classList.add("hidden"); };
      els.playerFrame.src = g.url;
    });
  }
  function closePlayer() {
    els.player.classList.remove("open");
    document.body.style.overflow = "";
    els.playerFrame.onload = null;
    els.playerFrame.src = "about:blank";
    currentGame = null;
    renderContinuePlaying();
  }

  /* ---------------- Theme ---------------- */
  function initTheme() {
    const saved = localStorage.getItem("dg_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon();
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dg_theme", next);
    updateThemeIcon();
  }
  function updateThemeIcon() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    els.themeToggle.textContent = isLight ? "🌙" : "☀️";
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  /* ---------------- Search ---------------- */
  function doSearch(q) {
    state.query = q.trim();
    state.visible = PAGE_SIZE;
    state.view = state.query ? "search" : "home";
    if (!state.query) state.category = "All";
    renderMainGrid();
    document.getElementById("mainGridSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- Favorites view toggle ---------------- */
  function toggleFavoritesView() {
    if (state.view === "favorites") {
      state.view = "home"; state.category = "All"; state.query = "";
      els.favToggle.classList.remove("active");
    } else {
      state.view = "favorites";
      els.favToggle.classList.add("active");
    }
    state.visible = PAGE_SIZE;
    renderMainGrid();
    document.getElementById("mainGridSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- Events ---------------- */
  function bindEvents() {
    els.loadMoreBtn.addEventListener("click", loadMore);
    $("#closePlayer").addEventListener("click", closePlayer);
    els.player.addEventListener("click", (e) => { if (e.target === els.player) closePlayer(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePlayer(); });

    els.playerFav.addEventListener("click", () => { if (currentGame) toggleFav(currentGame, null); });
    $("#playerFullscreen").addEventListener("click", () => {
      const el = els.playerFrame;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    });

    let searchDebounce;
    els.headerSearch.addEventListener("input", (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => doSearch(e.target.value), 220);
    });
    $("#heroSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      doSearch(els.heroSearch.value);
      els.headerSearch.value = els.heroSearch.value;
    });

    els.themeToggle.addEventListener("click", toggleTheme);
    els.favToggle.addEventListener("click", toggleFavoritesView);

    $all(".chip-shortcut").forEach(b => {
      b.addEventListener("click", () => doSearch(b.dataset.q));
    });
  }

  /* ---------------- PWA install prompt ---------------- */
  let deferredPrompt;
  function initInstallPrompt() {
    const banner = $("#installBanner");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (!localStorage.getItem("dg_install_dismissed")) {
        banner.classList.add("show");
      }
    });
    $("#ibYes").addEventListener("click", async () => {
      banner.classList.remove("show");
      if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
    });
    $("#ibNo").addEventListener("click", () => {
      banner.classList.remove("show");
      localStorage.setItem("dg_install_dismissed", "1");
    });
    $("#ibClose").addEventListener("click", () => {
      banner.classList.remove("show");
      localStorage.setItem("dg_install_dismissed", "1");
    });
  }

  function registerSW() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }
})();
