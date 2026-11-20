/* ============================================================
   theme.js — Studio Balesi
   Chargé dans l'en-tête de page, avant l'affichage : si le visiteur a
   choisi le thème clair, la feuille du thème sombre est neutralisée
   tout de suite, sans éclair sombre au chargement.
   Le site est sombre par défaut. Sans JavaScript, il reste sombre.
   ============================================================ */
(function () {
  var sheet = document.getElementById('theme-nuit');
  var clair = false;
  try { clair = localStorage.getItem('theme') === 'clair'; } catch (error) { /* stockage indisponible */ }
  if (clair && sheet) {
    sheet.media = 'not all';
    document.documentElement.setAttribute('data-theme', 'clair');
  }
})();
