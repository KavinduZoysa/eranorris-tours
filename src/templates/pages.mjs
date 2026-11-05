// Inner page templates: destination guides (/places/<id>/), experience guides
// (/experiences/<slug>/), tours (/private-tours/<slug>/) and the 404 page.
import { CATS, DESTS, PICKUPS, hav, legInfo, fmtDur, nightsTxt } from '../data/destinations.mjs';
import { EXPERIENCES, EXP_CATS, experiencesFor } from '../data/experiences.mjs';
import { GALLERIES } from '../data/galleries.mjs';
import { esc, picture, waLink } from './layout.mjs';

const D = Object.fromEntries(DESTS.map((d) => [d.id, d]));
const X = Object.fromEntries(EXPERIENCES.map((e) => [e.id, e]));
const AIRPORT = PICKUPS.find((p) => p.id === 'cmb');
const CARD_KEYS = [['w480', 480], ['w640', 640], ['w800', 800]];

// Photo gallery: a native scroll-snap strip (swipeable, works without JavaScript) that
// src/js/gallery.js enhances with previous/next buttons, a counter, dots and arrow keys.
// The first photo is the page's LCP candidate, so it loads eagerly; the rest are lazy.
function gallery(label, slides) {
  const n = slides.length;
  const items = slides
    .map((s, i) => {
      const pic = picture(s.ph, s.ph.keys, {
        sizes: '(max-width: 900px) calc(100vw - 32px), 640px',
        alt: s.alt,
        width: 1200,
        height: 800,
        attrs: i === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"',
      });
      return `<figure class="gal-slide"${n > 1 ? ` role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}"` : ''}>${pic}${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure>`;
    })
    .join('');
  if (n === 1) return `<div class="gal gal-one">${`<div class="gal-track">${items}</div>`}</div>`;
  const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"></path></svg>`;
  return `<div class="gal" data-gallery>
      <div class="gal-track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(label)} — ${n} photos. Use the arrow keys or swipe.">${items}</div>
      <button type="button" class="gal-btn gal-prev" aria-label="Previous photo">${icon('m15 18-6-6 6-6')}</button>
      <button type="button" class="gal-btn gal-next" aria-label="Next photo">${icon('m9 18 6-6-6-6')}</button>
      <p class="gal-count" aria-live="polite"><span>1</span> / ${n}</p>
      <div class="gal-dots">${slides.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1} of ${n}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
    </div>`;
}
function destinationSlides(ctx, d) {
  return [{ ph: ctx.photos[d.id], alt: d.alt }, ...(GALLERIES[d.id] || []).filter((n) => ctx.galleryPhotos[n]).map((n) => ({ ph: ctx.galleryPhotos[n], alt: ctx.galleryPhotos[n].alt, caption: ctx.galleryPhotos[n].caption }))];
}

function card(ctx, d, extra = '') {
  const ph = ctx.photos[d.id];
  return `<li class="pl-card">
      ${picture(ph, CARD_KEYS, { sizes: '(max-width: 600px) calc(100vw - 32px), 300px', alt: d.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' })}
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
      ${ph ? picture(ph, CARD_KEYS, { sizes: '(max-width: 600px) calc(100vw - 32px), 300px', alt: lead.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' }) : ''}
      <div class="pl-body">
        <div class="dc-meta"><span>Private tour${t.duration ? ' · ' + esc(t.duration) : ''}</span></div>
        <h3><a href="${ctx.u(`/private-tours/${t.slug}/`)}">${esc(t.h1 || t.title)}</a></h3>
        ${t.summary ? `<p>${esc(t.summary)}</p>` : ''}
      </div>
    </li>`;
}

// Things to do at a destination (src/data/experiences.mjs), as plain HTML. Choosing them
// happens on the map; this keeps the text crawlable and links there.
export function experienceMeta(e) {
  return [EXP_CATS[e.category], e.duration, e.price].filter(Boolean).map(esc).join(' · ');
}
function experienceCard(ctx, e, h = 'h3') {
  const ph = e.image && ctx.expCardPhotos[e.image];
  const guide = ctx.expGuide[e.id];
  return `<li class="xp${ph ? ' has-ph' : ''}" data-exp="${e.id}">
        ${ph ? picture(ph, ph.keys.filter(([k]) => k !== 'w1200'), { sizes: '(max-width: 600px) calc(100vw - 32px), 360px', alt: e.imageAlt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' }) : ''}
        <div class="xp-b"><${h}>${esc(e.name)}${e.featured ? ' <span class="xp-f">Featured</span>' : ''}</${h}><p class="xp-m">${experienceMeta(e)}</p>${e.where ? `<p class="xp-w">${esc(e.where)}</p>` : ''}<p>${esc(e.details || e.shortDescription)}</p>${guide ? `<p class="xp-g"><a href="${ctx.u(`/experiences/${guide}/`)}">Read the ${esc(e.name)} guide<span aria-hidden="true"> →</span></a></p>` : ''}</div>
      </li>`;
}
function experienceSection(ctx, d) {
  const list = experiencesFor(d.id);
  if (!list.length) return '';
  return `<section class="paper" aria-labelledby="expH">
  <div class="sect">
    <h2 id="expH">Things to do in ${esc(d.name)}</h2>
    <p class="xp-lede">Tick the ones that interest you on the map and they’re added to your quote request. Choosing an experience isn’t a booking.</p>
    <ul class="xp-list">
      ${list.map((e) => experienceCard(ctx, e)).join('\n      ')}
    </ul>
    <p class="xp-more"><a class="btn ghost" href="${ctx.u('/')}#experiences=${d.id}">Choose experiences on the map</a></p>
  </div>
</section>`;
}

// Guide prose, FAQ and official links (from src/content/…).
const prose = (html) => (html ? `<section class="paper"><div class="sect"><div class="prose">${html}</div></div></section>` : '');
function faqSection(faq) {
  if (!faq || !faq.length) return '';
  return `<section class="paper" aria-labelledby="faqH">
  <div class="sect">
    <h2 id="faqH">Frequently asked questions</h2>
    <div class="faq">
      ${faq.map((x) => `<details class="faq-i"><summary><h3 class="faq-q">${x.q}</h3></summary><div class="faq-a">${x.a}</div></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
}
function sourcesSection(sources) {
  if (!sources || !sources.length) return '';
  return `<section class="paper" aria-labelledby="srcH">
  <div class="sect src">
    <h2 id="srcH">Official information</h2>
    <p>Opening hours, prices and rules change. Check the official sources before you go:</p>
    <ul>${sources.map((x) => `<li><a href="${esc(x.href)}" rel="noopener" target="_blank">${esc(x.label)}</a></li>`).join('')}</ul>
  </div>
</section>`;
}
function facts(rows) {
  const list = rows.filter((r) => r && r[1]);
  return `<section class="paper facts" aria-label="At a glance"><dl>${list.map(([k, v, note]) => `<div><dt>${k}</dt><dd${v.length > 36 ? ' class="long"' : ''}>${esc(v)}${note ? `<small>${esc(note)}</small>` : ''}</dd></div>`).join('')}</dl></section>`;
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

function planBand(ctx, d) {
  return `<section class="cta-band" aria-labelledby="planH">
  <div class="sect">
    <div>
      <h2 id="planH">Plan a private tour with ${esc(d.name)}</h2>
      <p>Add ${esc(d.name)} to your route on the map, choose your pickup point and dates, then request a quote for a private trip with your own driver.</p>
    </div>
    <div class="row">
      <a class="btn primary" href="${ctx.u('/')}#add=${d.id}">Add ${esc(d.name)} to your trip</a>
      <a class="btn ghost" href="${ctx.u('/')}#place=${d.id}">See it on the map</a>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------------------
// Destination guide. `content` is the guide file when published (or in a preview build);
// in production a draft guide is passed as {} so only the design summary shows.
export function placePage(ctx, d, content) {
  const ph = ctx.photos[d.id];
  const path = `/places/${d.id}/`;
  const cr = crumbs(ctx, [
    { name: 'Home', path: '/' },
    { name: d.name, path },
  ]);
  const fromAirport = legInfo(AIRPORT, d);
  const ask = waLink(ctx, `Hello ${ctx.site.name}, I’d like to ask about a private tour that includes ${d.name}.`);
  const title = content.title || `${d.seoTitle} | Private Tours | ${ctx.site.name}`;
  const description =
    content.description ||
    [`${d.desc} Add ${d.name} to a private tour of Sri Lanka with your own driver.`, `${d.desc} Add it to a private Sri Lanka tour.`, d.desc].find(
      (x) => x.length <= 160,
    ) ||
    d.desc;
  // Curated route suggestions from the guide; otherwise the nearest places, with the
  // planner's rough estimate clearly labelled.
  const combine = content.combine && content.combine.length
    ? content.combine.filter((c) => D[c.id]).map((c) => card(ctx, D[c.id], `<span class="drive note">${esc(c.note)}</span>`))
    : nearbyOf(d).map((x) => card(ctx, x, `<span class="drive">~${fmtDur(legInfo(d, x).min)} drive from ${esc(d.name)} (rough estimate)</span>`));
  const ts = ctx.toursFor(d.id);

  const body = `<main id="content">
<section class="ph" aria-labelledby="h1">
  <div class="ph-in">
    <div>
      ${cr.html}
      <div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${esc(d.hl)}</span></div>
      <h1 id="h1">${esc(content.h1 || d.name)}</h1>
      <p class="lede">${esc(content.intro || d.desc)}</p>
      <div class="ph-cta">
        <a class="btn primary" href="${ctx.u('/')}#add=${d.id}">Add ${esc(d.name)} to your trip</a>
        <a class="btn ondark" href="${esc(ask)}" target="_blank" rel="noopener">Ask about a private tour</a>
      </div>
    </div>
    ${gallery(`Photos of ${d.name}`, destinationSlides(ctx, d))}
  </div>
</section>

${facts([
  ['Recommended stay', content.stay || nightsTxt(d.nights), content.stay ? '' : 'Suggested'],
  content.gettingThere ? ['Getting there', content.gettingThere] : ['From CMB Airport', `~${fmtDur(fromAirport.min)}`, `About ${fromAirport.km} km by road, rough estimate`],
  ['Best time', content.bestTime],
  ['Good for', content.goodFor || CATS[d.cat].label],
])}

${prose(content.html)}

${experienceSection(ctx, d)}

${prose(content.htmlAfter)}

${faqSection(content.faq)}

${sourcesSection(content.sources)}

${planBand(ctx, d)}

${ts.length ? `<section class="paper" aria-labelledby="toursH"><div class="sect"><h2 id="toursH">Private tours that include ${esc(d.name)}</h2><ul class="near">${ts.map((t) => tourCard(ctx, t)).join('')}</ul></div></section>` : ''}

<section class="paper" aria-labelledby="nearH">
  <div class="sect">
    <h2 id="nearH">Nearby places to combine</h2>
    <ul class="near">
    ${combine.join('\n    ')}
    </ul>
  </div>
</section>
</main>`;

  const place = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: d.name,
    description: content.intro || d.desc,
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
// Experience guide (/experiences/<slug>/) for an activity with its own search intent,
// linked to its experience (src/data/experiences.mjs) and destination.
export function activityPage(ctx, a) {
  const e = X[a.experience];
  const d = D[e.destinationId];
  const path = `/experiences/${a.slug}/`;
  const cr = crumbs(ctx, [
    { name: 'Home', path: '/' },
    { name: d.name, path: `/places/${d.id}/` },
    { name: a.h1 || e.name, path },
  ]);
  const slides = [
    ...a.gallery.filter((n) => ctx.galleryPhotos[n]).map((n) => ({ ph: ctx.galleryPhotos[n], alt: ctx.galleryPhotos[n].alt, caption: ctx.galleryPhotos[n].caption })),
  ];
  if (!slides.length && e.image && ctx.expCardPhotos[e.image]) slides.push({ ph: ctx.expCardPhotos[e.image], alt: e.imageAlt });
  if (!slides.length) slides.push({ ph: ctx.photos[d.id], alt: d.alt });
  const og = e.image && ctx.expCardPhotos[e.image] ? null : { src: ctx.photos[d.id].og, alt: d.alt };
  const more = experiencesFor(d.id).filter((x) => x.id !== e.id);
  const body = `<main id="content">
<section class="ph" aria-labelledby="h1">
  <div class="ph-in">
    <div>
      ${cr.html}
      <div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${esc(EXP_CATS[e.category])}</span><span>${esc(d.name)}</span></div>
      <h1 id="h1">${esc(a.h1 || e.name)}</h1>
      <p class="lede">${esc(a.intro || e.shortDescription)}</p>
      <div class="ph-cta">
        <a class="btn primary" href="${ctx.u('/')}#exp=${e.id}">Choose it on the map</a>
        <a class="btn ondark" href="${ctx.u('/')}#add=${d.id}">Add ${esc(d.name)} to your trip</a>
      </div>
    </div>
    ${gallery(a.h1 || e.name, slides)}
  </div>
</section>

${facts([
  ['Where', a.where || e.where || d.name],
  ['When', a.season],
  ['How long', a.duration],
  ['Good for', a.goodFor || EXP_CATS[e.category]],
])}

${prose(a.html)}

${prose(a.htmlAfter)}

${faqSection(a.faq)}

${sourcesSection(a.sources)}

${planBand(ctx, d)}

${more.length ? `<section class="paper" aria-labelledby="moreH"><div class="sect"><h2 id="moreH">More things to do in ${esc(d.name)}</h2><ul class="xp-list">${more.map((x) => experienceCard(ctx, x)).join('')}</ul><p class="xp-more"><a class="btn ghost" href="${ctx.u(`/places/${d.id}/`)}">The ${esc(d.name)} guide</a></p></div></section>` : ''}
</main>`;
  return {
    path,
    title: a.title,
    description: a.description,
    css: 'page',
    ogImage: og || { src: ctx.photos[d.id].og, alt: d.alt },
    jsonld: [cr.ld],
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
    ${ph ? gallery(t.h1 || t.title, [{ ph, alt: lead.alt }]) : ''}
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

