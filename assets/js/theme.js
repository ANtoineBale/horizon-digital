/* ============================================================
   theme.js — Studio Balesi
   Le site est sombre par défaut. Le visiteur peut passer en clair ;
   son choix est gardé sur son appareil (localStorage), jamais envoyé.
   Chargé dans l'en-tête de page, pour appliquer le choix avant
   l'affichage (pas d'éclair sombre). Sans JavaScript : site sombre,
   pas de bouton.
   ============================================================ */
(function () {
  var root = document.documentElement;
  var sheet = document.getElementById('theme-nuit');
  if (!sheet) return;

  function apply(clair) {
    sheet.media = clair ? 'not all' : 'all';
    if (clair) root.setAttribute('data-theme', 'clair'); else root.removeAttribute('data-theme');
  }

  var clair = false;
  try { clair = localStorage.getItem('theme') === 'clair'; } catch (error) { /* stockage indisponible */ }
  if (clair) apply(true);

  /* Le bouton : dans l'en-tête s'il y en a un, sinon flottant (page 404) */
  document.addEventListener('DOMContentLoaded', function () {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML =
      '<svg class="theme-toggle__soleil" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
      '<svg class="theme-toggle__lune" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

    function label() {
      var estClair = root.getAttribute('data-theme') === 'clair';
      button.setAttribute('aria-label', estClair ? 'Passer au thème sombre' : 'Passer au thème clair');
      button.title = estClair ? 'Thème sombre' : 'Thème clair';
    }

    button.addEventListener('click', function () {
      var versClair = root.getAttribute('data-theme') !== 'clair';
      apply(versClair);
      try { localStorage.setItem('theme', versClair ? 'clair' : 'sombre'); } catch (error) { /* stockage indisponible */ }
      label();
    });
    label();

    var bar = document.querySelector('.header__inner');
    if (bar) {
      bar.insertBefore(button, bar.querySelector('.burger'));
    } else {
      button.classList.add('theme-toggle--flottant');
      document.body.insertBefore(button, document.body.firstChild);
    }
  });
})();
