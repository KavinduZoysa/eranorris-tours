// The homepage's two services on one map — ported from the supplied design, then reshaped:
//
//   Tour planner     choose a place on the map → explore it in a dialog → "Add to my trip" →
//                    the compact trip panel appears → "Finish planning" → review → details → send.
//   Airport shuttle  choose a pickup (A) and a drop-off (B), from the lists or the map →
//                    "Continue" → travel details → review → "Request Airport Transfer".
//
// The main page shows both as cards; S.mode says which view is on screen ('home', 'tour' or
// 'shuttle'). The tour's state (S.stops, S.pickup, S.exps, …) and the transfer's state (S.tr)
// are kept apart and never change each other. See "Guided trip planner" and "Airport shuttle"
// in README.md. Other changes from the design are commented where they happen (photos,
// accessibility, deep links, real request hand-off).
import L from 'leaflet';
import { AIRPORT_IDS, CATS, DESTS, PICKUPS, SHUTTLE_TIMING, TRANSFER_PLACES, VEHICLES, hav, legInfo, fmtDur, nightsTxt } from '../data/destinations.mjs';
import { EXPERIENCES, EXP_CATS, EXP_KINDS, experiencesFor } from '../data/experiences.mjs';
import { initMenu } from './menu.js';

// Injected at build time (scripts/build.mjs): brand, contact channels, asset URLs.
const SITE = __SITE__;

const D = Object.fromEntries(DESTS.map((d) => [d.id, d]));
const P = Object.fromEntries(PICKUPS.map((p) => [p.id, p]));
const KEY = 'eranorris-trip-v1';
const $ = (s) => document.querySelector(s);
const app = $('.app'),
  trip = $('#trip');
// localStorage can be unavailable (private mode, blocked storage): never let that break the planner.
const store = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  },
  set(v) {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch (e) {}
  },
};
let S = Object.assign({ stops: [], pickup: null, start: '', adults: 2, children: 0 }, store.get());
S.stops = (S.stops || []).filter((s) => D[s.id]);
// Added: selected experiences (ids from src/data/experiences.mjs), saved with the trip like stops.
// Kept independent of the route: choosing one never adds, removes or reorders a stop.
const X = Object.fromEntries(EXPERIENCES.filter((e) => e.available !== false).map((e) => [e.id, e]));
S.exps = [...new Set((S.exps || []).filter((id) => X[id]))];
// Added: a saved trip can hold dates that have since passed. Drop them so a request can never
// go out for a past date; the visitor is told once the planner has loaded.
const ymd = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
const TODAY = ymd(new Date());
let staleDates = false;
if (S.start && S.start < TODAY) (S.start = ''), (staleDates = true);
// Added: the airport shuttle's own state — two locations and a few details. A location is
// { id } from TRANSFER_PLACES, or { id: 'pin', lat, lng } for a pin dropped on the map.
const TL = Object.fromEntries(TRANSFER_PLACES.map((p) => [p.id, p]));
const okLoc = (p) => (p && (p.id === 'pin' ? Number.isFinite(p.lat) && Number.isFinite(p.lng) : !!TL[p.id]) ? p : null);
// (An earlier version saved a transfer as "the airport and one place": carry that over once.)
const oldSh = S.sh && S.sh.place ? (S.sh.dir === 'dep' ? { from: S.sh.place, to: { id: 'cmb' } } : { from: { id: 'cmb' }, to: S.sh.place }) : {};
S.tr = Object.assign({ from: null, to: null, date: '', time: '', pax: 2 }, oldSh, S.tr || {});
S.tr.from = okLoc(S.tr.from);
S.tr.to = okLoc(S.tr.to);
S.tr.pax = Math.max(1, Math.min(20, Math.round(+S.tr.pax) || 2));
if (S.tr.date && S.tr.date < TODAY) (S.tr.date = ''), (S.tr.time = ''), (staleDates = true);
delete S.sh;
delete S.vehicle;
// Which view is on screen: 'home' (the main page's two service cards), 'tour' or 'shuttle'. A
// small inline script chose it before first paint (SVC_BOOT in src/templates/home.mjs): a
// visitor with a trip or transfer in progress, or a link such as /#add=kandy, skips the cards.
S.mode = { tour: 'tour', sh: 'shuttle' }[document.documentElement.getAttribute('data-svc')] || 'home';
let filter = 'all',
  active = null,
  picking = false,
  // Experiences ticked in the dialog of a place that isn't in the trip yet. They join the trip
  // with "Add to my trip" and are dropped by "Close": closing never adds anything.
  draft = null,
  quiet = false; // see focusQuiet()
const save = () => store.set(S);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function dateAt(off) {
  const d = new Date(S.start + 'T00:00:00');
  d.setDate(d.getDate() + off);
  return d;
}
const fmtD = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
// A stop's day numbers, used when no start date has been chosen (a quote doesn't need one).
const dayTxt = (r) => (r.s.nights ? `Day ${r.arrive + 1}–${r.depart + 1}` : `Day ${r.arrive + 1}`);
const fmtDs = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
function pickupPt() {
  if (!S.pickup) return null;
  return S.pickup.id === 'pin' ? S.pickup : P[S.pickup.id];
}
function nearest(pt) {
  let b = null,
    bd = 1e9;
  [...DESTS, ...PICKUPS].forEach((x) => {
    const d = hav(pt, x);
    if (d < bd) {
      bd = d;
      b = x;
    }
  });
  return b;
}
function pickupLabel() {
  const p = S.pickup;
  if (!p) return '';
  return p.id === 'pin' ? 'Pin near ' + (nearest(p).short || nearest(p).name) : P[p.id].short;
}
const pax = () => S.adults + S.children;
function plan() {
  let day = 0,
    drive = 0,
    km = 0;
  const o = pickupPt();
  let prev = o;
  const rows = S.stops.map((s, i) => {
    const d = D[s.id];
    const leg = prev ? legInfo(prev, d) : null;
    if (leg) {
      drive += leg.min;
      km += leg.km;
    }
    const arrive = day;
    day += s.nights;
    prev = d;
    return { s, d, i, leg, arrive, depart: day };
  });
  let ret = null;
  if (o && S.stops.length) {
    ret = legInfo(prev, o);
    drive += ret.min;
    km += ret.km;
  }
  return { rows, ret, nights: day, drive, km };
}
// Changed: guests don't choose a vehicle (tours or transfers). We suggest the smallest one that
// takes the group, and the request says it is a suggestion to be confirmed.
const fitVehicle = (n) => VEHICLES.find((v) => v.cap >= n) || VEHICLES.at(-1);
function toast(t) {
  const el = $('#toast');
  // Added: keep it clear of what the visitor is using. At the top while a dialog is open
  // (its buttons are at the bottom); just above the trip drawer on stacked layouts.
  const dlg = !card.hidden || !mbg.hidden;
  el.classList.toggle('top', dlg);
  const r = !dlg && !trip.hidden && trip.classList.contains('drawer') ? trip.getBoundingClientRect() : null;
  // (+26: a 12px gap, and the drawer may still be sliding up its last 14px.)
  el.style.bottom = r && r.top < window.innerHeight && r.bottom > 0 ? Math.max(28, window.innerHeight - r.top + 26) + 'px' : '';
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}
// A message from the step before must not sit on top of a dialog that has just opened.
const hideToast = () => $('#toast').classList.remove('show');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* map */
const mapwrap = $('#mapwrap');
// Changed: one finger moves the map on touch screens too (it used to need two fingers, so after
// zooming in on a phone a swipe scrolled the page and the map seemed stuck). Two fingers pinch
// to zoom. The page still scrolls from everywhere outside the map: on phones the map stops short
// of the screen's height (app.css), and behind the main page's service cards it is inert.
const coarse = window.matchMedia('(pointer: coarse)').matches;
const map = L.map('map', {
  zoomControl: false,
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  // Changed: was 6.5. Small phones need the island a little smaller to fit under the heading
  // and above the trip drawer.
  minZoom: 6,
  maxZoom: 10.5,
  // Changed: was [[4.4, 77.6], [11, 84]]. That box was too tight for the view to shift the island
  // clear of the overlay on short or narrow screens, so places ended up hidden under the search
  // and chips. Wider limits still keep the island in reach.
  maxBounds: [
    [1.5, 70],
    [15.5, 91],
  ],
  maxBoundsViscosity: 0.8,
});
const zoomCtl = L.control.zoom({ position: 'bottomright' }).addTo(map);
// Added: wording follows the input device ("Tap" on touch screens).
const TAP = coarse ? 'Tap' : 'Click';
// Changed: shorter credits ("Map: Natural Earth, geoBoundaries"), so the line stays on one row
// on small phones instead of wrapping over the places in the south.
map.attributionControl.addAttribution('Map: <a href="https://www.naturalearthdata.com/">Natural Earth</a>');
// Changed: credit added up front (not after the file loads) so the control doesn't grow and shift the zoom buttons.
// Drive times come from OpenStreetMap road data (src/data/route-times.mjs); its licence asks for
// this credit where the data is used, so it sits beside the drive estimates in the two reviews.
const OSM_CREDIT = 'road data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const DIST_CREDIT = '<a href="https://www.geoboundaries.org/" title="District boundaries">geoBoundaries</a>';
map.attributionControl.addAttribution(DIST_CREDIT);
map.createPane('land');
map.getPane('land').style.zIndex = 250;
map.getPane('land').style.pointerEvents = 'none';
// Changed: the map's colours are the design tokens in src/styles/app.css (:root, --map-*), so the
// whole palette lives in one place. The values after || are only used if the styles are missing.
const tokens = getComputedStyle(document.documentElement);
const tok = (name, fallback) => tokens.getPropertyValue(name).trim() || fallback;
const MAPC = {
  line: tok('--map-line', '#E9F1EC'),
  land: tok('--map-land', '#26493E'),
  landHover: tok('--map-land-hover', '#30594B'),
  neighbour: tok('--map-neighbour', '#173A35'),
  coast: tok('--map-coast', '#D9A441'),
};
const grat = { pane: 'land', color: MAPC.line, weight: 1, opacity: 0.05, interactive: false };
// Changed: graticule extended to match the wider bounds.
for (let la = 0; la <= 17; la += 0.5)
  L.polyline(
    [
      [la, 66],
      [la, 95],
    ],
    grat,
  ).addTo(map);
for (let lo = 66; lo <= 95; lo += 0.5)
  L.polyline(
    [
      [-0.5, lo],
      [17.5, lo],
    ],
    grat,
  ).addTo(map);
[
  ['Indian Ocean', 5.25, 81.7, ''],
  ['Bay of Bengal', 9.7, 82.7, ''],
  ['Laccadive Sea', 7.2, 78.9, ''],
  ['Palk Strait', 9.95, 79.55, ''],
  ['India', 10.55, 78.75, 'caps'],
].forEach(([t, la, lo, c]) =>
  L.marker([la, lo], {
    pane: 'land',
    interactive: false,
    keyboard: false,
    icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<span class="sea ${c}">${t}</span>` }),
  }).addTo(map),
);
// Changed: land shapes are pre-extracted from world-atlas at build time (src/geo/land.json)
// instead of fetching the full ~750 KB world file from a CDN and converting it in the browser.
function drawLand(fc) {
  const lk = fc.features.filter((f) => f.properties.name === 'Sri Lanka'),
    ind = fc.features.filter((f) => f.properties.name === 'India');
  L.geoJSON(ind, {
    pane: 'land',
    interactive: false,
    style: { color: MAPC.line, opacity: 0.2, weight: 1, fillColor: MAPC.neighbour, fillOpacity: 1 },
  }).addTo(map);
  distP.then((ok) => {
    if (ok) return;
    L.geoJSON(lk, {
      pane: 'land',
      interactive: false,
      style: { color: MAPC.coast, opacity: 0.22, weight: 10, fill: false },
    }).addTo(map);
    L.geoJSON(lk, {
      pane: 'land',
      interactive: false,
      style: { color: MAPC.line, opacity: 0.75, weight: 1.25, fillColor: MAPC.land, fillOpacity: 1 },
    }).addTo(map);
  });
}
map.createPane('dist');
map.getPane('dist').style.zIndex = 260;
map.createPane('distlbl');
Object.assign(map.getPane('distlbl').style, { zIndex: 270, pointerEvents: 'none' });
const distLbl = {};
const distP = fetch(SITE.assets.districts)
  .then((r) => {
    if (!r.ok) throw 0;
    return r.json();
  })
  .then((gj) => {
    L.geoJSON(gj, {
      pane: 'dist',
      interactive: false,
      style: { color: MAPC.coast, opacity: 0.22, weight: 10, fill: false },
    }).addTo(map);
    L.geoJSON(gj, {
      pane: 'dist',
      interactive: false,
      style: { color: MAPC.line, opacity: 0.8, weight: 2.5, fill: false },
    }).addTo(map);
    const base = {
      color: MAPC.line,
      opacity: 0.2,
      weight: 1,
      fillColor: MAPC.land,
      fillOpacity: 1,
      className: 'dpoly',
    };
    L.geoJSON(gj, {
      pane: 'dist',
      style: () => base,
      onEachFeature: (f, l) => {
        const n = f.properties.name;
        l.on('mouseover', () => {
          l.setStyle({ fillColor: MAPC.landHover, opacity: 0.45 });
          distLbl[n].classList.add('hov');
        });
        l.on('mouseout', () => {
          l.setStyle(base);
          distLbl[n].classList.remove('hov');
        });
      },
    }).addTo(map);
    gj.features.forEach((f) => {
      const n = f.properties.name;
      const m = L.marker(f.properties.lp, {
        pane: 'distlbl',
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<span class="dist">${n}</span>` }),
      }).addTo(map);
      distLbl[n] = m.getElement().firstElementChild;
    });
    requestAnimationFrame(hideSeaLabels);
    return true;
  })
  .catch((e) => {
    console.warn('District boundaries failed to load', e);
    map.attributionControl.removeAttribution(DIST_CREDIT);
    return false;
  });
fetch(SITE.assets.land)
  .then((r) => {
    if (!r.ok) throw 0;
    return r.json();
  })
  .then(drawLand)
  .catch((e) => console.warn('Map geometry failed to load', e));
const isNarrow = () => window.innerWidth <= 900;
// Added: phones in landscape use the side-by-side overlay (as on desktop) — see app.css. Not for
// the airport shuttle: its card needs the width, so it stays above the map there too.
const sideLayout = window.matchMedia('(max-width: 900px) and (max-height: 500px) and (orientation: landscape)');
const stacked = () => window.innerWidth <= 1100 && !(sideLayout.matches && S.mode !== 'shuttle');
function padL() {
  if (stacked()) return 0;
  const o = document.querySelector('.overlay');
  if (!o || o.offsetParent === null) return 0;
  return Math.max(0, o.getBoundingClientRect().right - mapwrap.getBoundingClientRect().left + 16);
}
// Added: the trip panel floats over the right of the map on wide layouts and is a drawer along
// the bottom of the map on stacked ones. The island is fitted clear of it either way.
function padR() {
  if (stacked() || trip.hidden || !trip.offsetWidth) return 40;
  return mapwrap.getBoundingClientRect().right - trip.getBoundingClientRect().left + 24;
}
// Room at the bottom for the credits line and the lowest markers (and the closed trip drawer).
// Crowded markers are pushed apart, so the southern ones can sit a little below their true place.
function padB() {
  if (!stacked()) return 30;
  return trip.hidden ? 44 : Math.min(trip.offsetHeight, 150) + 62;
}
function padT() {
  if (!stacked()) return 30;
  if (S.mode === 'shuttle') return 20; // there the transfer card sits above the map, not over it (app.css)
  const o = document.querySelector('.overlay').getBoundingClientRect(),
    m = mapwrap.getBoundingClientRect();
  return Math.max(30, o.bottom - m.top + 12);
}
// How the current view came about. 'overview': the whole island, refitted when the layout
// changes. 'route': zoomed to a transfer's two locations; changing or clearing one (or
// switching service) puts the overview back. 'user': the visitor panned or zoomed, so the app
// leaves it. Opening a place never moves the map: it opens as a dialog over it.
let view = 'overview';
function fit() {
  view = 'overview';
  map.invalidateSize({ pan: false });
  if (!map.getSize().x) {
    if (!map._loaded) map.setView([7.85, 80.75], 7.5);
    return;
  }
  map.fitBounds(
    [
      [5.92, 79.68],
      [9.83, 81.88],
    ],
    S.mode === 'home'
      ? { paddingTopLeft: [24, 24], paddingBottomRight: [24, 24] } // a backdrop behind the service cards
      : stacked()
        ? { paddingTopLeft: [16, padT()], paddingBottomRight: [16, padB()] }
        : { paddingTopLeft: [padL() + 20, 30], paddingBottomRight: [padR(), 30] },
  );
}
fit();
const userView = () => (view = 'user');
map.on('dragstart', userView);
map.getContainer().addEventListener('wheel', userView, { passive: true });
map.getContainer().addEventListener('touchstart', (e) => e.touches.length > 1 && userView(), { passive: true });
map.getContainer().addEventListener('keydown', (e) => /^(Arrow|\+$|-$|=$)/.test(e.key) && userView());
zoomCtl.getContainer().addEventListener('click', userView, true); // capture: Leaflet stops the buttons' clicks
map.whenReady(() =>
  map.on('zoomstart', (e) => {
    if (e && e.originalEvent) userView();
  }),
);
new ResizeObserver(() => {
  map.invalidateSize({ pan: false });
  if (view === 'overview') fit();
}).observe(mapwrap);
map.on('zoomend', () => mapwrap.classList.toggle('far', map.getZoom() < 7));
mapwrap.classList.toggle('far', map.getZoom() < 7);
const PLANE =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>';
// Opens a marker's place with Enter or Space (markers are focusable).
const openOnKey = (id) => (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  e.stopPropagation();
  openDest(id);
};
const markers = {};
DESTS.forEach((d, i) => {
  // Changed: the design's empty <image-slot> placeholders are filled with the supplied photos.
  // --dl staggers the "you can choose these" pulse (see hintPins).
  const icon = L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div class="pin ${d.pos}" style="--c:${CATS[d.cat].c};--dl:${((i % 5) * 0.14).toFixed(2)}s"><span class="stem"></span><span class="pt"></span><span class="med"><img src="${SITE.assets.photos[d.id].med}" alt="" width="96" height="96" decoding="async"><span class="kw">${d.kw}</span><b class="no"></b></span><span class="lbl">${d.name}</span></div>`,
  });
  const m = L.marker([d.lat, d.lng], { icon, keyboard: true, title: d.name, riseOnHover: true }).addTo(map);
  // Changed: while dropping a pin, tapping a place puts the pin there (it used to do nothing,
  // which on phones made large parts of the map untappable in pin mode).
  m.on('click', () => (picking ? map.fire('click', { latlng: L.latLng(d.lat, d.lng) }) : openDest(d.id)));
  // Added: markers are focusable (Leaflet) — make them announce properly and open with Enter/Space.
  const el = m.getElement();
  el.setAttribute('aria-label', `${d.name}, ${CATS[d.cat].label}: ${d.hl}`);
  el.addEventListener('keydown', openOnKey(d.id));
  markers[d.id] = m;
});
// Added (airport shuttle): the two airports are on the map as well, and can be chosen like a
// place. They are shown only in that service (renderPickupMarker).
const airMarkers = {};
AIRPORT_IDS.forEach((id) => {
  const p = TL[id];
  const m = L.marker([p.lat, p.lng], {
    icon: L.divIcon({ className: '', iconSize: [0, 0], html: `<div class="pk ap"><span class="sq">${PLANE}</span><span class="pl"></span></div>` }),
    keyboard: true,
    title: p.name,
    zIndexOffset: 3100,
  });
  m.on('click', () => (picking ? map.fire('click', { latlng: L.latLng(p.lat, p.lng) }) : openDest(id)));
  // Leaflet builds the marker's element each time it is added to the map.
  m.on('add', () => {
    const el = m.getElement();
    el.setAttribute('aria-label', `${p.name} (${p.code}), airport`);
    el.addEventListener('keydown', openOnKey(id));
  });
  airMarkers[id] = m;
});
function renderPins() {
  DESTS.forEach((d) => {
    const el = markers[d.id].getElement();
    if (!el) return;
    const pin = el.firstElementChild;
    const idx = tripIdx(d.id),
      role = trRole(d.id); // a transfer's pickup or drop-off
    pin.classList.toggle('in', idx > -1);
    pin.classList.toggle('sel', !!role);
    pin.classList.toggle('active', active === d.id);
    // The category filter belongs to the tour planner; the other views show every place.
    pin.classList.toggle('off', S.mode === 'tour' && !(filter === 'all' || d.cat === filter || idx > -1 || active === d.id));
    pin.querySelector('.no').textContent = idx > -1 ? idx + 1 : role ? TBADGE[role] : '';
    markers[d.id].setZIndexOffset(active === d.id ? 2000 : idx > -1 ? 1000 : 0);
    // Added: filtered-out (invisible) markers leave the tab order.
    const off = pin.classList.contains('off');
    el.tabIndex = off ? -1 : 0;
    el.toggleAttribute('aria-hidden', off);
  });
  layoutPins();
}
const pinR = () => {
  const z = map.getZoom();
  return z < 7 ? 16 : z < 8.25 ? 20 : 25;
};
function layoutPins() {
  const R = pinR();
  mapwrap.style.setProperty('--r', R + 'px');
  mapwrap.classList.toggle('tiny', R < 18);
  const items = [];
  DESTS.forEach((d) => {
    const el = markers[d.id].getElement();
    const pin = el && el.firstElementChild;
    if (!pin || pin.classList.contains('off')) return;
    const p = map.latLngToLayerPoint([d.lat, d.lng]);
    const idx = tripIdx(d.id);
    const hs = !!trRole(d.id);
    items.push({
      d,
      pin,
      p,
      x: p.x,
      y: p.y,
      idx,
      hs,
      m: active === d.id ? 6 : idx > -1 || hs ? 3 : 1,
      pr: active === d.id ? 0 : idx > -1 || hs ? 1 : 2,
    });
  });
  const fixed = [];
  fixedMarkers().forEach((m) => {
    const p = map.latLngToLayerPoint(m.getLatLng());
    fixed.push({ x: p.x, y: p.y, r: 16 });
  });
  const rects = [],
    cr0 = map.getContainer().getBoundingClientRect();
  fixedMarkers().forEach((m) => {
    const pl = m.getElement() && m.getElement().querySelector('.pl');
    if (!pl) return;
    const b = pl.getBoundingClientRect(),
      a = map.containerPointToLayerPoint([b.left - cr0.left, b.top - cr0.top]);
    if (!b.width) return; // a hidden label takes no room
    rects.push([a.x - 2, a.y - 2, a.x + b.width + 2, a.y + b.height + 2]);
  });
  const r = R + 4;
  for (let it = 0; it < 90; it++) {
    items.forEach((a) => {
      a.x += (a.p.x - a.x) * 0.05;
      a.y += (a.p.y - a.y) * 0.05;
    });
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        let dx = b.x - a.x,
          dy = b.y - a.y,
          dd = Math.hypot(dx, dy);
        if (dd < 2 * r) {
          if (dd < 0.01) {
            dx = Math.cos(i * 2.4);
            dy = Math.sin(i * 2.4);
            dd = 1;
          }
          const push = 2 * r - dd,
            ux = dx / dd,
            uy = dy / dd,
            wa = b.m / (a.m + b.m),
            wb = a.m / (a.m + b.m);
          a.x -= ux * push * wa;
          a.y -= uy * push * wa;
          b.x += ux * push * wb;
          b.y += uy * push * wb;
        }
      }
      fixed.forEach((f) => {
        let dx = a.x - f.x,
          dy = a.y - f.y,
          dd = Math.hypot(dx, dy);
        if (dd < 0.01) {
          dx = 1;
          dy = -0.6;
          dd = Math.hypot(dx, dy);
        }
        const min = r + f.r;
        if (dd < min) {
          a.x += (dx / dd) * (min - dd);
          a.y += (dy / dd) * (min - dd);
        }
      });
      rects.forEach((q) => {
        if (a.x > q[0] - r && a.x < q[2] + r && a.y > q[1] - r && a.y < q[3] + r) {
          const dl = a.x - (q[0] - r),
            dr = q[2] + r - a.x,
            dt = a.y - (q[1] - r),
            db = q[3] + r - a.y,
            mn = Math.min(dl, dr, dt, db);
          if (mn === dl) a.x -= dl;
          else if (mn === dr) a.x += dr;
          else if (mn === dt) a.y -= dt;
          else a.y += db;
        }
      });
    }
  }
  items.forEach((a) => {
    const dx = a.x - a.p.x,
      dy = a.y - a.p.y,
      len = Math.hypot(dx, dy);
    const med = a.pin.querySelector('.med'),
      st = a.pin.querySelector('.stem');
    med.style.left = dx + 'px';
    med.style.top = dy + 'px';
    a.pin.classList.toggle('moved', len > R * 0.5);
    st.style.width = Math.max(0, len - R) + 'px';
    st.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  });
  placeLabels(items, R);
}
function placeLabels(items, R) {
  if (!items) {
    layoutPins();
    return;
  }
  const obst = [];
  const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  items.forEach((o) => {
    const rd = R + 3;
    obst.push({ id: o.d.id, r: [o.x - rd, o.y - rd, o.x + rd, o.y + rd] });
    if (o.pin.classList.contains('moved'))
      obst.push({ id: o.d.id + 'p', r: [o.p.x - 5, o.p.y - 5, o.p.x + 5, o.p.y + 5] });
    if (o.idx > -1 || o.hs)
      obst.push({ id: o.d.id + 'b', r: [o.x + R - (o.hs ? 42 : 15), o.y - R - 8, o.x + R + 8, o.y - R + 15] });
  });
  fixedMarkers().forEach((m, i) => {
    const el = m.getElement(),
      pl = el && el.querySelector('.pl'),
      p = map.latLngToLayerPoint(m.getLatLng());
    obst.push({ id: 'pk' + i, r: [p.x - 16, p.y - 16, p.x + 16, p.y + 16] });
    if (pl) {
      const cr = map.getContainer().getBoundingClientRect(),
        b = pl.getBoundingClientRect(),
        a = map.containerPointToLayerPoint([b.left - cr.left, b.top - cr.top]);
      if (b.width) obst.push({ id: 'pkl' + i, r: [a.x, a.y, a.x + b.width, a.y + b.height] });
    }
  });
  // Added: on stacked layouts (phones, tablets) a name never runs off the map's edge or under
  // the controls laid over the map (search and chips, zoom buttons, credits, trip bar); it takes
  // another free side of its marker instead. Wide screens keep the design's placement.
  let edge = null;
  if (stacked()) {
    const cr = map.getContainer().getBoundingClientRect(),
      tl = map.containerPointToLayerPoint([4, 4]),
      br = map.containerPointToLayerPoint([cr.width - 4, cr.height - 4]);
    edge = [tl.x, tl.y, br.x, br.y];
    document.querySelectorAll('.overlay>*,.leaflet-control,.trip:not([hidden]),.pinbanner:not([hidden])').forEach((e) => {
      const b = e.getBoundingClientRect();
      if (!b.width) return;
      const a = map.containerPointToLayerPoint([b.left - cr.left, b.top - cr.top]);
      obst.push({ id: 'ui', r: [a.x, a.y, a.x + b.width, a.y + b.height] });
    });
  }
  const inside = (r) => !edge || (r[0] >= edge[0] && r[1] >= edge[1] && r[2] <= edge[2] && r[3] <= edge[3]);
  items.sort((a, b) => a.pr - b.pr);
  const placed = [];
  items.forEach((o) => {
    const l = o.pin.querySelector('.lbl'),
      w = l.offsetWidth,
      h = l.offsetHeight,
      rd = R + 1,
      ox = o.x - o.p.x,
      oy = o.y - o.p.y;
    const C = {
      r: [rd + 6, -h / 2 - 1],
      l: [-rd - 6 - w, -h / 2 - 1],
      t: [-w / 2, -rd - 4 - h],
      b: [-w / 2, rd + 4],
      tr: [rd - 2, -rd - h + 3],
      tl: [-rd + 2 - w, -rd - h + 3],
      br: [rd - 2, rd - 3],
      bl: [-rd + 2 - w, rd - 3],
    };
    let pick = null;
    for (const k of [o.d.pos, 'r', 'l', 't', 'b', 'tr', 'tl', 'br', 'bl']) {
      const [dx, dy] = C[k];
      const rc = [o.x + dx, o.y + dy, o.x + dx + w, o.y + dy + h];
      if (inside(rc) && !obst.some((b) => b.id !== o.d.id && hit(rc, b.r)) && !placed.some((b) => hit(rc, b))) {
        pick = { dx, dy, rc };
        break;
      }
    }
    // A place in the trip always shows its name, even with no free spot for it.
    const forced = !pick && o.pr < 2;
    if (forced) {
      const [dx, dy] = C[o.d.pos];
      pick = { dx, dy, rc: [o.x + dx, o.y + dy, o.x + dx + w, o.y + dy + h] };
    }
    o.pin.classList.toggle('nolbl', !pick);
    // Added: such a name may lie over a neighbour, so it lets taps through to the marker under it.
    o.pin.classList.toggle('lblover', forced);
    if (pick) {
      Object.assign(l.style, {
        left: ox + pick.dx + 'px',
        top: oy + pick.dy + 'px',
        right: 'auto',
        bottom: 'auto',
        transform: 'none',
      });
      placed.push(pick.rc);
    }
  });
  requestAnimationFrame(hideSeaLabels);
  clearTimeout(placeLabels._t);
  placeLabels._t = setTimeout(hideSeaLabels, 380);
}
function hideSeaLabels() {
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return [b.left - 6, b.top - 6, b.right + 6, b.bottom + 6];
  };
  const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const obs = [
    ...document.querySelectorAll(
      '.pin:not(.nolbl):not(.off) .lbl,.pin:not(.off) .med,.pk .pl,.pk .sq,.overlay>*,.leaflet-control,.trip:not([hidden]),.pinbanner:not([hidden])',
    ),
  ].map(rr);
  // Added: on stacked layouts a sea or district name cut by the map's edge is hidden too.
  const m = stacked() && map.getContainer().getBoundingClientRect();
  const cut = (r) => m && (r[0] + 6 < m.left || r[2] - 6 > m.right || r[1] + 6 < m.top || r[3] - 6 > m.bottom);
  document.querySelectorAll('.sea,.dist').forEach((s) => {
    s.style.opacity = '';
    const r = rr(s);
    const h = cut(r) || obs.some((o) => hit(r, o));
    s.style.opacity = h ? '0' : '';
    if (!h) obs.push(r);
  });
}
map.on('moveend', hideSeaLabels);
map.on('zoomend', () => layoutPins());
// Added: on stacked layouts the names are placed again after a pan or a refit too, as the
// map's edges and the controls over it are then in different places relative to the markers.
map.on('moveend', () => stacked() && layoutPins());
document.fonts && document.fonts.ready.then(() => layoutPins());
let pkMarker = null, // tour: the starting point
  trMarkers = []; // transfer: A or B, when it is not a destination or an airport (renderTrMarkers)
// Markers that are not destinations: the destination pins and their names keep clear of them.
const fixedMarkers = () => (S.mode === 'shuttle' ? [...AIRPORT_IDS.map((id) => airMarkers[id]), ...trMarkers] : [pkMarker]).filter((m) => m && map.hasLayer(m));
// Each service marks only its own choices on the map.
function tripIdx(id) {
  return S.mode === 'tour' ? S.stops.findIndex((s) => s.id === id) : -1;
}
function trRole(id) {
  if (S.mode !== 'shuttle') return null;
  return S.tr.from && S.tr.from.id === id ? 'from' : S.tr.to && S.tr.to.id === id ? 'to' : null;
}
function renderPickupMarker() {
  if (pkMarker) {
    map.removeLayer(pkMarker);
    pkMarker = null;
  }
  trMarkers.forEach((m) => map.removeLayer(m));
  trMarkers = [];
  const sh = S.mode === 'shuttle';
  AIRPORT_IDS.forEach((id) => {
    const m = airMarkers[id];
    if (sh && !map.hasLayer(m)) m.addTo(map);
    else if (!sh && map.hasLayer(m)) map.removeLayer(m);
  });
  if (sh) return renderTrMarkers();
  const p = S.mode === 'tour' && pickupPt();
  if (!p) return;
  const isPin = S.pickup.id === 'pin';
  const icon = L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div class="pk ${isPin ? 'drag' : ''}"><span class="sq"></span><span class="pl"><b>Start</b> · ${esc(pickupLabel())}</span></div>`,
  });
  pkMarker = L.marker([p.lat, p.lng], { icon, draggable: isPin, zIndexOffset: 3000, keyboard: false }).addTo(map);
  if (isPin)
    pkMarker.on('dragend', (e) => {
      const ll = e.target.getLatLng();
      S.pickup = { id: 'pin', lat: ll.lat, lng: ll.lng };
      update();
    });
}
const routeLayer = L.layerGroup().addTo(map);
function curve(a, b) {
  const z = 8,
    pa = map.project([a.lat, a.lng], z),
    pb = map.project([b.lat, b.lng], z);
  const mx = (pa.x + pb.x) / 2,
    my = (pa.y + pb.y) / 2,
    dx = pb.x - pa.x,
    dy = pb.y - pa.y;
  const k = 0.16;
  const cx = mx - dy * k,
    cy = my + dx * k;
  const out = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24,
      u = 1 - t;
    out.push(
      map.unproject(
        L.point(u * u * pa.x + 2 * u * t * cx + t * t * pb.x, u * u * pa.y + 2 * u * t * cy + t * t * pb.y),
        z,
      ),
    );
  }
  return out;
}
function renderRoute() {
  routeLayer.clearLayers();
  if (S.mode === 'shuttle') {
    // A transfer: one line from the pickup to the drop-off, once both are chosen.
    const a = trPt('from'),
      b = trPt('to');
    if (!a || !b) return;
    const c = curve(a, b);
    L.polyline(c, { className: 'route-glow', weight: 4, interactive: false }).addTo(routeLayer);
    L.polyline(c, { className: 'route', weight: 2.5, interactive: false }).addTo(routeLayer);
    return;
  }
  if (S.mode !== 'tour') return;
  const o = pickupPt();
  const pts = [];
  if (o) pts.push(o);
  S.stops.forEach((s) => pts.push(D[s.id]));
  for (let i = 0; i < pts.length - 1; i++) {
    const c = curve(pts[i], pts[i + 1]);
    L.polyline(c, { className: 'route-glow', weight: 4, interactive: false }).addTo(routeLayer);
    L.polyline(c, { className: 'route', weight: 2.5, interactive: false }).addTo(routeLayer);
  }
  if (o && S.stops.length) {
    L.polyline(curve(D[S.stops.at(-1).id], o), { className: 'route-ret', weight: 2, interactive: false }).addTo(
      routeLayer,
    );
  }
}

/* filters + search */
function renderChips() {
  const counts = { all: DESTS.length };
  DESTS.forEach((d) => (counts[d.cat] = (counts[d.cat] || 0) + 1));
  $('#chips').innerHTML = [['all', 'All', null], ...Object.entries(CATS).map(([k, v]) => [k, v.label, v.c])]
    .map(
      ([k, l, c]) =>
        `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}" aria-pressed="${filter === k}">${c ? `<i style="--c:${c}"></i>` : ''}${l}<small>${counts[k]}</small></button>`,
    )
    .join('');
}
$('#chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-f]');
  if (!b) return;
  filter = b.dataset.f;
  renderChips();
  renderPins();
});
const q = $('#q'),
  resEl = $('#results');
let res = [],
  hi = 0;
function search() {
  const t = q.value.trim().toLowerCase();
  res = DESTS.map((d) => {
    const n = d.name.toLowerCase();
    let s = 0;
    if (!t) s = 1;
    else if (n.startsWith(t)) s = 4;
    else if (n.includes(t)) s = 3;
    else if ((d.hl + ' ' + CATS[d.cat].label).toLowerCase().includes(t)) s = 2;
    else if (d.desc.toLowerCase().includes(t)) s = 1;
    return { d, s };
  })
    .filter((x) => x.s > 0 && (t || filter === 'all' || x.d.cat === filter))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.d);
  hi = 0;
  renderResults();
}
function renderResults() {
  resEl.hidden = false;
  resEl.innerHTML = res.length
    ? res
        .map((d, i) => {
          const inT = tripIdx(d.id);
          return `<li class="${i === hi ? 'hi' : ''}" data-i="${i}" id="res-${i}" role="option" aria-selected="${i === hi}"><span class="cd" style="--c:${CATS[d.cat].c}"></span><span><span class="nm">${d.name}</span><span class="sb">${CATS[d.cat].label} · ${d.hl}</span></span>${inT > -1 ? `<span class="st">Stop ${inT + 1}</span>` : ''}</li>`;
        })
        .join('')
    : `<li role="option" aria-disabled="true"><span class="none">No places match “${esc(q.value)}”. Try a town, “beach” or “safari”.</span></li>`;
  comboState(q, resEl, res.length ? 'res-' + hi : '');
}
// Added: keeps a text input + popup list in sync for assistive tech (ARIA 1.2 combobox).
function comboState(input, list, activeId) {
  input.setAttribute('aria-expanded', String(!list.hidden));
  if (activeId && !list.hidden) input.setAttribute('aria-activedescendant', activeId);
  else input.removeAttribute('aria-activedescendant');
}
function hideList(input, list) {
  list.hidden = true;
  comboState(input, list, '');
}
q.addEventListener('focus', () => quiet || search());
q.addEventListener('input', search);
q.addEventListener('blur', () => setTimeout(() => hideList(q, resEl), 120));
q.addEventListener('keydown', (e) => {
  if (resEl.hidden) return;
  if (e.key === 'ArrowDown') {
    hi = Math.min(res.length - 1, hi + 1);
    renderResults();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    hi = Math.max(0, hi - 1);
    renderResults();
    e.preventDefault();
  } else if (e.key === 'Enter' && res[hi]) {
    // Added preventDefault: focus moves into the dialog, and the same keypress must not "click" it.
    e.preventDefault();
    pickResult(res[hi], true);
  } else if (e.key === 'Escape') {
    q.blur();
  }
});
resEl.addEventListener('mousedown', (e) => {
  const li = e.target.closest('[data-i]');
  if (li) {
    e.preventDefault();
    pickResult(res[+li.dataset.i]);
  }
});
function pickResult(d, viaKeyboard) {
  q.value = '';
  hideList(q, resEl);
  q.blur();
  openDest(d.id, { ret: viaKeyboard ? q : null });
}

/* destination dialog */
// Changed: a place opens as a dialog over a dimmed map (centred on wide screens, a sheet from
// the bottom on phones) instead of a card in the corner of the map. Opening or closing it never
// changes the trip: only "Add to my trip" does.
const card = $('#dcard'),
  dback = $('#dback');
let cardReturn = null;
// Focus without side effects: no page scroll, and the search box doesn't pop its list open.
function focusQuiet(el) {
  quiet = el === q;
  el.focus({ preventScroll: true });
  quiet = false;
}
// opts.ret: where keyboard focus goes back to when the dialog closes (default: what had focus).
// opts.keepFocus: the caller places focus itself (previous / next place).
function openDest(id, opts = {}) {
  if (picking) return;
  if (card.hidden) {
    cardReturn = opts.ret || document.activeElement;
    hideToast();
  }
  active = id;
  // Experiences ticked for a place that isn't in the trip wait here until it is added.
  draft = S.mode === 'tour' && tripIdx(id) === -1 ? new Set(expsAt(id)) : null;
  renderPins();
  renderCard();
  if (!opts.keepFocus) focusCard();
}
// Focus goes to the dialog's main action ("Add to my trip", "Set as pickup", or "Close").
function focusCard() {
  const t = card.querySelector('.dc-foot .btn.primary') || card.querySelector('.dc-x');
  if (t) t.focus({ preventScroll: true });
}
function closeCard() {
  if (card.hidden) return;
  const lost = card.contains(document.activeElement) || document.activeElement === document.body;
  active = null;
  draft = null;
  card.hidden = true;
  dback.hidden = true;
  document.documentElement.classList.remove('dlg-open');
  renderPins();
  if (lost && cardReturn && cardReturn !== document.body && document.contains(cardReturn)) focusQuiet(cardReturn);
  cardReturn = null;
}
const closeBtn = (primary) => `<button type="button" class="btn ${primary ? 'primary' : 'ghost'}" data-act="close">Close</button>`;
function showCard() {
  card.hidden = false;
  dback.hidden = false;
  document.documentElement.classList.add('dlg-open'); // no scrolling of the page behind the dialog
  renderCardState();
}
// Airport shuttle: the same dialog, for any transfer location. It only says where the place is
// and asks what it should be: the pickup or the drop-off. No activities, no tour planning.
function renderLocCard() {
  const p = TL[active],
    d = D[active];
  const x = `<button type="button" class="dc-x" data-act="close" aria-label="Close ${esc(p.name)}">×</button>`;
  const sizes = '(max-width: 600px) 100vw, 620px';
  let head, meta;
  if (d) {
    const ph = SITE.assets.photos[d.id];
    head = `<div class="dc-img"><picture><source type="image/avif" srcset="${ph.cardAvif[0]} 480w, ${ph.cardAvif[1]} 800w" sizes="${sizes}"><img src="${ph.card[0]}" srcset="${ph.card[0]} 480w, ${ph.card[1]} 800w" sizes="${sizes}" alt="${esc(d.alt)}" width="480" height="192"></picture>${x}</div>`;
    meta = `<span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${d.hl}</span>`;
  } else {
    const air = AIRPORT_IDS.includes(p.id);
    head = `<div class="dc-img plain">${air ? PLANE : '<span class="sq"></span>'}${x}</div>`;
    meta = `${air ? '<span class="tag" style="--c:var(--ocean)">Airport</span>' : ''}<span>${p.code}</span>`;
  }
  card.innerHTML = `<div class="dc-scroll" id="dcScroll">${head}
 <div class="dc-body"><div class="dc-meta">${meta}</div>
 <h2 id="dcTitle">${esc(p.name)}</h2><p>${esc(p.sub)}.</p><dl class="dc-facts" id="dcFacts"></dl></div></div>
 <div class="dc-foot" id="dcActions"></div>`;
  showCard();
}
function renderLocState() {
  const p = TL[active],
    role = trRole(active),
    word = { from: 'pickup', to: 'drop-off' };
  // How far it is from (or to) the other end, when one is already chosen.
  const ok = role ? (role === 'from' ? 'to' : 'from') : S.tr.from ? 'from' : 'to',
    other = trPt(ok);
  const facts = $('#dcFacts');
  facts.hidden = !other;
  if (other) {
    const leg = legInfo(other, p);
    facts.innerHTML = `<div><dt>${ok === 'from' ? 'From' : 'To'} ${esc(trLabel(ok))}</dt><dd>~${fmtDur(leg.min)} · ${leg.km} km (est.)</dd></div>`;
  }
  const btn = (k, label, primary) => `<button type="button" class="btn ${primary ? 'primary' : 'ghost'}" data-act="set${k}">${label}</button>`;
  let foot;
  if (role) foot = `<span class="in-trip"><i>${role === 'from' ? 'A' : 'B'}</i>Your ${word[role]}</span>${btn(ok, `Use as ${word[ok]} instead`, false)}${closeBtn(true)}`;
  else if (S.tr.from && S.tr.to) foot = `${btn('from', 'Change pickup to here', false)}${btn('to', 'Change drop-off to here', false)}${closeBtn(true)}`;
  else {
    // The main action is the end that is still missing: the pickup first.
    const next = S.tr.from ? 'to' : 'from',
      alt = next === 'from' ? 'to' : 'from';
    foot = `${closeBtn(false)}${btn(alt, `Set as ${word[alt]}`, false)}${btn(next, `Set as ${word[next]}`, true)}`;
  }
  $('#dcActions').innerHTML = foot;
}
function renderCard() {
  if (S.mode === 'shuttle') return renderLocCard();
  const d = D[active];
  // Changed: photo instead of an empty image slot; added a crawlable link to the place page.
  const ph = SITE.assets.photos[d.id];
  const sizes = '(max-width: 600px) 100vw, 620px';
  card.innerHTML = `<div class="dc-scroll" id="dcScroll"><div class="dc-img"><picture><source type="image/avif" srcset="${ph.cardAvif[0]} 480w, ${ph.cardAvif[1]} 800w" sizes="${sizes}"><img src="${ph.card[0]}" srcset="${ph.card[0]} 480w, ${ph.card[1]} 800w" sizes="${sizes}" alt="${esc(d.alt)}" width="480" height="192"></picture><button type="button" class="dc-x" data-act="close" aria-label="Close ${esc(d.name)}">×</button><div class="dc-nav"><button type="button" data-act="prev" aria-label="Previous place">←</button><button type="button" data-act="next" aria-label="Next place">→</button></div></div>
 <div class="dc-body"><div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${d.hl}</span></div>
 <h2 id="dcTitle">${d.name}</h2><p>${d.desc} <a class="dc-more" href="${SITE.base}/places/${d.id}/">More about ${d.name}<span aria-hidden="true"> →</span></a></p><dl class="dc-facts" id="dcFacts"></dl>${expBlock(d)}</div></div>
 <div class="dc-foot" id="dcActions"></div>`;
  showCard();
}

/* experiences (added) */
// The dialog's "Things to do" list starts open; if a visitor closes it, it stays closed for the next place.
let expOpen = true;
const expsAt = (id) => S.exps.filter((x) => X[x].destinationId === id);
const expMeta = (e) => [EXP_KINDS[e.kind], EXP_CATS[e.category], e.duration, e.price].filter(Boolean).map(esc).join(' · ');
// Excursions say where they are: they need extra travel.
const expExtra = (e) => (e.kind === 'excursion' && e.where ? `<span class="exp-w">${esc(e.where)}</span>` : '');
function expBlock(d) {
  const xs = experiencesFor(d.id);
  if (!xs.length) return '';
  const item = (e) => {
    const th = e.image && SITE.assets.expPhotos[e.image];
    return `<li><label class="exp${th ? ' has-th' : ''}"><input type="checkbox" value="${e.id}" aria-labelledby="xn-${e.id}" aria-describedby="xd-${e.id}"><span class="exp-ck" aria-hidden="true"></span>${th ? `<img src="${th}" alt="" width="40" height="40" loading="lazy" decoding="async">` : ''}<span class="exp-b"><span class="exp-n" id="xn-${e.id}">${esc(e.name)}${e.featured ? ' <span class="exp-f">Featured</span>' : ''}</span><span class="exp-m">${expMeta(e)}</span>${expExtra(e)}<span class="exp-d" id="xd-${e.id}">${esc(e.shortDescription)}</span></span></label></li>`;
  };
  return `<div class="dc-exp" id="dcExp"><button type="button" class="dc-exp-t" data-act="exp" aria-expanded="${expOpen}" aria-controls="dcExpList"><span>Things to do in ${esc(d.name)} <span class="n">${xs.length}</span></span><span class="sel" id="dcExpSel"></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
 <div id="dcExpList"${expOpen ? '' : ' hidden'}><ul class="exp-list" aria-label="Things to do in ${esc(d.name)}">${xs.map(item).join('')}</ul><p class="exp-note" id="dcExpNote"></p></div></div>`;
}
// For a place that is already in the trip (the dialog, or the review step).
function toggleExp(id, on) {
  if (on === S.exps.includes(id)) return;
  S.exps = on ? [...S.exps, id] : S.exps.filter((x) => x !== id);
  update();
  toast(`${X[id].name} ${on ? 'added to' : 'removed from'} your trip`);
}
// Places with selected experiences: in route order, then those not (or no longer) in the route.
function expGroups() {
  const ids = [...new Set(S.exps.map((x) => X[x].destinationId))];
  const inRoute = S.stops.map((s) => s.id).filter((id) => ids.includes(id));
  return { inRoute, outside: ids.filter((id) => !inRoute.includes(id)) };
}
card.addEventListener('change', (e) => {
  if (!e.target.matches('#dcExpList input[type=checkbox]')) return;
  if (!draft) return toggleExp(e.target.value, e.target.checked);
  if (e.target.checked) draft.add(e.target.value);
  else draft.delete(e.target.value);
  renderCardState();
});
function renderCardState() {
  if (!active || card.hidden) return;
  if (S.mode === 'shuttle') return renderLocState();
  const d = D[active];
  const close = closeBtn;
  // Added: keep the experience checkboxes in step with the trip (or with the ticks waiting here).
  const ex = $('#dcExp');
  if (ex) {
    ex.querySelectorAll('input[type=checkbox]').forEach((i) => (i.checked = draft ? draft.has(i.value) : S.exps.includes(i.value)));
    const n = draft ? draft.size : expsAt(d.id).length;
    $('#dcExpSel').textContent = n ? `${n} selected` : '';
    $('#dcExpNote').textContent = draft
      ? `Tick what you’d like to do. Your choices are kept when you add ${d.name} to your trip. Choosing one isn’t a booking, and it doesn’t change your route.`
      : 'Ticked experiences are part of your trip request. Choosing one isn’t a booking, and it doesn’t change your route.';
  }
  const idx = S.stops.findIndex((s) => s.id === d.id);
  let from = null,
    fromL = '';
  if (idx === -1) {
    if (S.stops.length) {
      from = D[S.stops.at(-1).id];
      fromL = from.name;
    } else {
      from = pickupPt() || P.cmb;
      fromL = S.pickup ? pickupLabel() : 'CMB Airport';
    }
  } else if (idx > 0) {
    from = D[S.stops[idx - 1].id];
    fromL = from.name;
  } else if (S.pickup) {
    from = pickupPt();
    fromL = 'your starting point';
  }
  const leg = from ? legInfo(from, d) : null;
  $('#dcFacts').innerHTML =
    `<div><dt>${idx > -1 ? 'Your stay' : 'Suggested stay'}</dt><dd>${nightsTxt(idx > -1 ? S.stops[idx].nights : d.nights)}</dd></div>${leg ? `<div><dt>From ${esc(fromL)}</dt><dd>~${fmtDur(leg.min)} drive (est.)</dd></div>` : ''}`;
  $('#dcActions').innerHTML =
    idx > -1
      ? `<span class="in-trip"><i>${idx + 1}</i>In your trip</span><button type="button" class="btn ghost" data-act="remove">Remove from my trip</button>${close(true)}`
      : `${close(false)}<button type="button" class="btn primary" data-act="add">Add to my trip</button>`;
}
// "Add to my trip": the place joins the trip with whatever was ticked, and the dialog closes.
function addFromCard() {
  const id = active;
  if (draft) S.exps = [...S.exps.filter((x) => X[x].destinationId !== id), ...draft];
  closeCard();
  addStop(id);
}
card.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'close') closeCard();
  else if (act === 'add') addFromCard();
  else if (act === 'setfrom' || act === 'setto') {
    const id = active; // a transfer's pickup or drop-off; the dialog closes like "Add to my trip"
    closeCard();
    setTr(act === 'setfrom' ? 'from' : 'to', { id });
  } else if (act === 'remove') {
    const id = active;
    removeStop(id);
    draft = new Set(expsAt(id)); // not in the trip any more: its ticks wait for "Add to my trip" again
    renderCardState();
    focusCard();
  } else if (act === 'exp') {
    expOpen = !expOpen;
    a.setAttribute('aria-expanded', String(expOpen));
    $('#dcExpList').hidden = !expOpen;
  } else {
    const list = DESTS.filter((d) => filter === 'all' || d.cat === filter);
    let i = list.findIndex((d) => d.id === active);
    i = (i + (act === 'next' ? 1 : -1) + list.length) % list.length;
    openDest(list[i].id, { keepFocus: true });
    $('#dcScroll').scrollTop = 0;
    card.querySelector(`[data-act="${act}"]`).focus({ preventScroll: true });
  }
});
dback.addEventListener('click', (e) => {
  if (e.target === dback) closeCard();
});
// Added: dialogs keep Tab inside them.
function trapTab(box, e) {
  if (e.key !== 'Tab') return;
  const els = [...box.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex="-1"]:focus')].filter(
    (x) => x.offsetParent !== null,
  );
  if (!els.length) return;
  const first = els[0],
    last = els.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
card.addEventListener('keydown', (e) => trapTab(card, e));

/* trip ops */
function addStop(id) {
  if (S.stops.some((s) => s.id === id)) return;
  S.stops.push({ id, nights: D[id].nights });
  update();
  toast(`${D[id].name} added to your trip!`);
}
function removeStop(id) {
  const d = D[id];
  S.stops = S.stops.filter((s) => s.id !== id);
  update();
  // Changed: experiences chosen there are kept (the review step lists them as "also interested in"), never dropped silently.
  const n = expsAt(id).length;
  toast(n ? `${d.name} removed · ${n === 1 ? 'its experience stays' : `its ${n} experiences stay`} in your request as “also interested in”` : `${d.name} removed from your trip`);
}
// Added: move a place one step earlier or later in the route.
function moveStop(id, by) {
  const i = S.stops.findIndex((s) => s.id === id),
    j = i + by;
  if (i < 0 || j < 0 || j >= S.stops.length) return;
  [S.stops[i], S.stops[j]] = [S.stops[j], S.stops[i]];
  update();
  toast(`${D[id].name} is now stop ${j + 1}`);
}
function tourCost(order, o, closed) {
  let c = 0,
    prev = o;
  order.forEach((s) => {
    c += hav(prev, D[s.id]);
    prev = D[s.id];
  });
  if (closed) c += hav(prev, o);
  return c;
}
function optimise() {
  const closed = !!S.pickup,
    o = pickupPt() || P.cmb;
  let rest = S.stops.slice(),
    order = [],
    cur = o;
  while (rest.length) {
    let bi = 0,
      bd = 1e9;
    rest.forEach((s, i) => {
      const d = hav(cur, D[s.id]);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    order.push(rest[bi]);
    cur = D[rest[bi].id];
    rest.splice(bi, 1);
  }
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 1; i++)
      for (let j = i + 1; j < order.length; j++) {
        const t = order.slice(0, i).concat(order.slice(i, j + 1).reverse(), order.slice(j + 1));
        if (tourCost(t, o, closed) < tourCost(order, o, closed) - 0.01) {
          order = t;
          improved = true;
        }
      }
  }
  const before = plan().drive;
  const same = order.every((s, i) => s.id === S.stops[i].id);
  if (same) {
    toast('Your places are already in the shortest order');
    return;
  }
  S.stops = order;
  update();
  const saved = before - plan().drive;
  toast(saved >= 10 ? `Route reordered · about ${fmtDur(saved)} less driving` : 'Route reordered');
}
$('#optBtn').onclick = optimise;
$('#tripClear').onclick = () => {
  if (!window.confirm('Clear your trip? This removes your places, experiences and starting point.')) return;
  S.stops = [];
  S.exps = [];
  S.pickup = null;
  S.start = '';
  pkErr = false;
  update();
  toast('Trip cleared');
};

/* trip panel (added): the compact itinerary, shown once a place is in the trip */
const tripTg = $('#tripTg'),
  tripBody = $('#tripBody'),
  pkSel = $('#pkSel');
// Open or closed is the visitor's choice once they use the toggle. Until then the layout decides:
// open beside the map on wide screens, closed on small ones (a drawer along the bottom of the
// map; a small card on phones held sideways).
let tripOpen = null;
const tripRoomy = () => !stacked() && !sideLayout.matches;
function setTripOpen(on) {
  tripOpen = on;
  renderTripOpen();
}
function renderTripOpen() {
  const on = tripOpen ?? tripRoomy();
  trip.classList.toggle('drawer', stacked()); // app.css styles the two layouts from these classes
  trip.classList.toggle('shut', !on);
  tripTg.setAttribute('aria-expanded', String(on));
  tripBody.hidden = !on;
  syncTripH();
}
// Stacked layouts: the map's zoom buttons sit above the closed drawer, so it never covers them.
function syncTripH() {
  const h = stacked() && !trip.hidden ? trip.offsetHeight - (tripBody.hidden ? 0 : tripBody.offsetHeight) : 0;
  mapwrap.style.setProperty('--trip-h', (h ? h + 12 : 0) + 'px');
}
new ResizeObserver(syncTripH).observe(trip);
tripTg.onclick = () => setTripOpen(tripBody.hidden);
function renderTrip() {
  const n = S.stops.length,
    show = S.mode === 'tour' && n > 0;
  app.classList.toggle('has-trip', show);
  if (trip.hidden === show) {
    // The panel arrives with the first place and leaves with the last one.
    if (!show && trip.contains(document.activeElement)) map.getContainer().focus({ preventScroll: true });
    trip.hidden = !show;
    if (view === 'overview') requestAnimationFrame(fit);
  }
  if (!show) return syncTripH();
  const p = plan();
  $('#tripCount').textContent = `${n} ${n === 1 ? 'place' : 'places'} · ${p.nights + 1} ${p.nights ? 'days' : 'day'}`;
  $('#optBtn').hidden = n < 2;
  renderStops();
  renderPickup();
  renderTripOpen();
}
// Short on purpose: names, nights and a count of experiences. The review step has the detail.
function renderStops() {
  const n = S.stops.length;
  $('#stops').innerHTML = S.stops
    .map((s, i) => {
      const d = D[s.id],
        k = expsAt(s.id).length;
      return `<li class="tl-i"><span class="num">${i + 1}</span><span class="tl-b"><button type="button" class="tl-n" data-open="${d.id}">${d.name}</button><span class="tl-s">${nightsTxt(s.nights)}${k ? ` · ${k} ${k === 1 ? 'experience' : 'experiences'}` : ''}</span></span><span class="tl-a"><button type="button" class="mv" data-mv="${d.id}" data-d="-1" aria-label="Move ${esc(d.name)} earlier"${i ? '' : ' disabled'}>↑</button><button type="button" class="mv" data-mv="${d.id}" data-d="1" aria-label="Move ${esc(d.name)} later"${i < n - 1 ? '' : ' disabled'}>↓</button><button type="button" class="rm" data-rm="${d.id}" aria-label="Remove ${esc(d.name)} from your trip">×</button></span></li>`;
    })
    .join('');
}
$('#stops').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.open) openDest(t.dataset.open);
  else if (t.dataset.rm) {
    const i = S.stops.findIndex((s) => s.id === t.dataset.rm);
    removeStop(t.dataset.rm);
    // The list re-renders: keep keyboard focus on the next place's button (or the last one).
    const rms = document.querySelectorAll('#stops .rm');
    (rms[i] || rms[i - 1])?.focus();
  } else if (t.dataset.mv) {
    moveStop(t.dataset.mv, +t.dataset.d);
    const again = $(`#stops [data-mv="${t.dataset.mv}"][data-d="${t.dataset.d}"]`);
    const other = $(`#stops [data-mv="${t.dataset.mv}"][data-d="${-t.dataset.d}"]`);
    (again && !again.disabled ? again : other)?.focus();
  }
});
$('#addMore').onclick = () => {
  if (stacked()) setTripOpen(false); // give the map back
  if (isNarrow()) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  hintPins();
  if (coarse) toast('Tap another place on the map to explore it');
  else q.focus({ preventScroll: true }); // opens the list of places
};
$('#finishBtn').onclick = () => {
  if (S.pickup) return openReview();
  // Easy recovery: say what is missing and put the visitor on it.
  pkErr = true;
  setTripOpen(true);
  renderPickup();
  pkSel.focus();
};

/* starting point: where the trip begins and ends (S.pickup), kept apart from the places to visit */
let pkErr = false; // "Finish planning" was pressed before a starting point was chosen
pkSel.addEventListener('change', () => {
  if (pkSel.value && pkSel.value !== 'pin') setPickup({ id: pkSel.value });
});
function setPickup(p) {
  S.pickup = p;
  pkErr = false;
  update();
  const pt = pickupPt();
  if (p.id !== 'pin')
    map.panInside([pt.lat, pt.lng], {
      paddingTopLeft: [stacked() ? 20 : padL() + 60, stacked() ? padT() + 10 : 60],
      paddingBottomRight: [padR() + 20, padB() + 30],
    });
  toast('Starting point set · ' + pickupLabel());
}
function startPin(t) {
  pinTarget = t === 'from' || t === 'to' ? t : 'tour';
  $('#pinTxt').textContent =
    pinTarget === 'tour' ? `${TAP} the map to set your starting point` : `${TAP} the map to set your ${TWORD[pinTarget].toLowerCase()} point`;
  picking = true;
  mapwrap.classList.add('picking'); // also hides the trip panel, so the whole map can be used
  $('#pinBanner').hidden = false;
  closeCard();
  const behavior = reduceMotion() ? 'auto' : 'smooth';
  // Bring the map into view: at the top of the page for a tour; below the transfer card otherwise.
  if (pinTarget === 'tour') isNarrow() && window.scrollTo({ top: 0, behavior });
  else if (stacked()) mapwrap.scrollIntoView({ block: 'end', behavior });
  $('#pinCancel').focus({ preventScroll: true });
}
function stopPin() {
  const back = mapwrap.contains(document.activeElement);
  picking = false;
  mapwrap.classList.remove('picking');
  $('#pinBanner').hidden = true;
  syncTripH();
  if (pinTarget === 'tour') {
    if (back && !trip.hidden && !tripBody.hidden) $('#pinBtn').focus({ preventScroll: true });
  } else {
    if (stacked()) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    TSEL[pinTarget].focus({ preventScroll: true });
  }
}
$('#pinBtn').onclick = () => startPin();
$('#pinCancel').onclick = stopPin;
map.on('click', (e) => {
  if (picking) {
    stopPin();
    const pp = { id: 'pin', lat: e.latlng.lat, lng: e.latlng.lng };
    pinTarget === 'tour' ? setPickup(pp) : setTr(pinTarget, pp);
  }
});
function renderPickup() {
  const isPin = !!S.pickup && S.pickup.id === 'pin';
  let o = pkSel.querySelector('option[value="pin"]');
  if (isPin) {
    if (!o) pkSel.add((o = new Option('', 'pin')));
    o.textContent = pickupLabel();
  } else if (o) o.remove();
  pkSel.value = S.pickup ? S.pickup.id : '';
  const note = $('#pkNote'),
    miss = pkErr && !S.pickup;
  note.classList.toggle('bad', miss);
  note.textContent = miss
    ? 'Please choose where we pick you up, then press “Finish planning” again.'
    : !S.pickup
      ? 'Where should we pick you up? We bring you back here at the end.'
      : isPin
        ? 'Drag the pin on the map to adjust it. We pick you up and bring you back here.'
        : `${P[S.pickup.id].sub}. We pick you up and bring you back here.`;
}

/* guidance (added): one line under the heading that says what to do next */
const guide = $('#guide');
const GUIDE = {
  home: guide.innerHTML, // the main page, as it was built
  // tour planner
  s1: 'Start by selecting a destination on the map to explore what you can experience there.',
  s2: 'Great! Now select another destination, or <button type="button" class="linkbtn" data-start>set your starting point</button>.',
  s3: 'Add more places from the map, or choose <b>Finish planning</b> when your trip looks right.',
  // airport shuttle
  t0: 'Choose your pickup and drop-off locations to request your private airport transfer.',
  ta: 'Now choose your drop-off location, from the list or on the map.',
  tb: 'Now choose your pickup location, from the list or on the map.',
  t2: 'Your transfer is set. Choose <b>Continue</b> to add your travel details.',
};
function renderGuide() {
  const k =
    S.mode === 'home'
      ? 'home'
      : S.mode === 'shuttle'
        ? S.tr.from && S.tr.to
          ? 't2'
          : S.tr.from
            ? 'ta'
            : S.tr.to
              ? 'tb'
              : 't0'
        : !S.stops.length
          ? 's1'
          : !S.pickup
            ? 's2'
            : 's3';
  if (guide.dataset.k === k) return;
  guide.dataset.k = k;
  guide.innerHTML = GUIDE[k];
  requestAnimationFrame(hideSeaLabels);
}
guide.addEventListener('click', (e) => {
  if (!e.target.closest('[data-start]')) return;
  setTripOpen(true);
  pkSel.focus();
});
// A short, soft pulse on the markers shows that they can be chosen (app.css: .pulse). It stops
// by itself after a few seconds and does not run for visitors who prefer reduced motion.
let pulseT;
function hintPins() {
  mapwrap.classList.remove('pulse');
  void mapwrap.offsetWidth; // restart the animation
  mapwrap.classList.add('pulse');
  clearTimeout(pulseT);
  pulseT = setTimeout(() => mapwrap.classList.remove('pulse'), 6000);
}

/* travellers */
function stepTrav(k, by) {
  const v = S[k] + by;
  if (k === 'adults' && v < 1) return;
  if (v < 0 || v + (k === 'adults' ? S.children : S.adults) > 20) return;
  S[k] = v;
  update();
}
const tourVehicle = () => fitVehicle(pax());

/* the header's trip button (phones): only while a tour is being planned */
function renderSummary() {
  const n = S.stops.length;
  $('#tripPill').hidden = !(S.mode === 'tour' && n); // nothing to jump to until a place is in the trip
  $('#pillCount').textContent = n;
}
$('#tripPill').onclick = () => {
  window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  setTripOpen(true);
  tripTg.focus({ preventScroll: true });
};

/* request dialog: review, then details, then send (tours); details, then review, then send (transfers) */
const mbg = $('#mbg');
let hotel = 'Mid-range';
// Added: dialog focus handling — remember the opener, trap Tab inside, restore on close.
let modalReturn = null;
// Added: what the visitor typed is kept if the dialog is closed or a step is revisited.
// It lives in memory only and is never saved on the device.
// (name, email and phone are shared by the two services; the rest belong to one of them.)
const qd = { name: '', email: '', phone: '', country: '', notes: '', flight: '', luggage: '', tnotes: '' };
function showModal(html, focusSel) {
  if (mbg.hidden) {
    modalReturn = document.activeElement;
    hideToast();
  }
  mbg.innerHTML = html;
  mbg.hidden = false;
  document.body.style.overflow = 'hidden';
  const f = $('#qform');
  if (f) f.onsubmit = submitQuote;
  const t = mbg.querySelector(focusSel);
  if (t) setTimeout(() => t.focus(), 50);
}
mbg.addEventListener('keydown', (e) => trapTab(mbg, e));
// Added: chosen experiences in the quote summary, grouped under their places.
const mExp = (id) => {
  const xs = expsAt(id);
  return xs.length ? `<ul class="m-exp">${xs.map((x) => `<li>${esc(X[x].name)}</li>`).join('')}</ul>` : '';
};
function mAlso() {
  const { outside } = expGroups();
  return outside.length
    ? `<div class="m-also"><p class="m-also-h">Also interested in · not in the route</p><ul class="m-stops">${outside.map((id) => `<li><span class="n"></span><span class="nm">${D[id].name}</span><span class="dt"></span>${mExp(id)}</li>`).join('')}</ul></div>`
    : '';
}
// Chosen experiences under a place, each with a remove button (review step).
function expListHtml(id) {
  const xs = expsAt(id);
  return xs.length
    ? `<ul class="s-exp" aria-label="Experiences in ${esc(D[id].name)}">${xs.map((x) => `<li><span>${esc(X[x].name)}</span><button type="button" class="rmx" data-rmx="${x}" aria-label="Remove ${esc(X[x].name)}">×</button></li>`).join('')}</ul>`
    : '';
}
// Experiences whose place is not (or no longer) in the route: still sent, as "also interested in".
function expOutsideHtml() {
  const { outside } = expGroups();
  if (!outside.length) return '';
  return `<div class="exp-out"><p class="tagl">Also interested in · places not in your route</p>${outside
    .map((id) => `<div class="exp-out-g"><div class="exp-out-h"><span class="rv-nm">${D[id].name}</span><button type="button" class="linkbtn" data-addstop="${id}">Add ${D[id].name} to my trip</button></div>${expListHtml(id)}</div>`)
    .join('')}</div>`;
}
const stopWhen = (r) => (!S.start ? dayTxt(r) : r.s.nights ? `${fmtDs(dateAt(r.arrive))} – ${fmtDs(dateAt(r.depart))}` : fmtD(dateAt(r.arrive)));
const daysTxt = (p) => `${p.nights + 1} ${p.nights ? 'days' : 'day'}, ${p.nights} ${p.nights === 1 ? 'night' : 'nights'}`;

// Step 1 of 2: the whole trip in order, with the starting point shown apart from the places.
function reviewRoute() {
  const p = plan(),
    from = esc(pickupLabel());
  let h = `<div class="endpt"><span class="ic"></span><span><b>Starting point</b> · ${from}</span></div><ol class="stops">`;
  p.rows.forEach((r) => {
    if (r.leg) h += `<li class="leg">~${fmtDur(r.leg.min)} · ${r.leg.km} km</li>`;
    h += `<li class="stop"><span class="num">${r.i + 1}</span><div><span class="rv-nm">${r.d.name}</span><div class="s-sub">${stopWhen(r)}</div></div>
  <div class="stepper wide" role="group" aria-label="Nights in ${esc(r.d.name)}"><button type="button" data-n="${r.d.id}" data-d="-1" ${r.s.nights <= 0 ? 'disabled' : ''} aria-label="Fewer nights in ${esc(r.d.name)}">−</button><span>${r.s.nights}<small>${r.s.nights === 1 ? 'night' : 'nights'}</small></span><button type="button" data-n="${r.d.id}" data-d="1" ${r.s.nights >= 14 ? 'disabled' : ''} aria-label="More nights in ${esc(r.d.name)}">+</button></div>${expListHtml(r.d.id)}</li>`;
  });
  if (p.ret) h += `<li class="leg ret">~${fmtDur(p.ret.min)} · ${p.ret.km} km</li>`;
  return h + `</ol><div class="endpt"><span class="ic"></span><span><b>Back to</b> · ${from}</span></div>`;
}
function reviewSum() {
  const p = plan(),
    n = S.stops.length,
    k = S.exps.length;
  return `<div><dt>Trip length</dt><dd>${daysTxt(p)}</dd></div><div><dt>You chose</dt><dd>${n} ${n === 1 ? 'place' : 'places'}${k ? `, ${k} ${k === 1 ? 'experience' : 'experiences'}` : ''}</dd></div><div><dt>Driving (est.)</dt><dd>~${fmtDur(p.drive)} · ${p.km} km</dd></div>`;
}
function openReview() {
  showModal(
    `<div class="modal rv" role="dialog" aria-modal="true" aria-labelledby="mTitle" aria-describedby="mLede"><button type="button" class="m-close" data-close aria-label="Close">×</button>
 <div class="rv-body">
  <p class="m-step">Step 1 of 2 · Review</p>
  <h2 id="mTitle" tabindex="-1">Your Sri Lanka trip is taking shape!</h2>
  <p class="rv-lede" id="mLede">Review your selected destinations and tell us a little about your travel plans. We’ll help you arrange your private experience.</p>
  <h3 class="tagl">Your selected destinations</h3>
  <div class="rv-route" id="rvRoute">${reviewRoute()}</div>
  <dl class="rv-sum" id="rvSum">${reviewSum()}</dl>
  <p class="hint">Drive times and distances are rough estimates, not guaranteed journey times (${OSM_CREDIT}). You can change the nights here; to add, remove or reorder places, choose “Edit my trip”.</p>
  <div id="rvOut">${expOutsideHtml()}</div>
 </div>
 <div class="rv-foot"><button type="button" class="btn ghost" data-act="edit">Edit my trip</button><button type="button" class="btn primary" data-act="details">Continue</button></div></div>`,
    '#mTitle',
  );
}
function refreshReview() {
  if (!$('#rvRoute')) return;
  $('#rvRoute').innerHTML = reviewRoute();
  $('#rvSum').innerHTML = reviewSum();
  $('#rvOut').innerHTML = expOutsideHtml();
}

// Step 2 of 2: when, how many, and how to reach the visitor. No vehicle choice (see tourVehicle).
function dateInfo() {
  const p = plan();
  return S.start
    ? `${fmtD(dateAt(0))} to <b>${fmtD(dateAt(p.nights))}</b> · ${daysTxt(p)}`
    : 'Not sure yet? Leave it empty: you can ask for a quote without dates.';
}
function openDetails() {
  const p = plan();
  const v = (k) => esc(qd[k]);
  showModal(
    `<div class="modal dt" role="dialog" aria-modal="true" aria-labelledby="mTitle">
 <div class="m-sum"><p class="eyebrow">Your trip</p><h3>${p.nights + 1} ${p.nights ? 'days' : 'day'} in Sri Lanka</h3>
  <ol class="m-stops">${p.rows.map((r) => `<li><span class="n">${String(r.i + 1).padStart(2, '0')}</span><span class="nm">${r.d.name}</span><span class="dt">${nightsTxt(r.s.nights)}</span>${mExp(r.d.id)}</li>`).join('')}</ol>${mAlso()}
  <dl class="m-facts"><div><dt>Starting point</dt><dd>${esc(pickupLabel())}</dd></div><div><dt>Driving (est.)</dt><dd>~${fmtDur(p.drive)} · ${p.km} km</dd></div></dl></div>
 <form class="m-form" id="qform" novalidate><button type="button" class="m-close" data-close aria-label="Close">×</button>
  <p class="m-step">Step 2 of 2 · Your details</p>
  <h2 id="mTitle" tabindex="-1">Request your private tour</h2><p>Tell us when you’d like to travel and how to reach you. ${SITE.quoteEndpoint ? 'We’ll reply with a quote and our suggestions.' : 'On the next screen you send your request to us on WhatsApp or by email, and we reply with a quote and our suggestions.'} Nothing is booked until you confirm it with us.</p>
  <div class="fl" data-f="date"><label for="qDate">Preferred start date (optional)</label><div class="field"><input id="qDate" name="date" type="date" min="${TODAY}" value="${S.start}" aria-describedby="qDateInfo"></div><p class="hint" id="qDateInfo">${dateInfo()}</p></div>
  <fieldset class="fl gst" id="qGuests"><legend>Guests</legend>
   <div class="trow"><div><b id="qAdL">Adults</b><small>12 years and over</small></div><div class="stepper" data-q="adults" role="group" aria-labelledby="qAdL"><button type="button" data-d="-1" aria-label="Fewer adults">−</button><span id="qAdults" aria-live="polite"></span><button type="button" data-d="1" aria-label="More adults">+</button></div></div>
   <div class="trow"><div><b id="qChL">Children</b><small>2–11 years</small></div><div class="stepper" data-q="children" role="group" aria-labelledby="qChL"><button type="button" data-d="-1" aria-label="Fewer children">−</button><span id="qChildren" aria-live="polite"></span><button type="button" data-d="1" aria-label="More children">+</button></div></div>
   <p class="hint">We’ll match the vehicle to your group, so there’s nothing to choose.</p></fieldset>
  <div class="f2"><label class="fl" data-f="name"><span>Full name</span><div class="field"><input name="name" autocomplete="name" aria-required="true" value="${v('name')}"></div></label>
  <label class="fl" data-f="email"><span>Email</span><div class="field"><input name="email" type="email" autocomplete="email" aria-required="true" value="${v('email')}"></div></label></div>
  <div class="f2"><label class="fl" data-f="phone"><span>WhatsApp / phone</span><div class="field"><input name="phone" type="tel" autocomplete="tel" aria-required="true" value="${v('phone')}"></div></label>
  <label class="fl"><span>Country of residence (optional)</span><div class="field"><input name="country" autocomplete="country-name" value="${v('country')}"></div></label></div>
  <div class="fl"><span id="hotelLbl">Hotels (optional)</span><div class="seg" id="hotelSeg" role="group" aria-labelledby="hotelLbl">${['Budget', 'Mid-range', 'Luxury', 'I’ll book my own'].map((h) => `<button type="button" class="${h === hotel ? 'on' : ''}" aria-pressed="${h === hotel}">${h}</button>`).join('')}</div></div>
  <label class="fl"><span>Anything else? (optional)</span><textarea name="notes" placeholder="Flight times, interests, dietary needs…">${v('notes')}</textarea></label>
  <div class="m-acts"><button type="button" class="btn ghost" data-act="review">Back</button><button class="btn primary" type="submit">Send my trip request</button></div></form></div>`,
    '#mTitle',
  );
  renderGuests();
}
function renderGuests() {
  const g = $('#qGuests');
  if (!g) return;
  $('#qAdults').textContent = S.adults;
  $('#qChildren').textContent = S.children;
  g.querySelector('[data-q="adults"] [data-d="-1"]').disabled = S.adults <= 1;
  g.querySelector('[data-q="children"] [data-d="-1"]').disabled = S.children <= 0;
  g.querySelectorAll('[data-d="1"]').forEach((b) => (b.disabled = pax() >= 20));
}

// Changed: the design only simulated sending. Requests now really reach the business —
// POSTed to SITE.quoteEndpoint when one is configured, otherwise handed off to WhatsApp
// (or email) as a pre-filled message. The confirmation copy only claims what happened.
const fmtLong = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const mapsLink = (p) => `https://www.google.com/maps?q=${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
function tourText(ref, f) {
  const out = [];
  const p = plan();
  out.push(`Hello ${SITE.name}, I’d like a quote for a private tour (ref ${ref}).`, '');
  out.push(`Route: ${daysTxt(p)} · about ${fmtDur(p.drive)} driving, ${p.km} km (estimate)`);
  p.rows.forEach((r) => {
    out.push(`${r.i + 1}. ${r.d.name} — ${nightsTxt(r.s.nights)} (${stopWhen(r)})`);
    expsAt(r.d.id).forEach((x) => out.push(`   • ${X[x].name}`)); // added: chosen experiences
  });
  const { outside } = expGroups();
  if (outside.length) {
    out.push('Also interested in (not in the route yet):');
    outside.forEach((id) => {
      out.push(`- ${D[id].name}`);
      expsAt(id).forEach((x) => out.push(`   • ${X[x].name}`));
    });
  }
  out.push(`Starting point (pickup and drop-off): ${pickupLabel()}${S.pickup.id === 'pin' ? ' ' + mapsLink(S.pickup) : ''}`);
  // Changed: the vehicle is our suggestion for the group size, not the guest's choice.
  out.push(
    `Start date: ${S.start ? fmtLong(dateAt(0)) : 'flexible, not chosen yet'}`,
    `Vehicle: ${tourVehicle().name} (suggested for the group size, to be confirmed)`,
    `Hotels: ${hotel}`,
  );
  out.push(`Travellers: ${travTxt()}`, '', `Name: ${f.name}`, `Email: ${f.email}`);
  if (f.phone) out.push(`Phone: ${f.phone}`);
  if (f.country) out.push(`Country: ${f.country}`);
  if (f.notes) out.push(`Notes: ${f.notes}`);
  return out.join('\n');
}
// Added: structured copy of the chosen experiences for a form endpoint (the message has them too).
function expPayload() {
  const { inRoute, outside } = expGroups();
  return [...inRoute, ...outside].map((id) => ({
    destinationId: id,
    destination: D[id].name,
    inRoute: inRoute.includes(id),
    experiences: expsAt(id).map((x) => ({ id: x, name: X[x].name })),
  }));
}
/* sending (the tour and the transfer share this) */
const reqLinks = (text, subject) => ({
  wa: `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(text)}`,
  mail: `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
});
const doneHtml = (refLabel, h, body, actions) =>
  `<button type="button" class="m-close" data-close aria-label="Close">×</button><div class="done"><span class="ref">${refLabel}</span><h2 tabindex="-1">${h}</h2><p>${body}</p><div class="row">${actions}</div></div>`;
const BACK_BTN = `<button type="button" class="btn primary" data-close>Back to map</button>`;
const handoffBtns = (l) => `<a class="btn primary" href="${esc(l.wa)}" target="_blank" rel="noopener">Send on WhatsApp</a><a class="btn ghost" href="${esc(l.mail)}">Send by email</a>`;
const newRef = (pre) => pre + String(Math.floor(1000 + Math.random() * 9000));
let sending = false; // a request is on its way: ignore further presses
// POSTs a request to the form endpoint. While it runs, the button says "Sending…" and is off.
// If it fails, the screen stays as it is, with a message and a WhatsApp link, and the visitor
// can try again. Returns true only after a successful response.
async function deliver(body, btn, wa) {
  const label = btn.textContent;
  sending = true;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    const r = await fetch(SITE.quoteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return true;
  } catch (err) {
    console.warn('Request could not be sent', err);
    btn.disabled = false;
    btn.textContent = label;
    mbg.querySelector('.send-err')?.remove();
    (btn.closest('.m-acts, .rv-foot') || btn).insertAdjacentHTML(
      'beforebegin',
      `<p class="hint bad send-err" role="alert">We couldn’t send your request just now. Please try again, or <a href="${esc(wa)}" target="_blank" rel="noopener">send it on WhatsApp</a>.</p>`,
    );
    return false;
  } finally {
    sending = false;
  }
}
// Marks what is wrong in a details form and puts the visitor on the first problem.
function checkForm(f, phoneMsg) {
  let ok = true;
  f.querySelectorAll('.fl .err').forEach((x) => x.remove());
  f.querySelectorAll('.fl.bad').forEach((x) => x.classList.remove('bad'));
  f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
  const bad = (k, m) => {
    ok = false;
    const fl = f.querySelector(`[data-f="${k}"]`);
    fl.classList.add('bad');
    fl.querySelector('input').setAttribute('aria-invalid', 'true');
    fl.insertAdjacentHTML('beforeend', `<span class="err">${m}</span>`);
  };
  const date = f.querySelector('[data-f="date"] input');
  if (date && date.value && date.value < TODAY) bad('date', 'Please choose today or a later date');
  if (!f.name.value.trim()) bad('name', 'Please enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) bad('email', 'Please enter a valid email');
  if (f.phone.value.replace(/\D/g, '').length < 7) bad('phone', phoneMsg);
  if (!ok) f.querySelector('[aria-invalid]').focus();
  return ok;
}
async function submitQuote(e) {
  e.preventDefault();
  if (sending) return;
  const f = e.target;
  if (f.dataset.kind === 'transfer') {
    // A transfer's details are checked here; it is sent from its review step (sendTransfer).
    if (checkForm(f, 'Please enter a WhatsApp or phone number so the driver can reach you')) openTrReview();
    return;
  }
  if (!checkForm(f, 'Please enter a WhatsApp or phone number so we can reach you')) return;
  const ref = newRef('SL-');
  const val = (k) => (f[k] ? f[k].value.trim() : '');
  const data = { name: val('name'), email: val('email'), phone: val('phone'), country: val('country'), notes: val('notes') };
  const first = esc(data.name.split(' ')[0]);
  const text = tourText(ref, data);
  const subject = `Private tour quote request ${ref}`;
  const links = reqLinks(text, subject);
  const done = (...a) => {
    f.innerHTML = doneHtml(...a);
    f.querySelector('.done h2').focus();
  };
  if (SITE.quoteEndpoint) {
    const ok = await deliver({ ref, type: 'tour', ...data, experiences: expPayload(), _subject: subject, message: text }, f.querySelector('[type=submit]'), links.wa);
    if (!ok) return;
    return done(
      `Request ${ref}`,
      `Thank you, ${first}.`,
      `Your trip request has been sent to our travel planners. We’ll reply to <b>${esc(data.email)}</b> with a quote and our suggestions. Nothing is booked yet.`,
      BACK_BTN,
    );
  }
  done(
    `Request ${ref}`,
    `Nearly done, ${first}.`,
    `Your trip request is ready. Choose how to send it: nothing is sent or booked until you press send on WhatsApp or in your email app. We’ll then reply with a quote and our suggestions.`,
    handoffBtns(links),
  );
}
function closeQuote() {
  mbg.hidden = true;
  mbg.innerHTML = '';
  document.body.style.overflow = '';
  if (modalReturn && document.contains(modalReturn)) modalReturn.focus();
  modalReturn = null;
}
// Remember typed details.
mbg.addEventListener('input', (e) => {
  const k = e.target.name;
  if (k in qd) qd[k] = e.target.value;
});
// Dates and times are saved as they are chosen: the tour's start date, the transfer's date and time.
mbg.addEventListener('change', (e) => {
  const id = e.target.id;
  if (id !== 'qDate' && id !== 'tDate' && id !== 'tTime') return;
  // Typed dates can get past the picker's minimum.
  if (id !== 'tTime' && e.target.value && e.target.value < TODAY) {
    e.target.value = '';
    toast('Please choose today or a later date');
  }
  if (id === 'qDate') {
    S.start = e.target.value;
    update();
    $('#qDateInfo').innerHTML = dateInfo();
  } else {
    S.tr[id === 'tDate' ? 'date' : 'time'] = e.target.value;
    save();
  }
});
mbg.addEventListener('click', (e) => {
  if (e.target === mbg || e.target.closest('[data-close]')) return closeQuote();
  const t = e.target.closest('button');
  if (!t) return;
  const act = t.dataset.act;
  if (act === 'details') openDetails();
  else if (act === 'review') openReview();
  else if (act === 'edit') {
    closeQuote();
    if (isNarrow()) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    setTripOpen(true);
    tripTg.focus({ preventScroll: true });
  } else if (t.dataset.n) {
    const s = S.stops.find((x) => x.id === t.dataset.n);
    s.nights = Math.max(0, Math.min(14, s.nights + +t.dataset.d));
    update();
    refreshReview();
    // The route re-renders: keep keyboard focus on the stepper that was pressed.
    const again = $(`#rvRoute [data-n="${t.dataset.n}"][data-d="${t.dataset.d}"]`);
    const other = $(`#rvRoute [data-n="${t.dataset.n}"][data-d="${-t.dataset.d}"]`);
    (again && !again.disabled ? again : other)?.focus();
  } else if (t.dataset.rmx) {
    toggleExp(t.dataset.rmx, false);
    refreshReview();
    (mbg.querySelector('.rmx') || $('#mTitle')).focus();
  } else if (t.dataset.addstop) {
    addStop(t.dataset.addstop);
    refreshReview();
    $('#mTitle').focus();
  } else if (t.closest('[data-q]')) {
    stepTrav(t.closest('[data-q]').dataset.q, +t.dataset.d);
    renderGuests();
    if (t.disabled) [...t.parentElement.querySelectorAll('button')].find((b) => !b.disabled)?.focus();
  } else if (t.closest('#hotelSeg')) {
    hotel = t.textContent;
    [...t.parentElement.children].forEach((x) => {
      x.classList.toggle('on', x === t);
      x.setAttribute('aria-pressed', String(x === t));
    });
  }
  // airport shuttle
  else if (act === 'tr-edit') {
    closeQuote();
    if (stacked()) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    TSEL.from.focus({ preventScroll: true });
  } else if (act === 'tr-details') openTrDetails();
  else if (act === 'tr-send') sendTransfer(t);
  else if (t.closest('[data-tq]')) {
    S.tr.pax = Math.max(1, Math.min(20, S.tr.pax + +t.dataset.d));
    save();
    renderTrPax();
    if (t.disabled) [...t.parentElement.querySelectorAll('button')].find((b) => !b.disabled)?.focus();
  }
});

/* services: the main page's two cards, and the switch between the two services */
const ovEb = $('.overlay .eyebrow'),
  ovH = $('.overlay h1');
const COPY = {
  home: { eb: ovEb.innerHTML, h: ovH.innerHTML }, // as the page was built
  tour: { eb: `Build your Sri Lanka trip · ${DESTS.length} places`, h: 'Let’s plan your Sri Lanka <em>experience.</em>' },
  shuttle: { eb: 'Airport shuttle and private transfers', h: 'Where would you like <em>to go?</em>' },
}; // the line under the heading: see renderGuide()
const travTxt = () =>
  `${S.adults} ${S.adults === 1 ? 'adult' : 'adults'}${S.children ? `, ${S.children} ${S.children === 1 ? 'child' : 'children'}` : ''}`;
function setMode(m) {
  if (S.mode === m) return;
  if (picking) stopPin();
  closeCard();
  S.mode = m;
  update();
  // Each view lays the page out differently, so the map is fitted again: to the transfer if both
  // of its locations are chosen, otherwise to the whole island. A view the visitor chose is kept.
  if (m === 'shuttle' && S.tr.from && S.tr.to) viewTransfer();
  else if (view !== 'user') fit();
  if (m === 'tour' && !S.stops.length) hintPins(); // step 1 of the tour: the markers are the next action
}
// "Plan My Tour" / "Book Airport Transfer" on the main page, and the two-way switch that stays
// on screen inside each service.
function goService(m, viaCard) {
  if (S.mode === m) return;
  setMode(m);
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (viaCard) ovH.focus({ preventScroll: true }); // the card is gone: put the new heading in focus
}
$('#svc').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) goService(b.dataset.go, true);
});
$('#modes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (b) goService(b.dataset.mode, false);
});
function renderMode() {
  const m = S.mode,
    root = document.documentElement;
  // app.css shows one view from this attribute (none = the main page with the two service cards).
  if (m === 'home') root.removeAttribute('data-svc');
  else root.setAttribute('data-svc', m === 'shuttle' ? 'sh' : 'tour');
  document.querySelectorAll('#modes [data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  map.getContainer().inert = m === 'home'; // behind the service cards the map is only a backdrop
  if (ovH.dataset.m !== m) {
    const c = COPY[m];
    ovEb.innerHTML = c.eb;
    ovH.innerHTML = c.h;
    ovH.dataset.m = m;
    requestAnimationFrame(hideSeaLabels);
  }
}

/* airport shuttle and private transfers (changed): exactly two locations, a pickup (A) and a
   drop-off (B), then a few travel details. Its state is S.tr. Nothing here reads or writes the
   tour's places, starting point or experiences, and the tour never touches S.tr. */
const TSEL = { from: $('#tFrom'), to: $('#tTo') };
const TWORD = { from: 'Pickup', to: 'Drop-off' };
const TBADGE = { from: 'A · Pickup', to: 'B · Drop-off' };
let tErr = { from: false, to: false }; // "Continue" was pressed while this location was missing
let pinTarget = 'tour'; // what a dropped pin sets: the tour's starting point, or a transfer's 'from' / 'to'
const dayOf = (s) => new Date(s + 'T00:00:00');
const trPt = (k) => {
  const p = S.tr[k];
  return !p ? null : p.id === 'pin' ? p : TL[p.id];
};
function pinName(p) {
  const n = nearest(p);
  return 'Pin near ' + (n.short || n.name);
}
// Short name for the map and the card; full name for the review and the request.
const trLabel = (k) => (!S.tr[k] ? '' : S.tr[k].id === 'pin' ? pinName(S.tr[k]) : TL[S.tr[k].id].short);
const trFull = (k) => (!S.tr[k] ? '' : S.tr[k].id === 'pin' ? pinName(S.tr[k]) : TL[S.tr[k].id].label);
const trLeg = () => (S.tr.from && S.tr.to ? legInfo(trPt('from'), trPt('to')) : null);
const isAir = (k) => !!S.tr[k] && AIRPORT_IDS.includes(S.tr[k].id);
function setTr(k, p) {
  const o = k === 'from' ? 'to' : 'from';
  // One place can't be both ends: choosing it for the other end makes the two change places.
  const swap = !!S.tr[o] && p.id !== 'pin' && S.tr[o].id === p.id;
  if (swap) S.tr[o] = S.tr[k];
  S.tr[k] = p;
  tErr[k] = false;
  update();
  viewTransfer();
  // Stacked layouts: once both are chosen, "Continue" (above the map) comes into view.
  if (S.tr.from && S.tr.to && stacked()) $('#tGo').scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
  toast(swap && S.tr[o] ? 'Pickup and drop-off swapped' : `${TWORD[k]} set · ${trLabel(k)}`);
}
// Both chosen: the map zooms to the transfer. If not, back to the whole island (unless the
// visitor has moved the map themselves).
function viewTransfer() {
  const a = trPt('from'),
    b = trPt('to');
  if (a && b) {
    map.invalidateSize({ pan: false });
    map.fitBounds(
      L.latLngBounds([
        [a.lat, a.lng],
        [b.lat, b.lng],
      ]).pad(0.25),
      {
        paddingTopLeft: [stacked() ? 20 : padL() + 40, stacked() ? padT() + 10 : 60],
        paddingBottomRight: [60, 60],
        maxZoom: 10,
      },
    );
    view = 'route';
  } else if (view === 'route') fit();
}
Object.entries(TSEL).forEach(([k, sel]) =>
  sel.addEventListener('change', () => {
    const v = sel.value;
    if (v === 'pin') {
      renderTransfer(); // the list goes back to what was chosen; the map takes over
      startPin(k);
    } else if (TL[v]) setTr(k, { id: v });
  }),
);
$('#tSwap').onclick = () => {
  [S.tr.from, S.tr.to] = [S.tr.to, S.tr.from];
  update();
  viewTransfer();
  toast('Pickup and drop-off swapped');
};
$('#tClear').onclick = () => {
  Object.assign(S.tr, { from: null, to: null, date: '', time: '' });
  tErr = { from: false, to: false };
  update();
  fit(); // back to the whole island
  toast('Transfer cleared');
  TSEL.from.focus({ preventScroll: true });
};
// "Continue" needs both locations: if one is missing it says so and puts the visitor on it.
$('#tGo').onclick = () => {
  tErr = { from: !S.tr.from, to: !S.tr.to };
  if (!tErr.from && !tErr.to) return openTrDetails();
  renderTransfer();
  TSEL[tErr.from ? 'from' : 'to'].focus();
};
function renderTransfer() {
  if (S.mode !== 'shuttle') return;
  for (const [k, sel] of Object.entries(TSEL)) {
    const p = S.tr[k];
    // A dropped pin shows in the list as "Pin near …".
    let o = sel.querySelector('option[value="here"]');
    if (p && p.id === 'pin') {
      if (!o) sel.insertBefore((o = new Option('', 'here')), sel.querySelector('option[value="pin"]'));
      o.textContent = pinName(p);
    } else if (o) o.remove();
    sel.value = !p ? '' : p.id === 'pin' ? 'here' : p.id;
    const miss = tErr[k] && !p,
      err = $(`#${sel.id}Err`),
      msg = miss ? `Please choose a ${TWORD[k].toLowerCase()} location` : '';
    sel.closest('.tf').classList.toggle('bad', miss);
    if (miss) sel.setAttribute('aria-invalid', 'true');
    else sel.removeAttribute('aria-invalid');
    if (err.textContent !== msg) err.textContent = msg;
    err.hidden = !miss;
  }
  const leg = trLeg(),
    sum = $('#tSum'),
    txt = leg ? `<b>${esc(trLabel('from'))}</b> to <b>${esc(trLabel('to'))}</b>: about ${fmtDur(leg.min)}, ${leg.km} km (estimate)` : '';
  if (sum.dataset.t !== txt) sum.innerHTML = sum.dataset.t = txt; // only when it changes: it is read out
  sum.hidden = !leg;
  $('#tSwap').disabled = !(S.tr.from || S.tr.to);
  $('#tClear').hidden = !(S.tr.from || S.tr.to);
}
// On the map: a destination shows A or B on its own marker (renderPins), an airport on its
// marker's label, and any other place (Colombo, Negombo, the port, a dropped pin) gets a marker here.
function renderTrMarkers() {
  AIRPORT_IDS.forEach((id) => {
    const el = airMarkers[id].getElement();
    if (!el) return;
    const role = trRole(id);
    el.firstElementChild.classList.toggle('on', !!role);
    el.querySelector('.pl').innerHTML = role ? `<b>${TBADGE[role]}</b> · ${esc(TL[id].short)}` : `<b>Airport</b> · ${TL[id].code}`;
  });
  for (const k of ['from', 'to']) {
    const p = S.tr[k];
    if (!p || D[p.id] || AIRPORT_IDS.includes(p.id)) continue;
    const pt = trPt(k),
      isPin = p.id === 'pin';
    const m = L.marker([pt.lat, pt.lng], {
      icon: L.divIcon({
        className: '',
        iconSize: [0, 0],
        html: `<div class="pk on ${isPin ? 'drag' : ''} ${pt.lng > 80.6 ? 'r' : ''}"><span class="sq"></span><span class="pl"><b>${TBADGE[k]}</b> · ${esc(trLabel(k))}</span></div>`,
      }),
      draggable: isPin,
      zIndexOffset: 3000,
      keyboard: false,
    }).addTo(map);
    if (isPin)
      m.on('dragend', (e) => {
        const ll = e.target.getLatLng();
        S.tr[k] = { id: 'pin', lat: ll.lat, lng: ll.lng };
        update();
      });
    trMarkers.push(m);
  }
}

// Step 1 of 2: when, how many, and how to reach the guest. No vehicle to choose: we recommend
// one. The two locations stay in view beside (or above) the form.
function trWhenHint() {
  const later = 'Not sure yet? Leave the date and time empty: you can send them later.';
  if (isAir('from')) return `For an airport pickup, give the time your flight lands: your driver waits for you in the arrivals hall. ${later}`;
  if (isAir('to')) return `For a flight, we suggest reaching the airport ${SHUTTLE_TIMING.departureBufferMin / 60} hours before it leaves. ${later}`;
  return later;
}
function openTrDetails() {
  const leg = trLeg(),
    v = (k) => esc(qd[k]);
  showModal(
    `<div class="modal tr" role="dialog" aria-modal="true" aria-labelledby="mTitle">
 <div class="m-sum"><h3>Your transfer</h3>
  <ol class="m-stops"><li><span class="n">A</span><span class="nm">${esc(trLabel('from'))}</span><span class="dt">Pickup</span></li><li><span class="n">B</span><span class="nm">${esc(trLabel('to'))}</span><span class="dt">Drop-off</span></li></ol>
  <dl class="m-facts"><div><dt>Drive (est.)</dt><dd>~${fmtDur(leg.min)} · ${leg.km} km</dd></div><div><dt>Vehicle</dt><dd>We’ll recommend one</dd></div></dl></div>
 <form class="m-form" id="qform" novalidate data-kind="transfer"><button type="button" class="m-close" data-close aria-label="Close">×</button>
  <p class="m-step">Step 1 of 2 · Travel details</p>
  <h2 id="mTitle" tabindex="-1">Request your private transfer</h2><p>Tell us when you travel and how to reach you. We’ll confirm availability and send you a quotation. Nothing is booked until you confirm it with us.</p>
  <div class="f2"><div class="fl" data-f="date"><label for="tDate">Travel date</label><div class="field"><input id="tDate" name="tdate" type="date" min="${TODAY}" value="${S.tr.date}" aria-describedby="tWhen"></div></div>
  <div class="fl"><label for="tTime">Preferred pickup time</label><div class="field"><input id="tTime" name="ttime" type="time" step="300" value="${S.tr.time}" aria-describedby="tWhen"></div></div></div>
  <p class="hint" id="tWhen">${trWhenHint()}</p>
  <div class="trow"><div><b id="tPaxL">Passengers</b><small>Adults and children together</small></div><div class="stepper" data-tq="pax" role="group" aria-labelledby="tPaxL"><button type="button" data-d="-1" aria-label="Fewer passengers">−</button><span id="tPax" aria-live="polite"></span><button type="button" data-d="1" aria-label="More passengers">+</button></div></div>
  <div class="f2"><label class="fl" data-f="name"><span>Full name</span><div class="field"><input name="name" autocomplete="name" aria-required="true" value="${v('name')}"></div></label>
  <label class="fl" data-f="email"><span>Email</span><div class="field"><input name="email" type="email" autocomplete="email" aria-required="true" value="${v('email')}"></div></label></div>
  <div class="f2"><label class="fl" data-f="phone"><span>WhatsApp / phone</span><div class="field"><input name="phone" type="tel" autocomplete="tel" aria-required="true" value="${v('phone')}"></div></label>
  <label class="fl"><span>Flight number or details (optional)</span><div class="field"><input name="flight" autocomplete="off" placeholder="e.g. UL 504, lands 08:30" value="${v('flight')}"></div></label></div>
  <label class="fl"><span>Luggage (optional)</span><div class="field"><input name="luggage" autocomplete="off" placeholder="e.g. 2 large suitcases, 1 surfboard" value="${v('luggage')}"></div></label>
  <label class="fl"><span>Anything else? (optional)</span><textarea name="tnotes" placeholder="Hotel name, child seats, special requests…">${v('tnotes')}</textarea></label>
  <div class="m-acts"><button type="button" class="btn ghost" data-act="tr-edit">Edit locations</button><button class="btn primary" type="submit">Review request</button></div></form></div>`,
    '#mTitle',
  );
  renderTrPax();
}
function renderTrPax() {
  const g = mbg.querySelector('[data-tq="pax"]');
  if (!g) return;
  $('#tPax').textContent = S.tr.pax;
  g.querySelector('[data-d="-1"]').disabled = S.tr.pax <= 1;
  g.querySelector('[data-d="1"]').disabled = S.tr.pax >= 20;
}
// Step 2 of 2: everything in one list, then the request goes out.
function openTrReview() {
  const leg = trLeg(),
    word = isAir('from') || isAir('to') ? 'Airport' : 'Private';
  const row = (dt, dd) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`;
  const opt = (dt, val) => (val.trim() ? row(dt, esc(val.trim())) : '');
  showModal(
    `<div class="modal rv tr" role="dialog" aria-modal="true" aria-labelledby="mTitle" aria-describedby="mLede"><button type="button" class="m-close" data-close aria-label="Close">×</button>
 <div class="rv-body">
  <p class="m-step">Step 2 of 2 · Review and send</p>
  <h2 id="mTitle" tabindex="-1">Your ${word} Transfer Request</h2>
  <p class="rv-lede" id="mLede">Please check your details. ${SITE.quoteEndpoint ? '' : 'On the next screen you send the request to us on WhatsApp or by email. '}We’ll confirm availability and send you a quotation. Nothing is booked until you confirm it with us.</p>
  <dl class="tr-rev">${row('Pickup location', `<b class="ab" aria-hidden="true">A</b>${esc(trFull('from'))}`)}${row('Drop-off location', `<b class="ab" aria-hidden="true">B</b>${esc(trFull('to'))}`)}${row('Date', S.tr.date ? fmtLong(dayOf(S.tr.date)) : 'To be confirmed')}${row('Preferred pickup time', S.tr.time || 'To be confirmed')}${row('Passengers', S.tr.pax)}${opt('Flight', qd.flight)}${opt('Luggage', qd.luggage)}${opt('Notes', qd.tnotes)}${row('Name', esc(qd.name.trim()))}${row('Email', esc(qd.email.trim()))}${row('WhatsApp / phone', esc(qd.phone.trim()))}</dl>
  <p class="hint">Estimated drive: about ${fmtDur(leg.min)}, ${leg.km} km (${OSM_CREDIT}). We’ll recommend a vehicle for your group and luggage.</p>
 </div>
 <div class="rv-foot"><button type="button" class="btn ghost" data-act="tr-details">Edit details</button><button type="button" class="btn primary" data-act="tr-send">Request ${word} Transfer</button></div></div>`,
    '#mTitle',
  );
}
function transferText(ref, f) {
  const leg = trLeg(),
    n = S.tr.pax,
    at = (k) => `${trFull(k)}${S.tr[k].id === 'pin' ? ' ' + mapsLink(S.tr[k]) : ''}`;
  const out = [`Hello ${SITE.name}, I’d like a quote for a private transfer (ref ${ref}).`, ''];
  out.push(`Pickup (A): ${at('from')}`, `Drop-off (B): ${at('to')}`);
  out.push(`Date: ${S.tr.date ? fmtLong(dayOf(S.tr.date)) : 'to be confirmed'}`, `Preferred pickup time: ${S.tr.time || 'to be confirmed'}`);
  out.push(`Passengers: ${n}`);
  if (qd.flight.trim()) out.push(`Flight: ${qd.flight.trim()}`);
  if (qd.luggage.trim()) out.push(`Luggage: ${qd.luggage.trim()}`);
  // The vehicle is our suggestion for the group size, not the guest's choice.
  out.push(`Vehicle: ${fitVehicle(n).name} (suggested for the group size, to be confirmed)`, `Estimated drive: about ${fmtDur(leg.min)}, ${leg.km} km`);
  out.push('', `Name: ${f.name}`, `Email: ${f.email}`, `Phone: ${f.phone}`);
  if (f.notes) out.push(`Notes: ${f.notes}`);
  return out.join('\n');
}
// For a form endpoint: the same details as fields (the message has them as text too).
function trPayload() {
  const end = (k) => {
    const p = trPt(k);
    return { id: S.tr[k].id, name: trFull(k), lat: +p.lat.toFixed(5), lng: +p.lng.toFixed(5) };
  };
  return { pickup: end('from'), dropoff: end('to'), date: S.tr.date, time: S.tr.time, passengers: S.tr.pax, flight: qd.flight.trim(), luggage: qd.luggage.trim() };
}
async function sendTransfer(btn) {
  if (sending) return;
  const ref = newRef('SL-T-');
  const data = { name: qd.name.trim(), email: qd.email.trim(), phone: qd.phone.trim(), country: '', notes: qd.tnotes.trim() };
  const text = transferText(ref, data);
  const subject = `${isAir('from') || isAir('to') ? 'Airport' : 'Private'} transfer request ${ref}`;
  const links = reqLinks(text, subject);
  const done = (...a) => {
    const m = mbg.querySelector('.modal');
    m.innerHTML = `<div class="rv-body">${doneHtml(...a)}</div>`;
    m.querySelector('.done h2').focus();
  };
  if (SITE.quoteEndpoint) {
    // type "airport-transfer" tells a transfer from a tour; `transfer` carries its details as fields.
    const ok = await deliver({ ref, type: 'airport-transfer', ...data, experiences: [], transfer: trPayload(), _subject: subject, message: text }, btn, links.wa);
    if (!ok) return;
    return done(
      `Request ${ref}`,
      'Thank you! Your transfer request has been sent.',
      `We’ll review your details and contact you to confirm availability and provide a quotation. We’ll reply to <b>${esc(data.email)}</b>. Nothing is booked yet.`,
      BACK_BTN,
    );
  }
  done(
    `Request ${ref}`,
    `Nearly done, ${esc(data.name.split(' ')[0])}.`,
    `Your transfer request is ready. Choose how to send it: nothing is sent or booked until you press send on WhatsApp or in your email app. We’ll then confirm availability and send you a quotation.`,
    handoffBtns(links),
  );
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!mbg.hidden) closeQuote();
    else if (picking) stopPin();
    else if (!card.hidden) closeCard();
  }
  // "/" jumps to the tour planner's search.
  if (e.key === '/' && S.mode === 'tour' && mbg.hidden && card.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
    e.preventDefault();
    q.focus();
  }
});
let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    map.invalidateSize({ pan: false });
    if (!trip.hidden) renderTripOpen(); // wide ↔ stacked: the panel's default changes
    if (view === 'overview') fit();
  }, 150);
});

function update() {
  renderMode();
  renderPickupMarker();
  renderPins();
  renderRoute();
  renderTrip();
  renderGuide();
  renderTransfer();
  renderSummary();
  renderCardState();
  save();
}
renderChips();
update();
document.documentElement.classList.add('map-ready');
if (S.mode === 'tour' && !S.stops.length) hintPins(); // step 1 of the tour: the markers are the next action
if (S.mode === 'shuttle' && S.tr.from && S.tr.to) viewTransfer(); // a transfer in progress: show it
if (staleDates) setTimeout(() => toast('The dates in your saved trip have passed, so we cleared them'), 600);

// Added: deep links. /#tour and /#transfer (the site menu) open a service directly. From place
// pages: /#add=<id> adds the place and shows the trip panel, /#place=<id> opens its dialog,
// /#experiences=<id> opens it at its "Things to do" list, and /#exp=<experience id> does the
// same with focus on that experience (not ticked). All of those belong to the tour planner.
// A fragment (not a query string) so the homepage keeps a single crawlable URL.
function openFromHash() {
  if (location.hash === '#transfer' || location.hash === '#tour') {
    const m = location.hash === '#tour' ? 'tour' : 'shuttle';
    history.replaceState(null, '', location.pathname + location.search);
    if (!mbg.hidden) closeQuote();
    setMode(m);
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }
  const m = location.hash.match(/^#(add|place|experiences|exp)=([a-z-]+)$/);
  const id = m && (m[1] === 'exp' ? X[m[2]] && X[m[2]].destinationId : m[2]);
  if (!id || !D[id]) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (!mbg.hidden) closeQuote();
  setMode('tour');
  if (m[1] === 'add') {
    closeCard();
    addStop(id);
    setTripOpen(true);
    return;
  }
  if (m[1] !== 'place') expOpen = true;
  openDest(id);
  if (m[1] === 'experiences') $('#dcExp')?.scrollIntoView({ block: 'start' });
  const box = m[1] === 'exp' && card.querySelector(`#dcExpList input[value="${m[2]}"]`);
  if (box) {
    box.closest('label').scrollIntoView({ block: 'nearest' });
    box.focus({ preventScroll: true });
  }
}
openFromHash();
window.addEventListener('hashchange', openFromHash);
initMenu();
