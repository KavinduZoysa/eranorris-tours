// Content pages (places, experience guides, tours, credits, 404): photo galleries, the site
// menu and the phone action bar. Every page works without it.
import './gallery.js';
import { initMenu } from './menu.js';

initMenu();

// Phone action bar (.mcta, hidden until shown here; desktop never shows it): it appears once
// the hero's buttons have scrolled away, and hides again at the closing "plan" band and the
// footer, which offer the same actions.
const bar = document.querySelector('[data-mcta]');
if (bar && 'IntersectionObserver' in window) {
  const inView = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target);
    bar.hidden = inView.size > 0;
  });
  document.querySelectorAll('.ph-cta, .cta-band, .foot').forEach((el) => io.observe(el));
}
