(() => {
  const root = document.querySelector('.about-store-carousel');
  const track = document.getElementById('about-store-track');
  if (!root || !track) return;
  const slides = Array.from(track.querySelectorAll('.about-store-slide'));
  const dots = Array.from(root.querySelectorAll('[data-store-slide]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0, startX = 0, deltaX = 0, pointerDown = false;
  const render = (next) => {
    index = (next + slides.length) % slides.length;
    track.style.transition = reducedMotion ? 'none' : '';
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  };
  root.querySelector('#about-store-prev')?.addEventListener('click', () => render(index - 1));
  root.querySelector('#about-store-next')?.addEventListener('click', () => render(index + 1));
  dots.forEach(dot => dot.addEventListener('click', () => render(Number(dot.dataset.storeSlide))));
  root.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; pointerDown = true; startX = e.clientX; deltaX = 0; });
  root.addEventListener('pointermove', e => { if (pointerDown) deltaX = e.clientX - startX; });
  const finishSwipe = () => { if (!pointerDown) return; pointerDown = false; if (Math.abs(deltaX) > 45) render(index + (deltaX < 0 ? 1 : -1)); deltaX = 0; };
  root.addEventListener('pointerup', finishSwipe);
  root.addEventListener('pointercancel', finishSwipe);
  root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') render(index - 1); if (e.key === 'ArrowRight') render(index + 1); });
  root.tabIndex = 0;
  render(0);
})();
