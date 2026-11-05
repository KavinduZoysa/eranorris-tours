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
//   where            optional; only when it happens outside the destination itself
//   details          optional; a fuller, researched description for the destination page
//                    card (the map keeps shortDescription). General facts only — never
//                    what the tour includes.
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
    details: 'The temple beside Kandy Lake enshrines a relic of the Buddha’s tooth and is busy with worshippers all day, especially at the three daily ceremonies. Cover shoulders and knees, leave your shoes at the entrance and buy tickets from the machines on site.',
  },
  {
    id: 'kandy-peradeniya-botanical-gardens', destinationId: 'kandy', category: 'nature', source: 'brief',
    name: 'Peradeniya Royal Botanical Gardens',
    shortDescription: 'Walk through the Royal Botanical Gardens at Peradeniya, on the outskirts of Kandy.',
    where: 'Peradeniya, about 5.5 km west of Kandy',
    details: 'A former royal garden, botanic garden since 1821, spread over 147 acres beside the Mahaweli River. Highlights include the orchid house, the spice garden, the palm avenues and a giant Java fig on the Great Lawn; allow at least a couple of hours.',
  },
  {
    id: 'kandy-kandyan-dance', destinationId: 'kandy', category: 'culture', source: 'brief',
    name: 'Traditional Kandyan dance performance',
    shortDescription: 'Watch a performance of Kandyan dance, the traditional dance of the hill country, with drummers.',
    details: 'The classical dance of the hill country, with drummers and acrobatic ves dancers in silver headdresses. Evening performances for visitors are held at several venues in town and usually last about an hour; seating is often first come, first served.',
  },

  // Hikkaduwa — your villa site's experiences and "Tour Around Hikkaduwa", plus the design text.
  {
    id: 'hikkaduwa-cinnamon', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Cinnamon experience',
    shortDescription: 'Visit a working cinnamon garden with local artisans, learn to harvest and peel the bark by hand, and see how true cinnamon is processed.',
    details: 'Spend time at a working cinnamon garden and learn to peel the bark by hand. The shoots are cut, the outer bark is scraped away and the inner bark loosened with a brass rod, then peeled in thin strips and rolled into quills to dry.',
    duration: '3 hours, or a one-night stay',
    image: 'cinnamon-bark', imageAlt: 'Hands burnishing a freshly peeled length of cinnamon bark',
  },
  {
    id: 'hikkaduwa-sea-turtles', destinationId: 'hikkaduwa', category: 'wildlife', source: 'design',
    name: 'Sea turtles in the wild',
    shortDescription: 'Green sea turtles feed in the shallows off the beach. Watch from a respectful distance without touching or feeding them; sightings depend on the sea and are never guaranteed.',
    details: 'Green turtles come into the shallows by the reef at the north end of the beach to graze on algae, often a few metres from swimmers. Watch from a distance and don’t touch, chase or feed them, even with the seaweed sold on the beach. Sightings are common in calm weather but never guaranteed.',
  },
  {
    id: 'hikkaduwa-turtle-hatchery', destinationId: 'hikkaduwa', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Turtle hatchery and rescue centre',
    shortDescription: 'See turtles and how they are cared for at a hatchery and rescue centre. Hatcheries are privately run centres, not wild encounters.',
    details: 'Privately run hatcheries along this coast incubate eggs taken from nesting beaches before releasing the hatchlings, and keep turtles in tanks. It is a captive facility, not a wild encounter, and practices vary between hatcheries.',
    image: 'turtle-hatchery', imageAlt: 'Sea turtle swimming in a tank at a hatchery',
  },
  {
    id: 'hikkaduwa-moonstone-mine', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Moonstone mine visit',
    shortDescription: 'Walk through a moonstone mine and watch local artisans at work, with the chance to buy stones.',
    where: 'Meetiyagoda, inland from Hikkaduwa',
    details: 'The moonstone pits at Meetiyagoda are narrow hand-dug shafts. Gravel and clay are hauled up in buckets and washed to find the stones, which are then cut and polished in nearby workshops, usually with a showroom attached.',
  },
  {
    id: 'hikkaduwa-rathgama-lagoon-kayaking', destinationId: 'hikkaduwa', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Kayaking on Rathgama Lagoon',
    shortDescription: 'Paddle a calm lagoon near Hikkaduwa, bordered by mangroves and coconut palms, with kingfishers and cormorants along the way.',
    where: 'Rathgama, just south of Hikkaduwa',
    details: 'A calm, shallow lagoon behind a narrow strip of land, fringed with mangroves and coconut palms. Early morning and late afternoon are cooler on the water, and kingfishers, egrets and water monitors are often seen, though not guaranteed.',
    duration: 'Flexible · sunrise and sunset sessions',
    image: 'rathgama-lagoon', imageAlt: 'Sun setting over the calm water of Rathgama Lagoon',
  },
  {
    id: 'hikkaduwa-tsunami-museum', destinationId: 'hikkaduwa', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Tsunami Museum',
    shortDescription: 'A museum near Hikkaduwa remembering the 2004 tsunami that struck this coast.',
    details: 'Small community museums along the Galle Road north of Hikkaduwa remember the 2004 tsunami, which struck a crowded train at Peraliya; well over a thousand people are thought to have died there. Photographs and personal accounts can be graphic.',
    image: 'tsunami-museum', imageAlt: 'Rusted railway carriage on display at the Tsunami Museum',
  },
  {
    id: 'hikkaduwa-spice-garden', destinationId: 'hikkaduwa', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Spice garden',
    shortDescription: 'Walk through a spice garden and see how Sri Lankan spices are grown.',
    details: 'Spice gardens on this coast grow cinnamon, pepper, cardamom, cloves, nutmeg and other spices used in Sri Lankan cooking and Ayurveda. A walk shows the plants and how each spice is harvested; many gardens have a shop.',
  },

  // Galle and Mirissa — your villa site's "Whale Watching Mirissa & Galle Tour", plus the design text.
  {
    id: 'galle-fort', destinationId: 'galle', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Galle Fort',
    shortDescription: 'Explore the 17th-century fort town: the ramparts, the lighthouse and the streets inside the walls.',
    details: 'Walk the ramparts that circle the headland, from the Clock Tower to Flag Rock and the lighthouse, then explore the Dutch-era streets inside, with their churches, mosque and museums. The fort is a living town and free to walk; go early or late in the day, when it is cooler and quieter.',
    image: 'galle-fort', imageAlt: 'Clock tower and stone ramparts of Galle Fort',
  },
  {
    id: 'galle-jungle-beach', destinationId: 'galle', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Jungle Beach and the Japanese Peace Temple',
    shortDescription: 'Swim at Jungle Beach near Unawatuna and visit the Japanese Peace Temple nearby.',
    where: 'Rumassala, near Unawatuna, about 5 km east of Galle Fort',
    details: 'A small cove below the wooded Rumassala headland, between Galle harbour and Unawatuna. On the ridge above, a peace pagoda built by Japanese Buddhist monks looks back across the bay to Galle Fort. The sea is usually calm enough to swim from about November to April and can be rough in the south-west monsoon.',
    image: 'jungle-beach', imageAlt: 'Clear turquoise water at Jungle Beach near Unawatuna',
  },
  {
    id: 'mirissa-whale-watching', destinationId: 'mirissa', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Whale and dolphin watching',
    shortDescription: 'Head out to the deep water off Mirissa to look for whales and dolphins. The season runs from about November to April; sightings are never guaranteed.',
    details: 'Boats leave Mirissa harbour around dawn for the deep water just off the south coast, where blue whales, sperm whales and spinner dolphins feed. Trips usually spend 3–5 hours at sea and run from about November to April, when the sea is calmer; sightings are common in season but never guaranteed.',
    image: 'whale-watching', imageAlt: 'Whale’s tail rising above the sea',
  },
  {
    id: 'mirissa-coconut-tree-hill', destinationId: 'mirissa', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Coconut Tree Hill',
    shortDescription: 'Walk up to the palm-covered headland at Mirissa for views along the coast.',
    details: 'A short walk from the main beach, this headland of reddish cliffs and leaning palms looks along the coast and out to sea, and is busiest around sunrise and sunset. It is on private land, and access arrangements have changed in the past.',
    image: 'coconut-tree-hill', imageAlt: 'Coconut palms on a headland above the sea at Mirissa',
  },

  // Yala — your villa site's "Yala National Park Safari" and the design text.
  {
    id: 'yala-jeep-safari', destinationId: 'yala', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Private jeep safari',
    shortDescription: 'Explore the scrubland and lagoons of Yala in an open-top jeep, looking for elephants, leopards, sloth bears, crocodiles and birds. Sightings are never guaranteed.',
    details: 'Drive through Yala’s scrub, grassland and lagoons in an open safari jeep, at dawn or in the late afternoon when animals are most active. Block I is known for leopards; elephants, water buffalo, crocodiles and many birds are seen regularly, and sloth bears mainly from about May to July. Sightings are never guaranteed, and parts of the park usually close for several weeks around September–October.',
    duration: 'Half day',
    image: 'yala-elephant', imageAlt: 'Young elephant standing beside its mother in Yala',
  },

  // Other destinations — only activities the approved design text already names.
  {
    id: 'sigiriya-lion-rock-climb', destinationId: 'sigiriya', category: 'history', source: 'design',
    name: 'Climbing Lion Rock',
    shortDescription: 'Walk through the water gardens, then climb nearly 200 m past the frescoes to the palace ruins on the summit.',
    details: 'The climb follows the old royal approach: through the water and boulder gardens, up a spiral staircase to the fresco gallery and the Mirror Wall, then past the giant lion’s paws to the palace ruins on the summit. There are about 1,200 steps, some on exposed metal stairways, and most people need 2–3 hours in all. Start as soon as the site opens to avoid the worst of the heat and the queues.',
  },
  {
    id: 'polonnaruwa-cycling', destinationId: 'polonnaruwa', category: 'history', source: 'design',
    name: 'Cycling the ancient city',
    shortDescription: 'See the 11th-century royal city by bicycle, including the Gal Vihara rock carvings.',
    details: 'Flat, tree-lined roads link the ruins, which stretch several kilometres north from the museum by the reservoir to Gal Vihara, where four Buddha figures are cut from one granite face. Bicycles can be hired in town and near the site; start early, as the open ground heats up quickly.',
  },
  {
    id: 'nuwara-eliya-tea-factory', destinationId: 'nuwara-eliya', category: 'local-life', source: 'design',
    name: 'Tea estate and factory visit',
    shortDescription: 'Visit a tea estate and factory in the hills around Nuwara Eliya.',
    where: 'Estates around Nuwara Eliya and along the Kandy road',
    details: 'Nuwara Eliya has the highest average elevation of Sri Lanka’s tea districts, and its estates are known for a pale, fragrant tea. A factory tour follows the leaf through withering, rolling, fermenting, firing and grading, and usually ends with a tasting. Much of the processing happens at night, so the machines may be idle by day, and some factories do not allow photography inside.',
  },
  {
    id: 'ella-little-adams-peak', destinationId: 'ella', category: 'adventure', source: 'design',
    name: 'Little Adam’s Peak hike',
    shortDescription: 'An easy hike from Ella to the top of Little Adam’s Peak.',
    details: 'A 1,141 m hill named for its likeness to Adam’s Peak, reached on a gentle path through a tea estate off the Passara road, with steps near the top. Allow 45 minutes to an hour each way, and go early for clearer views and fewer people.',
  },
  {
    id: 'ella-nine-arches-bridge', destinationId: 'ella', category: 'history', source: 'design',
    name: 'Nine Arches Bridge',
    shortDescription: 'See the Nine Arches Bridge, the stone railway viaduct near Ella.',
    where: 'Demodara, about 2 km from Ella town',
    details: 'A curving railway viaduct of stone, brick and cement on nine arches, about 91 m long and 24 m high, completed around a century ago. Most people walk 30–45 minutes from Ella or take a tuk-tuk to a nearby path. It is a working railway with no barriers, so keep well clear when a train is due.',
  },
  {
    id: 'adams-peak-sunrise-climb', destinationId: 'adams-peak', category: 'adventure', source: 'design',
    name: 'Overnight sunrise climb',
    shortDescription: 'Climb the sacred summit overnight with pilgrims and hikers to watch the sun rise. The season runs from December to May.',
    where: 'Starts at Dalhousie (Nallathanni), about 32 km from Hatton',
    details: 'The Dalhousie route climbs about 1,000 m on several thousand steps, lit all night during the December–May pilgrimage season. Most people set off between about 1.30 and 2.30 am to reach the summit shrine for sunrise, taking around 3–4 hours up and 2–3 hours down. Bring warm layers and a refillable bottle: small plastic bottles and polythene are banned in the Sri Pada area.',
  },
  // Combines the design text's Bentota river safari with your villa site's Madu River tour
  // (listed under Hikkaduwa until November 2026). No duration until confirmed for Bentota.
  {
    id: 'bentota-river-safari', destinationId: 'bentota', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'River safari and mask museum',
    shortDescription: 'Take a boat through the mangroves of the Bentota River or the Madu River, then visit the traditional mask museum in Ambalangoda.',
    where: 'The Bentota River, or the Madu River at Balapitiya, about 20 km south; masks in Ambalangoda',
    details: 'Boats on the Bentota River head upstream from the river mouth between mangroves and small islands, usually for one to three hours. On the Madu Ganga at Balapitiya, a Ramsar wetland, boats wind through mangrove channels to an island temple, and the mask museum in Ambalangoda shows carved masks used in healing rituals and folk theatre. Kingfishers, herons and water monitors are common and crocodiles sometimes seen, but nothing is guaranteed.',
    image: 'madu-river', imageAlt: 'Boat passing through a tunnel of mangroves on the Madu River',
  },
  {
    id: 'bentota-water-sports', destinationId: 'bentota', category: 'adventure', source: 'design',
    name: 'Water sports',
    shortDescription: 'Water sports on Bentota’s river and beach.',
    details: 'Jet skis, water-skiing, wakeboarding, banana boats and windsurfing run mostly on the sheltered river and lagoon near the mouth, away from the open sea. The sea is calmer from about November to April. Operators vary, so check that life jackets are provided and fit.',
  },
  {
    id: 'arugam-bay-surfing', destinationId: 'arugam-bay', category: 'adventure', source: 'design',
    name: 'Surfing',
    shortDescription: 'Surf at Arugam Bay. The surf season runs from April to October.',
    details: 'Right-hand point breaks along this coast, from Pottuvil Point in the north to Okanda in the south, work from about April to October, when the wind blows offshore; July and August are busiest. Main Point suits experienced surfers, while its inside section and the softer breaks south of town are used for lessons. Reef and boulders lie under several breaks, so ask locally about the day’s conditions.',
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
