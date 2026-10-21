// Site-wide settings. See "Launch checklist" in README.md.

const env = process.env;

export default {
  // Brand shown in the header, titles and structured data.
  // Taken from eranorrissrilanka.com and this repo's name — confirm below.
  name: 'Eranorris',
  tagline: 'Private tours of Sri Lanka',

  // Preferred public address: https, one hostname, no trailing slash. Include a path only
  // if the site is served from a sub-directory (e.g. https://www.your-domain.com/tours).
  // The SITE_URL environment variable overrides this. A production build fails if neither
  // is set, or if the hostname is a placeholder. Every canonical, sitemap, Open Graph and
  // structured-data URL is generated from this one value.
  url: '',

  // Contact channels used for quote/transfer requests and shown in the footer.
  // Taken from eranorrissrilanka.com — confirm below.
  contact: {
    whatsapp: '94710630867', // international format, digits only (used in wa.me links)
    phone: '+94 71 063 0867', // display format
    email: 'eranories@gmail.com',
  },

  // Optional form backend that accepts a JSON POST (Formspree, Basin, Web3Forms or your own).
  // When set, requests are sent there and visitors see "sent" only after a successful response.
  // When empty, requests are handed off to WhatsApp or email and visitors are told so.
  // This value is public in the page source: never put a secret key here.
  quoteEndpoint: env.QUOTE_ENDPOINT || '',

  // Business location: shown in the footer and used in structured data. Set to null to omit.
  // Taken from eranorrissrilanka.com — confirm below.
  address: { locality: 'Hikkaduwa', region: 'Southern Province', country: 'LK', countryName: 'Sri Lanka' },

  // Owner confirmation of the facts customers rely on. Set each to true once you have checked
  // it. `npm run check` lists anything unconfirmed; `npm run check:release` (run by the deploy
  // workflow) fails until every item is true.
  confirmed: {
    brand: false, //          "Eranorris" is the customer-facing name for the tours business
    contact: false, //        WhatsApp number, phone and email above receive tour enquiries
    address: false, //        the business location above (or set address: null)
    shuttleFares: false, //   SHUTTLE_FARES in src/data/destinations.mjs are your real fixed prices
    shuttleService: false, // SHUTTLE_TIMING: driver meets guests in arrivals; 45 min / 3 h buffers
    vehicles: false, //       VEHICLES: models and passenger capacities you operate
    pickups: false, //        PICKUPS: you collect from every listed place (incl. Colombo Port, Mattala)
    hotelOptions: false, //   the quote form's hotel choices (Budget / Mid-range / Luxury) are services you offer
    destinationCopy: false, // the 16 destination descriptions, suggested nights and seasons
    experiences: false, //    src/data/experiences.mjs: each one is offered/arranged, and its text is right
    photoRights: false, //    you are licensed to use every photo in src/images/, and each shows the named place
  },
};
