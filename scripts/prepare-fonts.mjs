// One-off: downloads the exact font files the design used (Google Fonts: Geist, Geist Mono,
// Instrument Serif — all SIL Open Font License) into src/fonts/ for self-hosting, and writes
// src/fonts/fonts.json describing the latin @font-face rules. Re-run only to update fonts.
import { mkdir, writeFile } from 'node:fs/promises';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap';
// A current browser UA makes Google return woff2 with unicode-range subsets.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const outDir = new URL('../src/fonts/', import.meta.url);
await mkdir(outDir, { recursive: true });

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
const blocks = [...css.matchAll(/\/\* (\S+) \*\/\s*@font-face\s*{([^}]*)}/g)].filter((m) => m[1] === 'latin');
const faces = new Map();
for (const [, , body] of blocks) {
  const get = (k) => body.match(new RegExp(`${k}:\\s*([^;]+);`))[1].trim();
  const family = get('font-family').replace(/'/g, '');
  const style = get('font-style');
  const weight = Number(get('font-weight'));
  const url = body.match(/url\(([^)]+)\)/)[1];
  const key = `${family}|${style}|${url}`;
  // Variable fonts come back as one file per weight: merge into a weight range.
  const f = faces.get(key) || { family, style, weights: [], url, range: get('unicode-range') };
  f.weights.push(weight);
  faces.set(key, f);
}
const manifest = [];
for (const f of faces.values()) {
  const file = `${f.family.toLowerCase().replace(/\s+/g, '-')}-latin-${f.style}.woff2`;
  const buf = Buffer.from(await (await fetch(f.url)).arrayBuffer());
  await writeFile(new URL(file, outDir), buf);
  const lo = Math.min(...f.weights), hi = Math.max(...f.weights);
  manifest.push({ family: f.family, style: f.style, weight: lo === hi ? String(lo) : `${lo} ${hi}`, file, unicodeRange: f.range });
  console.log(`${file} (${Math.round(buf.length / 1024)} KB) weight ${lo}–${hi}`);
}
await writeFile(new URL('fonts.json', outDir), JSON.stringify(manifest, null, 2) + '\n');
