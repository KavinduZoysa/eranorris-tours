// Site menu (a <details> in the header, see menu() in src/templates/layout.mjs). It opens and
// closes without JavaScript; this adds Escape to close it, closing on an outside click or after
// choosing a link, and no background scrolling while the full-screen phone menu is open.
export function initMenu() {
  const m = document.querySelector('.menu');
  if (!m) return;
  const phone = window.matchMedia('(max-width: 900px)');
  const sync = () => document.documentElement.classList.toggle('menu-open', m.open && phone.matches);
  m.addEventListener('toggle', sync);
  phone.addEventListener('change', sync);
  const close = (focus) => {
    if (!m.open) return;
    m.open = false;
    sync(); // straight away; the toggle event comes a moment later
    if (focus) m.querySelector('summary').focus();
  };
  // Capture phase, so Escape closes only the menu (not a card or dialog underneath it).
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape' && m.open) {
        e.stopPropagation();
        close(true);
      }
    },
    true,
  );
  document.addEventListener('click', (e) => {
    if (m.open && !m.contains(e.target)) close(false);
  });
  m.querySelector('nav').addEventListener('click', (e) => {
    if (e.target.closest('a')) close(false);
  });
}
