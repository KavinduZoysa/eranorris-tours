// One-off: copies the supplied photos into src/images/ with descriptive file names and
// metadata stripped. The build generates the web sizes from these masters.
//
//   node scripts/prepare-images.mjs [destination photo folder] [--experiences=<folder>]
//
//   destinations: ~/villas/destinations by default → src/images/destinations/ (1200×800)
//   experiences:  the villa site's assets/images folder (default: ../eranorris-srilanka/assets/images)
//                 → src/images/experiences/ (longest side ≤ 1200, not cropped)
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { DESTS, PHOTO_SOURCES } from '../src/data/destinations.mjs';
import { EXPERIENCE_PHOTO_SOURCES } from '../src/data/experiences.mjs';

const args = process.argv.slice(2);
const srcDir = args.find((a) => !a.startsWith('--')) || path.join(homedir(), 'villas', 'destinations');
const expDir =
  args.find((a) => a.startsWith('--experiences='))?.slice(14) ||
  new URL('../../eranorris-srilanka/assets/images/', import.meta.url).pathname;
const outDir = new URL('../src/images/destinations/', import.meta.url);
await mkdir(outDir, { recursive: true });

for (const d of DESTS) {
  const from = path.join(srcDir, PHOTO_SOURCES[d.id]);
  const to = new URL(`${d.photo}.jpg`, outDir);
  const info = await sharp(from)
    .rotate()
    .resize(1200, 800, { fit: 'cover' })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(to.pathname);
  console.log(`${PHOTO_SOURCES[d.id]} → ${d.photo}.jpg (${Math.round(info.size / 1024)} KB)`);
}

const expOut = new URL('../src/images/experiences/', import.meta.url);
await mkdir(expOut, { recursive: true });
for (const [name, rel] of Object.entries(EXPERIENCE_PHOTO_SOURCES)) {
  const info = await sharp(path.join(expDir, rel))
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(new URL(`${name}.jpg`, expOut).pathname);
  console.log(`${rel} → experiences/${name}.jpg (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
