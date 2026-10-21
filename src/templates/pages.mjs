// Inner page templates: destination (/places/<id>/), tour (/private-tours/<slug>/), 404.
import { CATS, DESTS, PICKUPS, hav, legInfo, fmtDur, nightsTxt } from '../data/destinations.mjs';
import { EXP_CATS, experiencesFor } from '../data/experiences.mjs';
import { esc, picture, waLink } from './layout.mjs';

const D = Object.fromEntries(DESTS.map((d) => [d.id, d]));
const AIRPORT = PICKUPS.find((p) => p.id === 'cmb');

function heroImg(ph, alt) {
  // The hero photo is the likely LCP element: load it eagerly with high priority.
  const keys = [['w480', 480], ['w640', 640], ['w800', 800], ['w1200', 1200]];
  return `<figure class="ph-img">${picture(ph, keys, { sizes: '(max-width: 900px) calc(100vw - 32px), 640px', alt, width: 1200, height: 800, attrs: 'fetchpriority="high"' })}</figure>`;
}

function card(ctx, d, extra = '') {
  const ph = ctx.photos[d.id];
  return `<li class="pl-card">
      ${picture(ph, [['w480', 480], ['w640', 640], ['w800', 800]], { sizes: '(max-width: 600px) calc(100vw - 32px), 300px', alt: d.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' })}
      <div class="pl-body">
        <div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${esc(d.hl)}</span></div>
        <h3><a href="${ctx.u(`/places/${d.id}/`)}">${esc(d.name)}</a></h3>
        ${extra}
        <p>${esc(d.desc)}</p>
      </div>
    </li>`;
}

// A tour listed on the destination pages it visits.
function tourCard(ctx, t) {
  const lead = D[t.image] || D[(t.places || [])[0]];
  const ph = lead && ctx.photos[lead.id];
  return `<li class="pl-card">
      ${ph ? picture(ph, [['w480', 480], ['w640', 640], ['w800', 800]], { sizes: '(max-width: 600px) calc(100vw - 32px), 300px', alt: lead.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' }) : ''}
      <div class="pl-body">
        <div class="dc-meta"><span>Private tour${t.duration ? ' · ' + esc(t.duration) : ''}</span></div>
        <h3><a href="${ctx.u(`/private-tours/${t.slug}/`)}">${esc(t.h1 || t.title)}</a></h3>
        ${t.summary ? `<p>${esc(t.summary)}</p>` : ''}
      </div>
    </li>`;
}

// Things to do at a destination (src/data/experiences.mjs), as plain HTML. Choosing them
// happens on the map; this list keeps the text crawlable and links there.
export function experienceMeta(e) {
  return [EXP_CATS[e.category], e.duration, e.price].filter(Boolean).map(esc).join(' · ');
}
function experienceSection(ctx, d) {
  const list = experiencesFor(d.id);
  if (!list.length) return '';
  const items = list
    .map((e) => {
      const th = e.image && ctx.expPhotos[e.image];
      return `<li class="xp${th ? ' has-th' : ''}" data-exp="${e.id}">
        ${th ? `<img src="${th}" width="64" height="64" alt="${esc(e.imageAlt)}" loading="lazy" decoding="async">` : ''}
        <div><h3>${esc(e.name)}${e.featured ? ' <span class="xp-f">Featured</span>' : ''}</h3><p class="xp-m">${experienceMeta(e)}</p><p>${esc(e.shortDescription)}</p></div>
      </li>`;
    })
    .join('\n      ');
  return `<section class="paper" aria-labelledby="expH">
  <div class="sect">
    <h2 id="expH">Things to do in ${esc(d.name)}</h2>
    <p class="xp-lede">Tick the ones that interest you on the map and they’re added to your quote request. Choosing an experience isn’t a booking.</p>
    <ul class="xp-list">
      ${items}
    </ul>
    <p class="xp-more"><a class="btn ghost" href="${ctx.u('/')}#experiences=${d.id}">Choose experiences on the map</a></p>
  </div>
</section>`;
}

function crumbs(ctx, items) {
  const html = items
    .map((it, i) => (i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${ctx.u(it.path)}">${esc(it.name)}</a></li>`))
    .join('');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: ctx.abs(it.path) })),
  };
  return { html: `<nav class="crumbs" aria-label="Breadcrumb"><ol>${html}</ol></nav>`, ld };
}

export function nearbyOf(d, n = 3) {
  return DESTS.filter((x) => x.id !== d.id)
    .map((x) => ({ x, km: hav(d, x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n)
    .map((o) => o.x);
}

// ---------------------------------------------------------------------------
export function placePage(ctx, d, content) {
  const ph = ctx.photos[d.id];
  const path = `/places/${d.id}/`;
  const cr = crumbs(ctx, [
    { name: 'Home', path: '/' },
    { name: d.name, path },
  ]);
  const fromAirport = legInfo(AIRPORT, d);
  const near = nearbyOf(d);
  const ask = waLink(ctx, `Hello ${ctx.site.name}, I’d like to ask about a private tour that includes ${d.name}.`);
  const title = content.title || `${d.seoTitle} | Private Tours | ${ctx.site.name}`;
  const description =
    content.description ||
    [`${d.desc} Add ${d.name} to a private tour of Sri Lanka with your own driver.`, `${d.desc} Add it to a private Sri Lanka tour.`, d.desc].find(
      (x) => x.length <= 160,
    ) ||
    d.desc;

  const body = `<main id="content">
<section class="ph" aria-labelledby="h1">
  <div class="ph-in">
    <div>
      ${cr.html}
      <div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${esc(d.hl)}</span></div>
      <h1 id="h1">${esc(content.h1 || d.name)}</h1>
      <p class="lede">${esc(d.desc)}</p>
      <div class="ph-cta">
        <a class="btn primary" href="${ctx.u('/')}#add=${d.id}">Add ${esc(d.name)} to your trip</a>
        <a class="btn ondark" href="${esc(ask)}" target="_blank" rel="noopener">Ask about a private tour</a>
      </div>
    </div>
    ${heroImg(ph, d.alt)}
  </div>
</section>

<section class="paper facts" aria-label="At a glance">
  <dl>
    <div><dt>Suggested stay</dt><dd>${nightsTxt(d.nights)}</dd></div>
    <div><dt>From CMB Airport</dt><dd>~${fmtDur(fromAirport.min)}<small>About ${fromAirport.km} km by road, estimated</small></dd></div>
    <div><dt>Type</dt><dd>${CATS[d.cat].label}</dd></div>
  </dl>
</section>

${content.html ? `<section class="paper"><div class="sect"><div class="prose">${content.html}</div></div></section>` : ''}

${experienceSection(ctx, d)}

<section class="cta-band" aria-labelledby="planH">
  <div class="sect">
    <div>
      <h2 id="planH">Plan a private tour with ${esc(d.name)}</h2>
      <p>Add it to your route on the map, choose your pickup point and dates, and we’ll send you a quote for the whole trip with your own driver.</p>
    </div>
    <div class="row">
      <a class="btn primary" href="${ctx.u('/')}#add=${d.id}">Add ${esc(d.name)} to your trip</a>
      <a class="btn ghost" href="${ctx.u('/')}#place=${d.id}">See it on the map</a>
    </div>
  </div>
</section>

${(() => {
  const ts = ctx.toursFor(d.id);
  return ts.length
    ? `<section class="paper" aria-labelledby="toursH"><div class="sect"><h2 id="toursH">Private tours that include ${esc(d.name)}</h2><ul class="near">${ts.map((t) => tourCard(ctx, t)).join('')}</ul></div></section>`
    : '';
})()}

<section class="paper" aria-labelledby="nearH">
  <div class="sect">
    <h2 id="nearH">Nearby places to combine</h2>
    <ul class="near">
    ${near.map((x) => card(ctx, x, `<span class="drive">~${fmtDur(legInfo(d, x).min)} drive from ${esc(d.name)}</span>`)).join('\n    ')}
    </ul>
  </div>
</section>
</main>`;

  const place = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: d.name,
    description: d.desc,
    url: ctx.abs(path),
    image: ctx.abs(ph.w1200),
    geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
    containedInPlace: { '@type': 'Country', name: 'Sri Lanka' },
  };
  return {
    path,
    title,
    description,
    css: 'page',
    ogImage: { src: ph.og, alt: d.alt },
    jsonld: [cr.ld, place],
    body,
  };
}

// ---------------------------------------------------------------------------
// Tour pages are generated only from src/content/tours/<slug>.md. Every fact shown
// (duration, inclusions, price…) comes from that file; nothing is inferred.
export function tourPage(ctx, t) {
  const path = `/private-tours/${t.slug}/`;
  const places = (t.places || []).map((id) => D[id]).filter(Boolean);
  const lead = D[t.image] || places[0];
  const ph = lead && ctx.photos[lead.id];
  const cr = crumbs(ctx, [
    { name: 'Home', path: '/' },
    { name: t.h1 || t.title, path },
  ]);
  const ask = waLink(ctx, `Hello ${ctx.site.name}, I’d like to ask about the ${t.h1 || t.title}.`);
  const facts = [
    t.duration && ['Duration', esc(t.duration)],
    t.pickup && ['Pickup', esc(t.pickup)],
    t.groupSize && ['Group', esc(t.groupSize)],
    t.price && ['From', esc(t.price)],
  ].filter(Boolean);
  const list = (h, items) => (items && items.length ? `<h2>${h}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');

  const body = `<main id="content">
<section class="ph" aria-labelledby="h1">
  <div class="ph-in">
    <div>
      ${cr.html}
      <p class="eyebrow">Private tour${places.length ? ' · ' + places.map((p) => esc(p.name)).join(' · ') : ''}</p>
      <h1 id="h1">${esc(t.h1 || t.title)}</h1>
      ${t.summary ? `<p class="lede">${esc(t.summary)}</p>` : ''}
      <div class="ph-cta">
        <a class="btn primary" href="${esc(ask)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn ondark" href="mailto:${esc(ctx.site.contact.email)}?subject=${encodeURIComponent(`Enquiry: ${t.h1 || t.title}`)}">Enquire by email</a>
      </div>
    </div>
    ${ph ? heroImg(ph, lead.alt) : ''}
  </div>
</section>
${facts.length ? `<section class="paper facts" aria-label="Tour details"><dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section>` : ''}
<section class="paper"><div class="sect"><div class="prose">
${t.html}
${list('Included', t.includes)}
${list('Not included', t.excludes)}
</div></div></section>
${places.length ? `<section class="paper" aria-labelledby="stopsH"><div class="sect"><h2 id="stopsH">Places on this tour</h2><ul class="near">${places.map((x) => card(ctx, x)).join('')}</ul></div></section>` : ''}
</main>`;

  const trip = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: t.h1 || t.title,
    description: t.summary || t.description,
    url: ctx.abs(path),
    ...(ph && { image: ctx.abs(ph.w1200) }),
    provider: { '@type': 'TravelAgency', name: ctx.site.name, url: ctx.abs('/') },
    ...(places.length && {
      itinerary: {
        '@type': 'ItemList',
        itemListElement: places.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@type': 'TouristDestination', name: p.name, url: ctx.abs(`/places/${p.id}/`) },
        })),
      },
    }),
    // Offer only when the content file states a numeric price and currency.
    ...(t.priceAmount && t.priceCurrency && {
      offers: { '@type': 'Offer', price: String(t.priceAmount), priceCurrency: t.priceCurrency, url: ctx.abs(path) },
    }),
  };
  return {
    path,
    title: `${t.title} | ${ctx.site.name}`,
    description: t.description,
    css: 'page',
    ogImage: ph ? { src: ph.og, alt: lead.alt } : undefined,
    jsonld: [cr.ld, trip],
    body,
  };
}

// ---------------------------------------------------------------------------
export function notFoundPage(ctx) {
  const links = DESTS.slice(0, 8)
    .map((d) => `<li><a href="${ctx.u(`/places/${d.id}/`)}">${esc(d.name)}</a></li>`)
    .join('');
  return {
    path: '/404.html',
    title: `Page not found | ${ctx.site.name}`,
    description: 'The page you were looking for isn’t here. Go back to the map to plan a private tour of Sri Lanka.',
    css: 'page',
    noindex: true,
    noCanonical: true,
    body: `<main id="content" class="ph nf">
  <div class="ph-in">
    <div>
      <p class="eyebrow">404 · Page not found</p>
      <h1>This page isn’t <em>on the map.</em></h1>
      <p class="lede">The link may be old or mistyped. Start again from the map, or go straight to one of the places below.</p>
      <div class="ph-cta"><a class="btn primary" href="${ctx.u('/')}">Back to the map</a><a class="btn ondark" href="${ctx.u('/')}#places">All places</a></div>
      <ul>${links}</ul>
    </div>
  </div>
</main>`,
  };
}

