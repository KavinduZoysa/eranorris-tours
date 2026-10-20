// Homepage: the map-first planner from the supplied design, plus a crawlable places index.
// Markup inside <div class="app"> follows design/design-source.html. Dynamic regions
// (#chips, #stops, #vehicles, …) are pre-rendered in their initial state so the page
// is complete before JavaScript runs and nothing shifts when it does.
import { CATS, DESTS, VEHICLES } from '../data/destinations.mjs';
import { brand, esc, picture, waLink } from './layout.mjs';

const SEARCH_ICON = (s) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;

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
      ${picture(ph, [['w480', 480], ['w640', 640], ['w800', 800]], { sizes: '(max-width: 600px) calc(100vw - 32px), (max-width: 1240px) 33vw, 300px', alt: d.alt, width: 480, height: 320, attrs: 'loading="lazy" decoding="async"' })}
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
  <button class="trip-pill" id="tripPill"><span id="pillLbl">Your trip</span> <b id="pillCount">0</b></button>
</header>

<main id="content">
<div class="app">
  <section class="mapwrap" id="mapwrap" aria-labelledby="h1">
    <div id="map" role="region" aria-label="Map of Sri Lanka with ${DESTS.length} places. Tab to a place and press Enter to open it."></div>
    <div class="shade"></div>
    <div class="overlay">
      <p class="eyebrow">${DESTS.length} places · one island</p>
      <h1 id="h1" data-m="tour">Plan your Sri Lanka, <em>one stop at a time.</em></h1>
      <p class="lede">Pick places on the map, choose where we collect you and when, and we’ll send a quote for a private tour with your own driver.</p>
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
    <div class="map-fallback" role="note"><b>The interactive map isn’t available</b>You can still <a href="#places">browse all ${DESTS.length} places</a> below, or <a href="${waLink(ctx, `Hello ${site.name}, I’d like to plan a private tour of Sri Lanka.`)}" target="_blank" rel="noopener">plan your trip with us on WhatsApp</a>.</div>
    <div class="gest" id="gest" aria-hidden="true"><span>Use two fingers to move the map</span></div>
    <div class="pinbanner" id="pinBanner" hidden><span id="pinTxt">Click the map to set your pickup point</span><button id="pinCancel">Cancel</button></div>
    <article class="dcard" id="dcard" hidden></article>
  </section>

  <section class="panel" id="panel" aria-labelledby="pTitle">
    <div class="modes" id="modes" role="group" aria-label="What are you booking?"><button data-mode="tour" class="on" aria-pressed="true">Tour</button><button data-mode="shuttle" aria-pressed="false">Airport shuttle</button></div>
    <div class="p-head">
      <div>
        <h2 id="pTitle">Your trip</h2>
        <p id="summary">No stops yet</p>
      </div>
      <button class="linkbtn mut" id="clearBtn" hidden>Clear</button>
    </div>

    <div id="tourView">
    <section class="step" aria-labelledby="st1">
      <div class="step-h"><span class="n">01</span><h3 id="st1">Destinations</h3><button class="linkbtn act" id="optBtn" hidden>Optimise route</button></div>
      <div id="stops"><div class="empty-stops">Click a place on the map or search above to add your first stop. Add as many as you like and we’ll work out the dates.</div></div>
    </section>

    <section class="step" aria-labelledby="st2">
      <div class="step-h"><span class="n">02</span><h3 id="st2">Pickup location</h3></div>
      <div id="pkChosen"></div>
      <div id="pkPicker">
        <label class="field">
          ${SEARCH_ICON(16)}
          <input id="pkIn" type="text" placeholder="Airport, city or hotel area" autocomplete="off" aria-label="Pickup location" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="pkList">
        </label>
        <ul class="pk-list" id="pkList" role="listbox" aria-label="Pickup locations" hidden></ul>
        <div class="pk-alt"><button class="linkbtn" id="pinBtn">Drop a pin on the map</button></div>
      </div>
    </section>

    <section class="step" aria-labelledby="st3">
      <div class="step-h"><span class="n">03</span><h3 id="st3">Start date</h3></div>
      <label class="field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>
        <input id="startDate" type="date" aria-label="Start date" aria-describedby="dateInfo">
      </label>
      <p class="hint" id="dateInfo">Pick the day we collect you. Dates for each stop are worked out from here.</p>
    </section>
    </div>

    <div id="shView" hidden>
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
      <div class="step-h"><span class="n">03</span><h3 id="sh3">Flight times</h3></div>
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
      <p id="ctaHint">Add a destination, a pickup location and a start date to request a quote.</p>
      <button class="btn primary" id="quoteBtn" disabled aria-describedby="ctaHint">Request a quote</button>
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

<div class="mbg" id="mbg" hidden></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}
