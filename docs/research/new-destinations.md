# New destinations — evaluation and recommendations

Internal research record (2026-11-06). The brief asked whether these 11 places deserve their own
destination pages. Each was researched for what is there, real tourist demand, geography and
journey times, how it fits routes, and seasons. Eranorris's actual coverage of these places is
unknown, so every recommendation depends on the owner confirming the business goes there.

## Recommendation in short

| Place | Recommendation | Priority | Done in this pass |
|---|---|---|---|
| Negombo | Own page, as a first or last night near the airport | Medium–high | — |
| Sinharaja | Own page: UNESCO rainforest between the south coast and Udawalawe/Ella | Medium | Mentioned in the Udawalawe guide |
| Tangalle | Own page, if routes follow the coast from Mirissa to Yala | Medium | Mentioned in the Mirissa guide |
| Colombo | Own page, as a half-day to one-night city stop | Medium | — |
| Jaffna | Own page, for travellers who want the north | Medium (low foreign demand) | — |
| Kalpitiya | Not now: niche (kitesurfing, dolphins), too far for an excursion | Low | — |
| Wilpattu | Not a page: an excursion from Anuradhapura | — | Card `anuradhapura-wilpattu-safari` |
| Haputale | Not a page: an excursion from Ella | — | Card `ella-liptons-seat` |
| Weligama | Not a page: covered from Mirissa | — | Card `mirissa-weligama-surf-lesson` |
| Ahangama | Not a page: its sights are Galle excursions | — | Stilt fishing, Koggala Lake, Martin Wickramasinghe museum, Handunugoda cards |
| Hiriketiya | Not a page: covered from Mirissa | — | Card `mirissa-hummanaya-blowhole`; guide mention |

Why this order: Negombo answers a practical question almost every traveller has (where to sleep
before or after the flight) and the business already serves it for airport transfers.
Sinharaja and Tangalle sit on south-coast routes, closest to the business's home area.
Colombo is visited by many but rarely for long. Jaffna is distinctive but a long way from every
other destination.

## What a new destination needs before it can be added

1. **The owner confirms the business covers it**, and the suggested nights.
2. **A licensed main photo** that clearly shows the place (the map marker, cards and page all
   use it). None of the candidates has one yet.
3. **A `DESTS` entry** in `src/data/destinations.mjs`: coordinates, category, the short
   description and highlight shown on the map, and suggested nights.
4. **A guide** in `src/content/places/<id>.md`, written to `docs/content-guide.md`, with a
   research record, and experience cards in `src/data/experiences.mjs`.
5. **Colombo and Negombo only:** the ids `colombo` and `negombo` are already pickup points for
   airport transfers, and the planner keeps pickups and destinations in one list for the
   airport shuttle. Give the destinations different ids (e.g. `colombo-city`, `negombo-beach`)
   or de-duplicate that list first, without renaming the pickup ids (they are saved in
   visitors' trips).

## Negombo

**Research summary.** Negombo is a fishing town and beach strip at the mouth of the Negombo Lagoon, about 10 km from Bandaranaike International Airport. That is why many travellers spend their first or last night here. The town has a strong Catholic heritage, with large churches that have earned it the nickname 'Little Rome'. Outrigger canoes and a big fishing fleet still work the shore and lagoon, and the fish market at Lellama, near the old Dutch fort gate, is busiest early in the morning. Boat trips go out on the lagoon and the Hamilton (Dutch) Canal, which was cut in 1802 under the British. South of the lagoon, the Muthurajawela marsh has been a wetland sanctuary since 1996, with guided boat trips. The beach is wide but the sea is open: it is calmer from about November to April and rough in the south-west monsoon. It is pleasant rather than a highlight. The page should be honest that Negombo is a convenient bookend, not a reason to visit Sri Lanka.

**Main sights:**
- Fish market at Lellama by the lagoon mouth: auctions and the returning boats, early morning. Fish is also dried on the beach nearby
- Negombo Lagoon: boat trips past fishing huts and mangroves; outrigger canoes (oruva)
- Hamilton (Dutch) Canal: cut in 1802 by Gavin Hamilton, a British revenue agent, east of the earlier Dutch canals (Sri Lanka Tourism 60). It is used for boat rides
- Dutch fort gateway (inscribed 1678; the site is now a prison, so only the gate is seen) and the old town
- St Mary's Church (built about 1874–1922, painted ceiling) and the town's many churches
- Angurukaramulla Temple: a Buddhist temple with about 300-year-old woodwork and moonstones (Sri Lanka Tourism 66)
- Muthurajawela Marsh: 3,068 ha of coastal wetland at the south end of the lagoon. Its northern 1,777 ha were declared a sanctuary in 1996. Guided boat trips run from the visitor centre, about 30 minutes from Negombo
- Beach and seafood restaurants along the hotel strip (Lewis Place and Porutota Road)

**Routes:** Airport (CMB, Katunayake): about 10–12 km to the beach hotels, usually 20–30 minutes, more at peak. Colombo: about 37 km, about 1–1.5 hours with traffic (Rome2Rio's 31 minutes is free-flow). Bentota: about 2–2.5 hours via the Katunayake Expressway, the Outer Circular and the Southern Expressway. Galle: about 154 km, about 2.5–3 hours by the same expressways (Rome2Rio 1 h 57 min, optimistic). Hikkaduwa: about 2.5–3 hours. Kandy: about 100–115 km, about 3–3.5 hours via the A1 or via the Mirigama–Kurunegala expressway section. Sigiriya: about 146–155 km, about 3.5–4 hours via Kurunegala and Dambulla (Rome2Rio 2 h 26 min, optimistic). Route fit: the first night after a late arrival, then north to the Cultural Triangle or south down the coast; the last night before an early flight.
**Season:** Any time as an airport stop. The sea and beach are best from about November to April. The south-west monsoon (about May–September) brings rough seas and rain, and October–November has inter-monsoon showers. The fish market works all year; go early. Muthurajawela birding is best early in the morning.

Experience cards researched for a future page (full text and sources in `audit-2026-11/south-east.json`):
- Negombo fish market at dawn (attraction): Watch the catch come in and the auctions at Negombo’s busy fish market by the lagoon mouth, early in the morning.
- Lagoon and Hamilton Canal boat trip (activity): A boat trip on Negombo Lagoon and the old Hamilton Canal, past mangroves, fishing huts and waterbirds.
- Muthurajawela wetland boat trip (excursion): A guided boat trip through Muthurajawela, a protected coastal marsh at the south end of Negombo Lagoon, for birds and mangroves.
- Old town, Dutch gate and churches (attraction): Explore Negombo’s colonial past and Catholic heritage: the Dutch fort gate, St Mary’s Church and old temples.

Sources: Sri Lanka Tourism — Negombo | https://www.srilanka.travel/attraction?attraction_id=50 ; Sri Lanka Tourism — Negombo Beach | https://www.srilanka.travel/attraction?attraction_id=193 ; Sri Lanka Tourism — Hamilton Canal | https://www.srilanka.travel/attraction?attraction_id=60 ; Sri Lanka Tourism — Angurukaramulla Temple | https://www.srilanka.travel/attraction?attraction_id=66 ; Lonely Planet — Main Fish Market, Negombo | https://www.lonelyplanet.com/sri-lanka/negombo/attractions/main-fish-market/a/poi-sig/1194879/357497 ; Wikipedia — Muthurajawela wetlands | https://en.wikipedia.org/wiki/Muthurajawela_wetlands ; Rome2Rio — Negombo routes | https://www.rome2rio.com/s/Negombo/Galle ; Experience Travel Group — Colombo, Negombo and around | https://archive.experiencetravelgroup.com/sri_lanka/info/colombo-around

## Sinharaja

**Research summary.** Sinharaja is the country's largest remaining tract of lowland wet-zone rainforest. It spans Ratnapura, Galle and Kalutara districts in the Sabaragamuwa and Southern provinces. It was declared a UNESCO biosphere reserve in 1978 and a World Heritage Site in 1988 (natural criteria ix and x). UNESCO gives the inscribed area as 8,864 ha. The Forest Department manages it. Visitors go on foot only, with a guide; nearly all sources say a guide is required, and entrance tickets include or require one. The draw is endemism: at least 139 endemic plants (UNESCO); most of Sri Lanka's endemic birds have been recorded here (Sri Lanka Tourism says 19 of the 20 species on the older list); and more than half of the mammals and butterflies are endemic. Mixed-species feeding flocks are the birding highlight. Other likely sightings are purple-faced langurs, giant squirrels, green pit vipers and hump-nosed lizards. It rains all year and there are leeches in every month. There are four access roads (Sri Lanka Tourism): Kalawana–Weddagala to Kudawa (north-west; the main entrance and the easiest from Colombo), Rakwana–Morningside (north-east), Hiniduma–Neluwa to Lankagama (south-west) and Deniyaya–Pallegama/Pitadeniya (south-east). The northern and southern entrances are far apart by road, so a visit is planned around one side.

**Main sights:**
- Kudawa entrance and conservation centre (north-west, via Kalawana and Weddagala). This is the main and best-documented entrance. Half-day guided walks follow the forest trail to the Moulawella (Mulawella) viewpoint, and keen hikers do a long full-day trek to the Sinhagala peak. Sources disagree on trail lengths and times
- Pitadeniya entrance near Kotapola and Deniyaya (south-east), with forest trails along the Gin Ganga and to waterfalls such as Pathan Oya Ella. Travel guides warn of touts at this gate, so use the official ticket office
- Lankagama entrance near Neluwa (south-west, Galle District). It is newer and busy, but the Daily Mirror (July 2025) reported no first-aid team, no warning signs at the waterfalls and no maps there
- Morningside (north-east, via Rakwana). Higher and less visited, and more remote
- Birding: mixed-species feeding flocks and endemics such as the Sri Lanka blue magpie, red-faced malkoha, green-billed coucal, Sri Lanka junglefowl and spurfowl, best early in the morning. No sighting is guaranteed
- Deniyaya and Morawaka tea country on the southern edge, with small estates and the rainforest lodges where most visitors stay
- Kalawana, the main town on the northern approach. Since 24 May 2026 its bus stand has had an information display about the reserve (Daily Mirror, June 2026)

**Routes:** All times are estimates; roads on the reserve's edge are narrow and winding. Galle to Deniyaya, for Pitadeniya: about 86 km, about 2–2.5 hours (Daytrip gives 2 h 10 min). Mirissa: about 2–2.5 hours via Matara and Akuressa (Rome2Rio gives Matara–Deniyaya as 66 km). Hikkaduwa: about 2.5–3 hours to Deniyaya; the Lankagama/Neluwa side via Hiniduma may be a little shorter, unverified. Udawalawe to Deniyaya: about 2–2.5 hours via Embilipitiya; sources conflict on distance (46 km on Rome2Rio, 86 km on distancesfrom). Ella to Deniyaya: about 142 km, about 3.5–4 hours (Rome2Rio's 2 h 37 min looks optimistic). Colombo to Kudawa: about 120–135 km, about 3–4 hours via Ratnapura or Matugama and Kalawana (Lakpura). From the airport, allow about 4–5 hours. Route fit: a natural night between the south coast (Galle or Mirissa) and Udawalawe/Ella, or between Colombo and Udawalawe on the northern side. Cyclone Ditwah: no Sinharaja-specific closure or road damage was found. The road authority (RDA) said in 2026 that some road repairs could take up to two years, so check the access roads before publishing. Some sources say a 4WD is safer on the last steep stretch to Kudawa after rain.
**Season:** Open all year, but it rains in every month (about 3,000–6,000 mm a year). Sri Lanka Tourism gives the best times as about January–April and August–September; other sources say January–March is driest. Rain is heaviest roughly May–June and October–November. Leeches are present all year and worst after rain, so wear leech socks, long trousers and closed shoes. Entrances can close for public holidays: Kudawa was closed 10–15 April 2026 for the Sinhala and Tamil New Year.

Experience cards researched for a future page (full text and sources in `audit-2026-11/south-east.json`):
- Guided rainforest walk in Sinharaja (activity): Walk forest trails with a guide in Sri Lanka’s last large lowland rainforest, a UNESCO World Heritage Site. Entry is on foot only.
- Birdwatching for endemic species (activity): An early-morning walk for Sinharaja’s endemic birds and mixed feeding flocks. Sightings are never guaranteed.
- Sinhagala full-day trek (activity): A long, guided full-day hike from Kudawa through the forest to the Sinhagala peak, for fit walkers only.
- Sinharaja rainforest day trip (excursion): A long day trip inland to Sinharaja, a UNESCO-listed rainforest, for a guided walk. Expect about 2–2.5 hours’ drive each way.

Sources: Sri Lanka Tourism — Sinharaja | https://www.srilanka.travel/attraction?attraction_id=151 ; UNESCO World Heritage — Sinharaja Forest Reserve | https://whc.unesco.org/en/list/405 ; Forest Department (Department of Forest Conservation) | https://www.forestdept.gov.lk/ ; Ada Derana — Kudawa entrance closed for six days (April 2026) | https://www.adaderana.lk/news.php?nid=120972 ; Newswire — Kudawa entrance closed for New Year holidays (9 April 2026) | https://www.newswire.lk/2026/04/09/sinharaja-forest-kudawa-entrance-closed-for-new-year-holidays/ ; Daily Mirror — Lankagama entrance lacks facilities (31 July 2025) | https://www.dailymirror.lk/news-features/Tourists-travelling-to-Sinharaja-via-Lankagama-complain-of-lack-of-facilities/131-315591 ; Daily Mirror — Kalawana bus stop serves as info centre (13 June 2026) | https://www.dailymirror.lk/news-features/Kalawana-bus-stop-serves-as-info-centre-for-Sinharaja-Reserve/131-342812 ; Wikipedia — Sinharaja Forest Reserve | https://en.wikipedia.org/wiki/Sinharaja_Forest_Reserve

## Tangalle

**Research summary.** A town on one of the island's largest bays (Hambantota District, about 195 km from Colombo and 35 km east of Matara), with quieter beaches than the south-west coast and a different set of sights: Rekawa, which the Department of Wildlife Conservation lists as a turtle-watching site where wild turtles nest at night; the Mulkirigala rock temple; the Hummanaya blowhole; and Kalametiya's lagoons. Sri Lanka Tourism names 'Tangalla' among the best southern beaches. It sits on the coast route from Mirissa to Yala, so it works as a one- or two-night stop.

**Main sights:**
- Tangalle bay and beaches; Parewella natural swimming area
- Rekawa turtle watching (DWC-listed): five species nest on the beach at night; wild, never guaranteed
- Mulkirigala Raja Maha Vihara: cave temples on a 205 m rock, Kandyan-era paintings, about 20 km north
- Hummanaya blowhole, Kudawella, about 12 km
- Kalametiya bird sanctuary (lagoons and mangroves), about 24 km east
- Dutch fort (now a prison), rest house and court house in town
- Hiriketiya and Wewurukannala (Dikwella) to the west

**Routes:** About 45 km/1–1.25 hours east of Mirissa; about 75–80 km/1.5–2 hours to Tissamaharama for Yala (estimate); Udawalawe roughly 1.5–2 hours via Embilipitiya (estimate); airport about 3–3.5 hours via the Southern Expressway (estimate). Natural stop between Mirissa and Yala.
**Season:** Calmest seas about November to April. Rekawa nesting occurs through much of the year; peak months not confirmed.

Experience cards researched for a future page (full text and sources in `audit-2026-11/south-west-coast.json`):
- Night turtle watching at Rekawa (excursion): Wait on Rekawa beach at night for wild sea turtles coming ashore to nest. Watch quietly, without flash; sightings are never guaranteed.
- Mulkirigala rock temple (excursion): Climb past cave shrines with Kandyan-era paintings and reclining Buddhas to the top of a 205 m rock north of Tangalle.

Sources: https://en.wikipedia.org/wiki/Tangalle ; https://www.dwc.gov.lk/?page_id=817 ; https://www.srilanka.travel/pristine-beach-holidays ; https://en.wikipedia.org/wiki/Mulkirigala_Raja_Maha_Vihara ; https://en.wikipedia.org/wiki/Hummanaya

## Colombo

**Research summary.** Colombo is the commercial capital and main port, and most travellers pass through it at the start or end of a trip. Many itineraries skip it or give it half a day, but Sri Lanka Tourism lists more than a dozen city attractions, and Lonely Planet has a full Colombo destination guide. The draws are a compact mix: Buddhist, Hindu, Muslim and Christian places of worship close together (Gangaramaya and the Bawa-designed Seema Malaka on Beira Lake, the Jami Ul-Alfar 'Red Mosque', the Sea Street kovils and the Dutch Wolvendaal Church); colonial Fort with the restored Dutch Hospital; the crowded Pettah bazaars; the National Museum (founded 1877, with the Kandyan throne and regalia); evenings and street food on Galle Face Green; and Geoffrey Bawa's house, Number 11, which can be seen on guided tours. Kelaniya Raja Maha Vihara, about 10 km north-east, is one of the island's most important temples and holds the Duruthu Perahera each January. City traffic is heavy, so a page should set realistic expectations (half a day to one night) and qualify every time.

**Main sights:**
- Gangaramaya Temple and the Seema Malaka on Beira Lake. Seema Malaka is a lake pavilion designed by Geoffrey Bawa (Sri Lanka Tourism attractions 172 and 204)
- Galle Face Green: a seafront promenade laid out in 1859, busy at sunset with kites and street-food stalls (Sri Lanka Tourism 210)
- Fort: the Dutch Hospital, now restaurants and shops (Sri Lanka Tourism 200), the old clock-tower lighthouse (208) and colonial buildings
- Pettah: wholesale markets and spice shops (Sri Lanka Tourism 212), the Jami Ul-Alfar (Red) Mosque, and Wolvendaal Church, a Dutch church paved with tombstones (Sri Lanka Tourism 205)
- National Museum of Colombo (founded 1877; Kandyan throne and crown). Check opening days on the Department of National Museums site
- Independence Memorial Hall and the Arcade Independence Square; Viharamahadevi Park (Sri Lanka Tourism 202, 217, 216)
- Number 11, Geoffrey Bawa's townhouse. Seen only on 45-minute guided tours, which the Geoffrey Bawa Trust recommends booking
- Kelaniya Raja Maha Vihara, about 10 km north-east: Solias Mendis murals and the Duruthu Perahera in January (Sri Lanka Tourism 182)
- Lotus Tower observation deck, for city views (details not verified in this pass)
- Food: Pettah snacks, isso vadai and kottu on Galle Face, hoppers, crab restaurants (the Dutch Hospital has several)

**Routes:** Rome2Rio figures are free-flow and optimistic; the ranges below allow for traffic. Airport (CMB, Katunayake): about 35 km, usually about 45 minutes to 1.25 hours by the Katunayake Expressway, longer at peak. Negombo: about 37 km, about 1–1.5 hours. Bentota: about 65 km, about 1–1.5 hours by the Southern Expressway, or 2 hours or more on the coast road. Hikkaduwa: about 1.5–2 hours by expressway. Galle: about 120 km, about 1.5–2.5 hours by the Southern Expressway. Kandy: about 115 km, usually 3–4 hours by road; the Kadawatha–Mirigama section of the Central Expressway is not due until about 2028. Sigiriya: about 170 km, about 4–5 hours. Trains run to Galle and towards Kandy from Colombo Fort; check Sri Lanka Railways, as post-Ditwah repairs were still affecting the line into Kandy in late 2026. Route fit: a first afternoon or last day before a flight, a stop on the way south to Bentota and Galle, or a full day for cruise passengers.
**Season:** A city stop at any time of year. It is wettest during the south-west monsoon (about May–June) and the inter-monsoon rains (about October–November), and usually driest about January–March. Festivals: the Duruthu Perahera at Kelaniya in January, and Vesak in May, when lanterns and pandals decorate the city.

Experience cards researched for a future page (full text and sources in `audit-2026-11/south-east.json`):
- Gangaramaya Temple and Seema Malaka (attraction): A busy Buddhist temple packed with treasures, and Geoffrey Bawa’s calm pavilion on the water of Beira Lake nearby.
- Fort and Pettah walk (activity): Walk from colonial Fort into the crowded Pettah bazaars, past the Dutch Hospital, the Red Mosque and the Dutch Wolvendaal Church.
- Sunset on Galle Face Green (attraction): Join Colombo families on the seafront promenade at sunset, with kites, street food and the Indian Ocean.
- National Museum of Colombo (attraction): Sri Lanka’s largest museum, founded in 1877, with the throne and regalia of the last Kandyan kings.
- Number 11, Geoffrey Bawa’s house (attraction): A guided tour of the Colombo townhouse of Geoffrey Bawa, Sri Lanka’s best-known architect. Visits are by tour only.
- Kelaniya Raja Maha Vihara (excursion): One of Sri Lanka’s most revered Buddhist temples, by the Kelani River just outside Colombo, known for its murals.

Sources: Sri Lanka Tourism — Galle Face Green | https://www.srilanka.travel/attraction?attraction_id=210 ; Sri Lanka Tourism — Beira Lake | https://www.srilanka.travel/attraction?attraction_id=172 ; Sri Lanka Tourism — Seema Malakaya | https://www.srilanka.travel/attraction?attraction_id=204 ; Sri Lanka Tourism — Dutch Hospital | https://www.srilanka.travel/attraction?attraction_id=200 ; Sri Lanka Tourism — Pettah Market | https://www.srilanka.travel/attraction?attraction_id=212 ; Sri Lanka Tourism — Wolvendaal Church | https://www.srilanka.travel/attraction?attraction_id=205 ; Sri Lanka Tourism — Kelaniya Raja Maha Viharaya | https://www.srilanka.travel/attraction?attraction_id=182 ; Department of National Museums | https://museum.gov.lk/

## Jaffna

**Research summary.** Cultural capital of the Tamil north: Hindu kovils (Nallur Kandaswamy and its 25-day festival, usually late July–September), the Portuguese/Dutch fort, the rebuilt public library, Keerimalai springs, Point Pedro, Casuarina Beach and ferry-reached islands (Nainativu, Delft). Jaffna Fort had 249,913 visitors in 2025 but only 14,532 foreign (Sigiriya: 582,687 foreign); Jaffna district has 757 registered rooms, and SLTDA calls the north a 'Northern Gap'.

**Main sights:**
- Nallur Kandaswamy Kovil and festival
- Jaffna Fort
- Jaffna Public Library (burned 1981, rebuilt)
- Keerimalai springs and Naguleswaram
- Point Pedro / Sakkotai Cape
- Casuarina Beach
- Nainativu (Nagadeepa and Nagapooshani Amman) by ferry
- Delft island (national park since 2015) by ferry
- Kadurugoda, Nilavarai well, Fort Hammenhiel
- Elephant Pass
- Jaffna cuisine (not yet sourced)

**Routes:** By road: Anuradhapura about 197 km (usually 4–5 h with a stop, estimate); Trincomalee about 230 km (4.5–5.5 h); Sigiriya about 254 km (5–6 h); airport about 360 km (7–8 h). Rail: Northern Line fully reopened 9 April 2026; from 10 July 2026 the Colombo–KKS intercity runs Friday–Monday only, the Night Mail and Yal Devi continue, with frequencies changed several times during 2026 (re-check). Flights: Chennai and Tiruchirappalli–Jaffna (IndiGo). KKS–Nagapattinam ferry seasonal (usually paused about November–February; November 2026 status unverified).
**Season:** Dry zone; most rain about October–December (November usually wettest); drier January–September, hottest about April–August. Nallur festival usually late July–September, dates set by the temple.

Sources: https://www.srilanka.travel/diversity/northern-sri-lanka ; https://www.sltda.gov.lk/storage/common_media/Year_in_Review_2025_Final_updated_Report_2026_04_02.pdf ; https://www.adaderana.lk/news.php?nid=120944 ; https://www.dailymirror.lk/print/breaking-news/Power-set-shortage-cuts-KKS-intercity-to-four-days/108-344920 ; https://np.gov.lk/?p=33561 ; https://en.wikipedia.org/wiki/Jaffna_Fort ; https://en.wikipedia.org/wiki/Delft_National_Park ; https://www.lonelyplanet.com/sri-lanka/jaffna-and-the-north/jaffna

## Kalpitiya

**Research summary.** A peninsula between the Puttalam lagoon and the sea: spinner-dolphin trips and sperm whales offshore (about November–April), the Bar Reef marine sanctuary, and Sri Lanka's main kitesurfing lagoon (main wind season about May–September). Niche demand: the Bar Reef sold tickets to 3,732 foreign visitors in 2025 (dolphin trips may not all be counted); SLTDA calls it 'a niche but growing market'.

**Main sights:**
- Dolphin and whale watching (DWC 2012 sea-mammal regulations apply)
- Bar Reef Marine Sanctuary (declared 1992)
- Kitesurfing on the Kalpitiya lagoon and at Kappalady
- Mangroves, islands, salt pans of the Puttalam lagoon
- Dutch fort (Navy-occupied, restricted) and Dutch church
- St Anne's Church, Talawila

**Routes:** About 130–140 km from the airport (usually 2.5–3.5 h, estimate), 2.5–3 h from Negombo, about 120 km and 2.5–3 h from Anuradhapura; Wilpattu's Eluwankulama gate about 1.5–2 h.
**Season:** Dolphins/whales about November–April; kite season about May–September/early October, with a lighter season about December–February; calmest sea about December–April.

Sources: https://www.srilanka.travel/diversity/northern-sri-lanka ; https://www.sltda.gov.lk/storage/common_media/Year_in_Review_2025_Final_updated_Report_2026_04_02.pdf ; https://www.dwc.gov.lk/?page_id=817 ; https://en.wikipedia.org/wiki/Bar_Reef ; https://www.sundaytimes.lk/141102/news/new-safety-rules-as-whale-dolphin-watching-season-begins-in-kalpitiya-125836.html ; https://www.sltda.gov.lk/storage/common_media/9%20FINAL%20DRAFT%20CRITERIA%20FOR%20WHALE%20WATCHING%20FINAL%202026.6.12.cleaned.pdf

## Covered as excursions instead

- **Wilpattu.** Better as an excursion/experience under Anuradhapura (proposed: anuradhapura-wilpattu-safari). A destination page only if the business later sells lodge stays or a western route (airport–Kalpitiya–Wilpattu–Anuradhapura).
- **Haputale.** Not its own page for now: cover it from Ella (Lipton’s Seat card, guide day trips). Reconsider if routes regularly stay there.
- **Weligama.** Not a separate destination page. Cover it from Mirissa: the surf-lesson card (mirissa-weligama-surf-lesson) and the 'Along the coast' bullet.
- **Ahangama.** Not needed as a destination. Its sights are already proposed as Galle excursions (stilt fishing, Handunugoda tea estate, Koggala Lake, Martin Wickramasinghe museum).
- **Hiriketiya.** Not a separate page now. Mentioned in the Mirissa guide; reconsider only if the owner serves surf travellers there.
