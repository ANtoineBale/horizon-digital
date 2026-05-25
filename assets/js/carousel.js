/* carousel.js — Carrousel réalisations */

document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  if (!track || !slides.length) return;

  let index = 0;

  const visibleCount = () => {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    return 3;
  };

  const update = () => {
    const slideWidth = slides[0].getBoundingClientRect().width + 24; // gap 1.5rem
    track.style.transform = `translateX(-${index * slideWidth}px)`;

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index >= slides.length - visibleCount();
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      index = Math.min(slides.length - visibleCount(), index + 1);
      update();
    });
  }

  window.addEventListener('resize', () => {
    index = 0;
    update();
  });

  update();
});
