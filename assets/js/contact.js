/* ============================================================
   contact.js — Formulaire de contact
   Validation inline accessible + envoi Formspree sans rechargement
   ============================================================ */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

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

    const invalid = validate();
    if (invalid) {
      invalid.focus();
      return;
    }

    // innerHTML et non textContent : on garde la flèche décorative (aria-hidden)
    const label = submit.innerHTML;
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
    }
  });
})();
