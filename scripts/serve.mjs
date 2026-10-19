// Minimal static server for dist/ that behaves like typical static hosts:
// /path → 301 /path/ when a directory exists, real 404 status with 404.html.
//   npm run serve            (PORT=4173 by default)
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createGzip } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!p.startsWith(DIST)) return res.writeHead(400).end();
  if (existsSync(p) && statSync(p).isDirectory()) {
    if (!url.pathname.endsWith('/')) return res.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
    p = path.join(p, 'index.html');
  }
  const ok = existsSync(p) && statSync(p).isFile();
  const file = ok ? p : path.join(DIST, '404.html');
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  // Compress text like production hosts do, so local performance tests are representative.
  const gzip = /text|json|xml|svg|javascript/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  res.writeHead(ok ? 200 : 404, { 'Content-Type': type, ...(gzip && { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' }) });
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
