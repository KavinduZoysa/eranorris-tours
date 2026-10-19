// Static build: src/ → dist/. Run with `npm run build` (production) or
// `npm run build:staging` (noindex everywhere). Configuration: site.config.mjs.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { marked } from 'marked';
import sharp from 'sharp';
import site from '../site.config.mjs';
import { DESTS } from '../src/data/destinations.mjs';
import { homeBody } from '../src/templates/home.mjs';
import { esc, layout } from '../src/templates/layout.mjs';
import { notFoundPage, placePage, tourPage } from '../src/templates/pages.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const r = (...p) => path.join(ROOT, ...p);
const DIST = r('dist');
const CACHE = r('.cache', 'img');
const PROD = site.env === 'production';
const warnings = [];

// URL helpers. `base` supports hosting under a sub-path (e.g. https://example.com/tours).
const siteUrl = new URL(site.url);
const origin = siteUrl.origin;
const base = siteUrl.pathname.replace(/\/+$/, '');
const u = (p) => base + p;
const abs = (p) => origin + (base && p.startsWith(base + '/') ? p : base + p);
if (/example\.(com|org|net)/.test(siteUrl.hostname))
  warnings.push(`SITE_URL is a placeholder (${site.url}). Canonical, sitemap and Open Graph URLs will be wrong until it is set.`);
if (siteUrl.protocol !== 'https:') warnings.push('SITE_URL should use https.');

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
async function out(rel, data) {
  const file = path.join(DIST, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await mkdir(CACHE, { recursive: true });

// ---------------------------------------------------------------------------
// Images: responsive WebP sizes + an Open Graph JPEG per destination, cropped around
// each photo's focal point. Results are cached in .cache/img between builds.
const VARIANTS = [
  ['med', 96, 96, 'webp', 62], // map medallion (32–57 px CSS)
  ['card480', 480, 192, 'webp', 68], // destination card strip on the map
  ['card800', 800, 320, 'webp', 64],
  ['w480', 480, 320, 'webp', 68], // cards and hero
  ['w640', 640, 427, 'webp', 66],
  ['w800', 800, 533, 'webp', 64],
  ['w1200', 1200, 800, 'webp', 64],
  ['og', 1200, 630, 'jpg', 80], // social sharing
];
// AVIF copies (≈35% smaller than WebP) for the larger sizes, served via <picture>.
const AVIF = { card480: 52, card800: 48, w480: 52, w640: 50, w800: 48, w1200: 46 };
function region(W, H, A, [fx, fy]) {
  let cw = W,
    ch = Math.round(W / A);
  if (ch > H) {
    ch = H;
    cw = Math.round(H * A);
  }
  const clamp = (v, max) => Math.round(Math.min(Math.max(v, 0), max));
  return { left: clamp(fx * W - cw / 2, W - cw), top: clamp(fy * H - ch / 2, H - ch), width: cw, height: ch };
}
const photos = {};
let imgBytes = 0;
for (const d of DESTS) {
  const src = r('src', 'images', 'destinations', `${d.photo}.jpg`);
  const st = await stat(src);
  const meta = await sharp(src).metadata();
  photos[d.id] = {};
  const variants = VARIANTS.flatMap((v) => (AVIF[v[0]] ? [v, [v[0] + 'Avif', v[1], v[2], 'avif', AVIF[v[0]]]] : [v]));
  for (const [key, w, h, fmt, q] of variants) {
    const name = `${d.photo}-${w}x${h}.${fmt}`;
    const cacheFile = path.join(CACHE, `${hash(`${st.size}:${st.mtimeMs}:${w}x${h}:${fmt}:${q}:${d.focus}`)}-${name}`);
    if (!existsSync(cacheFile)) {
      const img = sharp(src).extract(region(meta.width, meta.height, w / h, d.focus)).resize(w, h);
      const enc = { webp: () => img.webp({ quality: q, effort: 5 }), avif: () => img.avif({ quality: q, effort: 4 }), jpg: () => img.jpeg({ quality: q, mozjpeg: true }) };
      await enc[fmt]().toFile(cacheFile);
    }
    const rel = `img/places/${name}`;
    await mkdir(path.join(DIST, 'img/places'), { recursive: true });
    await copyFile(cacheFile, path.join(DIST, rel));
    imgBytes += (await stat(cacheFile)).size;
    photos[d.id][key] = u('/' + rel);
  }
}

// ---------------------------------------------------------------------------
// Fonts: the design's Google Fonts files, self-hosted (see scripts/prepare-fonts.mjs), so
// no third-party connection is needed before text can render.
const PRELOAD = ['instrument-serif-latin-normal.woff2', 'geist-latin-normal.woff2'];
let fontCss = '';
await mkdir(path.join(DIST, 'fonts'), { recursive: true });
for (const f of JSON.parse(await readFile(r('src', 'fonts', 'fonts.json'), 'utf8'))) {
  await copyFile(r('src', 'fonts', f.file), path.join(DIST, 'fonts', f.file));
  fontCss += `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(${u('/fonts/' + f.file)}) format('woff2');unicode-range:${f.unicodeRange}}\n`;
}
const fontPreloads = PRELOAD.map((f) => `<link rel="preload" href="${u('/fonts/' + f)}" as="font" type="font/woff2" crossorigin>`).join('\n');

// ---------------------------------------------------------------------------
// Map geometry (see scripts/prepare-geo.mjs), content-hashed for long-term caching.
const geo = {};
for (const name of ['land', 'districts']) {
  const buf = await readFile(r('src', 'geo', `${name}.json`));
  const rel = `geo/${name}.${hash(buf)}.json`;
  await out(rel, buf);
  geo[name] = u('/' + rel);
}

// ---------------------------------------------------------------------------
// CSS (inlined per page type — small enough that a separate request costs more).
const read = (p) => readFile(r(p), 'utf8');
async function minCss(parts) {
  const { code } = await esbuild.transform(parts.join('\n'), { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] });
  return code;
}
const baseCss = await read('src/styles/base.css');
const CSS = {
  home: await minCss([fontCss, baseCss, await read('node_modules/leaflet/dist/leaflet.css'), await read('src/styles/app.css')]),
  page: await minCss([fontCss, baseCss, await read('src/styles/page.css')]),
};

// ---------------------------------------------------------------------------
// JS: the planner + Leaflet in one deferred, minified, content-hashed bundle.
const clientSite = {
  name: site.name,
  base,
  contact: site.contact,
  quoteEndpoint: site.quoteEndpoint,
  assets: {
    ...geo,
    photos: Object.fromEntries(
      DESTS.map((d) => {
        const p = photos[d.id];
        return [d.id, { med: p.med, card: [p.card480, p.card800], cardAvif: [p.card480Avif, p.card800Avif] }];
      }),
    ),
  },
};
const js = await esbuild.build({
  entryPoints: [r('src/js/app.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  legalComments: 'eof', // keeps Leaflet's BSD licence notice
  define: { __SITE__: JSON.stringify(clientSite) },
  write: false,
});
const jsBuf = Buffer.from(js.outputFiles[0].contents);
const jsRel = `assets/app.${hash(jsBuf)}.js`;
await out(jsRel, jsBuf);

// ---------------------------------------------------------------------------
// Content: optional Markdown with a small front-matter block.
//   ---
//   status: published        # anything else = draft (built, but noindex + not in sitemap)
//   title: …                 # optional <title> override
//   description: …           # optional meta description override
//   includes:                # lists use "- item" lines
//     - …
//   ---
function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const li = line.match(/^\s+-\s+(.*)$/);
    if (li && listKey) {
      data[listKey].push(unquote(li[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) throw new Error(`Cannot parse front matter line: ${line}`);
    const v = kv[2].replace(/\s+#.*$/, '').trim();
    if (v === '') {
      data[kv[1]] = [];
      listKey = kv[1];
    } else {
      data[kv[1]] = /^\[.*\]$/.test(v) ? v.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean) : unquote(v);
      listKey = null;
    }
  }
  return { data, body: m[2] };
}
const unquote = (s) => s.replace(/^(['"])(.*)\1$/, '$2');
async function readDir(dir) {
  const full = r('src', 'content', dir);
  if (!existsSync(full)) return [];
  // Files starting with "_" are templates/examples: skipped unless INCLUDE_EXAMPLES=1.
  const files = (await readdir(full)).filter((f) => f.endsWith('.md') && (includeExamples || !f.startsWith('_')));
  return Promise.all(
    files.map(async (f) => {
      const { data, body } = parseFrontMatter(await readFile(path.join(full, f), 'utf8'));
      return { file: `src/content/${dir}/${f}`, slug: f.replace(/\.md$/, ''), ...data, html: body.trim() ? marked.parse(body) : '' };
    }),
  );
}
const includeExamples = process.env.INCLUDE_EXAMPLES === '1';
const placeContent = Object.fromEntries((await readDir('places')).filter((c) => !c.slug.startsWith('_')).map((c) => [c.slug, c]));
for (const slug of Object.keys(placeContent)) if (!DESTS.some((d) => d.id === slug)) warnings.push(`src/content/places/${slug}.md has no matching destination id.`);
const tours = await readDir('tours');

// ---------------------------------------------------------------------------
// Pages
const ctx = { site, u, abs, photos, fontPreloads, assets: {} };
ctx.assets.ogDefault = { src: photos.sigiriya.og, alt: DESTS[0].alt };
const sitemap = [];
const report = [];
async function emit(p, { published = true } = {}) {
  const indexable = PROD && published && !p.noindex;
  const canonical = p.noCanonical ? null : abs(p.path);
  const html = layout(ctx, { ...p, indexable, canonical, css: CSS[p.css] });
  await out(p.path.endsWith('/') ? p.path.slice(1) + 'index.html' : p.path.slice(1), html);
  if (indexable) sitemap.push(canonical);
  report.push([p.path, indexable ? 'indexable' : 'noindex', p.title]);
}

await emit({
  path: '/',
  title: `Private Tours in Sri Lanka with Your Own Driver | ${site.name}`,
  ogTitle: `Plan a private tour of Sri Lanka, one stop at a time | ${site.name}`,
  description:
    'Plan a private tour of Sri Lanka on an interactive map. Pick places like Sigiriya, Kandy, Ella and Galle, choose your pickup and dates, and get a quote.',
  css: 'home',
  bodyClass: 'home',
  header: '',
  body: homeBody(ctx),
  scripts: `<script src="${u('/' + jsRel)}" defer onerror="document.documentElement.classList.add('map-failed')"></script>`,
  jsonld: [
    {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': abs('/#organization'),
      name: site.name,
      url: abs('/'),
      description:
        'Private tours of Sri Lanka with your own driver. Pick places on the map, choose where we collect you and when, and we’ll send a quote.',
      image: abs(photos.sigiriya.og),
      telephone: '+' + site.contact.whatsapp,
      email: site.contact.email,
      ...(site.address && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.address.locality,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
      }),
      areaServed: { '@type': 'Country', name: 'Sri Lanka' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': abs('/#website'),
      url: abs('/'),
      name: site.name,
      inLanguage: 'en',
      publisher: { '@id': abs('/#organization') },
    },
  ],
});

const drafts = [];
for (const d of DESTS) {
  const c = placeContent[d.id] || {};
  const published = c.status === 'published' && !!c.html;
  if (!published) drafts.push(d.id);
  await emit(placePage(ctx, d, c), { published });
}
for (const t of tours) {
  const missing = ['title', 'description'].filter((k) => !t[k]);
  if (missing.length) throw new Error(`${t.file}: missing ${missing.join(', ')}`);
  await emit(tourPage(ctx, t), { published: t.status === 'published' && !t.slug.startsWith('_') });
}
await emit(notFoundPage(ctx));

// ---------------------------------------------------------------------------
// Crawl directives and static files
await out(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((loc) => `  <url><loc>${esc(loc)}</loc></url>`).join('\n')}
</urlset>
`,
);
await out(
  'robots.txt',
  PROD ? `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n` : `# ${site.env} build — not for indexing\nUser-agent: *\nDisallow: /\n`,
);
// Cache and security headers for hosts that read a _headers file (Netlify, Cloudflare Pages).
await out(
  '_headers',
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/geo/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/img/*\n  Cache-Control: public, max-age=2592000\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${PROD ? '' : '  X-Robots-Tag: noindex\n'}`,
);
await out('.nojekyll', ''); // GitHub Pages: serve files as-is (no Jekyll processing)
for (const f of await readdir(r('src', 'static'))) if (!f.startsWith('.')) await copyFile(r('src', 'static', f), path.join(DIST, f));

// ---------------------------------------------------------------------------
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`\nBuilt ${report.length} pages for ${site.url} (${site.env})`);
for (const [p, s, t] of report) console.log(`  ${s.padEnd(9)} ${p.padEnd(34)} ${t}`);
console.log(`\n  JS ${kb(jsBuf.length)} · home CSS ${kb(CSS.home.length)} · page CSS ${kb(CSS.page.length)} · images ${kb(imgBytes)}`);
console.log(`  Sitemap: ${sitemap.length} URL(s)`);
if (drafts.length)
  console.log(
    `\n  ${drafts.length} place pages are drafts (noindex, not in the sitemap) until src/content/places/<id>.md\n  exists with "status: published" and real content: ${drafts.join(', ')}`,
  );
for (const w of warnings) console.warn(`\n  ⚠ ${w}`);
console.log('');
