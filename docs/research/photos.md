# Photo record — galleries and gaps

Internal record for the owner (2026-10-21). Gallery data: `src/data/galleries.mjs`.
Masters: `src/images/gallery/`. Every photo needs confirming under
`site.config.mjs → confirmed.photoRights`.

## How photos were chosen
Each gallery starts with the destination's existing main photo. That photo came from
`~/villas/destinations`, and its rights are unconfirmed (several look like stock images).

Extra slides use only the business's own photos:
- the owner's tour album in `~/villas/tours/`
- photos already published on eranorrissrilanka.com

A photo was used only when its subject and place could be identified from the image
itself. Photos with clearly identifiable people were skipped where possible.

## Photos used — please confirm each (place correct, rights OK, people OK)

| Name | Shows | Source |
|---|---|---|
| sigiriya-lion-paws | Lion's paws at the final staircase | tours/sigiriya |
| sigiriya-water-gardens | Path through the water gardens to the rock | tours/sigiriya |
| sigiriya-summit-ruins | Palace foundations on the summit | tours/sigiriya |
| sigiriya-summit-view | View over the forest from the top | tours/sigiriya |
| galle-clock-tower-bastion | Clock tower and bastion | villa site (galle_fort_tour_3) |
| galle-fort-from-above | Clock tower, ramparts, harbour | villa site (galle_fort_tour_1) |
| galle-ramparts-sea | Rampart walkway by the sea | tours/galle-fort |
| galle-jungle-beach | Jungle Beach (captioned "near Unawatuna"); swimmers in the distance | villa site |
| mirissa-whale-tail | Whale's tail (captioned "sightings never guaranteed") | villa site (whale_watching_1). Was it taken off Mirissa? |
| mirissa-coconut-tree-hill | Palms on Coconut Tree Hill | villa site |
| yala-elephants / buffalo / crocodile / spotted-deer | Wildlife | tours/yala. Confirm they were taken in Yala |
| hikkaduwa-tsunami-museum | Railway carriage at the museum (captioned "near Hikkaduwa") | villa site |
| hikkaduwa-rathgama-lagoon | Lagoon at sunset, with small silhouettes in a boat | villa site (kayak1) |
| hikkaduwa-turtle-hatchery | Turtle in a hatchery tank (captioned as a captive facility) | villa site |
| ella-nine-arches-bridge | Nine Arches Bridge | tours/galle album. Confirm it's Ella |
| nuwara-eliya-tea-estate | Hill-country tea estate (generic caption) | tours/galle album |
| nuwara-eliya-labookellie | Labookellie estate sign (captioned "on the road from Kandy") | tours/galle album |

## Experience card photos added (2026-11-06)
The same rule applies: the business's own photos, subject identifiable from the image.

| Name | Card | Shows | Source |
|---|---|---|---|
| lion-rock-climb | Climbing Lion Rock | Lion's paws at the final staircase | tours/sigiriya (same as the gallery photo) |
| nine-arches-bridge | Nine Arches Bridge | The bridge in the jungle | tours/galle album. Confirm it's Ella |
| tea-estate | Tea estate and factory visit | Hill-country tea estate | tours/galle album |
| stilt-fishing | Stilt fishing (new card) | Stilt fishermen silhouetted at sunset | villa site (stilt_fishing_1). Where was it taken? |
| herbal-cloth-weaving | Herbal cloth weaving (new card) | A weaver at a handloom | villa site (hearbal_cloth_weaving_3) |

Not used: `stilt_fishing_2` (a tourist posing on a stilt), `hearbal_cloth_weaving_1/2` (a shop
with a business's branding, which could suggest a partnership), `traditional_masks_1` (carries a
museum's name), the Yala leopard and sloth-bear photos (no card needs them yet; good
candidates if Yala gets more cards).

## Main destination photos — review (2026-11-06)
The 16 main photos came with the design. Each was checked against its alt text:
- **Corrected:** Polonnaruwa's photo shows the **Vatadage** (circular relic house, guardstones,
  moonstone, seated Buddha), not Gal Vihara as the design's `photoOf` said. The alt text now
  names it.
- **Corrected data:** `photoOf` in `src/data/destinations.mjs` described different pictures for
  several places (e.g. "a leopard" for Yala, "a blue whale" for Mirissa, "sea turtles" for
  Hikkaduwa). It isn't shown anywhere, but now matches the actual photos.
- **Replaced on 2026-11-07** (see below): Hikkaduwa (a generic stock snorkelling image), Bentota
  (a hotel's thatched pavilion), Adam's Peak (watermarked "LK74630200"), Ella and Nuwara Eliya
  (looked AI-generated or heavily processed) and Arugam Bay (low resolution and soft).
- **Can't be identified from the image** (confirm the place, or replace the same way):
  Udawalawe (elephants and a jeep), Mirissa (aerial bay), Trincomalee (headland and beach),
  Yala (rock outcrops at dusk).
- **Accurate but not the main sight:** Dambulla's photo is the modern Golden Temple building
  at the foot of the rock, not the historic caves.

## Considered but not used
These were in `~/villas/tours/galle`, and the subject or place couldn't be confirmed from
the photo:
- a lake view with a large hotel (Kandy? Nuwara Eliya?)
- a Buddha statue labelled "India" in front of a colonial building
- a temple interior with a golden Buddha and tusks
- a waterfall
- beach sunsets
- a harbour boat
- an islet on a sand spit

Also not used:
- Pinnawala elephants bathing: a captive facility, not needed on any page.
- Dambulla shots in `tours/sigiriya`: they repeat the main photo or couldn't be identified.

Tell us what these show and they can be added.

## Gaps — destinations with a single photo
The gallery simply shows one photo; no controls appear.
- **Kandy:** the Temple of the Tooth exterior and moat, Kandy Lake, Peradeniya (orchid
  house, palm avenue, Java fig), a Kandyan dance show (with permission).
- **Dambulla:** the cave interiors (photography rules apply inside), the rock approach.
- **Anuradhapura:** Ruwanwelisaya, Sri Maha Bodhi, Jetavanaramaya, monastery ruins.
- **Polonnaruwa:** Gal Vihara, the Vatadage, Parakrama Samudra, cycling between ruins.
- **Adam's Peak:** the lit path at night, the summit at sunrise, the peak's shadow.
- **Udawalawe:** elephant herds by the reservoir, open grassland.
- **Bentota:** the river, the beach, river-safari mangroves.
- **Trincomalee:** Nilaveli beach, Pigeon Island, Koneswaram temple.
- **Arugam Bay:** the point and surfers, the bay, the lagoon.
- **Ella:** Little Adam's Peak, Ella Rock, the village.
- **Mirissa:** the bay and beach, the harbour boats.
- **Hikkaduwa:** the beach and reef, wild turtles in the shallows (from a respectful distance).
- **Experience guides:** the Temple of the Tooth (uses the Kandy main photo for now).

## Main photos replaced (2026-11-07)
At the owner's request, six main photos were replaced with openly licensed photos from Wikimedia
Commons. Each was chosen from the place's Commons category or a keyword search, checked at full
size (no watermark, sharp, of the named place) and confirmed from the file's own GPS position,
category or description. Masters are generated from the Commons URLs in `PHOTO_SOURCES`; credits
are in `PHOTO_CREDITS` (both in `src/data/destinations.mjs`) and shown under each photo and on
`/photo-credits/`.

| Place | Photo | Photographer | Licence | Place confirmed by |
|---|---|---|---|---|
| Adam's Peak | [Sri Pada 07](https://commons.wikimedia.org/wiki/File:Sri_Pada_07.jpg) — the peak's shadow at sunrise | Bernard Gagnon | CC BY-SA 3.0 | GPS (summit) and description |
| Arugam Bay | [Beach of Arugam Bay](https://commons.wikimedia.org/wiki/File:Beach_of_Arugam_Bay.jpg) | Dennis Sylvester Hurd | CC0 | GPS and category |
| Bentota | [Bentota Estuary](https://commons.wikimedia.org/wiki/File:Bentota_Estuary.jpg) | Miniace | CC BY-SA 4.0 | Category "Bentota", description |
| Ella | [Civilization meets Jungle](https://commons.wikimedia.org/wiki/File:Civilization_meets_Jungle_(44753903400).jpg) — Nine Arches Bridge | Fabian Greiler (asks for a link to derfabian.at, given) | CC BY 2.0 | Category "Nine Arches Bridge, Demodara" |
| Hikkaduwa | [Hikka Beach](https://commons.wikimedia.org/wiki/File:Hikka_Beach.jpg) | Sendaru Perera | CC BY-SA 4.0 | GPS and category |
| Nuwara Eliya | [Tea-plantation Nuwara Eliya-2567](https://commons.wikimedia.org/wiki/File:Tea-plantation_Nuwara_Eliya-2567.jpg) | Bergentroll | CC0 | Description |

Considered and not used: other Adam's Peak photos with a photographer's watermark in the corner
or heavy processing; Bentota beach photos with a sensor-dust spot; a stilt-fishing photo labelled
"Hikkaduwa" (stilt fishing is around Koggala and Ahangama, so the label is doubtful); hotel
photos (they could suggest a partnership); tea photos from Haputale, Hatton or Uva (not Nuwara
Eliya).

