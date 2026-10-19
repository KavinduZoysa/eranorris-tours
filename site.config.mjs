// Site-wide settings. Everything marked TODO must be confirmed before launch —
// see "Before you publish" in README.md.

const env = process.env;

export default {
  // Brand shown in the header, titles and structured data.
  // TODO(confirm): "Eranorris" is taken from eranorrissrilanka.com and this repo's name.
  name: 'Eranorris',
  tagline: 'Private tours of Sri Lanka',

  // Preferred origin: HTTPS, one hostname, no trailing slash. Used for canonical
  // URLs, the sitemap, robots.txt and Open Graph tags.
  // TODO(required): set SITE_URL (or edit the fallback) to the production domain.
  url: (env.SITE_URL || 'https://www.example.com').replace(/\/+$/, ''),

  // "production" builds are indexable. Any other value (e.g. SITE_ENV=staging)
  // adds noindex to every page and disallows all crawling in robots.txt.
  env: env.SITE_ENV || 'production',

  // Contact channels used for quote/transfer requests and on every page.
  // TODO(confirm): taken from eranorrissrilanka.com — confirm they are right for tours.
  contact: {
    whatsapp: '94710630867', // international format, digits only (used in wa.me links)
    phone: '+94 71 063 0867', // display format
    email: 'eranories@gmail.com',
  },

  // Optional: a form backend that accepts a JSON POST (e.g. Formspree, Basin,
  // Web3Forms, or your own endpoint). When set, quote requests are sent there and
  // the visitor sees a confirmation only after a successful response. When empty,
  // the form hands the request off to WhatsApp (with an email alternative).
  // Never put a secret key here — this value is public in the page source.
  quoteEndpoint: env.QUOTE_ENDPOINT || '',

  // Business location for structured data. Only fields you can verify.
  // TODO(confirm): taken from eranorrissrilanka.com.
  address: { locality: 'Hikkaduwa', region: 'Southern Province', country: 'LK' },
};
