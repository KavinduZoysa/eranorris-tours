// Homepage: two services on one map, plus a crawlable places index.
// Markup inside <div class="app"> grew from design/design-source.html. Dynamic regions
// (#chips, the two location lists, …) are pre-rendered in their initial state so the page is
// complete before JavaScript runs and nothing shifts when it does.
//
// One page, three views. <html data-svc> says which one is showing (see SVC_BOOT below):
//   (none)   the main page: two service cards, "Plan My Tour" and "Book Airport Transfer"  (#svc)
//   "tour"   the guided tour planner (see "Guided trip planner" in README.md):
//              the map with one instruction (#guide) → a place opens as a dialog (#dcard)
//              → the compact itinerary (#trip) → review, details, send (#mbg)
//   "sh"     airport shuttle and private transfers (see "Airport shuttle" in README.md):
//              two locations, pickup A and drop-off B (#tcard) → details → review → send (#mbg)
// The two services keep separate state in src/js/app.js and never change each other.
import { CATS, DESTS, PICKUPS, TRANSFER_GROUPS, TRANSFER_PLACES } from '../data/destinations.mjs';
import { brand, esc, menu, picture, waLink } from './layout.mjs';

// Inline in <head>, before first paint: a visitor who comes back to a trip or transfer in
// progress, or who follows a link such as /#add=kandy or /#transfer, goes straight to that
// service instead of seeing the service cards flash by. src/js/app.js reads the same attribute.
export const SVC_BOOT = `(function(){try{var h=location.hash,s=JSON.parse(localStorage.getItem('eranorris-trip-v1')||'{}'),t=s.tr||{},m='';if(h==='#transfer')m='sh';else if(/^#(tour$|add=|place=|experiences=|exp=)/.test(h))m='tour';else if(s.mode==='shuttle'&&(t.from||t.to))m='sh';else if(s.mode==='tour'&&((s.stops||[]).length||s.pickup))m='tour';if(m)document.documentElement.setAttribute('data-svc',m)}catch(e){}})()`;

const SEARCH_ICON = (s) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;

const CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>`;

function chips() {
  const counts = { all: DESTS.length };
  DESTS.forEach((d) => (counts[d.cat] = (counts[d.cat] || 0) + 1));
  return [['all', 'All', null], ...Object.entries(CATS).map(([k, v]) => [k, v.label, v.c])]
    .map(
      ([k, l, c]) =>
        `<button class="chip ${k === 'all' ? 'on' : ''}" data-f="${k}" aria-pressed="${k === 'all'}">${c ? `<i style="--c:${c}"></i>` : ''}${l}<small>${counts[k]}</small></button>`,
    )
    .join('');
}

const PLANE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>`;
const SWAP = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16m0 0-3.5-3.5M7 20l3.5-3.5M17 20V4m0 0-3.5 3.5M17 4l3.5 3.5"></path></svg>`;

// The same list of places for "Pickup location" and "Drop-off location" (TRANSFER_PLACES).
function placeOptions(placeholder) {
  const groups = Object.entries(TRANSFER_GROUPS)
    .map(([g, label]) => `<optgroup label="${esc(label)}">${TRANSFER_PLACES.filter((p) => p.group === g).map((p) => `<option value="${p.id}">${esc(p.label)}</option>`).join('')}</optgroup>`)
    .join('');
  return `<option value="" disabled selected>${placeholder}</option>${groups}<option value="pin">Somewhere else: drop a pin on the map</option>`;
}

// One card per service on the main page. The pictures are drawn from what the map already
// uses (place photos, the airport marker, the dotted route), so the two cards belong together.
function serviceCards(ctx) {
  const med = (id) => `<span class="svc-m"><img src="${ctx.photos[id].med}" alt="" width="96" height="96" decoding="async"></span>`;
  return `<div class="svc" id="svc">
        <article class="svc-c" aria-labelledby="svcTour">
          <div class="svc-v tour" aria-hidden="true">${['sigiriya', 'kandy', 'ella', 'galle'].map(med).join('')}</div>
          <div class="svc-b">
            <h2 id="svcTour">Plan Your Sri Lanka Tour</h2>
            <p>Discover amazing places, explore experiences and build your own personalised private tour.</p>
            <button type="button" class="btn primary" data-go="tour">Plan My Tour</button>
          </div>
        </article>
        <article class="svc-c" aria-labelledby="svcSh">
          <div class="svc-v sh" aria-hidden="true"><span class="svc-pt a">${PLANE}</span><span class="svc-ln"></span><span class="svc-pt b"></span></div>
          <div class="svc-b">
            <h2 id="svcSh">Airport Shuttle &amp; Private Transfers</h2>
            <p>Need a comfortable transfer? Choose your pickup and drop-off locations and request your private transfer.</p>
            <button type="button" class="btn primary" data-go="shuttle">Book Airport Transfer</button>
          </div>
        </article>
      </div>`;
}

function placeCards(ctx) {
  return DESTS.map((d) => {
    const ph = ctx.photos[d.id];
    return `<li class="pl-card">
      ${picture(ph, [['w480', 480], ['w640', 640], ['w800', 800]], { sizes: '(max-width: 560px) 108px, (max-width: 600px) calc(100vw - 32px), (max-width: 1240px) 33vw, 300px', alt: d.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' })}
      <div class="pl-body">
        <div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${esc(d.hl)}</span></div>
        <h3><a href="${ctx.u(`/places/${d.id}/`)}">${esc(d.name)}</a></h3>
        <p>${esc(d.desc)}</p>
      </div>
    </li>`;
  }).join('\n    ');
}

export function homeBody(ctx) {
  const { site } = ctx;
  return `<header class="top">
  ${brand(ctx)}
  <div class="top-r"><button class="trip-pill" id="tripPill" hidden><span id="pillLbl">Your trip</span> <b id="pillCount">0</b></button>${menu(ctx)}</div>
</header>

<main id="content">
<div class="app">
  <section class="mapwrap" id="mapwrap" aria-labelledby="h1">
    <div id="map" role="region" aria-label="Map of Sri Lanka with ${DESTS.length} places. Tab to a place and press Enter to open it."></div>
    <div class="shade"></div>
    <div class="overlay">
      <div class="svc-tabs" id="modes" role="group" aria-label="Choose a service"><button type="button" data-mode="tour" aria-pressed="false">Tour planner</button><button type="button" data-mode="shuttle" aria-pressed="false">Airport shuttle</button></div>
      <p class="eyebrow">Two ways to travel with us</p>
      <h1 id="h1" data-m="home" tabindex="-1">Private tours and <em>airport transfers</em> in Sri Lanka</h1>
      <p class="guide" id="guide" data-k="home">Choose what you need. You can switch between the two at any time.</p>

      ${serviceCards(ctx)}

      <div class="tour-ui">
        <div class="search" role="search">
          <label class="sbox">
            ${SEARCH_ICON(18)}
            <input id="q" type="text" placeholder="Search Sigiriya, Ella, leopards…" autocomplete="off" aria-label="Search destinations" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="results">
            <kbd aria-hidden="true">/</kbd>
          </label>
          <ul class="results" id="results" role="listbox" aria-label="Matching places" hidden></ul>
        </div>
        <div class="chips" id="chips" role="group" aria-label="Filter places by type">${chips()}</div>
      </div>

      <section class="tcard" id="tcard" aria-labelledby="tcH">
        <h2 class="tagl" id="tcH">Your transfer</h2>
        <div class="tf" id="tfFrom">
          <label for="tFrom"><b class="ab" aria-hidden="true">A</b>Pickup location</label>
          <div class="field"><select id="tFrom" aria-describedby="tFromErr">${placeOptions('Choose where we pick you up')}</select></div>
          <p class="err" id="tFromErr" role="alert" hidden></p>
        </div>
        <button type="button" class="tswap" id="tSwap" aria-label="Swap pickup and drop-off" disabled>${SWAP}</button>
        <div class="tf" id="tfTo">
          <label for="tTo"><b class="ab" aria-hidden="true">B</b>Drop-off location</label>
          <div class="field"><select id="tTo" aria-describedby="tToErr">${placeOptions('Choose where we take you')}</select></div>
          <p class="err" id="tToErr" role="alert" hidden></p>
        </div>
        <p class="tsum" id="tSum" aria-live="polite" hidden></p>
        <div class="t-acts"><button type="button" class="linkbtn mut" id="tClear" hidden>Clear</button><button type="button" class="btn primary" id="tGo">Continue</button></div>
      </section>
    </div>
    <div class="map-fallback" role="note"><b>The planner isn’t available</b>It needs JavaScript and the interactive map. You can still <a href="#places">browse all ${DESTS.length} places</a> below. To plan a private tour or request an airport transfer, message us on <a href="${waLink(ctx, `Hello ${site.name}, I’d like to plan a private tour or an airport transfer in Sri Lanka.`)}" target="_blank" rel="noopener">WhatsApp</a> or email <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>.</div>
    <div class="pinbanner" id="pinBanner" hidden><span id="pinTxt">Click the map to set your starting point</span><button id="pinCancel">Cancel</button></div>

    <aside class="trip" id="trip" aria-labelledby="tripH" hidden>
      <h2 class="trip-h" id="tripH"><button type="button" class="trip-tg" id="tripTg" aria-expanded="true" aria-controls="tripBody"><span class="t">Your trip</span><span class="c" id="tripCount"></span>${CHEVRON}</button></h2>
      <div class="trip-b" id="tripBody">
        <section class="trip-sec" aria-labelledby="tsStart">
          <h3 class="tagl" id="tsStart">Starting point</h3>
          <label class="field">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg>
            <select id="pkSel" aria-labelledby="tsStart" aria-describedby="pkNote">
              <option value="" disabled selected>Choose where we pick you up</option>
              ${PICKUPS.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('\n              ')}
            </select>
          </label>
          <p class="hint" id="pkNote">Where should we pick you up? We bring you back here at the end.</p>
          <div class="pk-alt"><button type="button" class="linkbtn" id="pinBtn">Or drop a pin on the map</button></div>
        </section>
        <section class="trip-sec" aria-labelledby="tsPlaces">
          <div class="trip-sec-h"><h3 class="tagl" id="tsPlaces">Places to visit</h3><button type="button" class="linkbtn" id="optBtn" hidden>Shortest route</button></div>
          <ol class="tl" id="stops"></ol>
        </section>
        <p class="trip-clear"><button type="button" class="linkbtn mut" id="tripClear">Clear trip</button></p>
      </div>
      <div class="trip-f">
        <button type="button" class="btn ghost" id="addMore" aria-label="Add another destination"><span aria-hidden="true">+ Add another<span class="lg"> destination</span></span></button>
        <button type="button" class="btn primary" id="finishBtn">Finish planning</button>
      </div>
    </aside>
  </section>
</div>

<section class="places" id="places" aria-labelledby="placesH">
  <div class="places-in">
    <div class="places-h">
      <h2 id="placesH">Places you can add to a private tour of Sri Lanka</h2>
      <p>Every place on the map, from the ancient cities of the Cultural Triangle to the tea country, the national parks and the coast. Add any of them to your route and we’ll plan the driving between them.</p>
    </div>
    <ul class="pl-grid">
    ${placeCards(ctx)}
    </ul>
  </div>
</section>
</main>

<div class="dback" id="dback" hidden><article class="dcard" id="dcard" role="dialog" aria-modal="true" aria-labelledby="dcTitle" hidden></article></div>
<div class="mbg" id="mbg" hidden></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}
