// One-off: copies the supplied destination photos into src/images/destinations/
// with descriptive file names, normalised to 1200×800 JPEG with metadata stripped.
// The build generates the responsive WebP sizes from these masters.
//
//   node scripts/prepare-images.mjs [path/to/photo/folder]   (default: ~/villas/destinations)
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { DESTS, PHOTO_SOURCES } from '../src/data/destinations.mjs';

const srcDir = process.argv[2] || path.join(homedir(), 'villas', 'destinations');
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
