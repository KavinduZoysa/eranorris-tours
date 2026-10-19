// One-off: turns the map geometry the design fetched at runtime into two small
// local files under src/geo/. Re-run only if the source data changes.
//
//   land.json      India (clipped to the area around Sri Lanka) + Sri Lanka outline,
//                  from Natural Earth via world-atlas (public domain).
//   districts.json Sri Lanka district boundaries from geoBoundaries (CC BY 4.0),
//                  as supplied with the design, with coordinates rounded.
import { readFile, writeFile } from 'node:fs/promises';
import { feature } from 'topojson-client';

const root = new URL('..', import.meta.url);
const round = (c) => Math.round(c * 1000) / 1000;

// Clip box (lng/lat). Wide enough that its edges stay off-screen at the map's
// minimum zoom and max bounds.
const BOX = { w: 66, e: 96, s: -2, n: 26 };

function clipRing(ring) {
  // Sutherland–Hodgman against each edge of BOX.
  const edges = [
    [(p) => p[0] >= BOX.w, (a, b) => [BOX.w, a[1] + ((b[1] - a[1]) * (BOX.w - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= BOX.e, (a, b) => [BOX.e, a[1] + ((b[1] - a[1]) * (BOX.e - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= BOX.s, (a, b) => [a[0] + ((b[0] - a[0]) * (BOX.s - a[1])) / (b[1] - a[1]), BOX.s]],
    [(p) => p[1] <= BOX.n, (a, b) => [a[0] + ((b[0] - a[0]) * (BOX.n - a[1])) / (b[1] - a[1]), BOX.n]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    if (!input.length) break;
    let prev = input[input.length - 1];
    for (const cur of input) {
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
      prev = cur;
    }
  }
  return out;
}

function tidy(rings) {
  return rings
    .map((r) => r.map(([x, y]) => [round(x), round(y)]))
    .map((r) => r.filter((p, i) => i === 0 || p[0] !== r[i - 1][0] || p[1] !== r[i - 1][1]))
    .filter((r) => r.length >= 4);
}

function clipFeature(f) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const out = polys.map((p) => tidy(p.map(clipRing))).filter((p) => p.length);
  return { type: 'Feature', properties: { name: f.properties.name }, geometry: { type: 'MultiPolygon', coordinates: out } };
}

const topo = JSON.parse(await readFile(new URL('node_modules/world-atlas/countries-50m.json', root)));
const countries = feature(topo, topo.objects.countries).features;
const pick = (id, name) => countries.find((f) => f.id === id || f.properties?.name === name);
const land = {
  type: 'FeatureCollection',
  features: [clipFeature(pick('356', 'India')), clipFeature(pick('144', 'Sri Lanka'))],
};
await writeFile(new URL('src/geo/land.json', root), JSON.stringify(land));

const districts = JSON.parse(await readFile(new URL('design/lka-districts.geojson', root)));
for (const f of districts.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  f.geometry = { type: 'MultiPolygon', coordinates: polys.map(tidy) };
  f.properties = { name: f.properties.name, lp: f.properties.lp };
}
await writeFile(new URL('src/geo/districts.json', root), JSON.stringify(districts));

const size = async (p) => (await readFile(new URL(p, root))).length;
console.log('land.json', await size('src/geo/land.json'), 'bytes');
console.log('districts.json', await size('src/geo/districts.json'), 'bytes');
