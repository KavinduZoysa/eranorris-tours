// Resolves what is being built: environment, preferred URL (origin + optional sub-path) and
// whether it is a test build. Used by build.mjs; check.mjs reads the result the build records
// in .cache/build-info.json, so a check can never disagree with the build it is checking.
//
//   node scripts/build.mjs                    production — SITE_URL (or site.config.mjs url) required
//   node scripts/build.mjs --env=staging      noindex everywhere, crawling disallowed
//   node scripts/build.mjs --env=development  local preview (http://localhost), noindex
//   node scripts/build.mjs --test             production rules on a reserved test domain (npm test);
//                                             recorded as a test build, so it can never pass a release check

// Hostnames that must never appear in a real production build.
export const PLACEHOLDER_HOST = /(^|\.)(example\.(com|org|net)|example|test|invalid|localhost)$/i;
export const ENVS = ['production', 'staging', 'development'];

export function resolveTarget(site, { argv = process.argv.slice(2), env = process.env } = {}) {
  const arg = (k) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
  const test = argv.includes('--test');
  const mode = arg('env') || env.SITE_ENV || 'production';
  const errors = [];
  if (!ENVS.includes(mode)) errors.push(`Unknown environment "${mode}". Use one of: ${ENVS.join(', ')}.`);

  let raw = (env.SITE_URL || site.url || '').trim();
  if (!raw) {
    if (mode === 'development') raw = `http://localhost:${env.PORT || 4173}`;
    else if (test) raw = 'https://tours.example.test';
    else if (mode === 'staging') raw = 'https://staging.example.invalid';
    else
      errors.push(
        'SITE_URL is required for a production build. Set it to the preferred https:// address, e.g.\n' +
          '    SITE_URL=https://www.your-domain.com npm run build\n' +
          '  or set `url` in site.config.mjs. For a local preview run `npm run dev`.',
      );
  }
  let url = null;
  if (raw) {
    try {
      url = new URL(raw);
    } catch {
      errors.push(`SITE_URL "${raw}" is not a valid URL.`);
    }
  }
  if (url) {
    if (url.search || url.hash) errors.push('SITE_URL must not contain a query string or #fragment.');
    if (url.pathname !== url.pathname.toLowerCase() || /\/\/|\s/.test(url.pathname)) errors.push('SITE_URL path must be lowercase with no spaces or empty segments.');
    if (mode === 'production' && url.protocol !== 'https:') errors.push('SITE_URL must use https:// for production.');
    if (mode === 'production' && !test && PLACEHOLDER_HOST.test(url.hostname))
      errors.push(`SITE_URL uses a placeholder or reserved hostname (${url.hostname}). Set the real production domain.`);
  }
  const base = url ? url.pathname.replace(/\/+$/, '') : '';
  return { mode, test, url: url ? url.origin + base : '', origin: url ? url.origin : '', base, errors };
}
