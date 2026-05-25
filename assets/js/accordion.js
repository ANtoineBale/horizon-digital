/* accordion.js — FAQ accordion */

document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!question || !answer) return;

  question.addEventListener('click', () => {
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    // Ferme tous les autres
    document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(q => {
      if (q !== question) {
        q.setAttribute('aria-expanded', 'false');
        const a = q.nextElementSibling;
        if (a) a.style.maxHeight = '0';
      }
    });

    // Toggle l'item courant
    if (isOpen) {
      question.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';
    } else {
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});
