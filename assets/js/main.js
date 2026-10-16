/* ============================================================
   main.js — Horizon Digital
   Header · Navigation · Reveal · Compteurs · FAQ · Spotlight
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const closeNav = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    // Bloque le scroll de fond quand le menu plein écran est ouvert
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Ferme au clic sur un lien
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

  // Ferme avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      burger.focus();
    }
  });

  // Sous-menu "Expertises" : simple bouton qui ouvre / ferme la liste
  document.querySelectorAll('.nav__trigger').forEach((trigger) => {
    const item = trigger.closest('.nav__item--has-menu');
    const close = () => trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
    });

    // Fermé au clic en dehors, à Échap et quand le focus quitte le sous-menu
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) close();
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        close();
        trigger.focus();
      }
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) close();
    });
  });
})();

/* ============================================================
   3. LIEN ACTIF
   ============================================================ */
(() => {
  const normalize = (p) => (p.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  const current = normalize(window.location.pathname);

  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('http')) return;
    if (normalize(href) === current) link.setAttribute('aria-current', 'page');
  });
})();

/* ============================================================
   4. REVEAL AU SCROLL (avec décalage en cascade)
   ============================================================ */
(() => {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (REDUCED || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => {
    // data-reveal="3" → 3ᵉ élément d'une série, décalé de 3 × 90 ms
    const index = parseInt(el.dataset.reveal, 10);
    if (!Number.isNaN(index)) el.style.setProperty('--reveal-delay', `${index * 90}ms`);
    observer.observe(el);
  });
})();

/* ============================================================
   5. COMPTEURS ANIMÉS
   ============================================================ */
(() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (REDUCED) {
      el.textContent = String(target);
      return;
    }

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo — démarre vite, finit en douceur
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
})();

/* ============================================================
   6. FAQ — accordéon accessible
   ============================================================ */
(() => {
  const questions = document.querySelectorAll('.faq__q');
  if (!questions.length) return;

  // Relie chaque question à sa réponse ; une réponse fermée est inerte :
  // ni lue par les lecteurs d'écran, ni atteignable au clavier.
  const setOpen = (q, open) => {
    q.setAttribute('aria-expanded', String(open));
    q.nextElementSibling.inert = !open;
  };

  questions.forEach((q, i) => {
    const panel = q.nextElementSibling;
    panel.id = panel.id || `faq-reponse-${i + 1}`;
    q.setAttribute('aria-controls', panel.id);
    setOpen(q, q.getAttribute('aria-expanded') === 'true');

    q.addEventListener('click', () => {
      const isOpen = q.getAttribute('aria-expanded') === 'true';

      // Un seul panneau ouvert à la fois
      questions.forEach((other) => setOpen(other, false));
      setOpen(q, !isOpen);
    });
  });
})();

/* ============================================================
   7. SPOTLIGHT — halo bleu qui suit le curseur sur les cartes
   ============================================================ */
(() => {
  if (!window.matchMedia('(pointer: fine)').matches || REDUCED) return;

  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener(
      'pointermove',
      (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      },
      { passive: true }
    );
  });
})();

/* ============================================================
   8. ANNÉE COURANTE (footer)
   ============================================================ */
(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
