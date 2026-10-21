// Experiences: things a traveller can do or visit at a destination. Kept separate from DESTS
// (the places) and linked by `destinationId`. Imported by the build (destination pages) and
// bundled into the map app (destination card, planner, quote request).
//
// The build checks every entry (scripts/build.mjs): unique id, a real destinationId, a known
// category, and an image file + alt text when `image` is set. Mistakes stop the build.
//
// Fields
//   id               stable, unique, kebab-case. Saved in visitors' trips — don't rename;
//                    to retire one, set available: false (or delete it).
//   destinationId    an id from DESTS in src/data/destinations.mjs
//   name             title, as a traveller would search for it
//   shortDescription one or two sentences — only facts you can stand behind
//   category         a key of EXP_CATS
//   duration         optional; only if known (e.g. 'Half day')
//   price            optional display text; only a verified, current price
//   image            optional; file name in src/images/experiences/ without ".jpg"
//   imageAlt         required when image is set
//   featured         optional; listed first and marked "Featured"
//   available        optional; false hides it everywhere without deleting it
//   source           where the facts come from, for your review:
//                      'eranorrissrilanka.com' — your villa site's Experiences page
//                      'design'               — the approved design's destination text
//                      'brief'                — requested by you; names only, details to confirm
//
// Confirm the whole list before launch: site.config.mjs → confirmed.experiences.
// Not shown on purpose: the villa site's extra-charge figures (e.g. hatchery LKR 2,000,
// Tsunami Museum LKR 1,000 per person) — add a `price` only if it applies to tour guests.

export const EXP_CATS = {
  culture: 'Culture',
  history: 'History',
  nature: 'Nature',
  wildlife: 'Wildlife',
  'local-life': 'Local life',
  food: 'Food',
  adventure: 'Adventure',
};

export const EXPERIENCES = [
  // Kandy — requested in the brief. Durations and what is included are not yet known.
  {
    id: 'kandy-temple-of-the-tooth', destinationId: 'kandy', category: 'culture', source: 'brief',
    name: 'Temple of the Sacred Tooth Relic',
    shortDescription: 'Visit the Buddhist temple that houses the Sacred Tooth Relic, beside Kandy Lake.',
  },
  {
    id: 'kandy-peradeniya-botanical-gardens', destinationId: 'kandy', category: 'nature', source: 'brief',
    name: 'Peradeniya Royal Botanical Gardens',
    shortDescription: 'Walk through the Royal Botanical Gardens at Peradeniya, on the outskirts of Kandy.',
  },
  {
    id: 'kandy-kandyan-dance', destinationId: 'kandy', category: 'culture', source: 'brief',
    name: 'Traditional Kandyan dance performance',
    shortDescription: 'Watch a performance of Kandyan dance, the traditional dance of the hill country, with drummers.',
  },

  // Hikkaduwa — your villa site's experiences and "Tour Around Hikkaduwa", plus the design text.
  {
    id: 'hikkaduwa-cinnamon', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Cinnamon experience',
    shortDescription: 'Visit a working cinnamon garden with local artisans, learn to harvest and peel the bark by hand, and see how true cinnamon is processed.',
    duration: '3 hours, or a one-night stay',
    image: 'cinnamon-bark', imageAlt: 'Hands burnishing a freshly peeled length of cinnamon bark',
  },
  {
    id: 'hikkaduwa-sea-turtles', destinationId: 'hikkaduwa', category: 'wildlife', source: 'design',
    name: 'Sea turtles in the wild',
    shortDescription: 'Green sea turtles feed in the shallows off the beach. Watch from a respectful distance without touching or feeding them; sightings depend on the sea and are never guaranteed.',
  },
  {
    id: 'hikkaduwa-turtle-hatchery', destinationId: 'hikkaduwa', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Turtle hatchery and rescue centre',
    shortDescription: 'See turtles and how they are cared for at a hatchery and rescue centre. Hatcheries are privately run centres, not wild encounters.',
    image: 'turtle-hatchery', imageAlt: 'Sea turtle swimming in a tank at a hatchery',
  },
  {
    id: 'hikkaduwa-moonstone-mine', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Moonstone mine visit',
    shortDescription: 'Walk through a moonstone mine and watch local artisans at work, with the chance to buy stones.',
  },
  {
    id: 'hikkaduwa-rathgama-lagoon-kayaking', destinationId: 'hikkaduwa', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Kayaking on Rathgama Lagoon',
    shortDescription: 'Paddle a calm lagoon near Hikkaduwa, bordered by mangroves and coconut palms, with kingfishers and cormorants along the way.',
    duration: 'Flexible · sunrise and sunset sessions',
    image: 'rathgama-lagoon', imageAlt: 'Sun setting over the calm water of Rathgama Lagoon',
  },
  {
    id: 'hikkaduwa-tsunami-museum', destinationId: 'hikkaduwa', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Tsunami Museum',
    shortDescription: 'A museum near Hikkaduwa remembering the 2004 tsunami that struck this coast.',
    image: 'tsunami-museum', imageAlt: 'Rusted railway carriage on display at the Tsunami Museum',
  },
  {
    id: 'hikkaduwa-spice-garden', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Spice garden',
    shortDescription: 'Walk through a spice garden and see how Sri Lankan spices are grown.',
  },
  {
    id: 'hikkaduwa-madu-river-safari', destinationId: 'hikkaduwa', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Madu River boat safari and mask museum',
    shortDescription: 'Take a boat through the mangroves of the Madu River, stop at an island temple, then visit the traditional mask museum in Ambalangoda.',
    duration: 'About 3.5 hours including travel',
    image: 'madu-river', imageAlt: 'Boat passing through a tunnel of mangroves on the Madu River',
  },

  // Galle and Mirissa — your villa site's "Whale Watching Mirissa & Galle Tour", plus the design text.
  {
    id: 'galle-fort', destinationId: 'galle', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Galle Fort',
    shortDescription: 'Explore the 17th-century fort town: the ramparts, the lighthouse and the streets inside the walls.',
    image: 'galle-fort', imageAlt: 'Clock tower and stone ramparts of Galle Fort',
  },
  {
    id: 'galle-jungle-beach', destinationId: 'galle', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Jungle Beach and the Japanese Peace Temple',
    shortDescription: 'Swim at Jungle Beach near Unawatuna and visit the Japanese Peace Temple nearby.',
    image: 'jungle-beach', imageAlt: 'Clear turquoise water at Jungle Beach near Unawatuna',
  },
  {
    id: 'mirissa-whale-watching', destinationId: 'mirissa', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Whale and dolphin watching',
    shortDescription: 'Head out on a large boat to the deep water off Mirissa to look for whales and dolphins. The season runs from November to April; sightings are never guaranteed.',
    image: 'whale-watching', imageAlt: 'Whale’s tail rising above the sea',
  },
  {
    id: 'mirissa-coconut-tree-hill', destinationId: 'mirissa', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Coconut Tree Hill',
    shortDescription: 'Walk up to the palm-covered headland at Mirissa for views along the coast.',
    image: 'coconut-tree-hill', imageAlt: 'Coconut palms on a headland above the sea at Mirissa',
  },

  // Yala — your villa site's "Yala National Park Safari" and the design text.
  {
    id: 'yala-jeep-safari', destinationId: 'yala', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Private jeep safari',
    shortDescription: 'Explore the scrubland and lagoons of Yala in an open-top jeep with a naturalist guide, looking for elephants, leopards, sloth bears, crocodiles and birds. Sightings are never guaranteed.',
    duration: 'Half day',
    image: 'yala-elephant', imageAlt: 'Young elephant standing beside its mother in Yala',
  },

  // Other destinations — only activities the approved design text already names.
  {
    id: 'sigiriya-lion-rock-climb', destinationId: 'sigiriya', category: 'history', source: 'design',
    name: 'Climbing Lion Rock',
    shortDescription: 'Climb the 200 m rock past the frescoes to the palace ruins on the summit, then walk through the water gardens at its base.',
  },
  {
    id: 'polonnaruwa-cycling', destinationId: 'polonnaruwa', category: 'history', source: 'design',
    name: 'Cycling the ancient city',
    shortDescription: 'See the 11th-century royal city by bicycle, including the Gal Vihara rock carvings.',
  },
  {
    id: 'nuwara-eliya-tea-factory', destinationId: 'nuwara-eliya', category: 'local-life', source: 'design',
    name: 'Tea estate and factory visit',
    shortDescription: 'Visit a tea estate and factory in the hills around Nuwara Eliya.',
  },
  {
    id: 'ella-little-adams-peak', destinationId: 'ella', category: 'adventure', source: 'design',
    name: 'Little Adam’s Peak hike',
    shortDescription: 'An easy hike from Ella to the top of Little Adam’s Peak.',
  },
  {
    id: 'ella-nine-arches-bridge', destinationId: 'ella', category: 'history', source: 'design',
    name: 'Nine Arches Bridge',
    shortDescription: 'See the Nine Arches Bridge, the stone railway viaduct near Ella.',
  },
  {
    id: 'adams-peak-sunrise-climb', destinationId: 'adams-peak', category: 'adventure', source: 'design',
    name: 'Overnight sunrise climb',
    shortDescription: 'Climb the sacred summit overnight with pilgrims and hikers to watch the sun rise. The season runs from December to May.',
  },
  {
    id: 'bentota-river-safari', destinationId: 'bentota', category: 'nature', source: 'design',
    name: 'River safari',
    shortDescription: 'Take a boat safari on the river at Bentota.',
  },
  {
    id: 'bentota-water-sports', destinationId: 'bentota', category: 'adventure', source: 'design',
    name: 'Water sports',
    shortDescription: 'Water sports on Bentota’s river and beach.',
  },
  {
    id: 'arugam-bay-surfing', destinationId: 'arugam-bay', category: 'adventure', source: 'design',
    name: 'Surfing',
    shortDescription: 'Surf at Arugam Bay. The surf season runs from April to October.',
  },
];

// Source files for the photos, relative to the villa site's assets/images folder (used only by
// scripts/prepare-images.mjs). These are photos already published on eranorrissrilanka.com.
export const EXPERIENCE_PHOTO_SOURCES = {
  'cinnamon-bark': 'cinnamon-experience/webp/cinnamon-bark-burnishing-closeup.webp',
  'turtle-hatchery': 'around-hikkaduwa/webp/turtle_5.webp',
  'rathgama-lagoon': 'kayak/kayak1.jpeg',
  'tsunami-museum': 'around-hikkaduwa/webp/tsunami_museum_1.webp',
  'madu-river': 'madu-river/webp/madu_river_boat_safari_1.webp',
  'galle-fort': 'whale-watching-and-galle/webp/galle_fort_tour_2.webp',
  'jungle-beach': 'whale-watching-and-galle/webp/jungle_beach_tour_1.webp',
  'whale-watching': 'whale-watching-and-galle/whale_watching_1.jpg',
  'coconut-tree-hill': 'whale-watching-and-galle/coconut_tree_hill_1.jpeg',
  'yala-elephant': 'yala/webp/elephant.webp',
};

// Available experiences for a destination: featured first, then in the order listed above.
export function experiencesFor(destinationId) {
  const list = EXPERIENCES.filter((e) => e.destinationId === destinationId && e.available !== false);
  return [...list.filter((e) => e.featured), ...list.filter((e) => !e.featured)];
}
