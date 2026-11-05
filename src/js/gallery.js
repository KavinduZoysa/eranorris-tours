// Photo galleries on destination and experience pages. The strip is a native scroll-snap
// scroller, so swiping (and scrolling with a trackpad) works without this script; it adds
// previous/next buttons, the "2 / 5" counter, dots and arrow-key navigation.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

for (const g of document.querySelectorAll('[data-gallery]')) {
  const track = g.querySelector('.gal-track');
  const slides = [...track.children];
  if (slides.length < 2) continue;
  const count = g.querySelector('.gal-count span');
  const dots = [...g.querySelectorAll('.gal-dots button')];
  let i = 0;

  const sync = () => {
    count.textContent = String(i + 1);
    dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  };
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
    sync();
  };

  g.querySelector('.gal-prev').addEventListener('click', () => show(i - 1));
  g.querySelector('.gal-next').addEventListener('click', () => show(i + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
  track.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    show(i + (e.key === 'ArrowRight' ? 1 : -1));
  });
  // Swipes and trackpad scrolls: follow the slide that has snapped into place.
  let t;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const n = Math.round(track.scrollLeft / track.clientWidth);
        if (n !== i) {
          i = Math.max(0, Math.min(slides.length - 1, n));
          sync();
        }
      }, 80);
    },
    { passive: true },
  );
  g.classList.add('gal-ready');
  sync();
}
