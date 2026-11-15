/* Décor d’horizon : fondu discret, sans déplacement du contenu ni parallaxe souris. */
(() => {
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.horizon__scene');
  if (!hero || !scene) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small = window.matchMedia('(max-width: 940px)');
  let frame = 0;
  const render = () => {
    frame = 0;
    if (reduced.matches || small.matches) {
      scene.style.removeProperty('--fade');
      return;
    }
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    scene.style.setProperty('--fade', String(1 - progress * .35));
  };
  const update = () => { if (!frame) frame = requestAnimationFrame(render); };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  reduced.addEventListener('change', update);
  small.addEventListener('change', update);
  render();
})();
