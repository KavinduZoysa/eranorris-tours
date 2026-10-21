// Map-first trip planner — ported from the supplied design. Behaviour is unchanged
// except where commented (photos, accessibility, deep links, real request hand-off).
import L from 'leaflet';
import { CATS, DESTS, PICKUPS, VEHICLES, SHUTTLE_FARES, SHUTTLE_TIMING, hav, legInfo, fmtDur, nightsTxt } from '../data/destinations.mjs';
import { EXPERIENCES, EXP_CATS, experiencesFor } from '../data/experiences.mjs';

// Injected at build time (scripts/build.mjs): brand, contact channels, asset URLs.
const SITE = __SITE__;

const D = Object.fromEntries(DESTS.map((d) => [d.id, d]));
const P = Object.fromEntries(PICKUPS.map((p) => [p.id, p]));
const KEY = 'eranorris-trip-v1';
const $ = (s) => document.querySelector(s);
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
let S = Object.assign({ stops: [], pickup: null, start: '', adults: 2, children: 0, vehicle: null }, store.get());
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
if (S.sh) for (const k of ['arrDate', 'depDate']) if (S.sh[k] && S.sh[k] < TODAY) (S.sh[k] = ''), (staleDates = true);
let filter = 'all',
  active = null,
  picking = false;
const save = () => store.set(S);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function dateAt(off) {
  const d = new Date(S.start + 'T00:00:00');
  d.setDate(d.getDate() + off);
  return d;
}
const fmtD = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
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
function vehicleId() {
  const fit = VEHICLES.filter((v) => v.cap >= pax());
  const cur = VEHICLES.find((v) => v.id === S.vehicle);
  return cur && cur.cap >= pax() ? cur.id : fit[0].id;
}
function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* map */
const mapwrap = $('#mapwrap');
// Added: touch devices pan the map with two fingers so a one-finger swipe scrolls the page
// to the planner instead of getting trapped in a full-width map. Pinch-zoom and taps work as before.
const coarse = window.matchMedia('(pointer: coarse)').matches;
const map = L.map('map', {
  zoomControl: false,
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  minZoom: 6.5,
  maxZoom: 10.5,
  dragging: !coarse,
  // Changed: was [[4.4, 77.6], [11, 84]]. That box was too tight for the view to shift the island
  // clear of the overlay on short or narrow screens, so places ended up hidden under the search
  // and chips. Wider limits still keep the island in reach.
  maxBounds: [
    [1.5, 70],
    [15.5, 91],
  ],
  maxBoundsViscosity: 0.8,
});
L.control.zoom({ position: 'bottomright' }).addTo(map);
// Added: wording follows the input device ("Tap" on touch screens).
const TAP = coarse ? 'Tap' : 'Click';
// Added: short hint when a one-finger swipe on the map scrolls the page instead of panning it.
const gest = $('#gest');
let gestT, touchStart = null;
if (coarse) {
  const el = map.getContainer();
  el.addEventListener(
    'touchstart',
    (e) => {
      const ok = e.touches.length === 1 && !e.target.closest('.leaflet-marker-draggable, .leaflet-control');
      touchStart = ok ? [e.touches[0].clientX, e.touches[0].clientY] : null;
    },
    { passive: true },
  );
  el.addEventListener(
    'touchmove',
    (e) => {
      if (!touchStart || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (Math.hypot(t.clientX - touchStart[0], t.clientY - touchStart[1]) < 14) return;
      touchStart = null;
      gest.classList.add('show');
      clearTimeout(gestT);
      gestT = setTimeout(() => gest.classList.remove('show'), 1500);
    },
    { passive: true },
  );
}
map.attributionControl.addAttribution('Map data: <a href="https://www.naturalearthdata.com/">Natural Earth</a>');
// Changed: credit added up front (not after the file loads) so the control doesn't grow and shift the zoom buttons.
const DIST_CREDIT = 'Districts: <a href="https://www.geoboundaries.org/">geoBoundaries</a>';
map.attributionControl.addAttribution(DIST_CREDIT);
map.createPane('land');
map.getPane('land').style.zIndex = 250;
map.getPane('land').style.pointerEvents = 'none';
const grat = { pane: 'land', color: '#F3ECE0', weight: 1, opacity: 0.05, interactive: false };
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
    style: { color: '#F3ECE0', opacity: 0.2, weight: 1, fillColor: '#1C1915', fillOpacity: 1 },
  }).addTo(map);
  distP.then((ok) => {
    if (ok) return;
    L.geoJSON(lk, {
      pane: 'land',
      interactive: false,
      style: { color: '#E07B57', opacity: 0.16, weight: 10, fill: false },
    }).addTo(map);
    L.geoJSON(lk, {
      pane: 'land',
      interactive: false,
      style: { color: '#EFE3D1', opacity: 0.75, weight: 1.25, fillColor: '#2C251E', fillOpacity: 1 },
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
      style: { color: '#E07B57', opacity: 0.16, weight: 10, fill: false },
    }).addTo(map);
    L.geoJSON(gj, {
      pane: 'dist',
      interactive: false,
      style: { color: '#EFE3D1', opacity: 0.8, weight: 2.5, fill: false },
    }).addTo(map);
    const base = {
      color: '#EFE3D1',
      opacity: 0.2,
      weight: 1,
      fillColor: '#2C251E',
      fillOpacity: 1,
      className: 'dpoly',
    };
    L.geoJSON(gj, {
      pane: 'dist',
      style: () => base,
      onEachFeature: (f, l) => {
        const n = f.properties.name;
        l.on('mouseover', () => {
          l.setStyle({ fillColor: '#3B3229', opacity: 0.45 });
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
// Added: phones in landscape use the side-by-side overlay (as on desktop) — see app.css.
const sideLayout = window.matchMedia('(max-width: 900px) and (max-height: 500px) and (orientation: landscape)');
const stacked = () => window.innerWidth <= 1100 && !sideLayout.matches;
function padL() {
  if (stacked()) return 0;
  // Changed: also clears the destination card, which replaces the overlay in landscape.
  const m = mapwrap.getBoundingClientRect();
  const rights = [document.querySelector('.overlay'), document.getElementById('dcard')]
    .filter((e) => e && !e.hidden && e.offsetParent !== null)
    .map((e) => e.getBoundingClientRect().right - m.left + 16);
  return Math.max(0, ...rights);
}
function padT() {
  if (!stacked()) return 30;
  const o = document.querySelector('.overlay').getBoundingClientRect(),
    m = mapwrap.getBoundingClientRect();
  return Math.max(30, o.bottom - m.top + 12);
}
let userMoved = false;
function fit() {
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
    stacked()
      ? { paddingTopLeft: [16, padT()], paddingBottomRight: [16, 24] }
      : { paddingTopLeft: [padL() + 20, 30], paddingBottomRight: [40, 30] },
  );
}
fit();
map.on('dragstart', () => (userMoved = true));
map.getContainer().addEventListener('wheel', () => (userMoved = true), { passive: true });
map.whenReady(() =>
  map.on('zoomstart', (e) => {
    if (e && e.originalEvent) userMoved = true;
  }),
);
new ResizeObserver(() => {
  map.invalidateSize({ pan: false });
  if (!userMoved && !active) fit();
}).observe(mapwrap);
map.on('zoomend', () => mapwrap.classList.toggle('far', map.getZoom() < 7));
mapwrap.classList.toggle('far', map.getZoom() < 7);
function flyTo(ll, z) {
  z = Math.max(map.getZoom(), z);
  const pt = map.project(ll, z).subtract([padL() / 2, stacked() ? -padT() / 2 : 0]);
  if (reduceMotion()) map.setView(map.unproject(pt, z), z, { animate: false });
  else map.flyTo(map.unproject(pt, z), z, { duration: 0.8 });
}

const markers = {};
DESTS.forEach((d) => {
  // Changed: the design's empty <image-slot> placeholders are filled with the supplied photos.
  const icon = L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div class="pin ${d.pos}" style="--c:${CATS[d.cat].c}"><span class="stem"></span><span class="pt"></span><span class="med"><img src="${SITE.assets.photos[d.id].med}" alt="" width="96" height="96" decoding="async"><span class="kw">${d.kw}</span><b class="no"></b></span><span class="lbl">${d.name}</span></div>`,
  });
  const m = L.marker([d.lat, d.lng], { icon, keyboard: true, title: d.name, riseOnHover: true }).addTo(map);
  // Changed: while dropping a pin, tapping a place puts the pin there (it used to do nothing,
  // which on phones made large parts of the map untappable in pin mode).
  m.on('click', () => (picking ? map.fire('click', { latlng: L.latLng(d.lat, d.lng) }) : openDest(d.id, false)));
  // Added: markers are focusable (Leaflet) — make them announce properly and open with Enter/Space.
  const el = m.getElement();
  el.setAttribute('aria-label', `${d.name}, ${CATS[d.cat].label}: ${d.hl}`);
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    openDest(d.id, false, { focus: true });
  });
  markers[d.id] = m;
});
function renderPins() {
  DESTS.forEach((d) => {
    const el = markers[d.id].getElement();
    if (!el) return;
    const pin = el.firstElementChild;
    const idx = tripIdx(d.id);
    pin.classList.toggle('in', idx > -1);
    pin.classList.toggle('sel', isHotel(d.id));
    pin.classList.toggle('active', active === d.id);
    pin.classList.toggle(
      'off',
      !(filter === 'all' || d.cat === filter || idx > -1 || active === d.id || isHotel(d.id)),
    );
    pin.querySelector('.no').textContent = idx > -1 ? idx + 1 : isHotel(d.id) ? 'Hotel' : '';
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
    const hs = isHotel(d.id);
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
  [pkMarker, apMarker].forEach((m) => {
    if (!m) return;
    const p = map.latLngToLayerPoint(m.getLatLng());
    fixed.push({ x: p.x, y: p.y, r: 16 });
  });
  const rects = [],
    cr0 = map.getContainer().getBoundingClientRect();
  [pkMarker, apMarker].forEach((m) => {
    const pl = m && m.getElement() && m.getElement().querySelector('.pl');
    if (!pl) return;
    const b = pl.getBoundingClientRect(),
      a = map.containerPointToLayerPoint([b.left - cr0.left, b.top - cr0.top]);
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
  [pkMarker, apMarker].forEach((m, i) => {
    if (!m) return;
    const el = m.getElement(),
      pl = el && el.querySelector('.pl'),
      p = map.latLngToLayerPoint(m.getLatLng());
    obst.push({ id: 'pk' + i, r: [p.x - 16, p.y - 16, p.x + 16, p.y + 16] });
    if (pl) {
      const cr = map.getContainer().getBoundingClientRect(),
        b = pl.getBoundingClientRect(),
        a = map.containerPointToLayerPoint([b.left - cr.left, b.top - cr.top]);
      obst.push({ id: 'pkl' + i, r: [a.x, a.y, a.x + b.width, a.y + b.height] });
    }
  });
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
      if (!obst.some((b) => b.id !== o.d.id && hit(rc, b.r)) && !placed.some((b) => hit(rc, b))) {
        pick = { dx, dy, rc };
        break;
      }
    }
    if (!pick && o.pr < 2) {
      const [dx, dy] = C[o.d.pos];
      pick = { dx, dy, rc: [o.x + dx, o.y + dy, o.x + dx + w, o.y + dy + h] };
    }
    o.pin.classList.toggle('nolbl', !pick);
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
      '.pin:not(.nolbl):not(.off) .lbl,.pin:not(.off) .med,.pk .pl,.pk .sq,.overlay>*,.leaflet-control,.dcard:not([hidden]),.pinbanner:not([hidden])',
    ),
  ].map(rr);
  document.querySelectorAll('.sea,.dist').forEach((s) => {
    s.style.opacity = '';
    const r = rr(s);
    const h = obs.some((o) => hit(r, o));
    s.style.opacity = h ? '0' : '';
    if (!h) obs.push(r);
  });
}
map.on('moveend', hideSeaLabels);
map.on('zoomend', () => layoutPins());
document.fonts && document.fonts.ready.then(() => layoutPins());
let pkMarker = null,
  apMarker = null;
function tripIdx(id) {
  return S.mode === 'shuttle' ? -1 : S.stops.findIndex((s) => s.id === id);
}
function isHotel(id) {
  return S.mode === 'shuttle' && !!S.sh && !!S.sh.place && S.sh.place.id === id;
}
function renderPickupMarker() {
  if (pkMarker) {
    map.removeLayer(pkMarker);
    pkMarker = null;
  }
  if (apMarker) {
    map.removeLayer(apMarker);
    apMarker = null;
  }
  if (S.mode === 'shuttle') return renderShMarkers();
  const p = pickupPt();
  if (!p) return;
  const isPin = S.pickup.id === 'pin';
  const icon = L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div class="pk ${isPin ? 'drag' : ''}"><span class="sq"></span><span class="pl"><b>Pickup</b> · ${esc(pickupLabel())}</span></div>`,
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
  if (S.mode === 'shuttle') return renderShRoute();
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
  if (active && filter !== 'all' && D[active].cat !== filter) closeCard();
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
q.addEventListener('focus', search);
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
    // Added preventDefault: focus moves into the card, and the same keypress must not "click" it.
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
  openDest(d.id, true, { focus: viaKeyboard });
}

/* destination card */
const card = $('#dcard');
// opts.focus (added): move keyboard focus into the card, for keyboard and search users.
function openDest(id, fly, opts = {}) {
  if (picking) return;
  if (opts.focus) cardReturn = document.activeElement;
  active = id;
  userMoved = true;
  renderPins();
  renderCard();
  const d = D[id];
  if (fly) flyTo([d.lat, d.lng], 8.5);
  else
    map.panInside([d.lat, d.lng], {
      paddingTopLeft: [stacked() ? 20 : padL() + 40, stacked() ? padT() + 10 : 40],
      paddingBottomRight: [40, stacked() ? card.offsetHeight + 30 : 40],
    });
  if (opts.focus) {
    const t = ['[data-act="add"]', '[data-act="remove"]', '[data-act="sethotel"]', '.dc-x'].map((x) => card.querySelector(x)).find(Boolean);
    t.focus();
  }
}
let cardReturn = null;
function closeCard() {
  const hadFocus = card.contains(document.activeElement);
  active = null;
  card.hidden = true;
  mapwrap.classList.remove('has-card');
  renderPins();
  if (hadFocus && cardReturn && document.contains(cardReturn)) cardReturn.focus();
  cardReturn = null;
}
function renderCard() {
  const d = D[active];
  // Changed: photo instead of an empty image slot; added a crawlable link to the place page.
  const ph = SITE.assets.photos[d.id];
  card.setAttribute('aria-labelledby', 'dcTitle');
  card.innerHTML = `<div class="dc-img"><picture><source type="image/avif" srcset="${ph.cardAvif[0]} 480w, ${ph.cardAvif[1]} 800w" sizes="(max-width: 900px) calc(100vw - 24px), 360px"><img src="${ph.card[0]}" srcset="${ph.card[0]} 480w, ${ph.card[1]} 800w" sizes="(max-width: 900px) calc(100vw - 24px), 360px" alt="${esc(d.alt)}" width="480" height="192"></picture><button class="dc-x" data-act="close" aria-label="Close ${esc(d.name)}">×</button></div>
 <div class="dc-body"><div class="dc-meta"><span class="tag" style="--c:${CATS[d.cat].c}">${CATS[d.cat].label}</span><span>${d.hl}</span></div>
 <h2 id="dcTitle">${d.name}</h2><p>${d.desc} <a class="dc-more" href="${SITE.base}/places/${d.id}/">More about ${d.name}<span aria-hidden="true"> →</span></a></p><dl class="dc-facts" id="dcFacts"></dl><div class="dc-actions" id="dcActions"></div>${expBlock(d)}</div>`;
  card.hidden = false;
  mapwrap.classList.add('has-card');
  requestAnimationFrame(hideSeaLabels);
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = '';
  renderCardState();
}

/* experiences (added) */
// The card's "Things to do" list stays open for the next place once a visitor has opened it.
let expOpen = false;
const expsAt = (id) => S.exps.filter((x) => X[x].destinationId === id);
const expMeta = (e) => [EXP_CATS[e.category], e.duration, e.price].filter(Boolean).map(esc).join(' · ');
function expBlock(d) {
  const xs = experiencesFor(d.id);
  if (!xs.length) return '';
  const item = (e) => {
    const th = e.image && SITE.assets.expPhotos[e.image];
    return `<li><label class="exp${th ? ' has-th' : ''}"><input type="checkbox" value="${e.id}" aria-labelledby="xn-${e.id}" aria-describedby="xd-${e.id}"${S.exps.includes(e.id) ? ' checked' : ''}><span class="exp-ck" aria-hidden="true"></span>${th ? `<img src="${th}" alt="" width="40" height="40" loading="lazy" decoding="async">` : ''}<span class="exp-b"><span class="exp-n" id="xn-${e.id}">${esc(e.name)}${e.featured ? ' <span class="exp-f">Featured</span>' : ''}</span><span class="exp-m">${expMeta(e)}</span><span class="exp-d" id="xd-${e.id}">${esc(e.shortDescription)}</span></span></label></li>`;
  };
  return `<div class="dc-exp" id="dcExp"><button type="button" class="dc-exp-t" data-act="exp" aria-expanded="${expOpen}" aria-controls="dcExpList"><span>Things to do in ${esc(d.name)} <span class="n">${xs.length}</span></span><span class="sel" id="dcExpSel"></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
 <div id="dcExpList"${expOpen ? '' : ' hidden'}><ul class="exp-list" aria-label="Things to do in ${esc(d.name)}">${xs.map(item).join('')}</ul><p class="exp-note">Ticked experiences are added to your quote request. Choosing one isn’t a booking, and it doesn’t change your route.</p></div></div>`;
}
function toggleExp(id, on) {
  if (on === S.exps.includes(id)) return;
  S.exps = on ? [...S.exps, id] : S.exps.filter((x) => x !== id);
  update();
  const e = X[id];
  toast(on ? `${e.name} added${tripIdx(e.destinationId) > -1 ? '' : ` · ${D[e.destinationId].name} isn’t in your route yet`}` : `${e.name} removed`);
}
// Places with selected experiences: in route order, then those not (or no longer) in the route.
function expGroups() {
  const ids = [...new Set(S.exps.map((x) => X[x].destinationId))];
  const inRoute = S.stops.map((s) => s.id).filter((id) => ids.includes(id));
  return { inRoute, outside: ids.filter((id) => !inRoute.includes(id)) };
}
// While the list is open on wide layouts, the card may grow up to the overlay and scroll inside,
// rather than covering the search box. Stacked layouts keep their CSS limit.
function sizeCard() {
  card.style.maxHeight = '';
  const ex = $('#dcExp');
  if (card.hidden || !expOpen || !ex || ex.hidden || stacked()) return;
  const m = mapwrap.getBoundingClientRect(),
    o = document.querySelector('.overlay');
  const gap = parseFloat(getComputedStyle(card).bottom) || 12;
  const top = o && o.offsetParent !== null ? o.getBoundingClientRect().bottom - m.top + 12 : gap;
  card.style.maxHeight = Math.max(260, m.height - top - gap) + 'px';
}
card.addEventListener('change', (e) => {
  if (e.target.matches('#dcExpList input[type=checkbox]')) toggleExp(e.target.value, e.target.checked);
});
function renderCardState() {
  if (!active || card.hidden) return;
  const d = D[active];
  // Added: keep the experience checkboxes in step with the planner (e.g. removed from the panel).
  const ex = $('#dcExp');
  if (ex) {
    ex.hidden = S.mode === 'shuttle';
    ex.querySelectorAll('input[type=checkbox]').forEach((i) => (i.checked = S.exps.includes(i.value)));
    const n = expsAt(d.id).length;
    $('#dcExpSel').textContent = n ? `${n} selected` : '';
    sizeCard();
  }
  if (S.mode === 'shuttle') {
    const leg = legInfo(AIR, d),
      sel = !!S.sh.place && S.sh.place.id === d.id;
    $('#dcFacts').innerHTML =
      `<div><dt>From CMB Airport</dt><dd>~${fmtDur(leg.min)} · ${leg.km} km (est.)</dd></div><div><dt>Car, one way</dt><dd>$${fare(leg.km, 'car')}</dd></div>`;
    $('#dcActions').innerHTML =
      (sel
        ? `<span class="in-trip"><i>✓</i>Your hotel location</span>`
        : `<button class="btn primary" data-act="sethotel">Set as hotel location</button>`) +
      `<div class="dc-nav"><button data-act="prev" aria-label="Previous place">←</button><button data-act="next" aria-label="Next place">→</button></div>`;
    return;
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
    fromL = 'pickup';
  }
  const leg = from ? legInfo(from, d) : null;
  $('#dcFacts').innerHTML =
    `<div><dt>${idx > -1 ? 'Your stay' : 'Suggested stay'}</dt><dd>${nightsTxt(idx > -1 ? S.stops[idx].nights : d.nights)}</dd></div>${leg ? `<div><dt>From ${esc(fromL)}</dt><dd>~${fmtDur(leg.min)} drive (est.)</dd></div>` : ''}`;
  $('#dcActions').innerHTML =
    (idx > -1
      ? `<span class="in-trip"><i>${idx + 1}</i>In your trip</span><button class="btn ghost" data-act="remove">Remove</button>`
      : `<button class="btn primary" data-act="add">Add to trip</button>`) +
    `<div class="dc-nav"><button data-act="prev" aria-label="Previous place">←</button><button data-act="next" aria-label="Next place">→</button></div>`;
}
card.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'close') closeCard();
  else if (act === 'add') addStop(active);
  else if (act === 'remove') removeStop(active);
  else if (act === 'sethotel') setShPlace({ id: active });
  else if (act === 'exp') {
    expOpen = !expOpen;
    a.setAttribute('aria-expanded', String(expOpen));
    $('#dcExpList').hidden = !expOpen;
    sizeCard();
  } else {
    const list = DESTS.filter((d) => filter === 'all' || d.cat === filter);
    let i = list.findIndex((d) => d.id === active);
    i = (i + (act === 'next' ? 1 : -1) + list.length) % list.length;
    openDest(list[i].id, true);
  }
  // Added: the card re-renders its buttons; keep keyboard focus on the equivalent control.
  if (act !== 'close' && !card.hidden && !card.contains(document.activeElement)) {
    const sel = act === 'prev' || act === 'next' ? `[data-act="${act}"]` : '.dc-actions .btn, .dc-nav button';
    const t = card.querySelector(sel);
    if (t) t.focus();
  }
});

/* trip ops */
function addStop(id) {
  if (S.stops.some((s) => s.id === id)) return;
  S.stops.push({ id, nights: D[id].nights });
  update();
  toast(`${D[id].name} added as stop ${S.stops.length}`);
}
function removeStop(id) {
  const d = D[id];
  S.stops = S.stops.filter((s) => s.id !== id);
  update();
  // Changed: experiences chosen there are kept (listed under "not in your route"), never dropped silently.
  const n = expsAt(id).length;
  toast(n ? `${d.name} removed · ${n === 1 ? 'its experience is' : `its ${n} experiences are`} kept under “not in your route”` : `${d.name} removed`);
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
    toast('Your stops are already in the shortest order');
    return;
  }
  S.stops = order;
  update();
  const saved = before - plan().drive;
  toast(saved >= 10 ? `Route reordered · about ${fmtDur(saved)} less driving` : 'Route reordered');
}
$('#optBtn').onclick = optimise;
$('#clearBtn').onclick = () => {
  if (S.mode === 'shuttle') {
    Object.assign(S.sh, { place: null, arrDate: '', arrTime: '', depDate: '', depTime: '' });
    syncShInputs();
    update();
    toast('Transfer cleared');
    return;
  }
  if (!S.stops.length && !S.pickup && !S.start && !S.exps.length) return;
  S.stops = [];
  S.exps = [];
  S.pickup = null;
  S.start = '';
  $('#startDate').value = '';
  update();
  toast('Trip cleared');
};

function renderStops() {
  const el = $('#stops');
  const p = plan();
  if (!S.stops.length) {
    el.innerHTML = `<div class="empty-stops">${TAP} a place on the map or search above to add your first stop. Add as many as you like and we’ll work out the dates.</div>${expOutsideHtml()}`;
    return;
  }
  let h = '';
  if (S.pickup)
    h += `<div class="endpt"><span class="ic"></span><span><b>Pickup</b> · ${esc(pickupLabel())}</span></div>`;
  h += '<ol class="stops">';
  p.rows.forEach((r) => {
    if (r.leg) h += `<li class="leg">~${fmtDur(r.leg.min)} · ${r.leg.km} km</li>`;
    const when = S.start
      ? r.s.nights
        ? `${fmtDs(dateAt(r.arrive))} – ${fmtDs(dateAt(r.depart))}`
        : fmtD(dateAt(r.arrive))
      : r.s.nights
        ? `Day ${r.arrive + 1}–${r.depart + 1}`
        : `Day ${r.arrive + 1}`;
    h += `<li class="stop"><span class="num">${r.i + 1}</span><div><button class="s-name" data-open="${r.d.id}">${r.d.name}</button><div class="s-sub">${when}</div></div>
  <div class="stepper wide"><button data-n="${r.d.id}" data-d="-1" ${r.s.nights <= 0 ? 'disabled' : ''} aria-label="Fewer nights in ${esc(r.d.name)}">−</button><span>${r.s.nights}<small>${r.s.nights === 1 ? 'night' : 'nights'}</small></span><button data-n="${r.d.id}" data-d="1" ${r.s.nights >= 14 ? 'disabled' : ''} aria-label="More nights in ${esc(r.d.name)}">+</button></div>
  <button class="rm" data-rm="${r.d.id}" aria-label="Remove ${esc(r.d.name)}">×</button>${expListHtml(r.d.id)}</li>`;
  });
  if (p.ret) h += `<li class="leg ret">~${fmtDur(p.ret.min)} · ${p.ret.km} km</li>`;
  h += '</ol>';
  if (S.pickup)
    h += `<div class="endpt"><span class="ic"></span><span><b>Drop-off</b> · ${esc(pickupLabel())}</span></div>`;
  // Added: the leg figures are formula estimates, not routed journey times.
  if (p.ret || p.rows.some((r) => r.leg)) h += `<p class="hint">Drive times and distances are rough estimates, not guaranteed journey times.</p>`;
  h += expOutsideHtml();
  el.innerHTML = h;
}
// Added: chosen experiences under each stop, and a group for places not in the route.
function expListHtml(id) {
  const xs = expsAt(id);
  return xs.length
    ? `<ul class="s-exp" aria-label="Experiences in ${esc(D[id].name)}">${xs.map((x) => `<li><span>${esc(X[x].name)}</span><button class="rmx" data-rmx="${x}" aria-label="Remove ${esc(X[x].name)}">×</button></li>`).join('')}</ul>`
    : '';
}
function expOutsideHtml() {
  const { outside } = expGroups();
  if (!outside.length) return '';
  return `<div class="exp-out"><p class="tagl">Experiences at places not in your route</p>${outside
    .map((id) => `<div class="exp-out-g"><div class="exp-out-h"><button class="s-name" data-open="${id}">${D[id].name}</button><button class="linkbtn" data-addstop="${id}">Add ${D[id].name} to route</button></div>${expListHtml(id)}</div>`)
    .join('')}</div>`;
}
$('#stops').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.open) openDest(t.dataset.open, true);
  else if (t.dataset.rm) removeStop(t.dataset.rm);
  else if (t.dataset.addstop) addStop(t.dataset.addstop);
  else if (t.dataset.rmx) {
    toggleExp(t.dataset.rmx, false);
    $('#stops .rmx, #stops .s-name')?.focus(); // the list re-renders: keep keyboard focus nearby
  }
  else if (t.dataset.n) {
    const s = S.stops.find((x) => x.id === t.dataset.n);
    s.nights = Math.max(0, Math.min(14, s.nights + +t.dataset.d));
    update();
    // Added: the list re-renders; keep keyboard focus on the stepper that was pressed.
    const again = $(`#stops [data-n="${t.dataset.n}"][data-d="${t.dataset.d}"]`);
    const other = $(`#stops [data-n="${t.dataset.n}"][data-d="${-t.dataset.d}"]`);
    (again && !again.disabled ? again : other)?.focus();
  }
});

/* pickup */
const pkIn = $('#pkIn'),
  pkList = $('#pkList');
let pkRes = [],
  pkHi = 0;
function pkSearch() {
  const t = pkIn.value.trim().toLowerCase();
  pkRes = PICKUPS.filter((p) => !t || (p.name + ' ' + p.sub + ' ' + p.code).toLowerCase().includes(t));
  pkHi = 0;
  renderPkList();
}
function renderPkList() {
  pkList.hidden = false;
  pkList.innerHTML =
    pkRes
      .map(
        (p, i) =>
          `<li class="${i === pkHi ? 'hi' : ''}" data-i="${i}" id="pk-${i}" role="option" aria-selected="${i === pkHi}"><span class="code">${p.code}</span><span><b>${p.name}</b><small>${p.sub}</small></span></li>`,
      )
      .join('') +
    `<li class="pinopt ${pkHi === pkRes.length ? 'hi' : ''}" data-pin="1" id="pk-${pkRes.length}" role="option" aria-selected="${pkHi === pkRes.length}"><span class="code">PIN</span><span><b>Somewhere else</b><small>Drop a pin on the map</small></span></li>`;
  comboState(pkIn, pkList, 'pk-' + pkHi);
}
pkIn.addEventListener('focus', pkSearch);
pkIn.addEventListener('input', pkSearch);
pkIn.addEventListener('blur', () => setTimeout(() => hideList(pkIn, pkList), 120));
pkIn.addEventListener('keydown', (e) => {
  if (pkList.hidden) return;
  if (e.key === 'ArrowDown') {
    pkHi = Math.min(pkRes.length, pkHi + 1);
    renderPkList();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    pkHi = Math.max(0, pkHi - 1);
    renderPkList();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    pkHi === pkRes.length ? startPin() : setPickup({ id: pkRes[pkHi].id });
  } else if (e.key === 'Escape') pkIn.blur();
});
pkList.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  e.preventDefault();
  li.dataset.pin ? startPin() : setPickup({ id: pkRes[+li.dataset.i].id });
});
function setPickup(p) {
  S.pickup = p;
  pkIn.value = '';
  pkIn.blur();
  hideList(pkIn, pkList);
  update();
  const pt = pickupPt();
  if (p.id !== 'pin')
    map.panInside([pt.lat, pt.lng], {
      paddingTopLeft: [stacked() ? 20 : padL() + 60, stacked() ? padT() + 10 : 60],
      paddingBottomRight: [60, 60],
    });
  toast('Pickup set · ' + pickupLabel());
}
function startPin(t) {
  pinTarget = t === 'shuttle' ? 'shuttle' : 'tour';
  $('#pinTxt').textContent =
    pinTarget === 'shuttle' ? `${TAP} the map where you’re staying` : `${TAP} the map to set your pickup point`;
  pkIn.blur();
  hideList(pkIn, pkList);
  picking = true;
  mapwrap.classList.add('picking');
  $('#pinBanner').hidden = false;
  closeCard();
  if (isNarrow()) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
}
function stopPin() {
  picking = false;
  mapwrap.classList.remove('picking');
  $('#pinBanner').hidden = true;
}
$('#pinBtn').onclick = startPin;
$('#pinCancel').onclick = stopPin;
map.on('click', (e) => {
  if (picking) {
    stopPin();
    const pp = { id: 'pin', lat: e.latlng.lat, lng: e.latlng.lng };
    pinTarget === 'shuttle' ? setShPlace(pp) : setPickup(pp);
  } else if (active) closeCard();
});
function renderPickup() {
  const c = $('#pkChosen'),
    pk = $('#pkPicker');
  if (!S.pickup) {
    c.innerHTML = '';
    pk.hidden = false;
    return;
  }
  pk.hidden = true;
  const isPin = S.pickup.id === 'pin';
  const p = pickupPt();
  c.innerHTML = `<div class="chosen"><span class="code">${isPin ? 'PIN' : p.code}</span><span><b>${isPin ? esc(pickupLabel()) : p.name}</b><small>${isPin ? 'Drag the pin on the map to adjust' : p.sub}</small></span><button class="linkbtn" id="pkChange" aria-label="Change pickup location">Change</button></div>`;
  $('#pkChange').onclick = () => {
    S.pickup = null;
    update();
    setTimeout(() => pkIn.focus(), 0);
  };
}

/* date */
const sd = $('#startDate');
sd.min = TODAY;
sd.value = S.start || '';
sd.addEventListener('change', () => {
  // Added: typed dates can get past the picker's minimum.
  if (sd.value && sd.value < TODAY) {
    sd.value = '';
    toast('Please choose today or a later date');
  }
  S.start = sd.value;
  update();
});
function renderDate() {
  const p = plan();
  const el = $('#dateInfo');
  if (!S.start) {
    el.innerHTML = S.stops.length
      ? `Your route is <b>${p.nights + 1} days, ${p.nights} ${p.nights === 1 ? 'night' : 'nights'}</b>. Pick a start date to see dates for each stop.`
      : 'Pick the day we collect you. Dates for each stop are worked out from here.';
    return;
  }
  el.innerHTML = S.stops.length
    ? `${fmtD(dateAt(0))} to <b>${fmtD(dateAt(p.nights))}</b> · ${p.nights + 1} days, ${p.nights} ${p.nights === 1 ? 'night' : 'nights'}`
    : `Starts <b>${fmtD(dateAt(0))}</b>. Add stops to see your end date.`;
}

/* travellers */
document.querySelectorAll('.stepper[data-k]').forEach((st) =>
  st.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const k = st.dataset.k;
    const v = S[k] + +b.dataset.d;
    if (k === 'adults' && v < 1) return;
    if (v < 0 || v + (k === 'adults' ? S.children : S.adults) > 20) return;
    S[k] = v;
    update();
  }),
);
function renderTrav() {
  $('#adults').textContent = S.adults;
  $('#children').textContent = S.children;
  document.querySelector('[data-k="adults"] [data-d="-1"]').disabled = S.adults <= 1;
  document.querySelector('[data-k="children"] [data-d="-1"]').disabled = S.children <= 0;
  document.querySelectorAll('[data-k] [data-d="1"]').forEach((b) => (b.disabled = pax() >= 20));
  const vid = vehicleId();
  const rec = VEHICLES.find((v) => v.cap >= pax()).id;
  const shl = S.mode === 'shuttle' ? shLeg() : null;
  $('#vehicles').innerHTML = VEHICLES.map(
    (v) =>
      `<button class="vcard ${v.id === vid ? 'on' : ''}" data-v="${v.id}" aria-pressed="${v.id === vid}" ${v.cap < pax() ? 'disabled' : ''}><span class="rec">${v.id === rec ? 'Best fit' : ''}</span><b>${v.name}</b><small>${v.model}</small>${shl ? `<span class="vp">$${fare(shl.km, v.id) * nLegs()}</span>` : ''}<span class="cap">Up to ${v.cap} people</span></button>`,
  ).join('');
}
$('#vehicles').addEventListener('click', (e) => {
  const b = e.target.closest('[data-v]');
  if (!b || b.disabled) return;
  S.vehicle = b.dataset.v;
  update();
});

/* summary + cta */
function renderSummary() {
  if (S.mode === 'shuttle') return renderShSummary();
  const p = plan();
  const n = S.stops.length;
  const k = S.exps.length;
  $('#summary').textContent =
    (n
      ? `${n} ${n === 1 ? 'stop' : 'stops'} · ${p.nights} ${p.nights === 1 ? 'night' : 'nights'}${p.drive ? ` · ~${fmtDur(p.drive)} driving` : ''}`
      : 'No stops yet') + (k ? ` · ${k} ${k === 1 ? 'experience' : 'experiences'}` : '');
  $('#optBtn').hidden = n < 2;
  $('#clearBtn').hidden = !(n || S.pickup || S.start || S.exps.length);
  $('#pillCount').textContent = n;
  const miss = [];
  if (!n) miss.push('a destination');
  if (!S.pickup) miss.push('a pickup location');
  if (!S.start) miss.push('a start date');
  const btn = $('#quoteBtn');
  btn.disabled = !!miss.length;
  $('#ctaHint').innerHTML = miss.length
    ? `Add ${miss.length > 1 ? miss.slice(0, -1).join(', ') + ' and ' + miss.at(-1) : miss[0]} to request a quote.`
    : `<b>${p.nights + 1} days</b> · ${n} ${n === 1 ? 'stop' : 'stops'} · ${pax()} ${pax() === 1 ? 'traveller' : 'travellers'} · ${VEHICLES.find((v) => v.id === vehicleId()).name}`;
}
$('#tripPill').onclick = () => window.scrollTo({ top: $('#panel').offsetTop - 60, behavior: reduceMotion() ? 'auto' : 'smooth' });

/* quote modal */
const mbg = $('#mbg');
let hotel = 'Mid-range';
// Added: dialog focus handling — remember the opener, trap Tab inside, restore on close.
let modalReturn = null;
function showModal(html) {
  modalReturn = document.activeElement;
  mbg.innerHTML = html;
  mbg.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#qform').onsubmit = submitQuote;
  setTimeout(() => mbg.querySelector('input[name=name]').focus(), 50);
}
mbg.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const els = [...mbg.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex="-1"]:focus')].filter(
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
});
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
function openQuote() {
  const p = plan();
  const v = VEHICLES.find((x) => x.id === vehicleId());
  showModal(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
 <div class="m-sum"><p class="eyebrow">Your trip</p><h3>${p.nights + 1} days in Sri Lanka</h3>
  <ol class="m-stops">${p.rows.map((r) => `<li><span class="n">${String(r.i + 1).padStart(2, '0')}</span><span class="nm">${r.d.name}</span><span class="dt">${r.s.nights ? `${fmtDs(dateAt(r.arrive))}–${fmtDs(dateAt(r.depart))}` : fmtDs(dateAt(r.arrive))}</span>${mExp(r.d.id)}</li>`).join('')}</ol>${mAlso()}
  <dl class="m-facts"><div><dt>Pickup</dt><dd>${esc(pickupLabel())}</dd></div><div><dt>Dates</dt><dd>${fmtDs(dateAt(0))} – ${fmtDs(dateAt(p.nights))}</dd></div><div><dt>Travellers</dt><dd>${S.adults} ${S.adults === 1 ? 'adult' : 'adults'}${S.children ? `, ${S.children} ${S.children === 1 ? 'child' : 'children'}` : ''}</dd></div><div><dt>Vehicle</dt><dd>${v.name}</dd></div><div><dt>Driving (est.)</dt><dd>~${fmtDur(p.drive)} · ${p.km} km</dd></div></dl></div>
 <form class="m-form" id="qform" novalidate><button type="button" class="m-close" data-close aria-label="Close">×</button>
  <h2 id="mTitle">Request a quote</h2><p>${SITE.quoteEndpoint ? 'Send this route to our travel planners.' : 'Add your details, then send this route to us on WhatsApp or by email.'} We’ll reply with a price and any suggested changes.</p>
  <div class="f2"><label class="fl" data-f="name"><span>Full name</span><div class="field"><input name="name" autocomplete="name" aria-required="true"></div></label>
  <label class="fl" data-f="email"><span>Email</span><div class="field"><input name="email" type="email" autocomplete="email" aria-required="true"></div></label></div>
  <div class="f2"><label class="fl"><span>WhatsApp / phone (optional)</span><div class="field"><input name="phone" type="tel" autocomplete="tel"></div></label>
  <label class="fl"><span>Country of residence</span><div class="field"><input name="country" autocomplete="country-name"></div></label></div>
  <div class="fl"><span id="hotelLbl">Hotels</span><div class="seg" id="hotelSeg" role="group" aria-labelledby="hotelLbl">${['Budget', 'Mid-range', 'Luxury', 'I’ll book my own'].map((h) => `<button type="button" class="${h === hotel ? 'on' : ''}" aria-pressed="${h === hotel}">${h}</button>`).join('')}</div></div>
  <label class="fl"><span>Anything else? (optional)</span><textarea name="notes" placeholder="Flight times, interests, dietary needs…"></textarea></label>
  <button class="btn primary" type="submit" style="height:52px">${SITE.quoteEndpoint ? 'Send request' : 'Continue'}</button></form></div>`);
  $('#hotelSeg').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    hotel = b.textContent;
    [...e.currentTarget.children].forEach((x) => {
      x.classList.toggle('on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
  };
}

// Changed: the design only simulated sending. Requests now really reach the business —
// POSTed to SITE.quoteEndpoint when one is configured, otherwise handed off to WhatsApp
// (or email) as a pre-filled message. The confirmation copy only claims what happened.
const fmtLong = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const mapsLink = (p) => `https://www.google.com/maps?q=${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
function requestText(sh, ref, f) {
  const out = [];
  const v = VEHICLES.find((x) => x.id === vehicleId());
  if (sh) {
    const t = shTimes(),
      title = DIRS[S.sh.dir].title;
    out.push(`Hello ${SITE.name}, I’d like to book an airport transfer (ref ${ref}).`, '');
    out.push(`${title} · ${v.name} · $${shTotal()} fixed price per vehicle`);
    if (needArr()) out.push(`Arrival: CMB Airport → ${shLabel()} · flight lands ${fmtLong(dOf(S.sh.arrDate, 0))} at ${S.sh.arrTime}`);
    if (needDep())
      out.push(
        `Departure: ${shLabel()} → CMB Airport · flight leaves ${fmtLong(dOf(S.sh.depDate, 0))} at ${S.sh.depTime} · estimated pickup ${t.pickup}${t.pickupPrev ? ' the day before' : ''}`,
      );
    if (S.sh.place.id === 'pin') out.push(`Hotel location: ${mapsLink(S.sh.place)}`);
  } else {
    const p = plan();
    out.push(`Hello ${SITE.name}, I’d like a quote for a private tour (ref ${ref}).`, '');
    out.push(`Route: ${p.nights + 1} days, ${p.nights} ${p.nights === 1 ? 'night' : 'nights'} · about ${fmtDur(p.drive)} driving, ${p.km} km (estimate)`);
    p.rows.forEach((r) => {
      out.push(
        `${r.i + 1}. ${r.d.name} — ${nightsTxt(r.s.nights)} (${r.s.nights ? `${fmtDs(dateAt(r.arrive))} – ${fmtDs(dateAt(r.depart))}` : fmtDs(dateAt(r.arrive))})`,
      );
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
    out.push(`Pickup and drop-off: ${pickupLabel()}${S.pickup.id === 'pin' ? ' ' + mapsLink(S.pickup) : ''}`);
    out.push(`Start date: ${fmtLong(dateAt(0))}`, `Vehicle: ${v.name}`, `Hotels: ${hotel}`);
  }
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
async function submitQuote(e) {
  e.preventDefault();
  const f = e.target;
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
  if (!f.name.value.trim()) bad('name', 'Please enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) bad('email', 'Please enter a valid email');
  if (f.querySelector('[data-f="phone"]') && f.phone.value.replace(/\D/g, '').length < 7)
    bad('phone', 'Please enter a phone number so the driver can reach you');
  if (!ok) {
    f.querySelector('[aria-invalid]').focus();
    return;
  }
  const sh = S.mode === 'shuttle';
  const ref = (sh ? 'SL-T-' : 'SL-') + String(Math.floor(1000 + Math.random() * 9000));
  const val = (k) => (f[k] ? f[k].value.trim() : '');
  const data = { name: val('name'), email: val('email'), phone: val('phone'), country: val('country'), notes: val('notes') };
  const first = esc(data.name.split(' ')[0]);
  const em = esc(data.email);
  const text = requestText(sh, ref, data);
  const subject = sh ? `Airport transfer request ${ref}` : `Private tour quote request ${ref}`;
  const wa = `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  const mail = `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const done = (refLabel, h, body, actions) => {
    f.innerHTML = `<button type="button" class="m-close" data-close aria-label="Close">×</button><div class="done"><span class="ref">${refLabel}</span><h2 tabindex="-1">${h}</h2><p>${body}</p><div class="row">${actions}</div></div>`;
    f.querySelector('.done h2').focus();
  };
  const back = `<button type="button" class="btn primary" data-close>Back to map</button>`;
  const handoff = `<a class="btn primary" href="${esc(wa)}" target="_blank" rel="noopener">Send on WhatsApp</a><a class="btn ghost" href="${esc(mail)}">Send by email</a>`;
  const kind = sh ? DIRS[S.sh.dir].title.toLowerCase() : '';

  if (SITE.quoteEndpoint) {
    const btn = f.querySelector('[type=submit]'),
      label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const r = await fetch(SITE.quoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ref, type: sh ? 'airport-transfer' : 'tour', ...data, experiences: sh ? [] : expPayload(), _subject: subject, message: text }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
    } catch (err) {
      console.warn('Request could not be sent', err);
      btn.disabled = false;
      btn.textContent = label;
      f.querySelector('.send-err')?.remove();
      btn.insertAdjacentHTML(
        'beforebegin',
        `<p class="hint bad send-err" role="alert">We couldn’t send your request just now. Please try again, or <a href="${esc(wa)}" target="_blank" rel="noopener">send it on WhatsApp</a>.</p>`,
      );
      return;
    }
    if (sh)
      return done(
        `Request ${ref}`,
        `Thank you, ${first}.`,
        `Your ${kind} request (<b>$${shTotal()}</b>, fixed price per vehicle) has been sent. We’ll confirm availability and email your driver details to <b>${em}</b>.`,
        back,
      );
    return done(
      `Request ${ref}`,
      `Thank you, ${first}.`,
      `Your route has been sent to our travel planners. We’ll reply to <b>${em}</b> with a quote for this trip.`,
      back,
    );
  }
  if (sh)
    return done(
      `Request ${ref}`,
      `Nearly done, ${first}.`,
      `Your ${kind} request (<b>$${shTotal()}</b>, fixed price per vehicle) is ready. Nothing is sent or booked until you press send on WhatsApp or in your email app; we’ll then confirm availability and your driver details.`,
      handoff,
    );
  done(
    `Request ${ref}`,
    `Nearly done, ${first}.`,
    `Your route is ready. Nothing is sent until you press send on WhatsApp or in your email app; we’ll then reply with a quote for this trip.`,
    handoff,
  );
}
function closeQuote() {
  mbg.hidden = true;
  mbg.innerHTML = '';
  document.body.style.overflow = '';
  if (modalReturn && document.contains(modalReturn)) modalReturn.focus();
  modalReturn = null;
}
mbg.addEventListener('click', (e) => {
  if (e.target === mbg || e.target.closest('[data-close]')) closeQuote();
});
$('#quoteBtn').onclick = () => (S.mode === 'shuttle' ? openShuttle() : openQuote());

/* airport shuttle */
const AIR = P.cmb;
const SHPLACES = [
  P.colombo,
  P.negombo,
  P.port,
  ...DESTS.map((d) => ({
    id: d.id,
    code: d.name
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 3)
      .toUpperCase(),
    name: d.name,
    short: d.name,
    sub: 'Hotels in and around ' + d.name,
    lat: d.lat,
    lng: d.lng,
  })),
];
const SHP = Object.fromEntries(SHPLACES.map((p) => [p.id, p]));
const DIRS = {
  arr: { t: 'Arrival', title: 'Arrival transfer' },
  dep: { t: 'Departure', title: 'Departure transfer' },
  ret: { t: 'Return', title: 'Return transfer' },
};
// Changed: rates live in src/data/destinations.mjs (SHUTTLE_FARES) — confirm them before launch.
function fare(km, vid) {
  const F = SHUTTLE_FARES;
  return Math.round((Math.max(F.min, F.base + km * F.perKm) * F.mult[vid]) / 5) * 5;
}
S.mode = S.mode === 'shuttle' ? 'shuttle' : 'tour';
S.sh = Object.assign({ dir: 'arr', place: null, arrDate: '', arrTime: '', depDate: '', depTime: '' }, S.sh || {});
if (S.sh.place && S.sh.place.id !== 'pin' && !SHP[S.sh.place.id]) S.sh.place = null;
let pinTarget = 'tour';
function needArr() {
  return S.sh.dir !== 'dep';
}
function needDep() {
  return S.sh.dir !== 'arr';
}
function nLegs() {
  return S.sh.dir === 'ret' ? 2 : 1;
}
function shPt() {
  const p = S.sh.place;
  return !p ? null : p.id === 'pin' ? p : SHP[p.id];
}
function shLabel() {
  const p = S.sh.place;
  if (!p) return '';
  if (p.id !== 'pin') return SHP[p.id].short;
  const n = nearest(p);
  return 'Pin near ' + (n.short || n.name);
}
function shLeg() {
  const p = shPt();
  return p ? legInfo(AIR, p) : null;
}
function shTotal() {
  const l = shLeg();
  return l ? fare(l.km, vehicleId()) * nLegs() : 0;
}
const hm = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmtT = (m) => {
  m = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
const dOf = (s, off) => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + off);
  return d;
};
const andList = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a.at(-1) : a[0]);
const travTxt = () =>
  `${S.adults} ${S.adults === 1 ? 'adult' : 'adults'}${S.children ? `, ${S.children} ${S.children === 1 ? 'child' : 'children'}` : ''}`;
function shTimes() {
  const l = shLeg(),
    o = {};
  if (l && S.sh.arrTime) {
    const at = hm(S.sh.arrTime) + SHUTTLE_TIMING.arrivalBufferMin + l.min;
    o.hotelAt = fmtT(at);
    o.hotelNext = at >= 1440;
  }
  if (l && S.sh.depTime) {
    const pk = Math.floor((hm(S.sh.depTime) - SHUTTLE_TIMING.departureBufferMin - l.min) / 15) * 15;
    o.pickup = fmtT(pk);
    o.pickupPrev = pk < 0;
  }
  return o;
}
function shErr() {
  const s = S.sh;
  if (
    s.dir === 'ret' &&
    s.arrDate &&
    s.arrTime &&
    s.depDate &&
    s.depTime &&
    `${s.depDate}T${s.depTime}` <= `${s.arrDate}T${s.arrTime}`
  )
    return 'Your departure flight must be after your arrival flight.';
  return '';
}
function shMissing() {
  const m = [];
  if (!S.sh.place) m.push('where you’re staying');
  if (needArr() && !(S.sh.arrDate && S.sh.arrTime)) m.push('your arrival flight time');
  if (needDep() && !(S.sh.depDate && S.sh.depTime)) m.push('your departure flight time');
  return m;
}

const ovEb = $('.overlay .eyebrow'),
  ovH = $('.overlay h1'),
  ovP = $('.overlay .lede');
const COPY = {
  tour: { eb: ovEb.innerHTML, h: ovH.innerHTML, p: ovP.innerHTML },
  shuttle: {
    eb: 'Bandaranaike International · CMB',
    h: 'Airport transfers, <em>at a fixed price.</em>',
    p: 'Choose an arrival, departure or return transfer, then tell us where you’re staying and when your flight is. The price is per vehicle and shown before you send your request.',
  },
};
function setMode(m) {
  if (S.mode === m) return;
  if (picking) stopPin();
  S.mode = m;
  update();
}
$('#modes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (b) setMode(b.dataset.mode);
});
function renderMode() {
  const sh = S.mode === 'shuttle';
  document.querySelectorAll('#modes [data-mode]').forEach((b) => {
    const on = b.dataset.mode === S.mode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  $('#tourView').hidden = sh;
  $('#shView').hidden = !sh;
  $('#pTitle').textContent = sh ? 'Airport transfer' : 'Your trip';
  $('#pillLbl').textContent = sh ? 'Transfer' : 'Your trip';
  $('#quoteBtn').textContent = sh ? 'Request transfer' : 'Request a quote';
  if (ovH.dataset.m !== S.mode) {
    const c = COPY[S.mode];
    ovEb.innerHTML = c.eb;
    ovH.innerHTML = c.h;
    ovP.innerHTML = c.p;
    ovH.dataset.m = S.mode;
    requestAnimationFrame(hideSeaLabels);
  }
}

const shIn = $('#shIn'),
  shList = $('#shList');
let shRes = [],
  shHi = 0;
function shSearch() {
  const t = shIn.value.trim().toLowerCase();
  shRes = SHPLACES.filter((p) => !t || (p.name + ' ' + p.sub + ' ' + p.code).toLowerCase().includes(t));
  shHi = 0;
  renderShList();
}
function renderShList() {
  shList.hidden = false;
  shList.innerHTML =
    shRes
      .map(
        (p, i) =>
          `<li class="${i === shHi ? 'hi' : ''}" data-i="${i}" id="sh-${i}" role="option" aria-selected="${i === shHi}"><span class="code">${p.code}</span><span><b>${p.name}</b><small>${p.sub}</small></span></li>`,
      )
      .join('') +
    `<li class="pinopt ${shHi === shRes.length ? 'hi' : ''}" data-pin="1" id="sh-${shRes.length}" role="option" aria-selected="${shHi === shRes.length}"><span class="code">PIN</span><span><b>Somewhere else</b><small>Drop a pin on the map</small></span></li>`;
  comboState(shIn, shList, 'sh-' + shHi);
}
shIn.addEventListener('focus', shSearch);
shIn.addEventListener('input', shSearch);
shIn.addEventListener('blur', () => setTimeout(() => hideList(shIn, shList), 120));
shIn.addEventListener('keydown', (e) => {
  if (shList.hidden) return;
  if (e.key === 'ArrowDown') {
    shHi = Math.min(shRes.length, shHi + 1);
    renderShList();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    shHi = Math.max(0, shHi - 1);
    renderShList();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    shHi === shRes.length ? startPin('shuttle') : setShPlace({ id: shRes[shHi].id });
  } else if (e.key === 'Escape') shIn.blur();
});
shList.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  e.preventDefault();
  li.dataset.pin ? startPin('shuttle') : setShPlace({ id: shRes[+li.dataset.i].id });
});
$('#shPinBtn').onclick = () => startPin('shuttle');
$('#shChosen').addEventListener('click', (e) => {
  if (e.target.closest('[data-shchange]')) {
    S.sh.place = null;
    update();
    setTimeout(() => shIn.focus(), 0);
  }
});
function setShPlace(p) {
  S.sh.place = p;
  shIn.value = '';
  shIn.blur();
  hideList(shIn, shList);
  update();
  const pt = shPt();
  userMoved = true;
  map.fitBounds(
    L.latLngBounds([
      [AIR.lat, AIR.lng],
      [pt.lat, pt.lng],
    ]).pad(0.25),
    {
      paddingTopLeft: [stacked() ? 20 : padL() + 40, stacked() ? padT() + 10 : 60],
      paddingBottomRight: [60, stacked() && !card.hidden ? card.offsetHeight + 30 : 60],
      maxZoom: 10,
    },
  );
  toast('Hotel location set · ' + shLabel());
}
$('#shDir').addEventListener('click', (e) => {
  const b = e.target.closest('[data-dir]');
  if (!b) return;
  S.sh.dir = b.dataset.dir;
  update();
});
const SHIN = { shArrDate: 'arrDate', shArrTime: 'arrTime', shDepDate: 'depDate', shDepTime: 'depTime' };
Object.entries(SHIN).forEach(([id, k]) =>
  $('#' + id).addEventListener('change', (e) => {
    if (/Date$/.test(k) && e.target.value && e.target.value < TODAY) {
      e.target.value = '';
      toast('Please choose today or a later date');
    }
    S.sh[k] = e.target.value;
    update();
  }),
);
function syncShInputs() {
  Object.entries(SHIN).forEach(([id, k]) => ($('#' + id).value = S.sh[k] || ''));
}
syncShInputs();
$('#shArrDate').min = sd.min;

function renderShuttle() {
  if (S.mode !== 'shuttle') return;
  const d = S.sh.dir,
    l = shLeg(),
    t = shTimes(),
    lbl = esc(shLabel());
  document.querySelectorAll('#shDir [data-dir]').forEach((b) => {
    b.classList.toggle('on', b.dataset.dir === d);
    b.setAttribute('aria-pressed', String(b.dataset.dir === d));
  });
  $('#shRoute').classList.toggle('rev', d === 'dep');
  $('#apTag').textContent = d === 'dep' ? 'To' : 'From';
  $('#htTag').textContent = d === 'dep' ? 'From' : 'To';
  const lg = $('#shLeg');
  lg.hidden = !l;
  if (l) lg.textContent = `~${fmtDur(l.min)} · ${l.km} km${d === 'ret' ? ' · each way' : ''} (est.)`;
  const c = $('#shChosen'),
    pk = $('#shPicker');
  if (!S.sh.place) {
    c.innerHTML = '';
    pk.hidden = false;
  } else {
    pk.hidden = true;
    const isPin = S.sh.place.id === 'pin',
      p = shPt();
    c.innerHTML = `<div class="chosen"><span class="code">${isPin ? 'PIN' : p.code}</span><span><b>${isPin ? lbl : p.name}</b><small>${isPin ? 'Drag the pin on the map to adjust' : p.sub}</small></span><button class="linkbtn" data-shchange aria-label="Change hotel location">Change</button></div>`;
  }
  $('#shArr').hidden = !needArr();
  $('#shDep').hidden = !needDep();
  $('#shArrInfo').innerHTML = !S.sh.arrTime
    ? 'Local time. Your driver waits for you in the arrivals hall.'
    : !l
      ? 'Add where you’re staying to see your drop-off time.'
      : `Your driver waits in arrivals. You’ll reach ${lbl} around <b>${t.hotelAt}${t.hotelNext ? ' the next day' : ''}</b>, allowing ${SHUTTLE_TIMING.arrivalBufferMin} min for immigration and bags (estimate).`;
  $('#shDepInfo').innerHTML = !S.sh.depTime
    ? 'Local time. We’ll work out when to collect you.'
    : !l
      ? 'Add where you’re staying to see your pickup time.'
      : `Estimated pickup from ${lbl} at <b>${t.pickup}${t.pickupPrev ? ' the day before' : ''}</b>, aiming to reach the airport ${SHUTTLE_TIMING.departureBufferMin / 60} hours before your flight.`;
  $('#shDepDate').min = S.sh.arrDate || sd.min;
  const err = shErr(),
    ee = $('#shErr');
  ee.hidden = !err;
  ee.textContent = err;
}
function renderShSummary() {
  const l = shLeg(),
    v = VEHICLES.find((x) => x.id === vehicleId()),
    s = S.sh;
  $('#summary').textContent = l
    ? `${DIRS[s.dir].t} · ~${fmtDur(l.min)} · ${l.km} km${s.dir === 'ret' ? ' each way' : ''}`
    : 'Bandaranaike International · CMB';
  $('#optBtn').hidden = true;
  $('#clearBtn').hidden = !(s.place || s.arrDate || s.arrTime || s.depDate || s.depTime);
  $('#pillCount').textContent = nLegs();
  const miss = shMissing(),
    err = shErr(),
    total = shTotal();
  $('#quoteBtn').disabled = !!(miss.length || err);
  $('#ctaHint').innerHTML =
    (total
      ? `<span class="cta-price"><b>$${total}</b><span>${DIRS[s.dir].title} · ${v.name}<br>Fixed price per vehicle</span></span>`
      : '') + (miss.length ? `<span>Add ${andList(miss)} to request a transfer.</span>` : err ? `<span>${err}</span>` : '');
}
const PLANE =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path></svg>';
function renderShMarkers() {
  apMarker = L.marker([AIR.lat, AIR.lng], {
    icon: L.divIcon({
      className: '',
      iconSize: [0, 0],
      html: `<div class="pk ap"><span class="sq">${PLANE}</span><span class="pl"><b>Airport</b> · CMB</span></div>`,
    }),
    zIndexOffset: 3100,
    keyboard: false,
    interactive: false,
  }).addTo(map);
  const p = shPt();
  if (!p || D[S.sh.place.id]) return;
  const isPin = S.sh.place.id === 'pin',
    right = !(p.lng < AIR.lng && hav(p, AIR) >= 25);
  pkMarker = L.marker([p.lat, p.lng], {
    icon: L.divIcon({
      className: '',
      iconSize: [0, 0],
      html: `<div class="pk ${isPin ? 'drag' : ''} ${right ? 'r' : ''}"><span class="sq"></span><span class="pl"><b>Hotel</b> · ${esc(shLabel())}</span></div>`,
    }),
    draggable: isPin,
    zIndexOffset: 3000,
    keyboard: false,
  }).addTo(map);
  if (isPin)
    pkMarker.on('dragend', (e) => {
      const ll = e.target.getLatLng();
      S.sh.place = { id: 'pin', lat: ll.lat, lng: ll.lng };
      update();
    });
}
function renderShRoute() {
  const p = shPt();
  if (!p) return;
  const d = S.sh.dir;
  const draw = (a, b) => {
    const c = curve(a, b);
    L.polyline(c, { className: 'route-glow', weight: 4, interactive: false }).addTo(routeLayer);
    L.polyline(c, { className: 'route', weight: 2.5, interactive: false }).addTo(routeLayer);
  };
  if (d !== 'dep') draw(AIR, p);
  if (d !== 'arr') draw(p, AIR);
}
function openShuttle() {
  const l = shLeg(),
    v = VEHICLES.find((x) => x.id === vehicleId()),
    t = shTimes(),
    total = shTotal(),
    lbl = esc(shLabel()),
    legs = [];
  if (needArr()) legs.push({ r: `CMB → ${lbl}`, dt: `${fmtDs(dOf(S.sh.arrDate, 0))} · lands ${S.sh.arrTime}` });
  if (needDep())
    legs.push({ r: `${lbl} → CMB`, dt: `${fmtDs(dOf(S.sh.depDate, t.pickupPrev ? -1 : 0))} · estimated pickup ${t.pickup}` });
  showModal(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
 <div class="m-sum"><p class="eyebrow">Airport transfer</p><h3>${DIRS[S.sh.dir].title}</h3>
  <ol class="m-stops">${legs.map((g, i) => `<li><span class="n">0${i + 1}</span><span class="nm">${g.r}</span><span class="dt">${g.dt}</span></li>`).join('')}</ol>
  <dl class="m-facts"><div><dt>Travellers</dt><dd>${travTxt()}</dd></div><div><dt>Vehicle</dt><dd>${v.name}</dd></div><div><dt>Drive (est.)</dt><dd>~${fmtDur(l.min)} · ${l.km} km${legs.length > 1 ? ' each way' : ''}</dd></div><div><dt>Fixed price</dt><dd class="m-price">$${total}</dd></div></dl></div>
 <form class="m-form" id="qform" novalidate><button type="button" class="m-close" data-close aria-label="Close">×</button>
  <h2 id="mTitle">Request your transfer</h2><p>$${total} per vehicle${legs.length > 1 ? ' for both transfers' : ''}, fixed price. ${SITE.quoteEndpoint ? 'We’ll confirm availability and email your driver details.' : 'Add your details, then send the request on WhatsApp or by email. We’ll confirm availability and your driver details.'}</p>
  <div class="f2"><label class="fl" data-f="name"><span>Full name</span><div class="field"><input name="name" autocomplete="name" aria-required="true"></div></label>
  <label class="fl" data-f="email"><span>Email</span><div class="field"><input name="email" type="email" autocomplete="email" aria-required="true"></div></label></div>
  <label class="fl" data-f="phone"><span>WhatsApp / phone</span><div class="field"><input name="phone" type="tel" autocomplete="tel" aria-required="true"></div></label>
  <label class="fl"><span>Hotel name and anything else (optional)</span><textarea name="notes" placeholder="Hotel name, luggage, child seats…"></textarea></label>
  <button class="btn primary" type="submit" style="height:52px">${SITE.quoteEndpoint ? `Request transfer · $${total}` : 'Continue'}</button></form></div>`);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!mbg.hidden) closeQuote();
    else if (picking) stopPin();
    else if (active) closeCard();
  }
  if (e.key === '/' && mbg.hidden && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    q.focus();
  }
});
let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    map.invalidateSize({ pan: false });
    if (!userMoved && !active) fit();
    sizeCard();
  }, 150);
});

function update() {
  renderMode();
  renderPickupMarker();
  renderPins();
  renderRoute();
  renderStops();
  renderPickup();
  renderDate();
  renderShuttle();
  renderTrav();
  renderSummary();
  renderCardState();
  save();
}
renderChips();
update();
document.documentElement.classList.add('map-ready');
if (staleDates) setTimeout(() => toast('The dates in your saved trip have passed, so we cleared them'), 600);

// Added: deep links from place pages — /#add=<id> adds the stop, /#place=<id> just opens it,
// /#experiences=<id> opens it with its "Things to do" list expanded.
// A fragment (not a query string) so the homepage keeps a single crawlable URL.
function openFromHash() {
  const m = location.hash.match(/^#(add|place|experiences)=([a-z-]+)$/);
  if (!m || !D[m[2]]) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (S.mode === 'shuttle') setMode('tour');
  if (m[1] === 'add') addStop(m[2]);
  if (m[1] === 'experiences') expOpen = true;
  openDest(m[2], true);
}
openFromHash();
window.addEventListener('hashchange', openFromHash);
