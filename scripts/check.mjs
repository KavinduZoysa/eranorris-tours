// Validates the built site in dist/ against the build that produced it.
//   npm run check           SEO, links, structured data, accessibility basics
//   npm run check:release   the same, plus launch readiness: real production build, no
//                           unconfirmed business details (used by the deploy workflow)
// Errors exit 1. Warnings are things to review, not blockers.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';
import { DESTS } from '../src/data/destinations.mjs';
import { EXPERIENCES } from '../src/data/experiences.mjs';
import { PLACEHOLDER_HOST } from './lib/target.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const INFO = path.join(ROOT, '.cache', 'build-info.json');
if (!existsSync(DIST) || !existsSync(INFO)) {
  console.error('No build found — run `npm run build` (or `npm test`) first.');
  process.exit(1);
}
const RELEASE = process.argv.includes('--release');
const build = JSON.parse(readFileSync(INFO, 'utf8'));
const siteUrl = new URL(build.url);
const base = build.base;
const PREFIX = siteUrl.origin + base + '/'; // every absolute URL we publish starts with this
const PROD = build.mode === 'production';
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const rel = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/');
const urlFor = (f) => siteUrl.origin + base + rel(f).replace(/index\.html$/, '');

// Resolve a root-relative URL path to a file in dist (as a static host would).
function resolves(p) {
  if (base && !p.startsWith(base + '/') && p !== base) return false;
  let local = decodeURIComponent(p.slice(base.length) || '/');
  let f = path.join(DIST, local);
  if (local.endsWith('/')) f = path.join(f, 'index.html');
  return existsSync(f) && statSync(f).isFile();
}

const sitemapXml = readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const sitemap = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const seen = { title: new Map(), description: new Map() };

for (const file of htmlFiles) {
  const name = rel(file);
  const root = parse(readFileSync(file, 'utf8'));
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  const noindex = /noindex/.test(robots);
  const title = root.querySelector('title')?.text.trim() || '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const is404 = name === '/404.html';
  if (!robots) err(name, 'missing <meta name="robots">');

  if (!title) err(name, 'missing <title>');
  if (!desc) err(name, 'missing meta description');
  if (title.length > 65) warn(name, `title is ${title.length} chars (aim for ≤ 60): ${title}`);
  if (desc && (desc.length < 70 || desc.length > 165)) warn(name, `description is ${desc.length} chars (aim for 70–160)`);
  if (!noindex) {
    for (const [k, v] of [['title', title], ['description', desc]]) {
      if (seen[k].has(v)) err(name, `duplicate ${k} with ${seen[k].get(v)}`);
      else seen[k].set(v, name);
    }
  }

  // Headings
  const hs = root.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const h1s = hs.filter((h) => h.tagName === 'H1');
  if (h1s.length !== 1) err(name, `expected exactly one <h1>, found ${h1s.length}`);
  let prev = 0;
  for (const h of hs) {
    const lvl = Number(h.tagName[1]);
    if (prev && lvl > prev + 1) warn(name, `heading level jumps h${prev} → h${lvl} ("${h.text.trim().slice(0, 40)}")`);
    prev = lvl;
  }

  // Canonical + indexing agreement
  if (is404) {
    if (!noindex) err(name, '404 page must be noindex');
    if (canonical) err(name, '404 page should not declare a canonical');
  } else {
    if (!canonical) err(name, 'missing canonical');
    else if (canonical !== urlFor(file)) err(name, `canonical ${canonical} ≠ ${urlFor(file)}`);
    else if (!canonical.startsWith('https://')) err(name, 'canonical is not https');
  }
  const inSitemap = canonical && sitemap.includes(canonical);
  if (inSitemap && noindex) err(name, 'in sitemap but noindex');
  if (PROD && !noindex && !is404 && !inSitemap) err(name, 'indexable but missing from sitemap');
  if (!PROD && !noindex) err(name, `${build.mode} build page is indexable`);
  const og = root.querySelector('meta[property="og:url"]')?.getAttribute('content');
  if (canonical && og !== canonical) err(name, 'og:url does not match canonical');
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:image:alt']) {
    if (!root.querySelector(`meta[property="${prop}"]`)?.getAttribute('content')) err(name, `missing ${prop}`);
  }
  const ogImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  if (ogImage && (!ogImage.startsWith(PREFIX) || !resolves(new URL(ogImage).pathname))) err(name, `og:image is not a file on this site: ${ogImage}`);

  // Links and assets
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    const label = (a.getAttribute('aria-label') || a.text).trim();
    if (!label) err(name, `link without accessible text: ${href}`);
    if (/^(click here|here|read more|more)$/i.test(label)) warn(name, `generic link text "${label}"`);
    if (a.getAttribute('target') === '_blank' && !/noopener/.test(a.getAttribute('rel') || '')) err(name, `target=_blank without rel=noopener: ${href}`);
    if (href.startsWith('#')) {
      if (href.length > 1 && !root.querySelector(href.replace(/^#/, '#'))) err(name, `in-page anchor ${href} not found`);
      continue;
    }
    if (/^(https?:|mailto:|tel:)/.test(href)) {
      if (href.startsWith(siteUrl.origin)) err(name, `absolute internal link (use a root-relative path): ${href}`);
      continue;
    }
    const p = href.split('#')[0].split('?')[0];
    if (!p.startsWith('/')) err(name, `relative link (use root-relative): ${href}`);
    else if (!resolves(p)) err(name, `broken internal link: ${href}`);
    else if (!p.endsWith('/') && !path.extname(p)) warn(name, `link without trailing slash: ${href}`);
  }
  const assetRefs = [
    ...root.querySelectorAll('[src]').map((e) => e.getAttribute('src')),
    ...root.querySelectorAll('img[srcset],source[srcset]').flatMap((e) => e.getAttribute('srcset').split(',').map((s) => s.trim().split(/\s+/)[0])),
    ...root.querySelectorAll('link[href]').filter((l) => l.getAttribute('rel') !== 'canonical').map((l) => l.getAttribute('href')),
  ];
  for (const ref of assetRefs) if (ref.startsWith('/') && !resolves(ref.split('?')[0])) err(name, `missing asset: ${ref}`);
  for (const img of root.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) err(name, `<img> without alt: ${img.getAttribute('src')}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) err(name, `<img> without width/height: ${img.getAttribute('src')}`);
  }
  for (const b of root.querySelectorAll('button')) {
    if (!(b.getAttribute('aria-label') || b.text.trim())) err(name, `button without accessible name`);
  }
  if (root.querySelector('html')?.getAttribute('lang') !== 'en') err(name, 'missing <html lang="en">');

  // Structured data
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    let data;
    try {
      data = JSON.parse(s.text);
    } catch (e) {
      err(name, `invalid JSON-LD: ${e.message}`);
      continue;
    }
    for (const o of [].concat(data)) {
      if (o['@context'] !== 'https://schema.org' || !o['@type']) err(name, 'JSON-LD object missing @context/@type');
      if (o['@type'] === 'BreadcrumbList') {
        o.itemListElement.forEach((it, i) => {
          if (it.position !== i + 1 || !it.name || !/^https:\/\//.test(it.item)) err(name, 'BreadcrumbList item invalid');
        });
        if (o.itemListElement.at(-1).item !== canonical) err(name, 'last breadcrumb ≠ canonical');
      }
      if (o['@type'] === 'TouristDestination' && o.url !== canonical) err(name, 'TouristDestination url ≠ canonical');
      if (o['@type'] === 'TouristTrip' && o.offers && !(o.offers.price && o.offers.priceCurrency)) err(name, 'TouristTrip offer missing price/currency');
      // Every URL in structured data must use the one preferred origin (+ base path).
      const urls = JSON.stringify(o).match(/https?:\/\/[^"]+/g) || [];
      for (const x of urls) if (!x.startsWith(PREFIX) && !x.startsWith('https://schema.org')) err(name, `JSON-LD URL not on the preferred origin: ${x}`);
      const text = JSON.stringify(o);
      if (/aggregateRating|"review"/.test(text)) err(name, 'ratings/reviews in JSON-LD — only add with real, visible reviews');
    }
  }
}

// The homepage must link to every destination page in plain HTML (crawlable without JS).
{
  const home = parse(readFileSync(path.join(DIST, 'index.html'), 'utf8'));
  const hrefs = new Set(home.querySelectorAll('a[href]').map((a) => a.getAttribute('href')));
  for (const d of DESTS) if (!hrefs.has(`${base}/places/${d.id}/`)) err('/index.html', `no crawlable link to /places/${d.id}/`);
}

// Every available experience is listed (as crawlable HTML) on its destination's page.
for (const e of EXPERIENCES.filter((x) => x.available !== false)) {
  const file = path.join(DIST, 'places', e.destinationId, 'index.html');
  if (!existsSync(file) || !readFileSync(file, 'utf8').includes(`data-exp="${e.id}"`)) err(`/places/${e.destinationId}/`, `experience "${e.id}" is not listed on its destination page`);
}

// Sitemap ↔ files
for (const loc of sitemap) {
  const u = new URL(loc);
  if (u.origin !== siteUrl.origin) err('sitemap.xml', `URL on another origin: ${loc}`);
  if (!resolves(u.pathname)) err('sitemap.xml', `URL has no page: ${loc}`);
}
if (PROD && !sitemap.length) err('sitemap.xml', 'empty');

// robots.txt
const robots = readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
if (PROD) {
  if (/Disallow:\s*\/\s*$/m.test(robots)) err('robots.txt', 'production build disallows everything');
  if (!robots.includes(`Sitemap: ${siteUrl.origin}${base}/sitemap.xml`)) err('robots.txt', 'missing/incorrect Sitemap line');
  if (base) warn('robots.txt', `site is under ${base}/ — robots.txt only works at the origin root; add the Sitemap line there`);
} else if (!/Disallow:\s*\/\s*$/m.test(robots)) err('robots.txt', `${build.mode} build must disallow crawling`);

// Assets referenced from the JS bundle (photos, geometry)
for (const js of files.filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(js, 'utf8');
  for (const m of src.matchAll(/"(\/(?:[\w.-]+\/)*(?:img|geo)\/[^"]+)"/g)) if (!resolves(m[1])) err(rel(js), `bundle references missing ${m[1]}`);
}

// Launch readiness. Informational for everyday checks; blocking with --release.
const ready = [];
if (!PROD) ready.push(`this is a ${build.mode} build — releases must be production builds (npm run build)`);
if (build.test) ready.push('this is a test build on a reserved domain (npm test) — build with the real SITE_URL');
if (PLACEHOLDER_HOST.test(siteUrl.hostname)) ready.push(`SITE_URL hostname ${siteUrl.hostname} is a placeholder`);
if (build.includeExamples) ready.push('built with INCLUDE_EXAMPLES=1');
for (const k of build.unconfirmed || []) ready.push(`site.config.mjs → confirmed.${k} is not true yet`);
if (RELEASE) for (const m of ready) errors.push(`release: ${m}`);

for (const w of warnings) console.warn('warn  ' + w);
if (!RELEASE && ready.length) console.warn(`\nNot ready for release yet (npm run check:release would fail):\n${ready.map((m) => '  - ' + m).join('\n')}`);
for (const e of errors) console.error('ERROR ' + e);
console.log(
  `\nChecked ${htmlFiles.length} pages (${build.mode}${build.test ? ', test build' : ''}, ${PREFIX}), ${sitemap.length} sitemap URL(s): ${errors.length} error(s), ${warnings.length} warning(s).`,
);
process.exit(errors.length ? 1 : 0);
