/* ============================================================
   main.js — Studio Balesi
   Header · Navigation · Année · Méthode
   ============================================================ */


/* ============================================================
   1. HEADER — état "scrollé"
   ============================================================ */
(() => {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    header.classList.toggle('is-stuck', window.scrollY > 40);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
})();

/* ============================================================
   2. NAVIGATION MOBILE + sous-menu
   ============================================================ */
(() => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;
  const mobile = window.matchMedia('(max-width: 940px)');
  const triggers = [...nav.querySelectorAll('.nav__trigger')];
  const closeSubmenus = () => triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
  const closeNav = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
    closeSubmenus();
  };
  burger.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) { closeNav(); return; }
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
    nav.querySelector('a, button')?.focus();
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  triggers.forEach(trigger => {
    const item = trigger.closest('.nav__item--has-menu');
    const close = () => trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      trigger.setAttribute('aria-expanded', String(trigger.getAttribute('aria-expanded') !== 'true'));
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        e.stopPropagation();
        close();
        trigger.focus();
      }
    });
    item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) close(); });
    document.addEventListener('click', e => { if (!item.contains(e.target)) close(); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      burger.focus();
    }
  });
  // This is a disclosure, not a modal: leaving it closes it without trapping Tab.
  document.addEventListener('focusin', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && e.target !== burger) closeNav();
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });
  mobile.addEventListener('change', () => {
    const focusWasInNav = nav.contains(document.activeElement);
    closeNav();
    if (mobile.matches && focusWasInNav) burger.focus();
  });
})();

/* ============================================================
   3. LIEN ACTIF
   ============================================================ */
(() => {
  const normalize = (p) => (p.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  const page = normalize(window.location.pathname);
  const current = page === 'projet-belavi' ? 'realisations' : page;
  if (page === 'expertises') document.querySelector('.nav__trigger')?.setAttribute('aria-current', 'page');

  document.querySelectorAll('a.nav__link[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('http')) return;
    if (normalize(href) === current) link.setAttribute('aria-current', 'page');
  });
})();

/* ============================================================
   4. ANNÉE COURANTE (footer)
   ============================================================ */
(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* ============================================================
   5. MÉTHODE — la ligne se trace à l'entrée dans la fenêtre
   Purement décoratif : sans ce script, la ligne est déjà pleine.
   ============================================================ */
(() => {
  const steps = document.querySelector('.steps');
  if (!steps || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  steps.classList.add('is-armed');
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    steps.classList.add('is-inview');
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(steps);
})();

/* ============================================================
   6. DÉMO BELAVI — le vrai livret dans le téléphone
   Sur ordinateur il se charge d'office ; sur mobile, seulement au
   toucher du bouton (pas de défilement piégé, page plus légère).
   Sans ce script : la capture et le lien « en grand » restent.
   ============================================================ */
(() => {
  document.querySelectorAll('[data-belavi-demo]').forEach((box) => {
    const template = box.querySelector('template');
    const button = box.querySelector('.belavi-demo-btn');
    const poster = box.querySelector('.belavi-phone-poster');
    const hint = box.querySelector('[data-belavi-hint]');
    if (!template || !button || !poster) return;

    const start = (moveFocus) => {
      const frame = template.content.firstElementChild.cloneNode(true);
      template.replaceWith(frame);
      poster.hidden = true;
      button.hidden = true;
      if (hint) hint.hidden = false;
      if (moveFocus) {
        frame.setAttribute('tabindex', '-1');
        frame.focus();
      }
    };

    if (window.matchMedia('(min-width: 941px)').matches) {
      start(false);
    } else {
      button.hidden = false;
      button.addEventListener('click', () => start(true), { once: true });
    }
  });
})();

/* ============================================================
   7. IMAGES ET APPEL FINAL — fin de l'apparition à l'entrée dans la fenêtre
   Décoratif : sans ce script, ou en mouvement réduit, tout est déjà en place.
   ============================================================ */
(() => {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = document.querySelectorAll('.offer2__shots, .project__shot, .belavi-editor img, .cta');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  items.forEach((item) => {
    item.classList.add('is-armed');
    observer.observe(item);
  });
})();

/* ============================================================
   8. SCHÉMA D'AUTOMATISATION — l'impulsion parcourt les quatre étapes
   une seule fois, quand le schéma entre dans la fenêtre (4,7 s, pas de
   boucle). Rien ne démarre en mouvement réduit.
   ============================================================ */
(() => {
  const flow = document.querySelector('[data-flow]');
  if (!flow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    flow.classList.add('is-running');
    observer.disconnect();
  }, { threshold: 0.6 });
  observer.observe(flow);
})();
