/* Shared runtime for every DanoGames game: scales the play area to fit any screen. */
(function () {
  var MAX_SCALE = 1.6;
  var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (touch) document.documentElement.classList.add('g-touch');
  try { if (window.self !== window.top) document.documentElement.classList.add('g-embedded'); }
  catch (e) { document.documentElement.classList.add('g-embedded'); }

  function setup() {
    var stage = document.querySelector('.g-stage');
    if (!stage) return;

    var hint = document.querySelector('.g-hint[data-touch]');
    if (touch && hint) hint.textContent = hint.getAttribute('data-touch');

    var fit = document.createElement('div');
    fit.className = 'g-fit';
    Array.prototype.slice.call(stage.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && n.classList.contains('g-overlay')) return;
      fit.appendChild(n);
    });
    stage.insertBefore(fit, stage.firstChild);

    // Content sized with vw/vh units is laid out against the full window, but has to fit
    // inside the stage (the window minus the HUD and hint), so we always scale to the stage box.
    function refit() {
      var cs = getComputedStyle(stage);
      var aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var nw = fit.offsetWidth, nh = fit.offsetHeight;
      if (!nw || !nh || aw <= 0 || ah <= 0) return;
      var s = Math.min(aw / nw, ah / nh, MAX_SCALE);
      fit.style.transform = 'scale(' + s.toFixed(4) + ')';
    }

    refit();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(refit);
      ro.observe(stage);
      ro.observe(fit);
    }
    window.addEventListener('resize', refit);
    window.addEventListener('orientationchange', function () { setTimeout(refit, 200); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
