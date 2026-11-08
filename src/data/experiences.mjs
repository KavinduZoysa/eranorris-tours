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
//   kind             a key of EXP_KINDS: a main attraction of the place, an activity there,
//                    or a nearby excursion that needs extra travel (then `where` is required)
//   shortDescription one or two sentences (≤ 200 characters) — only facts you can stand behind
//   category         a key of EXP_CATS
//   where            optional; only when it happens outside the destination itself
//   details          optional; a fuller, researched description for the destination page
//                    card (the map keeps shortDescription). General facts only — never
//                    what the tour includes. Typical times go here, in words.
//   season           optional; when to go, if timing matters ("About March to August")
//   duration         optional; only a duration you have confirmed for your own offer
//                    (e.g. 'Half day'); general typical times belong in `details`
//   price            optional display text; only a verified, current price
//   image            optional; file name in src/images/experiences/ without ".jpg"
//   imageAlt         required when image is set
//   featured         optional; listed first and marked "Featured"
//   available        optional; false hides it everywhere without deleting it
//   source           where the facts come from, for your review:
//                      'eranorrissrilanka.com' — your villa site's Experiences page
//                      'design'               — the approved design's destination text
//                      'brief'                — requested by you; names only, details to confirm
//                      'research'             — added from research; sources in docs/research/<destination>.md
//
// Who provides an experience is not shown: the owner confirmed (November 2026) that all of
// them are arranged through partners, and that guests don't need that detail.
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
  water: 'Beach & water',
};

// What sort of thing an experience is. Shown on every card, and the order the cards are listed.
export const EXP_KINDS = {
  attraction: 'Main attraction',
  activity: 'Activity',
  excursion: 'Nearby excursion',
};

export const EXPERIENCES = [
  // Kandy — requested in the brief. Durations and what is included are not yet known.
  {
    id: 'kandy-temple-of-the-tooth', destinationId: 'kandy', kind: 'attraction', category: 'culture', source: 'brief',
    name: 'Temple of the Sacred Tooth Relic',
    shortDescription: 'Visit the Buddhist temple that houses the Sacred Tooth Relic, beside Kandy Lake.',
    details: 'The temple beside Kandy Lake enshrines a relic of the Buddha’s tooth and is busy with worshippers all day, especially at the three daily ceremonies. Cover shoulders and knees, leave your shoes at the entrance and buy tickets from the machines on site.',
  },
  {
    id: 'kandy-peradeniya-botanical-gardens', destinationId: 'kandy', kind: 'attraction', category: 'nature', source: 'brief',
    name: 'Peradeniya Royal Botanical Gardens',
    shortDescription: 'Walk through the Royal Botanical Gardens at Peradeniya, on the outskirts of Kandy.',
    where: 'Peradeniya, about 5.5 km west of Kandy',
    details: 'A former royal garden, botanic garden since 1821, spread over 147 acres beside the Mahaweli River. Highlights include the orchid house, the spice garden, the palm avenues and a giant Java fig on the Great Lawn; allow at least a couple of hours.',
  },
  {
    id: 'kandy-kandyan-dance', destinationId: 'kandy', kind: 'activity', category: 'culture', source: 'brief',
    name: 'Traditional Kandyan dance performance',
    shortDescription: 'Watch a performance of Kandyan dance, the traditional dance of the hill country, with drummers.',
    details: 'The classical dance of the hill country, with drummers and acrobatic ves dancers in silver headdresses. Evening performances for visitors are held at several venues in town and usually last about an hour; seating is often first come, first served.',
  },
  {
    id: 'kandy-lake-walk', destinationId: 'kandy', kind: 'attraction', category: 'history', source: 'research',
    name: 'Kandy Lake and the old city',
    shortDescription: 'Walk around the lake the last king of Kandy created in the early 1800s, past the Temple of the Tooth and the old royal buildings.',
    details: 'Sri Wickrama Rajasinghe, the last king of Kandy, had paddy fields flooded below his palace to make the lake in the early 1800s; its scalloped parapet wall was still unfinished when the kingdom fell in 1815. A path follows the shore past the Temple of the Tooth and the old palace buildings, with the forest of Udawattakele behind. A full circuit takes about an hour at a gentle pace.',
  },
  {
    id: 'kandy-udawattakele', destinationId: 'kandy', kind: 'activity', category: 'nature', source: 'research',
    name: 'Udawattakele forest walk',
    shortDescription: 'Walk shaded paths through the forest reserve on the ridge behind the Temple of the Tooth, once the royal pleasure garden, minutes from the centre.',
    details: 'The forest on the ridge behind the temple was the Kandyan kings’ pleasure garden, became a forest reserve in 1856 and a sanctuary in 1938, and covers about 104 ha. Shaded paths wind past ponds and old trees, with plenty of birds and monkeys. It is quieter early in the morning; most visitors walk for one to two hours.',
  },
  {
    id: 'kandy-bahirawakanda', destinationId: 'kandy', kind: 'attraction', category: 'culture', source: 'research',
    name: 'Bahirawakanda Buddha viewpoint',
    shortDescription: 'Climb to the large white seated Buddha on a hill above Kandy for one of the best views over the city and the lake.',
    details: 'On a hill about 2 km from the centre, a white seated Buddha about 27 m tall, completed in 1992, looks out over Kandy. The terrace around it is one of the best viewpoints over the city, the lake and the surrounding hills, especially late in the afternoon. It is a place of worship: cover shoulders and knees and remove shoes where asked.',
  },
  {
    id: 'kandy-three-temples', destinationId: 'kandy', kind: 'excursion', category: 'history', source: 'research',
    name: 'Gadaladeniya, Lankatilaka and Embekke temples',
    shortDescription: 'A quiet half-day loop to three 14th-century temples west of Kandy, built in stone, brick and wood; Embekke is known for its carved pillars.',
    where: 'Off the Colombo road, roughly 15 km west of Kandy',
    details: 'These three temples date from the 14th-century Gampola period. Gadaladeniya is built of stone, Lankatilaka of brick on a rock outcrop, and the Embekke devale is famous for the carved wooden pillars of its drumming hall. They are quiet working temples, so dress modestly and remove shoes. Together they make an easy half-day away from the crowds.',
  },
  {
    id: 'kandy-ceylon-tea-museum', destinationId: 'kandy', kind: 'activity', category: 'local-life', source: 'research',
    name: 'Ceylon Tea Museum, Hanthana',
    shortDescription: 'See old tea machinery and the story of Ceylon tea in a 1925 tea factory in the hills just south of Kandy, with a tea room at the top.',
    where: 'Hanthana, a few kilometres south of Kandy',
    details: 'Set up by the Sri Lanka Tea Board and the Planters’ Association, the museum opened in 2001 in the Hanthana tea factory, built in 1925. Its floors hold rollers, dryers and other old machinery, a library and displays on pioneers such as James Taylor and Thomas Lipton, with a tea room on the top floor. Most visitors spend about an hour.',
  },
  {
    id: 'kandy-hanthana-pekoe-trail', destinationId: 'kandy', kind: 'activity', category: 'adventure', source: 'research',
    name: 'Hanthana hills and the Pekoe Trail',
    shortDescription: 'Walk in the Hanthana range just south of Kandy, where the long-distance Pekoe Trail begins its route through the tea country.',
    details: 'The Hanthana range rises to about 1,240 m just south of the city, with tea estates, grassland and views back over Kandy. The first stage of the Pekoe Trail, a 300 km waymarked route through the hills, runs from Hanthana to Galaha and is graded easy. Start early, carry water and check the trail organisers’ stage conditions, which change with the weather.',
  },
  {
    id: 'kandy-esala-perahera', destinationId: 'kandy', kind: 'activity', category: 'culture', source: 'research',
    name: 'Esala Perahera festival',
    shortDescription: 'Watch the torch-lit processions of dancers, drummers and decorated elephants that carry the relic casket through Kandy for ten nights each year.',
    season: 'Usually July or August; the temple publishes the dates each year',
    details: 'Kandy’s great festival honours the Sacred Tooth Relic. Processions of dancers, drummers, fire-twirlers and decorated elephants parade through the streets at night, growing larger each evening, and end with a daytime procession. The temple sets the dates each year from the lunar calendar, usually in July or August. Hotels fill early and the streets are packed, so plan well ahead.',
  },

  // Hikkaduwa — your villa site's experiences and "Tour Around Hikkaduwa", plus the design text.
  {
    id: 'hikkaduwa-cinnamon', destinationId: 'hikkaduwa', kind: 'activity', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Cinnamon experience',
    shortDescription: 'Visit a working cinnamon garden with local artisans, learn to harvest and peel the bark by hand, and see how true cinnamon is processed.',
    details: 'Spend time at a working cinnamon garden and learn to peel the bark by hand. The shoots are cut, the outer bark is scraped away and the inner bark loosened with a brass rod, then peeled in thin strips and rolled into quills to dry.',
    duration: '3 hours, or a one-night stay',
    image: 'cinnamon-bark', imageAlt: 'Hands burnishing a freshly peeled length of cinnamon bark',
  },
  {
    id: 'hikkaduwa-sea-turtles', destinationId: 'hikkaduwa', kind: 'attraction', category: 'wildlife', source: 'design',
    name: 'Sea turtles in the wild',
    shortDescription: 'Green sea turtles feed in the shallows off the beach. Watch from a respectful distance without touching or feeding them; sightings depend on the sea and are never guaranteed.',
    details: 'Green turtles come into the shallows by the reef at the north end of the beach to graze on algae, often a few metres from swimmers. Watch from a distance and don’t touch, chase or feed them, even with the seaweed sold on the beach. Sightings are common in calm weather but never guaranteed.',
  },
  {
    id: 'hikkaduwa-turtle-hatchery', destinationId: 'hikkaduwa', kind: 'activity', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Turtle hatchery',
    shortDescription: 'A privately run hatchery where turtle eggs are incubated and turtles kept in tanks. A captive facility, not a wild encounter.',
    details: 'Privately run hatcheries along this coast incubate eggs taken from nesting beaches before releasing the hatchlings, and keep turtles in tanks. It is a captive facility, not a wild encounter, and practices vary between hatcheries.',
    image: 'turtle-hatchery', imageAlt: 'Sea turtle swimming in a tank at a hatchery',
  },
  {
    id: 'hikkaduwa-moonstone-mine', destinationId: 'hikkaduwa', kind: 'excursion', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Moonstone mine visit',
    shortDescription: 'See the hand-dug moonstone pits at Meetiyagoda and watch the stones being cut and polished; most workshops have a showroom.',
    where: 'Meetiyagoda, inland between Hikkaduwa and Ambalangoda',
    details: 'The moonstone pits at Meetiyagoda are narrow hand-dug shafts. Gravel and clay are hauled up in buckets and washed to find the stones, which are then cut and polished in nearby workshops, usually with a showroom attached.',
  },
  {
    id: 'hikkaduwa-rathgama-lagoon-kayaking', destinationId: 'hikkaduwa', kind: 'activity', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Kayaking on Rathgama Lagoon',
    shortDescription: 'Paddle a calm lagoon near Hikkaduwa, bordered by mangroves and coconut palms, with kingfishers and cormorants along the way.',
    where: 'Rathgama, just south of Hikkaduwa',
    details: 'A calm, shallow lagoon behind a narrow strip of land, fringed with mangroves and coconut palms. Early morning and late afternoon are cooler on the water, and kingfishers, egrets and water monitors are often seen, though not guaranteed.',
    duration: 'Flexible · sunrise and sunset sessions',
    image: 'rathgama-lagoon', imageAlt: 'Sun setting over the calm water of Rathgama Lagoon',
  },
  {
    id: 'hikkaduwa-tsunami-museum', destinationId: 'hikkaduwa', kind: 'attraction', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Tsunami museum and Peraliya memorial',
    shortDescription: 'A museum near Hikkaduwa remembering the 2004 tsunami that struck this coast.',
    where: 'Peraliya and Telwatta, a few kilometres north of Hikkaduwa on the Galle Road',
    details: 'Small community museums along the Galle Road remember the 2004 tsunami, which wrecked a crowded train at Peraliya; well over a thousand people are thought to have died there. The railway memorial and the Tsunami Honganji Vihara, a tall standing Buddha with victims\' names at its base, are nearby. Some photographs are graphic. Visit quietly and dress modestly.',
    image: 'tsunami-museum', imageAlt: 'Rusted railway carriage on display at the Tsunami Museum',
  },
  {
    id: 'hikkaduwa-spice-garden', destinationId: 'hikkaduwa', kind: 'activity', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Spice garden',
    shortDescription: 'Walk through a spice garden and see how Sri Lankan spices are grown.',
    details: 'Spice gardens on this coast grow cinnamon, pepper, cardamom, cloves, nutmeg and other spices used in Sri Lankan cooking and Ayurveda. A walk shows the plants and how each spice is harvested; many gardens have a shop.',
  },
  {
    id: 'hikkaduwa-herbal-cloth-weaving', destinationId: 'hikkaduwa', kind: 'activity', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Handloom weaving and natural dyeing workshop',
    shortDescription: 'Watch cotton being dyed and woven on wooden handlooms at a small workshop near Hikkaduwa, with a shop selling the finished cloth.',
    details: 'Small family workshops in the Hikkaduwa and Galle area weave cotton on foot-treadle handlooms, and some colour the yarn with plant dyes such as turmeric or tree bark. A visit shows the dyeing and the looms at work and usually ends in a shop, with no obligation to buy. Most visits take under an hour. How \'herbal\' the dyes are varies from workshop to workshop.',
    image: 'herbal-cloth-weaving', imageAlt: 'A weaver working at a wooden handloom',
  },
  {
    id: 'hikkaduwa-reef-snorkelling', destinationId: 'hikkaduwa', kind: 'activity', category: 'water', source: 'research',
    name: 'Snorkelling on the Hikkaduwa reef',
    shortDescription: 'Snorkel from the beach over the shallow reef of Hikkaduwa National Park, with reef fish and often turtles. Calmest from about November to April.',
    season: 'About November to April, on calm days',
    details: 'The reef at the north end of the beach is a marine national park, on average only about 5 m deep. Much of the coral has been damaged by bleaching and heavy use and is being restored, but reef fish are plentiful and green turtles are often seen. Snorkel on calm days in the marked areas, keep your fins off the reef and never touch coral, which is prohibited. Turtle sightings are never guaranteed.',
  },
  {
    id: 'hikkaduwa-surfing', destinationId: 'hikkaduwa', kind: 'activity', category: 'water', source: 'research',
    name: 'Surfing and surf lessons',
    shortDescription: 'Surf Hikkaduwa\'s reef breaks, or learn on the gentler waves further south around Narigama. The season runs from about November to April.',
    season: 'About November to April',
    details: 'Hikkaduwa\'s surf season follows the north-east monsoon, roughly November to April. The reef breaks off the main beach suit experienced surfers, while the softer waves around Narigama are where most schools give lessons and rent boards. Reef and rock lie close to the surface at some breaks, so ask locally about the day\'s conditions and stay within your ability.',
  },
  {
    id: 'hikkaduwa-diving', destinationId: 'hikkaduwa', kind: 'activity', category: 'water', source: 'research',
    name: 'Scuba diving: reefs and wrecks',
    shortDescription: 'Dive the reefs and wrecks off Hikkaduwa, including the Conch, an early oil tanker. Best in the calmer months, about November to April.',
    season: 'About November to April',
    details: 'Dive centres in Hikkaduwa run boat dives to deeper reefs and several wrecks in the calmer months, roughly November to April, including the Conch, an early oil tanker. Beginners can take introductory dives and courses. Choose a centre registered with Sri Lanka Tourism and affiliated with an international training agency, and check its equipment and boat safety gear.',
  },

  // Galle and Mirissa — your villa site's "Whale Watching Mirissa & Galle Tour", plus the design text.
  {
    id: 'galle-fort', destinationId: 'galle', kind: 'attraction', category: 'history', source: 'eranorrissrilanka.com',
    name: 'Galle Fort',
    shortDescription: 'Explore the 17th-century fort town: the ramparts, the lighthouse and the streets inside the walls.',
    details: 'Walk the ramparts that circle the headland, from the Clock Tower to Flag Rock and the lighthouse, then explore the Dutch-era streets inside, with their churches, mosque and museums. The fort is a living town and free to walk; go early or late in the day, when it is cooler and quieter.',
    image: 'galle-fort', imageAlt: 'Clock tower and stone ramparts of Galle Fort',
  },
  {
    id: 'galle-jungle-beach', destinationId: 'galle', kind: 'attraction', category: 'water', source: 'eranorrissrilanka.com',
    name: 'Jungle Beach and the Japanese Peace Pagoda',
    shortDescription: 'Swim at Jungle Beach, a small cove near Unawatuna, and walk up to the Japanese Peace Pagoda above it. Calmest from about November to April.',
    where: 'Rumassala, near Unawatuna, about 5 km east of Galle Fort',
    season: 'Swimming about November to April',
    details: 'A small cove below the wooded Rumassala headland, between Galle harbour and Unawatuna, reached by a short path through the trees. On the ridge above, a peace pagoda built by Japanese Buddhist monks looks back to Galle Fort; cover shoulders and knees. The sea is usually calm enough to swim from about November to April. The reef is a protected sanctuary, so don\'t stand on or touch coral.',
    image: 'jungle-beach', imageAlt: 'Clear turquoise water at Jungle Beach near Unawatuna',
  },
  {
    id: 'galle-stilt-fishing', destinationId: 'galle', kind: 'excursion', category: 'local-life', source: 'eranorrissrilanka.com',
    name: 'Stilt fishermen at Koggala and Ahangama',
    shortDescription: 'See the stilt fishermen on their poles in the shallows east of Galle. Many now pose for paid photos, so agree on any payment first.',
    where: 'Koggala and Ahangama, about 25–40 minutes east of Galle Fort on the coast road',
    season: 'Posing for photos most days in the tourist season; real fishing mainly about May to October',
    details: 'Fishermen sit on a crossbar tied to a single pole in the shallows and cast for small fish, a method dating from about the Second World War. Some still fish, mainly in the south-west monsoon months, but in the tourist season many by the road pose for photographs and ask for payment, and some are not fishermen. Agree on any payment first and don\'t climb a pole uninvited. Usually a short roadside stop.',
    image: 'stilt-fishing', imageAlt: 'Stilt fishermen silhouetted on their poles in the sea at sunset',
  },
  {
    id: 'galle-koggala-lake', destinationId: 'galle', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Koggala Lake boat trip',
    shortDescription: 'A boat trip on Koggala Lake, a mangrove-fringed lagoon dotted with islands, with stops at a cinnamon island and a temple island.',
    where: 'Koggala, about 14 km (usually 25–35 minutes) east of Galle Fort',
    details: 'A broad lagoon behind the coast at Koggala, scattered with small islands and fringed with mangroves. Trips of about 1.5–2 hours usually stop at an island where cinnamon is peeled (with a shop) and a temple island with old murals, and pass Madol Doova, the island behind Martin Wickramasinghe\'s novel. Cormorants and herons are common. Ask for life jackets; mornings and late afternoons are cooler.',
  },
  {
    id: 'galle-martin-wickramasinghe-museum', destinationId: 'galle', kind: 'excursion', category: 'culture', source: 'research',
    name: 'Martin Wickramasinghe Folk Museum, Koggala',
    shortDescription: 'The birthplace of the Sinhala novelist Martin Wickramasinghe and a large museum of village life, crafts and ceremonies at Koggala.',
    where: 'Koggala, about 14 km (usually 25–35 minutes) east of Galle Fort',
    details: 'Run by the trust set up after Martin Wickramasinghe died in 1976, the complex at Koggala includes the house where he was born, furnished with his belongings, and pavilions of folk crafts, rural tools, fishing and farming gear and ceremonial objects. Most visitors spend about an hour. Opening hours are on the trust\'s website.',
  },
  {
    id: 'galle-handunugoda-tea-estate', destinationId: 'galle', kind: 'excursion', category: 'local-life', source: 'research',
    name: 'Handunugoda tea estate (white tea)',
    shortDescription: 'Visit a low-country tea estate inland from Ahangama, known for its white tea, to see the processing and taste the teas.',
    where: 'Inland from Ahangama, about 40 minutes east of Galle Fort',
    details: 'A family-owned estate in the low hills inland from Ahangama, known for its white tea. Visits usually include a walk in the plantation, a look at the small factory and a tasting of several teas, ending at the shop. Unlike the hill-country estates, it grows tea close to sea level, so it is an easy add-on to a coast day. Check the visiting arrangements before you go; allow about 1–2 hours.',
  },
  {
    id: 'galle-unawatuna-beach', destinationId: 'galle', kind: 'attraction', category: 'water', source: 'research',
    name: 'Unawatuna beach',
    shortDescription: 'Swim at Unawatuna, a crescent bay sheltered by headlands and a reef, a short drive from Galle Fort. Calmest from about November to April.',
    where: 'Unawatuna, about 6 km (usually 15–20 minutes) east of Galle Fort',
    season: 'Swimming about November to April',
    details: 'A curved bay between two headlands, sheltered by a reef and usually calm enough for swimming from about November to April. It is lined with cafés and guesthouses and gets busy in season; Jungle Beach and the peace pagoda are on the headland to the west. From about May to September the sea is often rough, so follow the flags and any lifeguards.',
  },
  {
    id: 'mirissa-whale-watching', destinationId: 'mirissa', kind: 'activity', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Whale and dolphin watching',
    shortDescription: 'Head out to the deep water off Mirissa to look for whales and dolphins. The season runs from about November to April; sightings are never guaranteed.',
    details: 'Boats leave Mirissa harbour around dawn for the deep water just off the south coast, where blue whales, sperm whales and spinner dolphins feed. Trips usually spend 3–5 hours at sea and run from about November to April. Licensed boats must carry a registered guide and keep at least 100 m from whales; sightings are common in season but never guaranteed.',
    image: 'whale-watching', imageAlt: 'Whale’s tail rising above the sea',
  },
  {
    id: 'mirissa-coconut-tree-hill', destinationId: 'mirissa', kind: 'attraction', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'Coconut Tree Hill',
    shortDescription: 'Walk up to the palm-covered headland at Mirissa for views along the coast.',
    details: 'A short walk from the main beach, this headland of reddish cliffs and leaning palms looks along the coast and out to sea, and is busiest around sunrise and sunset. It is on private land, and access arrangements have changed in the past.',
    image: 'coconut-tree-hill', imageAlt: 'Coconut palms on a headland above the sea at Mirissa',
  },
  {
    id: 'mirissa-weligama-surf-lesson', destinationId: 'mirissa', kind: 'activity', category: 'water', source: 'research',
    name: 'Surf lesson at Weligama',
    shortDescription: 'Learn to surf on the gentle waves of Weligama Bay, a few minutes west of Mirissa. Lessons run mainly from about November to April.',
    where: 'Weligama Bay, about 5 km west of Mirissa',
    season: 'Mainly about November to April',
    details: 'Weligama\'s long, sandy bay has soft, forgiving waves and many surf schools, which makes it one of Sri Lanka\'s most popular places to learn. A first lesson usually starts with the basics on the sand, then time in the whitewater with an instructor. Lessons run mainly in the calmer months; ask about the day\'s conditions and check that boards and leashes are in good order.',
  },
  {
    id: 'mirissa-matara-dondra-head', destinationId: 'mirissa', kind: 'excursion', category: 'history', source: 'research',
    name: 'Matara forts and Dondra Head lighthouse',
    shortDescription: 'See Matara\'s Dutch forts and the 49 m lighthouse at Dondra Head, the southernmost point of Sri Lanka, a short drive east of Mirissa.',
    where: 'Matara, about 20 minutes east of Mirissa, and Dondra Head, about 6 km further',
    details: 'Matara keeps a Dutch rampart fort by the sea and the small Star Fort of the 1760s, built to guard the river crossing and restored by the Department of Archaeology. Dondra Head, about 6 km beyond, is the island\'s southernmost point; its 49 m white lighthouse was completed in 1890. Most people take two to three hours for both, including the drive.',
  },
  {
    id: 'mirissa-hummanaya-blowhole', destinationId: 'mirissa', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Hummanaya blowhole',
    shortDescription: 'Watch the sea burst through a rock blowhole at Kudawella, east of Mirissa, best when the swell is big. A short walk from the road.',
    where: 'Kudawella, near Dikwella, about 45 minutes to an hour east of Mirissa',
    season: 'Most active when the swell is big; ask locally',
    details: 'At Kudawella, near Dikwella, waves force water up through a crack in the rocks, throwing spray as high as 25–30 m when the swell is big and much less on calm days. There is a viewing platform and a small visitor centre. Keep behind the barriers and away from wet rock edges. Often combined with Hiriketiya or the Wewurukannala temple.',
  },

  // Yala — your villa site's "Yala National Park Safari" and the design text.
  {
    id: 'yala-jeep-safari', destinationId: 'yala', kind: 'activity', category: 'wildlife', source: 'eranorrissrilanka.com',
    name: 'Yala jeep safari',
    shortDescription: 'Explore the scrubland and lagoons of Yala in an open-top jeep, looking for elephants, leopards, sloth bears, crocodiles and birds. Sightings are never guaranteed.',
    details: 'Drive through Yala’s scrub, grassland and lagoons in an open safari jeep, at dawn or in the late afternoon when animals are most active. Block I is known for leopards; elephants, water buffalo, crocodiles and many birds are seen regularly, and sloth bears mainly from about May to July. Sightings are never guaranteed, and parts of the park usually close for several weeks around September–October.',
    duration: 'Half day',
    image: 'yala-elephant', imageAlt: 'Young elephant standing beside its mother in Yala',
  },
  {
    id: 'yala-bundala-national-park', destinationId: 'yala', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Bundala National Park birdwatching safari',
    shortDescription: 'A quieter jeep drive around the coastal lagoons of Bundala, a Ramsar wetland known for waterbirds and, in some years, flamingos.',
    where: 'Bundala National Park, west of Tissamaharama, about 20–30 minutes by road',
    season: 'Best for migrant birds from about September to March',
    details: 'Bundala’s shallow lagoons, salt pans and dunes hold large numbers of waterbirds, with migrant shorebirds from about September to March and flocks of greater flamingos in some years. Crocodiles and a few elephants live here too. Drives are quieter than in Yala and usually take about 3 hours, early or late in the day. Sightings are never guaranteed.',
  },
  {
    id: 'yala-kataragama', destinationId: 'yala', kind: 'excursion', category: 'culture', source: 'research',
    name: 'Kataragama shrine and evening puja',
    shortDescription: 'Join pilgrims at Kataragama, a shrine town sacred to Buddhists, Hindus and Muslims, for the drumming and offerings of the evening puja.',
    where: 'Kataragama, about 19 km north of Tissamaharama, around 30 minutes by road',
    season: 'All year; the annual Esala festival is usually in July',
    details: 'Pilgrims bathe in the Menik Ganga, then crowd into the shrine of the god Kataragama for offerings held several times a day; the evening one is the busiest. The white Kiri Vehera stupa is a short walk north. Remove shoes and avoid shorts. Allow 2–3 hours including the drive. The annual festival, usually in July, brings fire-walking and very large crowds.',
  },
  {
    id: 'yala-tissamaharama-stupa', destinationId: 'yala', kind: 'attraction', category: 'history', source: 'research',
    name: 'Tissamaharama stupa and Tissa Wewa',
    shortDescription: 'See the great white stupa of Ruhuna’s ancient capital and the 2,000-year-old Tissa Wewa reservoir, best at sunset.',
    where: 'Tissamaharama, the main base for Yala',
    details: 'Tissamaharama was the capital of the ancient southern kingdom of Ruhuna. Its whitewashed stupa, about 50 m high, is linked to King Kavantissa in the 2nd century BC, and the smaller Yatala and Sandagiri stupas are nearby. Tissa Wewa, an ancient reservoir beside the town, draws waterbirds and is lovely at sunset. Most people spend an hour or two. Dress modestly at the temples.',
  },
  {
    id: 'yala-sithulpawwa', destinationId: 'yala', kind: 'excursion', category: 'history', source: 'research',
    name: 'Sithulpawwa rock monastery',
    shortDescription: 'An ancient cave monastery on rock outcrops in the Yala wilderness, still an active temple, reached by a road through the park.',
    where: 'Inside Yala, about 28 km from Kirinda by a park road; roughly 1–1.5 hours from Tissamaharama',
    details: 'Monks have lived among these rock outcrops since around the 2nd century BC; caves, stupas, inscriptions and a cave with old paintings remain, and the rock looks out over the forest. It is reached by roads through the park from Kirinda or Kataragama, partly gravel. Go in daylight, as elephants use the roads, and dress modestly. Allow half a day from Tissamaharama.',
  },
  {
    id: 'yala-kirinda', destinationId: 'yala', kind: 'excursion', category: 'culture', source: 'research',
    name: 'Kirinda rock temple and beach',
    shortDescription: 'Climb to a temple on a rock above the sea at Kirinda, linked by legend to Queen Viharamahadevi, with views over dunes and the coast.',
    where: 'Kirinda, about 10 km south of Tissamaharama, around 20 minutes by road',
    details: 'The temple buildings are modern, but two rock inscriptions date to the 1st century AD, and tradition says the princess who became Queen Viharamahadevi came ashore near here. The rock gives wide views of the beach, dunes and fishing boats. Currents can be strong, so ask locally before swimming. Most people spend about an hour.',
  },
  {
    id: 'yala-lunugamvehera-safari', destinationId: 'yala', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Lunugamvehera National Park safari',
    shortDescription: 'A quieter jeep safari in the park between Yala and Udawalawe, an elephant corridor with far fewer vehicles than Yala’s Block I.',
    where: 'Lunugamvehera National Park, entrance near Thanamalwila, about 30 minutes north-west of Tissamaharama',
    details: 'Lunugamvehera protects the catchment of a large reservoir and a corridor used by elephants moving between Yala and Udawalawe. Elephants, water buffalo, crocodiles and many waterbirds are seen, but sightings are never guaranteed. The main entrance is near Thanamalwila. Drives usually take about 3–4 hours, early or late in the day.',
  },

  // Other destinations — only activities the approved design text already names.
  {
    id: 'sigiriya-lion-rock-climb', destinationId: 'sigiriya', kind: 'attraction', category: 'history', source: 'design',
    name: 'Climbing Lion Rock',
    shortDescription: 'Walk through the water gardens, then climb nearly 200 m past the frescoes to the palace ruins on the summit.',
    details: 'The climb follows the old royal approach: through the water and boulder gardens, up a spiral staircase to the fresco gallery and the Mirror Wall, then past the giant lion’s paws to the palace ruins on the summit. There are about 1,200 steps, some on exposed metal stairways, and most people need 2–3 hours in all. Start as soon as the site opens to avoid the worst of the heat and the queues.',
    image: 'lion-rock-climb', imageAlt: 'The giant stone lion’s paws at the foot of the final staircase up Sigiriya rock',
  },
  {
    id: 'sigiriya-pidurangala-rock', destinationId: 'sigiriya', kind: 'activity', category: 'adventure', source: 'research',
    name: 'Pidurangala Rock climb',
    shortDescription: 'Climb the rock next to Sigiriya, past a temple and a brick reclining Buddha, for the classic view of Lion Rock, often at sunrise.',
    details: 'Pidurangala rises about 1 km north of Lion Rock. A path from the working temple at its foot climbs past a large brick reclining Buddha to a final boulder scramble where you need your hands; most people reach the top in 30–45 minutes. The temple charges its own fee and asks visitors to cover shoulders and knees. For sunrise, bring a torch and shoes with good grip.',
  },
  {
    id: 'sigiriya-elephant-safari', destinationId: 'sigiriya', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Elephant safari: Minneriya, Kaudulla or Hurulu',
    shortDescription: 'An afternoon jeep safari to see wild elephants graze the old reservoir beds; drivers pick the park on the day. Sightings are never guaranteed.',
    where: 'Minneriya, Kaudulla or Hurulu Eco Park, about 30–60 minutes by road from Sigiriya',
    season: 'Best about July–October; usually peaks around August–September',
    details: 'Minneriya and Kaudulla national parks and Hurulu Eco Park share the same herds, so drivers choose the park on the day. From about July to October elephants graze the drying reservoir beds, usually peaking around August and September at Minneriya; numbers vary with water levels. Most safaris last about 3 hours in the afternoon. Ask your driver to keep a good distance and not to crowd the herds.',
  },
  {
    id: 'sigiriya-ritigala', destinationId: 'sigiriya', kind: 'excursion', category: 'history', source: 'research',
    name: 'Ritigala forest monastery',
    shortDescription: 'Walk a paved forest path through the ruins of an ascetic monastery on the lower slopes of Ritigala, a mountain reserve north of Habarana.',
    where: 'Ritigala, about an hour by road north of Sigiriya via Habarana',
    details: 'Ritigala rises to 766 m above the dry-zone plains. The mountain is a strict nature reserve, but the monastery ruins on its lower slopes are open. Monks lived here from about the 1st century BC, and a stone path leads through shaded forest past a reservoir, a monastery hospital and paired stone platforms joined by bridges. Allow 2–3 hours on site; it has its own ticket and is rarely crowded.',
  },
  {
    id: 'sigiriya-village-tour', destinationId: 'sigiriya', kind: 'activity', category: 'local-life', source: 'research',
    name: 'Village tour near Habarana',
    shortDescription: 'A packaged walk through paddy fields, a short boat crossing of a village tank and a home-cooked rice-and-curry lunch. Organised for visitors.',
    where: 'Hiriwadunna and other villages around Habarana, about 20–30 minutes from Sigiriya',
    details: 'Village tours around Habarana and Sigiriya, the best known at Hiriwadunna, follow a set routine: a walk along paddy bunds, a crossing of the village tank in a small boat and a rice-and-curry lunch cooked over a wood fire in a village home. They are commercial and partly staged, but the farmland and food are real. Most take 2–3 hours, often around lunchtime.',
  },
  {
    id: 'sigiriya-cooking-class', destinationId: 'sigiriya', kind: 'activity', category: 'food', source: 'research',
    name: 'Sri Lankan cooking class',
    shortDescription: 'Cook a rice-and-curry meal with a local family near Sigiriya: several curries and a coconut sambol, often in clay pots over a wood fire.',
    details: 'Family kitchens around Sigiriya run hands-on classes. You usually help prepare rice, three or four vegetable or lentil curries and a coconut sambol, often in clay pots over a wood fire, and some start with a garden or market visit. Most last about 3 hours and end with eating what you cooked. Classes are commercial and vary, so mention dietary needs when booking.',
  },
  {
    id: 'polonnaruwa-cycling', destinationId: 'polonnaruwa', kind: 'activity', category: 'history', source: 'design',
    name: 'Cycling the ancient city',
    shortDescription: 'Cycle the flat, shaded roads between the ruins of the medieval royal city, from the palace and Quadrangle to the Gal Vihara carvings.',
    details: 'Flat, tree-lined roads link the ruins, which stretch several kilometres north from the museum by the reservoir to Gal Vihara, where four Buddha figures are cut from one granite face. Bicycles can be hired in town and near the site; start early, as the open ground heats up quickly.',
  },
  {
    id: 'polonnaruwa-ancient-city', destinationId: 'polonnaruwa', kind: 'attraction', category: 'history', source: 'research',
    name: 'Ancient city and Gal Vihara',
    shortDescription: 'Explore the medieval royal city: the palace walls, the circular Vatadage in the Quadrangle and the Buddha figures carved from one granite face.',
    details: 'Polonnaruwa was the royal capital from 1070 for about two and a half centuries. The ruins run several kilometres north from the museum, where tickets are sold: the royal palace, the Quadrangle with its Vatadage and Hatadage, Rankoth Vehera, Lankatilaka and the four Buddha images of Gal Vihara. A full morning covers the main groups; start early, before the heat.',
  },
  {
    id: 'polonnaruwa-medirigiriya', destinationId: 'polonnaruwa', kind: 'excursion', category: 'history', source: 'research',
    name: 'Medirigiriya Vatadage',
    shortDescription: 'A quiet 7th-century circular relic house on a low rock, ringed by three circles of slender stone pillars, north of Polonnaruwa.',
    where: 'Medirigiriya, about 35 km north of Polonnaruwa (around 45 minutes to an hour by road)',
    details: 'Built in about the 7th century, the vatadage at Medirigiriya stands on a low rock reached by a short flight of steps, with three rings of slender octagonal pillars around a small stupa and Buddha images. It is among the best-preserved buildings of its kind and usually has few visitors. Allow about half an hour on site; the rock gets very hot at midday.',
  },
  {
    id: 'polonnaruwa-elephant-safari', destinationId: 'polonnaruwa', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Elephant safari: Minneriya or Kaudulla',
    shortDescription: 'An afternoon jeep safari from Polonnaruwa to see wild elephants on the reservoir grasslands of Minneriya or Kaudulla. Never guaranteed.',
    where: 'Minneriya or Kaudulla National Park, about 30–60 minutes by road from Polonnaruwa',
    season: 'Best about July–October; usually peaks around August–September',
    details: 'Minneriya\'s entrance is about 25–30 km west of Polonnaruwa, and Kaudulla lies to its north; the same herds use both, so drivers choose the park on the day. From about July to October elephants graze the drying reservoir beds, usually peaking around August and September. Many visitors see the ruins in the morning and take a safari of about 3 hours in the afternoon.',
  },
  {
    id: 'nuwara-eliya-tea-factory', destinationId: 'nuwara-eliya', kind: 'activity', category: 'local-life', source: 'design',
    name: 'Tea estate and factory visit',
    shortDescription: 'Visit a tea estate and factory in the hills around Nuwara Eliya.',
    where: 'Estates around Nuwara Eliya and along the Kandy road',
    details: 'Nuwara Eliya has the highest average elevation of Sri Lanka’s tea districts, and its estates are known for a pale, fragrant tea. A factory tour follows the leaf through withering, rolling, fermenting, firing and grading, and usually ends with a tasting. Much of the processing happens at night, so the machines may be idle by day, and some factories do not allow photography inside.',
    image: 'tea-estate', imageAlt: 'Rows of tea bushes on a hill-country estate under a blue sky',
  },
  {
    id: 'nuwara-eliya-horton-plains', destinationId: 'nuwara-eliya', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Horton Plains and World’s End walk',
    shortDescription: 'Walk the 9 km loop across a high plateau to World’s End, where the escarpment drops about 870 m, and Baker’s Falls. Start at dawn, before the cloud.',
    where: 'Horton Plains National Park, about 32 km by road from Nuwara Eliya',
    season: 'Open all year; clearest from about January to March',
    details: 'Horton Plains National Park protects grassland and cloud forest at about 2,100–2,300 m. The loop of about 9 km takes around three hours on mostly level, rocky paths, past Mini World’s End, World’s End and Baker’s Falls. Cloud often hides the view by mid-morning, so most people arrive early. There are no railings at the edge. Plastic bags are banned; sambar deer are often seen.',
  },
  {
    id: 'nuwara-eliya-gregory-lake', destinationId: 'nuwara-eliya', kind: 'attraction', category: 'nature', source: 'research',
    name: 'Gregory Lake',
    shortDescription: 'Stroll the lakeside path or take a boat on the lake at the edge of town, made in the 1870s below Pidurutalagala.',
    details: 'The lake was created in the 1870s by damming streams below Pidurutalagala, the island’s highest mountain. A path follows the shore, and boats are available, which makes it an easy evening stroll after a day on the road. It is busiest at weekends and in the April holiday season.',
  },
  {
    id: 'nuwara-eliya-hakgala', destinationId: 'nuwara-eliya', kind: 'attraction', category: 'nature', source: 'research',
    name: 'Hakgala Botanic Gardens',
    shortDescription: 'Walk the terraced gardens below Hakgala Rock, founded in 1861 to grow cinchona, with roses and other flowers at their best from mid-March to April.',
    where: 'About 9.5 km south-east of Nuwara Eliya on the Badulla road',
    season: 'Flowers usually peak from about mid-March to April',
    details: 'Hakgala was set up in 1861 to trial cinchona, the source of quinine, and later turned into a garden of roses, ferns, temperate flowers and trees on terraces at about 1,745 m below the rock. It covers about 28 ha. Allow one to two hours; paths are steep in places.',
  },
  {
    id: 'nuwara-eliya-seetha-amman', destinationId: 'nuwara-eliya', kind: 'activity', category: 'culture', source: 'research',
    name: 'Seetha Amman Temple',
    shortDescription: 'Visit the Hindu temple at Sita Eliya dedicated to Sita, where tradition says Ravana held her captive, as told in the Ramayana.',
    where: 'Sita Eliya, a little before Hakgala on the Badulla road',
    details: 'This small, colourful temple is dedicated to Sita and has a shrine to Hanuman. By tradition this is where Ravana kept her captive in the Ramayana, and many pilgrims come from India. It stands beside a stream a little before Hakgala on the Badulla road, so the two fit one outing. Shoes come off at the entrance.',
  },
  {
    id: 'nuwara-eliya-lovers-leap', destinationId: 'nuwara-eliya', kind: 'activity', category: 'nature', source: 'research',
    name: 'Lover’s Leap waterfall walk',
    shortDescription: 'Walk up through the tea of Pedro estate to Lover’s Leap, a waterfall of about 30 m on the slopes just outside town.',
    where: 'Pedro estate, a few kilometres east of the town centre',
    details: 'The path to Lover’s Leap climbs through Pedro estate’s tea bushes to a waterfall of about 30 m, with views back over Nuwara Eliya. The round trip from the estate is about 5 km, shorter from a tuk-tuk drop-off. Rocks near the falls are slippery, so keep to the path.',
  },
  {
    id: 'nuwara-eliya-moon-plains', destinationId: 'nuwara-eliya', kind: 'activity', category: 'nature', source: 'research',
    name: 'Moon Plains viewpoint',
    shortDescription: 'A grassland reserve near town with a cliff-edge viewpoint often called a mini World’s End. Authorised jeeps usually cover the last stretch.',
    where: 'Moon Plains (Sandatenna), a short drive from Nuwara Eliya',
    details: 'The Nuwara Eliya Municipal Council declared Moon Plains (Sandatenna) a tourism zone in 2014. Grassland and farmland lead to a viewpoint over the surrounding mountains, often called a mini World’s End, and the last few kilometres are usually covered in authorised jeeps. Mornings are clearest; check the current access arrangements locally.',
  },
  {
    id: 'nuwara-eliya-waterfalls', destinationId: 'nuwara-eliya', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Ramboda, St Clair’s and Devon falls',
    shortDescription: 'See three of the hill country’s best-known waterfalls from viewpoints on the hill roads: Ramboda on the Kandy road, St Clair’s and Devon near Talawakele.',
    where: 'Ramboda on the Kandy road; St Clair’s and Devon near Talawakele, west of Nuwara Eliya',
    details: 'Ramboda Falls tumbles down beside the Kandy road, an easy stop on the drive between Kandy and Nuwara Eliya. St Clair’s and Devon falls are seen from roadside viewpoints near Talawakele, on the road towards Hatton and Adam’s Peak. All three are fullest after the monsoon rains. Keep to the viewpoints; rocks near falls are slippery.',
  },
  {
    id: 'nuwara-eliya-birdwatching', destinationId: 'nuwara-eliya', kind: 'activity', category: 'wildlife', source: 'research',
    name: 'Birdwatching at Victoria Park and Galway’s Land',
    shortDescription: 'Look for hill-country birds, including endemics, in the town park and the small Galway’s Land National Park. Early morning is best.',
    details: 'Victoria Park in the centre and Galway’s Land National Park, about 2 km east, are both known among birders for hill-country species, including some found only in Sri Lanka, and winter migrants. Go early in the morning, when birds are most active and the paths are quiet. Sightings are never guaranteed.',
  },
  {
    id: 'ella-little-adams-peak', destinationId: 'ella', kind: 'activity', category: 'nature', source: 'design',
    name: 'Little Adam’s Peak hike',
    shortDescription: 'An easy hike from Ella to the top of Little Adam’s Peak.',
    details: 'A 1,141 m hill named for its likeness to Adam’s Peak, reached on a gentle path through a tea estate off the Passara road, with steps near the top. Allow 45 minutes to an hour each way, and go early for clearer views and fewer people.',
  },
  {
    id: 'ella-nine-arches-bridge', destinationId: 'ella', kind: 'attraction', category: 'history', source: 'design',
    name: 'Nine Arches Bridge',
    shortDescription: 'See the Nine Arches Bridge, the stone railway viaduct near Ella.',
    where: 'Demodara, about 2 km from Ella town',
    details: 'A curving railway viaduct of stone, brick and cement on nine arches, about 91 m long and 24 m high, completed around a century ago. Most people walk 30–45 minutes from Ella or take a tuk-tuk to a nearby path. It is a working railway with no barriers, so keep well clear when a train is due.',
    image: 'nine-arches-bridge', imageAlt: 'The stone Nine Arches Bridge curving through the jungle near Ella',
  },
  {
    id: 'ella-rock-hike', destinationId: 'ella', kind: 'activity', category: 'adventure', source: 'research',
    name: 'Ella Rock hike',
    shortDescription: 'The harder of Ella’s two classic hikes: along the railway, then a steep forest path to a high viewpoint over the Ella Gap. Allow 3–4 hours.',
    details: 'The usual route follows the railway for about 2.5 km towards Kital Ella station, then climbs a steep path through forest and eucalyptus to the top, with views down the gap. Plan on three to four hours for the round trip. Paths branch and people sometimes offer to show the way for a fee, so an offline map helps. Start early, and step well clear of the line when a train comes.',
  },
  {
    id: 'ella-ravana-falls', destinationId: 'ella', kind: 'attraction', category: 'nature', source: 'research',
    name: 'Ravana Falls',
    shortDescription: 'A 25 m waterfall beside the Wellawaya road just below Ella, linked by legend to King Ravana of the Ramayana. Fullest after rain.',
    where: 'About 6 km south of Ella on the Wellawaya road',
    details: 'About 6 km from Ella station on the Wellawaya road, the falls drop about 25 m in tiers and can be seen from the roadside; they are part of the Ravana Ella Wildlife Sanctuary. Legend links the falls and a nearby cave to Ravana. The flow drops sharply in the dry season. The rocks are slippery and the water can run fast after rain, so don’t climb the falls.',
  },
  {
    id: 'ella-hill-country-train', destinationId: 'ella', kind: 'activity', category: 'nature', source: 'research',
    name: 'Hill-country train ride',
    shortDescription: 'Ride the line through the tea country to or from Ella, one of Sri Lanka’s best-known train journeys. Services were disrupted after Cyclone Ditwah; check before planning.',
    season: 'All year when services run; check the current timetable before planning around it',
    details: 'The section between Nanu Oya, near Nuwara Eliya, and Ella climbs over the line’s highest point near Pattipola and runs along hillsides past Haputale with long views. It takes roughly 2.5–3 hours and delays are common. Reserved seats can be booked online with each passenger’s passport number. Stay inside the carriage: people have been badly hurt leaning out of doors.',
  },
  {
    id: 'ella-liptons-seat', destinationId: 'ella', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Lipton’s Seat, Haputale',
    shortDescription: 'Go early to the viewpoint above Dambatenne tea estate where Thomas Lipton is said to have surveyed his plantations, before the mist rolls in.',
    where: 'Near Haputale, roughly an hour by road from Ella',
    details: 'The viewpoint sits high above the Dambatenne tea factory near Haputale, looking over tea estates and, on clear mornings, far across the southern plains. Mist usually arrives by mid-morning, so most people go at dawn. The road climbs through the estate; some walk the last stretch through the tea.',
  },
  {
    id: 'ella-diyaluma-falls', destinationId: 'ella', kind: 'excursion', category: 'nature', source: 'research',
    name: 'Diyaluma Falls',
    shortDescription: 'One of Sri Lanka’s highest waterfalls, about 220 m, near Koslanda. Paths lead to pools near the top; stay well back from the edge.',
    where: 'Near Koslanda, roughly 1.5–2 hours by road from Ella',
    details: 'Diyaluma drops about 220 m off an escarpment near Koslanda. Paths lead up to rock pools near the top, just above the drop, which are popular for swimming in calm conditions, but people have drowned and fallen here. Keep well back from the edge, stay out of the water after rain, and ask locally about conditions. Allow half a day from Ella.',
  },
  {
    id: 'ella-dowa-rock-temple', destinationId: 'ella', kind: 'excursion', category: 'history', source: 'research',
    name: 'Dowa rock temple',
    shortDescription: 'An unfinished Buddha about 11 m tall carved into a rock face beside a painted cave shrine, on the Badulla road north of Bandarawela.',
    where: 'On the Badulla road north of Bandarawela, roughly half an hour from Ella',
    details: 'The standing Buddha was carved into the granite face but never finished; tradition dates it to King Valagamba in the 1st century BC. Beside it, a cave shrine holds paintings and images. It is a working temple: dress modestly and remove shoes. A visit takes under an hour.',
  },
  {
    id: 'ella-tea-factory', destinationId: 'ella', kind: 'activity', category: 'local-life', source: 'research',
    name: 'Tea factory visit near Ella',
    shortDescription: 'See how Uva tea is made at a working factory near Ella, from withering to grading, and taste the result.',
    details: 'Several factories in the Ella area show visitors the process of making black tea: withering the leaf, rolling, fermenting, drying and grading, usually followed by a tasting. Uva teas are known for a bright, brisk flavour. As in the other tea districts, some machines may be idle by day, and photography may not be allowed inside.',
  },
  {
    id: 'ella-pekoe-trail', destinationId: 'ella', kind: 'activity', category: 'adventure', source: 'research',
    name: 'Pekoe Trail stage from Ella',
    shortDescription: 'Walk an easy 9.5 km stage of the Pekoe Trail from Ella to Demodara, through tea and villages, passing near the Nine Arches Bridge.',
    details: 'The Pekoe Trail is a 300 km waymarked route through the hill country. Two stages start or end in Ella: an easy 9.5 km walk to Demodara and a moderate 9.6 km stage from Makulella. The trail organisers publish each stage’s conditions, which change with the weather. Carry water, and start early.',
  },
  {
    id: 'adams-peak-sunrise-climb', destinationId: 'adams-peak', kind: 'activity', category: 'adventure', source: 'design',
    name: 'Overnight sunrise climb',
    shortDescription: 'Climb the sacred summit overnight with pilgrims and hikers to watch the sun rise. The season runs from December to May.',
    where: 'Starts at Dalhousie (Nallathanni), about 32 km from Hatton',
    details: 'The Dalhousie route climbs about 1,000 m on several thousand steps, lit all night during the December–May pilgrimage season. Most people set off between about 1.30 and 2.30 am to reach the summit shrine for sunrise, taking around 3–4 hours up and 2–3 hours down. Bring warm layers and a refillable bottle: small plastic bottles and polythene are banned in the Sri Pada area.',
  },
  // Combines the design text's Bentota river safari with your villa site's Madu River tour
  // (listed under Hikkaduwa until November 2026). No duration until confirmed for Bentota.
  {
    id: 'bentota-river-safari', destinationId: 'bentota', kind: 'activity', category: 'nature', source: 'eranorrissrilanka.com',
    name: 'River safari and mask museum',
    shortDescription: 'A mangrove boat trip on the Bentota River, or on the Madu River at Balapitiya further south, which pairs well with the mask museums of Ambalangoda.',
    where: 'Bentota River at Bentota; Madu Ganga at Balapitiya, about 20 km south; masks at Ambalangoda, about 25 km south',
    details: 'Two different rivers. Bentota River boats wind upstream from the river mouth between mangroves and islets for one to three hours. The Madu Ganga at Balapitiya, about 20 km south, is a Ramsar-listed estuary with an island temple, and Ambalangoda\'s mask museums are a short drive beyond. Birds and water monitors are common, crocodiles occasional. Some boats offer photos holding a captive young crocodile; decline.',
    image: 'madu-river', imageAlt: 'Boat passing through a tunnel of mangroves on the Madu River',
  },
  {
    id: 'bentota-water-sports', destinationId: 'bentota', kind: 'activity', category: 'water', source: 'design',
    name: 'Water sports',
    shortDescription: 'Jet skis, water-skiing, banana boats and windsurfing on the sheltered Bentota River near the mouth. Ask for a briefing and wear a life jacket.',
    details: 'Jet skis, water-skiing, wakeboarding, banana boats and windsurfing run mostly on the sheltered river and lagoon near the mouth, away from the open sea. Operators vary: ask for a safety briefing, wear a life jacket that fits, keep jet skis well clear of swimmers and fishing boats, and don\'t go out after drinking. The sea itself is calmer from about November to April.',
  },
  {
    id: 'bentota-lunuganga', destinationId: 'bentota', kind: 'attraction', category: 'culture', source: 'research',
    name: 'Lunuganga, Geoffrey Bawa\'s garden',
    shortDescription: 'Tour the country garden of the architect Geoffrey Bawa, shaped over decades on a former plantation inland from Bentota.',
    where: 'A short drive inland from Bentota',
    details: 'Bawa bought the former rubber and cinnamon estate in 1948 and spent decades shaping it into terraces, lake views and pavilions. The Geoffrey Bawa Trust shows it only on its own guided tours at set times each day; outside guides are not allowed. Expect steps, steep slopes and uneven paths. Times, booking options and photography rules are on the Trust\'s website.',
  },
  {
    id: 'bentota-brief-garden', destinationId: 'bentota', kind: 'excursion', category: 'culture', source: 'research',
    name: 'Brief Garden (Bevis Bawa\'s garden)',
    shortDescription: 'Wander the sculpture-filled garden of the landscape designer Bevis Bawa, Geoffrey Bawa\'s brother, on a former rubber estate inland from Bentota.',
    where: 'Kalawila, about 10 km inland from Bentota',
    details: 'Bevis Bawa began the garden on a former rubber estate near Kalawila and developed it until his death in 1992. It is looser and more personal than Lunuganga, with sculpture, terraces and shady paths, and has long been open to visitors. Check that it is open before going; most people spend about an hour.',
  },
  {
    id: 'arugam-bay-surfing', destinationId: 'arugam-bay', kind: 'activity', category: 'water', source: 'design',
    name: 'Surfing',
    shortDescription: 'Surf the right-hand point breaks around Arugam Bay, from gentle learner waves to Main Point. The season runs from about April to October.',
    details: 'Right-hand point breaks along this coast, from Pottuvil Point in the north to Okanda in the south, work from about April to October, when the wind blows offshore; July and August are busiest. Main Point suits experienced surfers, while its inside section and the softer breaks south of town are used for lessons. Reef and boulders lie under several breaks, so ask locally about the day’s conditions.',
  },
  {
    id: 'arugam-bay-kumana-safari', destinationId: 'arugam-bay', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Kumana National Park safari',
    shortDescription: 'A jeep safari in Kumana, south of Arugam Bay, known for nesting waterbirds and quieter tracks than Yala. Sightings are never guaranteed.',
    where: 'Kumana National Park, about 40 km south via Panama and Okanda, roughly 1–1.5 hours by road',
    season: 'Birds best from about April to July',
    details: 'Kumana adjoins Yala and is known above all for birds: from about April to July, large numbers nest at the Kumana Villu swamp. Elephants, crocodiles and occasionally leopards are seen. Visitors need a permit and a guide from the park office at Okanda and go in by jeep; most spend half a day or a full day. Parks can close at short notice for drought or heavy rain.',
  },
  {
    id: 'arugam-bay-pottuvil-lagoon-boat-trip', destinationId: 'arugam-bay', kind: 'activity', category: 'nature', source: 'research',
    name: 'Pottuvil Lagoon mangrove boat trip',
    shortDescription: 'A slow boat trip through the mangroves of Pottuvil Lagoon at dawn or dusk, looking for birds, crocodiles and sometimes elephants.',
    where: 'Pottuvil Lagoon, just north of Pottuvil, about 10–15 minutes from Arugam Bay',
    details: 'Boats wind through the mangrove channels of the lagoon at Pottuvil, past herons, kingfishers and monitor lizards; crocodiles are common and elephants sometimes come to the water’s edge. Trips run early or late in the day, when it is cooler and wildlife is more active, and most take a couple of hours. Sightings are never guaranteed.',
  },
  {
    id: 'arugam-bay-kudumbigala', destinationId: 'arugam-bay', kind: 'excursion', category: 'history', source: 'research',
    name: 'Kudumbigala forest hermitage',
    shortDescription: 'An ancient forest hermitage of rock caves, with a steep climb to a stupa on a granite outcrop and views over jungle and coast.',
    where: 'Near Panama, about 25 km south of Arugam Bay, roughly 40 minutes by road',
    details: 'More than 200 rock caves in the forest near Panama were once used by Buddhist monks, and the hermitage is still a place of meditation. Rock-cut steps lead to a small stupa on top of an outcrop with wide views; the climb is steep and exposed, so skip it in rain. Dress modestly and keep quiet. Allow 2–3 hours; it combines well with Okanda or Kumana.',
  },
  {
    id: 'arugam-bay-muhudu-maha-vihara', destinationId: 'arugam-bay', kind: 'attraction', category: 'history', source: 'research',
    name: 'Muhudu Maha Vihara',
    shortDescription: 'Ancient Buddhist ruins among the dunes on Pottuvil beach, linked by legend to Queen Viharamahadevi, with granite statues near the sea.',
    where: 'Pottuvil beach, about 4 km north of Arugam Bay',
    details: 'Granite statues and the remains of an ancient monastery stand among the sand dunes at the edge of the beach at Pottuvil. Legend says Viharamahadevi, mother of King Dutugemunu, came ashore here, one of several places that claim the story. It is still a place of worship: cover shoulders and knees, and remove shoes and hats near the shrines. Most people spend under an hour.',
  },
  {
    id: 'arugam-bay-lahugala-elephants', destinationId: 'arugam-bay', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Elephants at Lahugala',
    shortDescription: 'Look for wild elephant herds grazing around the tanks of Lahugala Kitulana, inland from Pottuvil, especially in the dry months.',
    where: 'Lahugala Kitulana, about 16 km inland on the Monaragala road, roughly 20–30 minutes from Arugam Bay',
    season: 'Most elephants usually from about June to August',
    details: 'Herds come to the grassland around the Lahugala, Kitulana and Sengamuwa tanks, especially in the dry months, and are often seen in the late afternoon. The ruined Magul Maha Vihara monastery lies nearby. Keep well back, stay in the vehicle and never feed elephants. Sightings are never guaranteed.',
  },

  // udawalawe — added from research (sources: docs/research/udawalawe.md).
  {
    id: 'udawalawe-jeep-safari', destinationId: 'udawalawe', kind: 'activity', category: 'wildlife', source: 'research',
    name: 'Udawalawe jeep safari',
    shortDescription: 'Look for wild elephant herds on the open grassland around the Udawalawe reservoir, early or late in the day. Sightings are never guaranteed.',
    season: 'All year; no regular annual closure',
    details: 'Family herds of wild elephants graze and bathe around the reservoir through the year, and the open ground makes them easy to watch; water buffalo, crocodiles, deer and birds of prey are common too. Drives usually last about 3–4 hours, best from opening time or in the late afternoon. Ask the driver to keep a good distance from mothers and calves. Sightings are never guaranteed.',
  },
  {
    id: 'udawalawe-elephant-transit-home', destinationId: 'udawalawe', kind: 'activity', category: 'wildlife', source: 'research',
    name: 'Elephant Transit Home (managed facility)',
    shortDescription: 'Watch orphaned elephant calves come in for milk at a wildlife department rehabilitation centre, from a viewing area. No contact.',
    where: 'Beside the main road, a few kilometres west of the park entrance',
    details: 'A managed facility, not a wild encounter: since 1995 the wildlife department has raised orphaned calves here with limited human contact and released them into protected areas at about five years old. Visitors watch the milk feeds from a viewing area and cannot touch or feed the elephants; between feeds there is little to see. Feeding times vary between sources, so check locally. Allow about an hour.',
  },
  {
    id: 'udawalawe-maduwanwela-walawwa', destinationId: 'udawalawe', kind: 'excursion', category: 'history', source: 'research',
    name: 'Maduwanwela Walawwa manor house',
    shortDescription: 'A rambling chieftain’s manor house begun in the 1700s, with courtyards, old furniture and a courtroom, now a little-visited museum.',
    where: 'Maduwanwela, about 26 km beyond Embilipitiya; roughly an hour or more west of Udawalawe',
    details: 'Built from the 1700s and enlarged until 1905 by the Maduwanwela family of local chieftains, the walawwa once had more than a hundred rooms around 21 courtyards; about 40 survive. The Department of Archaeology runs it as a museum with period furniture and a courthouse. Allow about an hour, and check that it is open before you go.',
  },

  // trincomalee — added from research (sources: docs/research/trincomalee.md).
  {
    id: 'trincomalee-pigeon-island-snorkelling', destinationId: 'trincomalee', kind: 'activity', category: 'water', source: 'research',
    name: 'Snorkelling at Pigeon Island',
    shortDescription: 'Snorkel the coral reef of Pigeon Island National Park, a short boat ride off Nilaveli, where reef sharks and turtles are often seen.',
    where: 'Pigeon Island National Park, about 1 km off Nilaveli beach, about 15 km north of Trincomalee',
    season: 'About April or May to September; boats may stop in the north-east monsoon',
    details: 'Boats from Nilaveli beach cross about 1 km to the larger island, where you snorkel over coral in the shallows. Blacktip reef sharks and turtles are often seen, never guaranteed. Parts of the reef are damaged and some areas are roped off; don’t stand on or touch coral. Most trips take about half a day. The park fee and the boat are paid separately, and boats may not run in rough seas.',
  },
  {
    id: 'trincomalee-whale-watching', destinationId: 'trincomalee', kind: 'activity', category: 'wildlife', source: 'research',
    name: 'Whale and dolphin watching',
    shortDescription: 'Head out from Trincomalee to look for blue whales, sperm whales and spinner dolphins, roughly from March to August. Sightings are never guaranteed.',
    season: 'About March to August, outside Mirissa’s November–April season',
    details: 'Boats leave early in the morning for deep water about 6–8 nautical miles offshore, around half an hour out, where blue whales, sperm whales and spinner dolphins are seen in season. Trips usually last a few hours, depending on the sea and how far out the whales are. Choose an operator that keeps to Sri Lanka’s sea-mammal regulations on approach distances, and bring seasickness remedies if you need them.',
  },
  {
    id: 'trincomalee-scuba-diving', destinationId: 'trincomalee', kind: 'activity', category: 'water', source: 'research',
    name: 'Scuba diving',
    shortDescription: 'Dive the reefs around Pigeon Island and nearby rocks with a dive centre north of town; some centres visit Second World War wrecks.',
    season: 'About April or May to September',
    details: 'Dive centres at Uppuveli and Nilaveli run reef dives, including around Pigeon Island, roughly from April or May to September, when the sea is calmest. Beginners can usually take an introductory dive or a course; some centres take experienced divers to Second World War wrecks. A morning with two dives usually takes about half a day. Choose a centre affiliated with a recognised training agency and check your insurance covers diving.',
  },
  {
    id: 'trincomalee-koneswaram-fort-frederick', destinationId: 'trincomalee', kind: 'attraction', category: 'culture', source: 'research',
    name: 'Koneswaram Temple and Fort Frederick',
    shortDescription: 'Walk through the gate of the old fort to Koneswaram, the clifftop Hindu temple on Swami Rock, high above the sea.',
    details: 'The Portuguese tore down the original temple in 1622 and built the fort with its stones; the Dutch and British held it later, and it is still an army garrison open to visitors, where spotted deer graze. Koneswaram, rebuilt in the 20th century, is one of Sri Lanka’s five ancient Shiva shrines. Remove shoes and cover shoulders and knees. Allow about 1–2 hours; puja times and festivals are busiest.',
  },
  {
    id: 'trincomalee-kanniya-velgam-vehera', destinationId: 'trincomalee', kind: 'excursion', category: 'history', source: 'research',
    name: 'Kanniya hot wells and Velgam Vehera',
    shortDescription: 'Visit the seven warm-water wells at Kanniya and the ruined monastery of Velgam Vehera, restored by the Hindu Chola kings.',
    where: 'Kanniya, about 8 km north-west of Trincomalee town (about 20 minutes by road); Velgam Vehera a few kilometres further',
    details: 'At Kanniya, seven small square wells of warm water lie beside the remains of an early Buddhist monastery; people bathe by pouring water from buckets, so dress modestly rather than in swimwear alone. Velgam Vehera, a little further on, is a ruined monastery with a stupa, a standing Buddha and Tamil inscriptions from its Chola restoration. Most people take 2–3 hours for both.',
  },
  {
    id: 'trincomalee-war-cemetery', destinationId: 'trincomalee', kind: 'attraction', category: 'history', source: 'research',
    name: 'Trincomalee War Cemetery',
    shortDescription: 'Visit the Commonwealth war cemetery on the Nilaveli road, resting place of more than 300 Second World War service personnel.',
    where: 'On the Nilaveli road, between Trincomalee town and Uppuveli',
    details: 'Trincomalee was an important Allied naval base, and Japanese aircraft attacked the harbour in April 1942. The cemetery, cared for by the Commonwealth War Graves Commission, holds more than 300 Second World War graves in a quiet, well-kept garden. It lies beside the road between the town and Uppuveli, and a visit takes about half an hour.',
  },
  {
    id: 'trincomalee-girihandu-seya', destinationId: 'trincomalee', kind: 'excursion', category: 'history', source: 'research',
    name: 'Girihandu Seya, Thiriyaya',
    shortDescription: 'Climb to a ruined circular relic house and stupa on a rocky hill near the sea, linked by tradition to relics of the Buddha.',
    where: 'Thiriyaya, about 45 km north of Trincomalee, roughly an hour by road through Nilaveli',
    details: 'Steps climb a rocky hill to the ruins of a circular relic house (vatadage) around a small stupa, with views over forest to the sea. Tradition says two merchants enshrined relics of the Buddha here, and a long Sanskrit rock inscription of around the 7th–8th century names them. It is quiet and little visited; dress modestly and remove shoes at the shrine. Allow half a day including the drive.',
  },

  // dambulla — added from research (sources: docs/research/dambulla.md).
  {
    id: 'dambulla-cave-temple', destinationId: 'dambulla', kind: 'attraction', category: 'culture', source: 'research',
    name: 'Dambulla cave temple',
    shortDescription: 'Climb to five painted cave shrines filled with Buddha images, a working temple and UNESCO World Heritage Site above Dambulla town.',
    details: 'Stone steps climb the side of a granite outcrop to five cave shrines with more than 150 statues, including a 14 m reclining Buddha, under ceilings painted with scenes from the Buddha\'s life. The caves have been used for worship since the 1st century BC and are still an active temple. Buy the ticket at the foot before you climb, cover shoulders and knees, and allow 1–2 hours.',
  },
  {
    id: 'dambulla-nalanda-gedige', destinationId: 'dambulla', kind: 'excursion', category: 'history', source: 'research',
    name: 'Nalanda Gedige',
    shortDescription: 'A small stone shrine of about the 8th–10th century that blends a South Indian temple plan with Buddhist use, near the road to Kandy.',
    where: 'Nalanda, about 25 km south of Dambulla, just off the Kandy road',
    details: 'This stone image house follows a South Indian Hindu temple plan but was used for Buddhist worship, and its weathered carvings mix both traditions. It was dismantled and rebuilt on higher ground when the Bowatenne reservoir was built. A visit takes about half an hour, so it fits a stop on the drive between Dambulla and Kandy.',
  },
  {
    id: 'dambulla-pophams-arboretum', destinationId: 'dambulla', kind: 'activity', category: 'nature', source: 'research',
    name: 'Popham\'s Arboretum and night loris walk',
    shortDescription: 'Walk quiet trails through a restored patch of dry-zone forest, or join a guided night walk to look for slender lorises.',
    where: 'Kandalama road, a few kilometres east of Dambulla',
    details: 'Sam Popham began restoring this scrubland as dry-zone forest in 1963; it now belongs to the National Institute of Fundamental Studies, which reopened it for visitors in 2023. Marked trails make a quiet hour\'s walk by day. Guided night walks of about 1–1.5 hours look for the grey slender loris and other nocturnal animals by torchlight; sightings are never guaranteed.',
  },

  // anuradhapura — added from research (sources: docs/research/anuradhapura.md).
  {
    id: 'anuradhapura-sri-maha-bodhi', destinationId: 'anuradhapura', kind: 'attraction', category: 'culture', source: 'research',
    name: 'Sri Maha Bodhi and the great stupas',
    shortDescription: 'See the sacred Bodhi tree and the white dome of Ruwanwelisaya at evening worship, among pilgrims dressed in white.',
    season: 'Busiest on full-moon (poya) days, and at Vesak and Poson',
    details: 'The Sri Maha Bodhi grew from a cutting of the tree under which the Buddha is believed to have attained enlightenment, brought here in the 3rd century BC. Nearby, Ruwanwelisaya rises about 100 m above a wall of carved elephants, and Thuparamaya is said to be the island\'s first stupa. Visit early or at evening worship; remove shoes and hats, and cover shoulders and knees.',
  },
  {
    id: 'anuradhapura-sacred-city-cycling', destinationId: 'anuradhapura', kind: 'activity', category: 'history', source: 'research',
    name: 'The sacred city by bicycle',
    shortDescription: 'Cycle the flat roads between Anuradhapura\'s ancient monasteries, from the Abhayagiri ruins to the vast brick stupa of Jetavanaramaya.',
    details: 'The ruins of the Abhayagiri and Jetavana monasteries spread over several kilometres north and east of the centre, linked by flat, shaded roads. A bicycle lets you stop at the Samadhi Buddha, the Kuttam Pokuna twin ponds, the moonstone at Mahasena\'s Palace and Jetavanaramaya. Bicycles can be hired in town; start early, as you walk barefoot at each site.',
  },
  {
    id: 'anuradhapura-mihintale', destinationId: 'anuradhapura', kind: 'excursion', category: 'culture', source: 'research',
    name: 'Mihintale',
    shortDescription: 'Climb the granite stairway to the hilltop where tradition says Buddhism came to Sri Lanka, with stupas and wide views over the plains.',
    where: 'Mihintale, about 12 km east of Anuradhapura (around 20–30 minutes by road)',
    season: 'Busiest at the Poson full moon, usually in June',
    details: 'A stairway of about 1,840 granite steps climbs to the hill where tradition says the monk Mahinda met King Devanampiya Tissa in the 3rd century BC. The way up passes the ruins of a monastery hospital and leads to stupas and the rock of Aradhana Gala. Go early or late in the day, and expect to remove shoes at the shrines. Most people take 2–3 hours.',
  },
  {
    id: 'anuradhapura-aukana-buddha', destinationId: 'anuradhapura', kind: 'excursion', category: 'history', source: 'research',
    name: 'Aukana Buddha',
    shortDescription: 'See the 5th-century standing Buddha, nearly 12 m tall and carved from the living rock, facing the ancient Kala Wewa reservoir.',
    where: 'Aukana, about an hour by road south of Anuradhapura, near Kala Wewa',
    details: 'Carved from a granite rock face in about the 5th century, the standing Buddha at Aukana is nearly 12 m tall and still a place of worship, overlooking the Kala Wewa reservoir. A visit takes about half an hour; remove shoes and hat, and cover shoulders and knees. It is a detour of about an hour from Anuradhapura or Dambulla, often made on the drive between them.',
  },
  {
    id: 'anuradhapura-wilpattu-safari', destinationId: 'anuradhapura', kind: 'excursion', category: 'wildlife', source: 'research',
    name: 'Wilpattu National Park safari',
    shortDescription: 'A half- or full-day jeep safari in Sri Lanka\'s largest national park, around forest lakes, looking for leopards, sloth bears and elephants.',
    where: 'Hunuwilagama gate, roughly 40–50 km west of Anuradhapura (about 1–1.5 hours by road)',
    season: 'Usually best about February to October; heaviest rain about October to January',
    details: 'Wilpattu\'s dry-zone forest is dotted with villus, shallow lakes that fill with rain, where leopards, sloth bears, elephants, deer and water birds come to drink. Drives on sandy tracks start from the main gate at Hunuwilagama; a half day covers the nearer lakes, a full day goes deeper. It is quieter than Yala, but sightings are never guaranteed, and heavy rain can flood the tracks and close the park.',
  },
];

// Source files for the photos (used only by scripts/prepare-images.mjs): paths in the villa
// site's assets/images folder (photos already published on eranorrissrilanka.com), or
// 'tours:<path under ~/villas/tours>' for the owner's tour album. Rights: confirmed.photoRights.
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
  'lion-rock-climb': 'tours:sigiriya/WhatsApp Image 2026-10-14 at 12.35.22 PM.jpeg',
  'nine-arches-bridge': 'tours:galle/WhatsApp Image 2026-10-14 at 12.34.39 PM.jpeg',
  'tea-estate': 'tours:galle/WhatsApp Image 2026-10-14 at 12.34.49 PM.jpeg',
  'stilt-fishing': 'whale-watching-and-galle/webp/stilt_fishing_1.webp',
  'herbal-cloth-weaving': 'around-hikkaduwa/webp/hearbal_cloth_weaving_3.webp',
};

// Available experiences for a destination: featured first, then main attractions, activities and
// nearby excursions, each in the order listed above.
export function experiencesFor(destinationId) {
  const rank = (e) => (e.featured ? -1 : Object.keys(EXP_KINDS).indexOf(e.kind));
  return EXPERIENCES.filter((e) => e.destinationId === destinationId && e.available !== false).sort((a, b) => rank(a) - rank(b));
}
