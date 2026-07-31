/* ============================================================
   horizon.js — Moteur de parallaxe du hero
   ------------------------------------------------------------
   Principe : chaque couche porte un [data-depth]. Au scroll,
   on décale et on agrandit les couches proportionnellement à
   leur profondeur → l'horizon se rapproche puis nous dépasse.

   Perf : uniquement transform/opacity, lecture DOM groupée,
   écriture dans un rAF, écouteurs passifs.
   ============================================================ */
(() => {
  const scene = document.querySelector('[data-horizon]');
  if (!scene) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const layers = Array.from(scene.querySelectorAll('[data-depth]')).map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth) || 0,
    // Amplitude du zoom : les plans proches grossissent davantage
    scale: parseFloat(el.dataset.scale) || 0,
  }));

  const hero = scene.closest('.hero') || scene.parentElement;
  let heroHeight = hero.offsetHeight;
  let ticking = false;
  let progress = 0;

  /* --- Écriture : une seule passe, dans le rAF --- */
  function render() {
    ticking = false;

    for (const { el, depth, scale } of layers) {
      // Translation verticale : le plan descend d'autant plus qu'il est proche
      const y = progress * depth * heroHeight * 0.55;
      // Agrandissement : donne la sensation d'avancer vers l'horizon
      const s = 1 + progress * scale;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    }

    // Exposé en CSS pour piloter les opacités (ligne d'horizon, scroll cue)
    scene.style.setProperty('--p', progress.toFixed(4));
  }

  /* --- Lecture : calcul de la progression du hero ---
     On part du rect plutôt que de window.scrollY : ça reste juste
     quelle que soit l'élément qui porte réellement le défilement. */
  function onScroll() {
    const top = hero.getBoundingClientRect().top;
    progress = Math.min(Math.max(-top / heroHeight, 0), 1);

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  function onResize() {
    heroHeight = hero.offsetHeight;
    onScroll();
  }

  /* --- Parallaxe souris (desktop, pointeur fin uniquement) --- */
  function initPointerParallax() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const inner = scene.querySelector('.horizon__scene');
    if (!inner) return;

    let pending = false;
    let px = 0;
    let py = 0;

    window.addEventListener(
      'pointermove',
      (e) => {
        // Normalisé entre -1 et 1 depuis le centre de l'écran
        px = (e.clientX / window.innerWidth) * 2 - 1;
        py = (e.clientY / window.innerHeight) * 2 - 1;

        if (!pending) {
          pending = true;
          requestAnimationFrame(() => {
            pending = false;
            inner.style.setProperty('--mx', (-px).toFixed(3));
            inner.style.setProperty('--my', (-py).toFixed(3));
          });
        }
      },
      { passive: true }
    );
  }

  /* --- Démarrage --- */
  if (reduced.matches) {
    // Mouvement désactivé : le décor reste une belle image fixe
    scene.style.setProperty('--p', '0');
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  initPointerParallax();
  onResize();
})();
