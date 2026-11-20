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
  const items = document.querySelectorAll('.offer2__shots, .project__shot, .work-card__thumb, .belavi-editor img, .cta');
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
   8. SCHÉMA D'AUTOMATISATION — animation en boucle, avec bouton pause
   Ne démarre pas en mouvement réduit ; se met en pause hors de l'écran.
   ============================================================ */
(() => {
  const flow = document.querySelector('[data-flow]');
  if (!flow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const toggle = flow.querySelector('.flow__toggle');
  if (!toggle) return;
  let pausedByUser = false;
  const apply = (paused) => flow.classList.toggle('is-paused', paused);
  flow.classList.add('is-running');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    apply(pausedByUser);
    toggle.textContent = pausedByUser ? 'Relancer l’animation' : 'Mettre l’animation en pause';
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      apply(pausedByUser || !entries[0].isIntersecting);
    }).observe(flow);
  }
})();

/* ============================================================
   9. THÈME — bouton clair / sombre dans l'en-tête
   Le site est sombre par défaut ; le choix est gardé sur l'appareil
   du visiteur (localStorage), jamais envoyé. Le bouton n'existe
   qu'avec JavaScript, puisqu'il ne ferait rien sans lui.
   ============================================================ */
(() => {
  const sheet = document.getElementById('theme-nuit');
  const bar = document.querySelector('.header__inner');
  if (!sheet || !bar) return;
  const root = document.documentElement;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.innerHTML =
    '<svg class="theme-toggle__soleil" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
    '<svg class="theme-toggle__lune" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  const label = () => {
    const clair = root.getAttribute('data-theme') === 'clair';
    button.setAttribute('aria-label', clair ? 'Passer au thème sombre' : 'Passer au thème clair');
    button.title = clair ? 'Thème sombre' : 'Thème clair';
  };
  button.addEventListener('click', () => {
    const clair = root.getAttribute('data-theme') !== 'clair';
    sheet.media = clair ? 'not all' : 'all';
    if (clair) root.setAttribute('data-theme', 'clair'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', clair ? 'clair' : 'sombre'); } catch (error) { /* stockage indisponible */ }
    label();
  });
  label();
  bar.insertBefore(button, bar.querySelector('.burger'));
})();
