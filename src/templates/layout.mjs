// Shared page shell: <head> metadata, header and footer.
import { CATS, DESTS } from '../data/destinations.mjs';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Inline, before anything renders: lets CSS tell "no JS" from "JS on", and flags a map
// script that fails to load or throws during start-up so the fallback note appears.
const BOOT = `document.documentElement.classList.add('js');addEventListener('error',function(e){var h=document.documentElement;if(!h.classList.contains('map-ready')&&e.filename&&/\\/assets\\/app\\./.test(e.filename))h.classList.add('map-failed')})`;

export function layout(ctx, page) {
  const { site, u, abs, assets } = ctx;
  const robots = page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow';
  const og = page.ogImage || assets.ogDefault;
  const ld = (page.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${robots}">
${page.canonical ? `<link rel="canonical" href="${esc(page.canonical)}">` : ''}
<meta name="theme-color" content="#14110E">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${u('/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${u('/apple-touch-icon.png')}">
${ctx.fontPreloads}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
${page.canonical ? `<meta property="og:url" content="${esc(page.canonical)}">` : ''}
<meta property="og:image" content="${esc(abs(og.src))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(og.alt)}">
<meta name="twitter:card" content="summary_large_image">
<script>${BOOT}</script>
<style>${page.css}</style>
${page.head || ''}
${ld}
</head>
<body class="${page.bodyClass || ''}">
<a class="skip" href="#${page.skipTo || 'content'}">Skip to ${page.skipLabel || 'content'}</a>
${page.header ?? header(ctx)}
${page.body}
${footer(ctx)}
${page.scripts || ''}
</body>
</html>
`;
}

// Responsive photo: AVIF first, WebP fallback. `keys` are [variantKey, width] pairs from the build.
export function picture(ph, keys, { sizes, alt, width, height, attrs = '' }) {
  const set = (suffix) => keys.map(([k, w]) => `${ph[k + suffix]} ${w}w`).join(', ');
  const fallback = ph[keys[Math.min(1, keys.length - 1)][0]];
  return `<picture><source type="image/avif" srcset="${set('Avif')}" sizes="${sizes}"><img src="${fallback}" srcset="${set('')}" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(alt)}" ${attrs}></picture>`;
}

export function brand(ctx, tag = 'a') {
  const { site, u } = ctx;
  const inner = `<b>${esc(site.name)}<i>.</i></b><span>${esc(site.tagline)}</span>`;
  return tag === 'a' ? `<a class="brand" href="${u('/')}">${inner}</a>` : `<span class="brand">${inner}</span>`;
}

export function header(ctx, right = `<a class="top-link" href="${ctx.u('/')}">Plan your trip</a>`) {
  return `<header class="top">
  ${brand(ctx)}
  ${right}
</header>`;
}

export function waLink(ctx, text) {
  return `https://wa.me/${ctx.site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function footer(ctx) {
  const { site, u } = ctx;
  const year = new Date().getFullYear();
  const byCat = Object.keys(CATS)
    .flatMap((c) => DESTS.filter((d) => d.cat === c))
    .map((d) => `<li><a href="${u(`/places/${d.id}/`)}">${esc(d.name)}</a></li>`)
    .join('');
  return `<footer class="foot">
  <div class="foot-in">
    <div>
      ${brand(ctx)}
      <p>Private tours of Sri Lanka with your own driver. Pick your places, tell us your dates, and we’ll put together a quote.</p>
    </div>
    <nav aria-label="Places">
      <h2>Places</h2>
      <ul class="cols">${byCat}</ul>
    </nav>
    <div>
      <h2>Contact</h2>
      <ul>
        <li><a href="${waLink(ctx, `Hello ${site.name}, I’d like to ask about a private tour of Sri Lanka.`)}" rel="noopener" target="_blank">WhatsApp ${esc(site.contact.phone)}</a></li>
        <li><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></li>
        ${site.address ? `<li>Based in ${esc([site.address.locality, site.address.countryName].filter(Boolean).join(', '))}</li>` : ''}
      </ul>
    </div>
  </div>
  <p class="foot-base">© ${year} ${esc(site.name)}</p>
</footer>`;
}
