/* main.js — Studio Balesi V2 */

/* Navigation mobile */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

/* Dropdown clavier — toggle au focus */
document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
  });
});

/* Active link sur les liens du menu (pas le bouton CTA) */
const normalize = path => {
  const p = path.split('/').pop() || 'index';
  return p.replace(/\.html$/, '') || 'index';
};
const currentPage = normalize(window.location.pathname);
document.querySelectorAll('.nav-links a:not(.btn)').forEach(link => {
  if (normalize(link.getAttribute('href') || '') === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

/* Fade-in au scroll */
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}
