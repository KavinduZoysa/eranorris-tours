// Single source of truth for the map, the homepage place list and /places/<slug>/ pages.
// Imported by the build (templates) and bundled into the map app.
//
// Text in `name`, `hl`, `desc`, `nights` and `kw` comes from the supplied design. Main photos come
// from PHOTO_SOURCES (below): files in ~/villas/destinations, or Wikimedia Commons URLs for the
// openly licensed photos credited in PHOTO_CREDITS. `photoOf`
// says what the photo shows; it was corrected in November 2026 where the design's wording
// described a different picture from the photo supplied (e.g. "a leopard" for Yala). `seoTitle` is derived from `hl`. Photos are the supplied files in
// src/images/destinations/ (see `photo`); `focus` is the [x, y] focal point used
// when cropping (0–1).

export const CATS = {
  culture: { label: 'Culture', c: '#E8A05C' },
  beach: { label: 'Beach', c: '#6FC3D0' },
  wildlife: { label: 'Wildlife', c: '#C9B663' },
  hills: { label: 'Hills', c: '#86C79A' },
};

export const DESTS = [
  {
    id: 'sigiriya', name: 'Sigiriya', cat: 'culture', lat: 7.957, lng: 80.7603, nights: 2, pos: 't',
    hl: 'UNESCO · Lion Rock', kw: 'Rock', photoOf: 'Lion Rock',
    seoTitle: 'Sigiriya Lion Rock',
    desc: 'A 5th-century palace built on a 200 m rock, with frescoes halfway up and water gardens at its base.',
    photo: 'sigiriya-lion-rock', focus: [0.45, 0.28],
    alt: 'Sigiriya Lion Rock rising above the tree line and the path through the water gardens',
  },
  {
    id: 'dambulla', name: 'Dambulla', cat: 'culture', lat: 7.8567, lng: 80.6492, nights: 0, pos: 'l',
    hl: 'UNESCO · Cave temple', kw: 'Caves', photoOf: 'the Golden Temple',
    seoTitle: 'Dambulla Cave Temple',
    desc: 'Five cave shrines filled with Buddha statues and painted ceilings, on a rock above the town.',
    photo: 'dambulla-golden-temple', focus: [0.5, 0.3],
    alt: 'Golden Buddha statue above the temple entrance at Dambulla',
  },
  {
    id: 'anuradhapura', name: 'Anuradhapura', cat: 'culture', lat: 8.3114, lng: 80.4037, nights: 1, pos: 'l',
    hl: 'UNESCO · First capital', kw: 'Stupas', photoOf: 'Ruwanwelisaya stupa',
    seoTitle: 'Anuradhapura, the First Capital',
    desc: 'The island’s first capital: giant dagobas, monastery ruins and the sacred Sri Maha Bodhi tree.',
    photo: 'anuradhapura-ruwanwelisaya-stupa', focus: [0.62, 0.45],
    alt: 'White Ruwanwelisaya stupa behind a large tree at sunset in Anuradhapura',
  },
  {
    id: 'polonnaruwa', name: 'Polonnaruwa', cat: 'culture', lat: 7.9403, lng: 81.0188, nights: 1, pos: 'r',
    hl: 'UNESCO · Medieval city', kw: 'Ruins', photoOf: 'the Vatadage',
    seoTitle: 'Polonnaruwa Medieval City',
    desc: 'A royal city from the 11th century, best seen by bicycle. Known for the Gal Vihara rock carvings.',
    photo: 'polonnaruwa-ancient-ruins', focus: [0.5, 0.42],
    alt: 'Carved steps, guardstones and a moonstone leading up to a seated Buddha at the Vatadage in Polonnaruwa',
  },
  {
    id: 'kandy', name: 'Kandy', cat: 'culture', lat: 7.2906, lng: 80.6337, nights: 2, pos: 'r',
    hl: 'Temple of the Tooth', kw: 'Temple', photoOf: 'the Temple of the Tooth',
    seoTitle: 'Kandy & the Temple of the Tooth',
    desc: 'The last royal capital, set around a lake and home to the Temple of the Sacred Tooth Relic.',
    photo: 'kandy-temple-of-the-tooth', focus: [0.35, 0.45],
    alt: 'The Temple of the Sacred Tooth Relic in Kandy behind its white moat wall',
  },
  {
    id: 'nuwara-eliya', name: 'Nuwara Eliya', cat: 'hills', lat: 6.9497, lng: 80.7891, nights: 1, pos: 'l',
    hl: 'Tea country · 1,900 m', kw: 'Tea', photoOf: 'the tea estates',
    seoTitle: 'Nuwara Eliya Tea Country',
    desc: 'A cool hill town surrounded by tea estates, with factory visits and colonial-era bungalows.',
    photo: 'nuwara-eliya-tea-estate', focus: [0.4, 0.62],
    alt: 'Rows of tea bushes on rolling hills below the mountains near Nuwara Eliya',
  },
  {
    id: 'ella', name: 'Ella', cat: 'hills', lat: 6.8667, lng: 81.0466, nights: 2, pos: 'r',
    hl: 'Nine Arches Bridge', kw: 'Bridge', photoOf: 'Nine Arches Bridge',
    seoTitle: 'Ella and the Nine Arches Bridge',
    desc: 'A mountain village with easy hikes to Little Adam’s Peak and views of the Nine Arches Bridge.',
    photo: 'ella-nine-arches-bridge', focus: [0.45, 0.45],
    alt: 'A train curving across the stone Nine Arches Bridge through the jungle near Ella',
  },
  {
    id: 'adams-peak', name: 'Adam’s Peak', cat: 'hills', lat: 6.8096, lng: 80.4994, nights: 1, pos: 'l',
    hl: 'Sunrise climb · 2,243 m', kw: 'Sunrise', photoOf: 'the peak’s shadow at sunrise',
    seoTitle: 'Adam’s Peak Sunrise Climb',
    desc: 'A sacred summit climbed overnight by pilgrims and hikers to watch the sun rise. Season Dec–May.',
    photo: 'adams-peak-shadow-sunrise', focus: [0.5, 0.42],
    alt: 'The triangular shadow of Adam’s Peak cast over the hills at sunrise, seen from the summit',
  },
  {
    id: 'yala', name: 'Yala', cat: 'wildlife', lat: 6.3728, lng: 81.5016, nights: 2, pos: 'r',
    hl: 'Leopards', kw: 'Leopard', photoOf: 'rock outcrops above a lake',
    seoTitle: 'Yala National Park Leopards',
    desc: 'National park with one of the highest leopard densities in the world. Jeep safaris at dawn and dusk.',
    photo: 'yala-national-park', focus: [0.4, 0.66],
    alt: 'Rock outcrops above a lake under a pink evening sky in Yala National Park',
  },
  {
    id: 'udawalawe', name: 'Udawalawe', cat: 'wildlife', lat: 6.4744, lng: 80.8986, nights: 1, pos: 'l',
    hl: 'Elephants', kw: 'Elephant', photoOf: 'wild elephants',
    seoTitle: 'Udawalawe Elephant Safaris',
    desc: 'Open grassland around a reservoir where herds of wild elephants are seen all year.',
    photo: 'udawalawe-elephants', focus: [0.5, 0.6],
    alt: 'Wild elephant and calf beside a safari jeep in Udawalawe National Park',
  },
  {
    id: 'galle', name: 'Galle', cat: 'culture', lat: 6.0329, lng: 80.2168, nights: 2, pos: 'l',
    hl: 'UNESCO · Dutch fort', kw: 'Fort', photoOf: 'Galle Fort',
    seoTitle: 'Galle Fort',
    desc: 'A 17th-century fort town with ramparts, lighthouse, cafés and boutique hotels inside the walls.',
    photo: 'galle-fort-lighthouse', focus: [0.74, 0.55],
    alt: 'Galle lighthouse and fort ramparts framed by palm trees',
  },
  {
    id: 'hikkaduwa', name: 'Hikkaduwa', cat: 'beach', lat: 6.1395, lng: 80.1063, nights: 1, pos: 'l',
    hl: 'Sea turtles · Coral reef', kw: 'Turtles', photoOf: 'the beach',
    seoTitle: 'Hikkaduwa Turtles & Coral Reef',
    desc: 'A west-coast beach town where green sea turtles feed in the shallows, with a coral reef close to shore and turtle hatcheries nearby.',
    photo: 'hikkaduwa-beach', focus: [0.5, 0.55],
    alt: 'An outrigger canoe above Hikkaduwa beach, with boats moored in the bay',
  },
  {
    id: 'mirissa', name: 'Mirissa', cat: 'beach', lat: 5.9483, lng: 80.4716, nights: 2, pos: 'b',
    hl: 'Whale watching', kw: 'Whales', photoOf: 'the bay',
    seoTitle: 'Mirissa Whale Watching',
    desc: 'A palm-lined bay on the south coast and the main base for blue whale watching from November to April.',
    photo: 'mirissa-bay', focus: [0.6, 0.55],
    alt: 'Aerial view of the curved bay and beach at Mirissa',
  },
  {
    id: 'bentota', name: 'Bentota', cat: 'beach', lat: 6.421, lng: 79.998, nights: 2, pos: 'l',
    hl: 'River & beach', kw: 'River', photoOf: 'the river mouth',
    seoTitle: 'Bentota River and Beach',
    desc: 'A wide west-coast beach with river safaris, water sports and resort hotels.',
    photo: 'bentota-river-mouth', focus: [0.55, 0.45],
    alt: 'The Bentota River meeting the sea beside a wooded islet, seen from above',
  },
  {
    id: 'trincomalee', name: 'Trincomalee', cat: 'beach', lat: 8.5874, lng: 81.2152, nights: 2, pos: 'r',
    hl: 'East coast · May–Sep', kw: 'Reef', photoOf: 'a headland and beach',
    seoTitle: 'Trincomalee and the East Coast',
    desc: 'A harbour town near Nilaveli beach and Pigeon Island, best visited from May to September.',
    photo: 'trincomalee-coast', focus: [0.45, 0.55],
    alt: 'Green headland above clear water and a quiet beach near Trincomalee',
  },
  {
    id: 'arugam-bay', name: 'Arugam Bay', cat: 'beach', lat: 6.8406, lng: 81.8368, nights: 2, pos: 'r',
    hl: 'Surf · Apr–Oct', kw: 'Surf', photoOf: 'the beach',
    seoTitle: 'Arugam Bay Surf Town',
    desc: 'A laid-back surf town on the east coast. The surf season runs from April to October.',
    photo: 'arugam-bay-beach', focus: [0.55, 0.55],
    alt: 'Fishing boats pulled up along the curving beach at Arugam Bay, seen from above',
  },
];

// Source file names in the supplied photo folder (villas/destinations), keyed by
// destination id. Used only by scripts/prepare-images.mjs.
export const PHOTO_SOURCES = {
  sigiriya: 'sigiriya.jpg',
  dambulla: 'dambulla.jpg',
  anuradhapura: 'anuradhapura.jpg',
  polonnaruwa: 'polonnaruwa.jpg',
  kandy: 'kandy.jpg',
  'nuwara-eliya': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Tea-plantation_Nuwara_Eliya-2567.jpg',
  ella: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Civilization_meets_Jungle_%2844753903400%29.jpg',
  'adams-peak': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Sri_Pada_07.jpg',
  yala: 'yala-national-park.jpg',
  udawalawe: 'udawalawe-national-park.jpg',
  galle: 'galle.jpg',
  hikkaduwa: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Hikka_Beach.jpg',
  mirissa: 'mirissa.jpg',
  bentota: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Bentota_Estuary.jpg',
  trincomalee: 'trincomalee.jpg',
  'arugam-bay': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Beach_of_Arugam_Bay.jpg',
};

// Credits for the openly licensed main photos (Wikimedia Commons), which replaced supplied photos
// in November 2026 where those were watermarked, low quality or not of the place. Shown under
// the photo on the place page and on /photo-credits/ (CC BY and CC BY-SA require the credit;
// CC0 doesn't, but it is given anyway). The site's copies are cropped and resized.
export const PHOTO_CREDITS = {
  'nuwara-eliya': {
    title: 'Highland tea plantation, Nuwara Eliya', author: 'Bergentroll',
    license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Tea-plantation_Nuwara_Eliya-2567.jpg',
  },
  ella: {
    title: 'Civilization meets Jungle', author: 'Fabian Greiler', authorUrl: 'http://www.derfabian.at',
    license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Civilization_meets_Jungle_(44753903400).jpg',
  },
  'adams-peak': {
    title: 'Triangular shadow of Sri Pada at sunrise', author: 'Bernard Gagnon',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Sri_Pada_07.jpg',
  },
  hikkaduwa: {
    title: 'Hikka Beach', author: 'Sendaru Perera',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Hikka_Beach.jpg',
  },
  bentota: {
    title: 'Bentota Estuary', author: 'Miniace',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Bentota_Estuary.jpg',
  },
  'arugam-bay': {
    title: 'Beach of Arugam Bay', author: 'Dennis Sylvester Hurd',
    license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Beach_of_Arugam_Bay.jpg',
  },
};

// Confirm: site.config.mjs → confirmed.pickups.
export const PICKUPS = [
  { id: 'cmb', code: 'CMB', name: 'Bandaranaike International Airport', short: 'CMB Airport', sub: 'Katunayake · main international airport', lat: 7.1808, lng: 79.8841 },
  { id: 'colombo', code: 'CMB·C', name: 'Colombo city', short: 'Colombo', sub: 'Any hotel or address in Colombo', lat: 6.9271, lng: 79.8612 },
  { id: 'negombo', code: 'NEG', name: 'Negombo', short: 'Negombo', sub: 'Beach hotels, 20 min from the airport', lat: 7.2083, lng: 79.8358 },
  { id: 'port', code: 'PORT', name: 'Colombo Port cruise terminal', short: 'Colombo Port', sub: 'For cruise passengers', lat: 6.9447, lng: 79.8466 },
  { id: 'hri', code: 'HRI', name: 'Mattala Rajapaksa International Airport', short: 'HRI Airport', sub: 'Hambantota · south coast', lat: 6.2845, lng: 81.124 },
  { id: 'kandy-p', code: 'KDY', name: 'Kandy', short: 'Kandy', sub: 'Any hotel in Kandy', lat: 7.2906, lng: 80.6337 },
  { id: 'galle-p', code: 'GAL', name: 'Galle', short: 'Galle', sub: 'Any hotel in Galle or the fort', lat: 6.0329, lng: 80.2168 },
];

// Confirm: site.config.mjs → confirmed.vehicles. Models and capacities come from the design.
export const VEHICLES = [
  { id: 'car', name: 'Car', model: 'Toyota Prius or similar', cap: 3 },
  { id: 'van', name: 'Van', model: 'Toyota KDH, high roof', cap: 7 },
  { id: 'coach', name: 'Mini coach', model: 'Toyota Coaster', cap: 20 },
];

// Confirm: site.config.mjs → confirmed.shuttleFares. These airport-transfer rates come from the
// design prototype and are shown to customers as fixed prices. Replace them with your real rates.
// Fare (USD, one way) = round5(max(min, base + perKm × km) × vehicle multiplier), where km is the
// estimated road distance below — so a fare is only as good as that estimate.
export const SHUTTLE_FARES = { min: 25, base: 12, perKm: 0.5, mult: { car: 1, van: 1.45, coach: 2.4 } };

// Confirm: site.config.mjs → confirmed.shuttleService. From the design: the driver meets
// arriving guests in the arrivals hall; drop-off time allows this many minutes for immigration
// and bags; departure pickups aim to reach the airport this long before the flight.
export const SHUTTLE_TIMING = { arrivalBufferMin: 45, departureBufferMin: 180 };

// Great-circle distance in km, and the design's drive estimate (road factor 1.4, ~40 km/h).
// These are rough estimates, not routed distances or guaranteed journey times — the interface
// labels them as estimates.
const rad = (x) => (x * Math.PI) / 180;
export function hav(a, b) {
  const dl = rad(b.lat - a.lat), dg = rad(b.lng - a.lng);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dg / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
// Optional: real road distances (km) and typical drive times (minutes) for common legs. Where a
// pair is listed it replaces the formula, for drive times and for transfer fares. Keys are two
// ids from DESTS or PICKUPS joined by "|", in either order, e.g.  'cmb|galle': { km: 150, min: 150 }.
// Empty until you supply figures — the formula ignores expressways, so it can overstate times.
export const ROUTE_TIMES = {};
export function legInfo(a, b) {
  const known = a.id && b.id && (ROUTE_TIMES[`${a.id}|${b.id}`] || ROUTE_TIMES[`${b.id}|${a.id}`]);
  if (known) return { km: known.km, min: known.min };
  const km = hav(a, b) * 1.4;
  return { km: Math.max(5, Math.round(km / 5) * 5), min: Math.max(10, Math.round(((km / 40) * 60) / 10) * 10) };
}
export function fmtDur(m) {
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return h + 'h' + (r ? ' ' + r + 'm' : '');
}
export const nightsTxt = (n) => (n === 0 ? 'Day visit' : n + (n === 1 ? ' night' : ' nights'));
