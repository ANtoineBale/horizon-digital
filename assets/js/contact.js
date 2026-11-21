/* ============================================================
   contact.js — Formulaire de contact
   Validation inline accessible + envoi Formspree sans rechargement
   ============================================================ */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.noValidate = true;

  // Valeur autorisée uniquement : aucun texte libre de l’URL n’est injecté.
  // Chaque offre porte aussi son prix et son délai, affichés dans le rappel.
  // Les prix figurent aussi dans index.html et expertises.html : les changer partout.
  const need = document.getElementById('need');
  const offres = new Map([
    ['marque', { value: 'Stratégie de marque et identité', titre: 'Stratégie de marque', prix: 'à partir de 1 500 €', delai: '3 à 5 semaines' }],
    ['contenus', { value: 'Communication et contenus', titre: 'Communication & contenu', prix: 'à partir de 900 €', delai: '2 à 4 semaines' }],
    ['site', { value: 'Création ou refonte d’un site web', titre: 'Site vitrine', prix: 'à partir de 1 200 €', delai: '4 à 8 semaines' }],
    ['plateforme', { value: 'Création d’une plateforme web — suite au projet Belavi', titre: 'Plateforme web', prix: 'sur devis', delai: 'délai fixé après le cadrage' }],
    ['automatisation', { value: 'IA et automatisation', titre: 'IA & automatisation', prix: 'à partir de 600 €', delai: '1 à 3 semaines' }],
    ['diagnostic', { value: 'Diagnostic IA — 390 €', titre: 'Diagnostic IA', prix: '390 €', delai: 'prix fixe', note: 'Je vous confirme sous 48 h ouvrées la date et les modalités, avant tout paiement.' }],
  ]);
  const depuisUrl = offres.get(new URLSearchParams(window.location.search).get('projet'));
  if (need && !need.value && depuisUrl) need.value = depuisUrl.value;

  /* --- Rappel de l'offre choisie, au-dessus du formulaire ---
     Construit en texte seul (textContent), à partir de la liste ci-dessus. */
  const rappel = document.getElementById('offre-choisie');
  const sujet = form.querySelector('[name="_subject"]');
  const sujetParDefaut = sujet ? sujet.value : '';
  const ligne = (tag, cls, text) => {
    const node = document.createElement(tag);
    node.className = cls;
    node.textContent = text;
    return node;
  };
  const afficherOffre = () => {
    if (!rappel || !need) return;
    const offre = [...offres.values()].find((o) => o.value === need.value);
    rappel.textContent = '';
    rappel.hidden = !offre;
    if (sujet) sujet.value = offre ? `Demande — ${offre.titre} — site Studio Balesi` : sujetParDefaut;
    if (!offre) return;
    rappel.append(
      ligne('p', 'offre-choisie__label', 'Votre demande'),
      ligne('p', 'offre-choisie__titre', offre.titre),
      ligne('p', 'offre-choisie__prix', `${offre.prix} · ${offre.delai}`),
      ligne('p', 'offre-choisie__note', offre.note || 'Ce n’est pas une commande ferme : je vous réponds sous 48 h ouvrées avec une proposition écrite.'),
    );
  };
  if (need) need.addEventListener('change', afficherOffre);
  afficherOffre();

  const status = document.getElementById('form-status');
  const submit = form.querySelector('[type="submit"]');

  /* --- Messages d'erreur, reliés au champ par aria-describedby --- */
  const setError = (field, message) => {
    const wrap = field.closest('.field');
    let node = wrap.querySelector('.field__error');

    if (!node) {
      node = document.createElement('p');
      node.className = 'field__error';
      node.id = `${field.id}-error`;
      node.setAttribute('aria-live', 'polite');
      wrap.appendChild(node);
    }

    node.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', node.id);
  };

  const clearError = (field) => {
    const node = field.closest('.field').querySelector('.field__error');
    if (node) node.textContent = '';
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  };

  /* --- Règles --- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validate = () => {
    const checks = [
      ['name',    (v) => (v ? '' : 'Merci d\'indiquer votre nom.')],
      ['email',   (v) => (!v ? 'Merci d\'indiquer votre e-mail.' : EMAIL.test(v) ? '' : 'Cette adresse e-mail semble incomplète.')],
      ['message', (v) => (v ? '' : 'Décrivez votre besoin, même en deux lignes.')],
    ];

    let firstInvalid = null;

    for (const [id, rule] of checks) {
      const field = document.getElementById(id);
      if (!field) continue;

      const error = rule(field.value.trim());
      if (error) {
        setError(field, error);
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearError(field);
      }
    }

    return firstInvalid;
  };

  /* L'erreur disparaît dès que l'utilisateur corrige */
  ['name', 'email', 'message'].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.addEventListener('input', () => clearError(field));
  });

  /* --- Envoi --- */
  const show = (kind, text) => {
    if (!status) return;
    status.hidden = false;
    status.className = `form-status form-status--${kind}`;
    status.textContent = text;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submit.disabled) return;
    const invalid = validate();
    if (invalid) {
      invalid.focus();
      return;
    }

    // innerHTML et non textContent : on garde la flèche décorative (aria-hidden)
    const label = submit.innerHTML;
    status.hidden = true;
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.textContent = 'Envoi en cours…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.hidden = true;
        show('ok', 'Message bien reçu. Je vous réponds sous 48 h ouvrées.');
        status.focus?.();
      } else {
        throw new Error('Réponse serveur invalide');
      }
    } catch {
      submit.disabled = false;
      submit.innerHTML = label;
      show('ko', "L'envoi a échoué. Réessayez, ou écrivez-moi à antoinebalesi@gmail.com.");
      // Le focus sur le message le fait lire par les lecteurs d'écran
      status.focus();
    } finally {
      form.removeAttribute('aria-busy');
    }
  });
})();
