// Homepage: the map-first planner from the supplied design, plus a crawlable places index.
// Markup inside <div class="app"> follows design/design-source.html. Dynamic regions
// (#chips, #vehicles, …) are pre-rendered in their initial state so the page
// is complete before JavaScript runs and nothing shifts when it does.
//
// The tour planner is a guided flow (see "Guided trip planner" in README.md):
//   1. the map with one instruction            (.overlay, #guide)
//   2. a place opens as a dialog               (#dback > #dcard)
//   3. the compact itinerary appears           (#trip)
//   4. review, then details, then send         (#mbg, built in src/js/app.js)
// The side panel (#panel) is only used for airport transfers.
import { CATS, DESTS, PICKUPS, VEHICLES } from '../data/destinations.mjs';
import { brand, esc, menu, picture, waLink } from './layout.mjs';

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

function vehicles() {
  return VEHICLES.map(
    (v, i) =>
      `<button class="vcard ${i === 0 ? 'on' : ''}" data-v="${v.id}" aria-pressed="${i === 0}"><span class="rec">${i === 0 ? 'Best fit' : ''}</span><b>${v.name}</b><small>${v.model}</small><span class="cap">Up to ${v.cap} people</span></button>`,
  ).join('');
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
  <div class="top-r"><button class="trip-pill" id="tripPill"><span id="pillLbl">Your trip</span> <b id="pillCount">0</b></button>${menu(ctx)}</div>
</header>

<main id="content">
<div class="app">
  <section class="mapwrap" id="mapwrap" aria-labelledby="h1">
    <div id="map" role="region" aria-label="Map of Sri Lanka with ${DESTS.length} places. Tab to a place and press Enter to open it."></div>
    <div class="shade"></div>
    <div class="overlay">
      <p class="eyebrow">Build your Sri Lanka trip · ${DESTS.length} places</p>
      <h1 id="h1" data-m="tour">Let’s plan your Sri Lanka <em>experience.</em></h1>
      <p class="guide" id="guide" data-k="s1">Start by selecting a destination on the map to explore what you can experience there.</p>
      <div class="search" role="search">
        <label class="sbox">
          ${SEARCH_ICON(18)}
          <input id="q" type="text" placeholder="Search Sigiriya, Ella, leopards…" autocomplete="off" aria-label="Search destinations" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="results">
          <kbd aria-hidden="true">/</kbd>
        </label>
        <ul class="results" id="results" role="listbox" aria-label="Matching places" hidden></ul>
      </div>
      <div class="chips" id="chips" role="group" aria-label="Filter places by type">${chips()}</div>
      <p class="ov-alt"><button type="button" class="linkbtn" id="toShuttle">Only need an airport transfer?</button></p>
    </div>
    <div class="map-fallback" role="note"><b>The interactive map isn’t available</b>You can still <a href="#places">browse all ${DESTS.length} places</a> below, or <a href="${waLink(ctx, `Hello ${site.name}, I’d like to plan a private tour of Sri Lanka.`)}" target="_blank" rel="noopener">plan your trip with us on WhatsApp</a>.</div>
    <div class="gest" id="gest" aria-hidden="true"><span>Use two fingers to move the map</span></div>
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

  <section class="panel" id="panel" aria-labelledby="pTitle">
    <div class="modes" id="modes" role="group" aria-label="What are you booking?"><button data-mode="tour" aria-pressed="false">Tour</button><button data-mode="shuttle" class="on" aria-pressed="true">Airport shuttle</button></div>
    <div class="p-head">
      <div>
        <h2 id="pTitle">Airport transfer</h2>
        <p id="summary">Bandaranaike International · CMB</p>
      </div>
      <button class="linkbtn mut" id="clearBtn" hidden>Clear</button>
    </div>

    <div id="shView">
    <section class="step" aria-labelledby="sh1">
      <div class="step-h"><span class="n">01</span><h3 id="sh1">Trip type</h3></div>
      <div class="dirs" id="shDir" role="group" aria-labelledby="sh1">
        <button class="vcard" data-dir="arr" aria-pressed="true"><b>Arrival</b><small>Airport → hotel</small></button>
        <button class="vcard" data-dir="dep" aria-pressed="false"><b>Departure</b><small>Hotel → airport</small></button>
        <button class="vcard" data-dir="ret" aria-pressed="false"><b>Return</b><small>Both ways</small></button>
      </div>
    </section>

    <section class="step" aria-labelledby="sh2">
      <div class="step-h"><span class="n">02</span><h3 id="sh2">Route</h3></div>
      <div class="shroute" id="shRoute">
        <div class="shrow"><span class="tagl" id="apTag">From</span>
          <div class="chosen fixed"><span class="code">CMB</span><span><b>Bandaranaike International Airport</b><small>Katunayake</small></span></div>
        </div>
        <div class="leg" id="shLeg" hidden></div>
        <div class="shrow"><span class="tagl" id="htTag">To</span>
          <div id="shChosen"></div>
          <div id="shPicker">
            <label class="field">
              ${SEARCH_ICON(16)}
              <input id="shIn" type="text" placeholder="Where are you staying?" autocomplete="off" aria-label="Hotel location" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="shList">
            </label>
            <ul class="pk-list" id="shList" role="listbox" aria-label="Hotel areas" hidden></ul>
            <div class="pk-alt"><button class="linkbtn" id="shPinBtn">Drop a pin on the map</button></div>
          </div>
        </div>
      </div>
    </section>

    <section class="step" aria-labelledby="sh3">
      <div class="step-h"><span class="n">03</span><h3 id="sh3">Flight times</h3><span class="opt">Optional</span></div>
      <div class="flt" id="shArr">
        <span class="tagl" style="display:block;margin-bottom:8px">Arrival flight lands</span>
        <div class="f2">
          <label class="field"><input id="shArrDate" type="date" aria-label="Arrival date"></label>
          <label class="field"><input id="shArrTime" type="time" step="300" aria-label="Landing time"></label>
        </div>
        <p class="hint" id="shArrInfo"></p>
      </div>
      <div class="flt" id="shDep">
        <span class="tagl" style="display:block;margin-bottom:8px">Departure flight leaves</span>
        <div class="f2">
          <label class="field"><input id="shDepDate" type="date" aria-label="Departure date"></label>
          <label class="field"><input id="shDepTime" type="time" step="300" aria-label="Departure time"></label>
        </div>
        <p class="hint" id="shDepInfo"></p>
      </div>
      <p class="hint bad" id="shErr" role="alert" hidden></p>
    </section>
    </div>

    <section class="step" aria-labelledby="st4">
      <div class="step-h"><span class="n">04</span><h3 id="st4">Travellers &amp; vehicle</h3></div>
      <div class="trow"><div><b id="adLbl">Adults</b><small>12 years and over</small></div><div class="stepper" data-k="adults" role="group" aria-labelledby="adLbl"><button data-d="-1" aria-label="Fewer adults">−</button><span id="adults" aria-live="polite">2</span><button data-d="1" aria-label="More adults">+</button></div></div>
      <div class="trow"><div><b id="chLbl">Children</b><small>2–11 years</small></div><div class="stepper" data-k="children" role="group" aria-labelledby="chLbl"><button data-d="-1" aria-label="Fewer children" disabled>−</button><span id="children" aria-live="polite">0</span><button data-d="1" aria-label="More children">+</button></div></div>
      <div class="veh" id="vehicles">${vehicles()}</div>
    </section>

    <div class="cta">
      <p id="ctaHint">Add where you’re staying to request a transfer.</p>
      <button class="btn primary" id="quoteBtn" disabled aria-describedby="ctaHint">Request transfer</button>
    </div>
    <p class="nojs-note">The trip planner needs JavaScript. To plan a private tour, message us on <a href="${waLink(ctx, `Hello ${site.name}, I’d like to plan a private tour of Sri Lanka.`)}" target="_blank" rel="noopener">WhatsApp</a> or email <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>.</p>
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
