// Static build: src/ → dist/. Configuration: site.config.mjs. Build modes: scripts/lib/target.mjs
//   npm run build           production (requires SITE_URL)
//   npm run build:staging   noindex everywhere, crawling disallowed
//   npm run dev             local preview at http://localhost:4173
//   npm test                production rules on a reserved test domain, then npm run check
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
import { EXPERIENCES, EXP_CATS } from '../src/data/experiences.mjs';
import { GALLERIES, GALLERY_IMAGES } from '../src/data/galleries.mjs';
import { homeBody } from '../src/templates/home.mjs';
import { esc, layout } from '../src/templates/layout.mjs';
import { activityPage, notFoundPage, placePage, tourPage } from '../src/templates/pages.mjs';
import { resolveTarget } from './lib/target.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const r = (...p) => path.join(ROOT, ...p);
const DIST = r('dist');
const CACHE = r('.cache', 'img');
const warnings = [];
const fail = (lines) => {
  console.error('\nBuild stopped:\n' + lines.map((l) => '  ✗ ' + l).join('\n') + '\n');
  process.exit(1);
};

// Where the site is going: environment + preferred URL. Production refuses a missing or
// placeholder domain so wrong canonical/sitemap URLs can never be deployed.
const target = resolveTarget(site);
if (target.errors.length) fail(target.errors);
const PROD = target.mode === 'production';
const includeExamples = process.env.INCLUDE_EXAMPLES === '1';
if (includeExamples && PROD && !target.test) fail(['INCLUDE_EXAMPLES=1 is for previews only; example pages cannot go into a production build.']);

// URL helpers. `base` supports hosting under a sub-path (e.g. https://example.com/tours).
const { origin, base } = target;
const u = (p) => base + p;
const abs = (p) => origin + (base && p.startsWith(base + '/') ? p : base + p);

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

// Generic 3:2 responsive set (WebP + AVIF) cropped around a focal point. Sizes wider than
// the source crop are skipped rather than upscaled (w480 is always made).
const SET = [['w480', 480, 320], ['w640', 640, 427], ['w800', 800, 533], ['w1200', 1200, 800]];
async function photoSet(src, dir, base, focus = [0.5, 0.5]) {
  const st = await stat(src);
  const meta = await sharp(src).metadata();
  const crop = region(meta.width, meta.height, 1.5, focus);
  const set = { keys: [] };
  for (const [key, w, h] of SET) {
    if (w > crop.width && key !== 'w480') continue;
    for (const [fmt, q, suffix] of [['webp', 66, ''], ['avif', 48, 'Avif']]) {
      const name = `${base}-${w}x${h}.${fmt}`;
      const cacheFile = path.join(CACHE, `${hash(`${st.size}:${st.mtimeMs}:${w}x${h}:${fmt}:${q}:${focus}`)}-${name}`);
      if (!existsSync(cacheFile)) {
        const img = sharp(src).extract(crop).resize(w, h);
        await (fmt === 'webp' ? img.webp({ quality: q, effort: 5 }) : img.avif({ quality: q, effort: 4 })).toFile(cacheFile);
      }
      await mkdir(path.join(DIST, dir), { recursive: true });
      await copyFile(cacheFile, path.join(DIST, dir, name));
      imgBytes += (await stat(cacheFile)).size;
      set[key + suffix] = u(`/${dir}/${name}`);
    }
    set.keys.push([key, w]);
  }
  return set;
}
// Destination galleries (src/data/galleries.mjs): extra photos after each main photo.
const galleryPhotos = {};
for (const [name, g] of Object.entries(GALLERY_IMAGES)) {
  const src = r('src', 'images', 'gallery', `${name}.jpg`);
  if (!existsSync(src)) continue; // reported by the data checks below
  galleryPhotos[name] = { ...(await photoSet(src, 'img/gallery', name, g.focus)), alt: g.alt, caption: g.caption };
}
for (const d of DESTS) photos[d.id].keys = SET.map(([k, w]) => [k, w]);

// Experience photos: 3:2 cards for destination pages, square thumbnails for the map card.
const expCardPhotos = {};
const expPhotos = {};
for (const name of new Set(EXPERIENCES.filter((e) => e.image && e.available !== false).map((e) => e.image))) {
  const src = r('src', 'images', 'experiences', `${name}.jpg`);
  if (!existsSync(src)) continue; // reported by the data checks below
  const st = await stat(src);
  const file = `${name}-128x128.webp`;
  const cacheFile = path.join(CACHE, `${hash(`${st.size}:${st.mtimeMs}:exp128`)}-${file}`);
  if (!existsSync(cacheFile))
    await sharp(src).resize(128, 128, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 70 }).toFile(cacheFile);
  await mkdir(path.join(DIST, 'img/experiences'), { recursive: true });
  await copyFile(cacheFile, path.join(DIST, 'img/experiences', file));
  expPhotos[name] = u('/img/experiences/' + file);
  expCardPhotos[name] = await photoSet(src, 'img/experiences', name);
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
    expPhotos,
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
// Photo gallery enhancement for destination and experience pages (works without it too).
const galJs = await esbuild.build({ entryPoints: [r('src/js/gallery.js')], bundle: true, minify: true, format: 'iife', target: ['es2020'], write: false });
const galBuf = Buffer.from(galJs.outputFiles[0].contents);
const galRel = `assets/gallery.${hash(galBuf)}.js`;
await out(galRel, galBuf);
const galleryScript = `<script src="${u('/' + galRel)}" defer></script>`;

// ---------------------------------------------------------------------------
// Content: optional Markdown with a small front-matter block.
//   ---
//   status: draft | published  # exactly one of these (see publication rules below)
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
// "## Frequently asked questions" (or "## FAQ") becomes the FAQ component: each "### …?"
// heading is a question and the text under it the answer.
function splitFaq(md) {
  const m = md.match(/^##\s+(frequently asked questions|faqs?)\s*$/im);
  if (!m) return { md, faq: [] };
  const rest = md.slice(m.index + m[0].length);
  const next = rest.search(/^##\s+/m);
  const faqMd = next === -1 ? rest : rest.slice(0, next);
  const faq = faqMd
    .split(/^###\s+/m)
    .slice(1)
    .map((part) => {
      const nl = part.indexOf('\n');
      return { q: (nl === -1 ? part : part.slice(0, nl)).trim(), a: nl === -1 ? '' : part.slice(nl + 1).trim() };
    });
  return { md: md.slice(0, m.index) + (next === -1 ? '' : rest.slice(next)), faq };
}
async function readDir(dir) {
  const full = r('src', 'content', dir);
  if (!existsSync(full)) return [];
  // Files starting with "_" are templates/examples: skipped unless INCLUDE_EXAMPLES=1.
  const files = (await readdir(full)).filter((f) => f.endsWith('.md') && (includeExamples || !f.startsWith('_')));
  return Promise.all(
    files.map(async (f) => {
      const { data, body } = parseFrontMatter(await readFile(path.join(full, f), 'utf8'));
      const file = `src/content/${dir}/${f}`;
      const { md, faq } = splitFaq(body);
      // `<!-- experiences -->` marks where the "Things to do" cards go; other HTML comments are
      // writing notes and never reach the browser.
      const [before, after = ''] = marked.parse(md).split(/<!--\s*experiences\s*-->/);
      const clean = (h) => h.replace(/<!--[\s\S]*?-->/g, '').trim();
      const item = (v, what) =>
        [].concat(v || []).map((x) => {
          const [a, ...rest] = String(x).split('|');
          if (!rest.length) contentErrors.push(`${file}: ${what} entries need "… | …" (got "${x}").`);
          return [a.trim(), rest.join('|').trim()];
        });
      return {
        file,
        slug: f.replace(/\.md$/, ''),
        ...data,
        html: clean(before),
        htmlAfter: clean(after),
        faq: faq.map(({ q, a }) => ({ q: marked.parseInline(q), a: marked.parse(a).trim(), text: q })),
        combine: item(data.combine, 'combine').map(([id, note]) => ({ id, note })),
        sources: item(data.sources, 'sources').map(([label, href]) => ({ label, href })),
        verify: [].concat(data.verify || []),
        gallery: [].concat(data.gallery || []),
      };
    }),
  );
}
const contentErrors = [];
const placeContent = Object.fromEntries((await readDir('places')).filter((c) => !c.slug.startsWith('_')).map((c) => [c.slug, c]));
const tours = await readDir('tours');
const activities = (await readDir('experiences')).filter((c) => !c.slug.startsWith('_'));

// Publication rules. A page is published only when its file says `status: published`, it has
// real content and no placeholders. Anything else stays a draft: in production a draft place
// page shows only the design's short summary (noindex), and a draft tour is not built at all.
// Draft content is visible only in staging/development previews.
const MIN_WORDS = { places: 200, tours: 120, experiences: 120 };
const PLACEHOLDER = /\[TODO|\bTODO\b|\bTBD\b|lorem ipsum/i;
const DEST_IDS = new Set(DESTS.map((d) => d.id));
const words = (html) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&[#a-z0-9]+;/gi, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
function isPublished(c, kind) {
  const status = c.status ?? 'draft';
  if (status !== 'draft' && status !== 'published') {
    contentErrors.push(`${c.file}: status "${status}" is not valid. Use "draft" or "published" (lowercase).`);
    return false;
  }
  if (status !== 'published') return false;
  if (c.slug.startsWith('_')) contentErrors.push(`${c.file}: files starting with "_" are templates or examples and cannot be published.`);
  const n = words([c.html, c.htmlAfter, ...c.faq.map((x) => x.a)].join(' '));
  if (n < MIN_WORDS[kind])
    contentErrors.push(`${c.file}: marked published but has ${n} words of visible content (minimum ${MIN_WORDS[kind]}). Finish the page or set status: draft.`);
  // Owner sign-off: a review date and no open verification items.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.reviewed || '')) contentErrors.push(`${c.file}: marked published but has no "reviewed: YYYY-MM-DD" (the date the owner checked it).`);
  if (c.verify.length) contentErrors.push(`${c.file}: marked published but has ${c.verify.length} open "verify:" item(s). Resolve them (and remove the list) first.`);
  const fields = [c.html, c.htmlAfter, ...c.faq.flatMap((x) => [x.q, x.a]), c.title, c.description, c.h1, c.intro, c.stay, c.gettingThere, c.bestTime, c.goodFor, c.summary, c.duration, c.pickup, c.groupSize, c.price, ...[].concat(c.includes || [], c.excludes || [])];
  if (fields.some((f) => typeof f === 'string' && PLACEHOLDER.test(f))) contentErrors.push(`${c.file}: marked published but still contains placeholder text ([TODO], TBD…).`);
  return true;
}
const EXP_IDS = new Set(EXPERIENCES.map((e) => e.id));
// Structure shared by destination and experience guides.
function checkGuide(c) {
  for (const { id } of c.combine) if (!DEST_IDS.has(id)) contentErrors.push(`${c.file}: combine — unknown destination id "${id}".`);
  for (const { href } of c.sources) if (!/^https:\/\/[^\s]+$/.test(href)) contentErrors.push(`${c.file}: sources — "${href}" must be a full https:// URL.`);
  for (const name of c.gallery) if (!GALLERY_IMAGES[name]) contentErrors.push(`${c.file}: gallery — unknown image "${name}" (see src/data/galleries.mjs).`);
  const qs = new Set();
  for (const x of c.faq) {
    if (!x.text.endsWith('?')) contentErrors.push(`${c.file}: FAQ question "${x.text}" should end with "?".`);
    if (!x.a) contentErrors.push(`${c.file}: FAQ question "${x.text}" has no answer.`);
    if (qs.has(x.text)) contentErrors.push(`${c.file}: FAQ question "${x.text}" appears twice.`);
    qs.add(x.text);
  }
}
for (const c of Object.values(placeContent)) {
  if (!DEST_IDS.has(c.slug)) contentErrors.push(`${c.file}: no destination with id "${c.slug}" in src/data/destinations.mjs.`);
  checkGuide(c);
  c.published = isPublished(c, 'places');
}
for (const a of activities) {
  if (!EXP_IDS.has(a.experience)) contentErrors.push(`${a.file}: "experience:" must be an id from src/data/experiences.mjs (got "${a.experience}").`);
  for (const k of ['title', 'description']) if (!a[k]) contentErrors.push(`${a.file}: missing ${k}.`);
  checkGuide(a);
  a.published = isPublished(a, 'experiences');
}
for (const t of tours) {
  const missing = ['title', 'description'].filter((k) => !t[k]);
  if (missing.length) contentErrors.push(`${t.file}: missing ${missing.join(', ')}.`);
  if (t.places && !Array.isArray(t.places)) contentErrors.push(`${t.file}: places must be a list, e.g. places: [sigiriya, dambulla].`);
  for (const id of [].concat(t.places || [], t.image || [])) if (!DEST_IDS.has(id)) contentErrors.push(`${t.file}: unknown destination id "${id}".`);
  if (!!t.priceAmount !== !!t.priceCurrency) contentErrors.push(`${t.file}: set both priceAmount and priceCurrency, or neither.`);
  if (t.priceAmount && !/^\d+(\.\d{1,2})?$/.test(String(t.priceAmount))) contentErrors.push(`${t.file}: priceAmount must be a number, e.g. 85.`);
  if (t.priceCurrency && !/^[A-Z]{3}$/.test(t.priceCurrency)) contentErrors.push(`${t.file}: priceCurrency must be a 3-letter code, e.g. USD.`);
  t.published = isPublished(t, 'tours');
}
// Experiences (src/data/experiences.mjs): every entry must point at a real destination.
{
  const seen = new Set();
  for (const e of EXPERIENCES) {
    const at = `src/data/experiences.mjs → ${e.id || '(missing id)'}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id || '')) contentErrors.push(`${at}: id must be kebab-case, e.g. kandy-temple-of-the-tooth.`);
    if (seen.has(e.id)) contentErrors.push(`${at}: duplicate id.`);
    seen.add(e.id);
    if (!DEST_IDS.has(e.destinationId)) contentErrors.push(`${at}: unknown destinationId "${e.destinationId}".`);
    if (!EXP_CATS[e.category]) contentErrors.push(`${at}: category "${e.category}" is not one of ${Object.keys(EXP_CATS).join(', ')}.`);
    for (const k of ['name', 'shortDescription']) if (typeof e[k] !== 'string' || !e[k].trim()) contentErrors.push(`${at}: ${k} is required.`);
    for (const k of ['duration', 'price']) if (e[k] != null && (typeof e[k] !== 'string' || !e[k].trim())) contentErrors.push(`${at}: ${k} must be text, or left out.`);
    for (const k of ['featured', 'available']) if (e[k] != null && typeof e[k] !== 'boolean') contentErrors.push(`${at}: ${k} must be true or false.`);
    if (e.image) {
      if (!existsSync(r('src', 'images', 'experiences', `${e.image}.jpg`))) contentErrors.push(`${at}: image src/images/experiences/${e.image}.jpg not found.`);
      if (!e.imageAlt) contentErrors.push(`${at}: imageAlt is required with an image.`);
    }
  }
}
// Galleries (src/data/galleries.mjs)
for (const [id, names] of Object.entries(GALLERIES)) {
  if (!DEST_IDS.has(id)) contentErrors.push(`src/data/galleries.mjs: unknown destination id "${id}".`);
  for (const n of names) if (!GALLERY_IMAGES[n]) contentErrors.push(`src/data/galleries.mjs → ${id}: unknown image "${n}".`);
}
for (const [n, g] of Object.entries(GALLERY_IMAGES)) {
  if (!g.alt) contentErrors.push(`src/data/galleries.mjs → ${n}: alt text is required.`);
  if (!existsSync(r('src', 'images', 'gallery', `${n}.jpg`))) contentErrors.push(`src/data/galleries.mjs → ${n}: src/images/gallery/${n}.jpg not found (run npm run prepare:images).`);
}
for (const e of EXPERIENCES)
  for (const k of ['where', 'details']) if (e[k] != null && (typeof e[k] !== 'string' || !e[k].trim())) contentErrors.push(`src/data/experiences.mjs → ${e.id}: ${k} must be text, or left out.`);

// Production builds only contain published tours and experience guides; previews show drafts too.
const builtTours = tours.filter((t) => t.published || !PROD);
const builtActivities = activities.filter((a) => a.published || !PROD);
const expGuide = Object.fromEntries(builtActivities.filter((a) => EXP_IDS.has(a.experience)).map((a) => [a.experience, a.slug]));

// Internal links in guide content must point at real pages; a published page may only link
// to pages that are published too (drafts aren't built in production).
const routes = new Map([['/', true]]);
for (const d of DESTS) routes.set(`/places/${d.id}/`, true);
for (const t of tours) if (!t.slug.startsWith('_')) routes.set(`/private-tours/${t.slug}/`, t.published);
for (const a of activities) routes.set(`/experiences/${a.slug}/`, a.published);
for (const c of [...Object.values(placeContent), ...activities, ...tours]) {
  const html = [c.html, c.htmlAfter, ...c.faq.map((x) => x.a)].join(' ');
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (!routes.has(href)) contentErrors.push(`${c.file}: link to ${href} — no such page.`);
    else if (c.published && !routes.get(href)) contentErrors.push(`${c.file}: published page links to ${href}, which is not published yet.`);
  }
}
if (contentErrors.length) fail(contentErrors);
// Root-relative links in content follow the site's base path.
const rebase = (h) => (base ? h.replace(/href="\//g, `href="${base}/`) : h);
for (const c of [...Object.values(placeContent), ...activities]) {
  c.html = rebase(c.html);
  c.htmlAfter = rebase(c.htmlAfter);
  c.faq.forEach((x) => (x.a = rebase(x.a)));
}

// ---------------------------------------------------------------------------
// Pages
const ctx = { site, u, abs, photos, expPhotos, expCardPhotos, galleryPhotos, expGuide, fontPreloads, assets: {}, toursFor: (id) => builtTours.filter((t) => (t.places || []).includes(id)) };
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
      telephone: '+' + site.contact.phone.replace(/\D/g, ''),
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
  if (!c.published) drafts.push(d.id);
  // Draft text is shown only in previews; production draft pages use the design summary alone.
  await emit({ ...placePage(ctx, d, c.published || !PROD ? c : {}), scripts: galleryScript }, { published: !!c.published });
}
for (const t of builtTours) await emit(tourPage(ctx, t), { published: t.published });
for (const a of builtActivities) await emit({ ...activityPage(ctx, a), scripts: galleryScript }, { published: a.published });
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
  PROD ? `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n` : `# ${target.mode} build — not for indexing\nUser-agent: *\nDisallow: /\n`,
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
// Recorded for scripts/check.mjs (kept out of dist/, so it is never deployed).
const unconfirmed = Object.entries(site.confirmed || {}).filter(([, v]) => v !== true).map(([k]) => k);
await writeFile(
  r('.cache', 'build-info.json'),
  JSON.stringify({ mode: target.mode, test: target.test, url: target.url, base, includeExamples, unconfirmed, builtAt: new Date().toISOString() }, null, 2),
);

console.log(`\nBuilt ${report.length} pages for ${target.url} (${target.mode}${target.test ? ', test build' : ''}${base ? `, served under ${base}/` : ''})`);
for (const [p, s, t] of report) console.log(`  ${s.padEnd(9)} ${p.padEnd(34)} ${t}`);
console.log(`\n  JS ${kb(jsBuf.length)} · home CSS ${kb(CSS.home.length)} · page CSS ${kb(CSS.page.length)} · images ${kb(imgBytes)}`);
console.log(`  Sitemap: ${sitemap.length} URL(s)`);
if (drafts.length)
  console.log(
    `\n  ${drafts.length} place pages are drafts (noindex, not in the sitemap) until src/content/places/<id>.md\n  exists with "status: published" and real content: ${drafts.join(', ')}`,
  );
const tourDrafts = tours.filter((t) => !t.published && !t.slug.startsWith('_'));
const actDrafts = activities.filter((a) => !a.published);
if (actDrafts.length) console.log(`\n  Draft experience guides (${PROD ? 'not built in production' : 'preview only'}): ${actDrafts.map((a) => a.slug).join(', ')}`);
if (tourDrafts.length) console.log(`\n  Draft tours (${PROD ? 'not built in production' : 'preview only'}): ${tourDrafts.map((t) => t.slug).join(', ')}`);
if (unconfirmed.length) warnings.push(`Not yet confirmed in site.config.mjs: ${unconfirmed.join(', ')}. npm run check:release fails until confirmed.`);
if (target.test) warnings.push('Test build (reserved test domain). It cannot pass npm run check:release or be deployed.');
for (const w of warnings) console.warn(`\n  ⚠ ${w}`);
console.log('');
