# Content plan

Where the site's travel content stands, what has to happen before it goes live, and what to
write next. Updated 2026-11-07, after the November tourism audit.

## Where things stand

- **16 destination guides** (`src/content/places/`), each researched, audited in November 2026
  and kept as **drafts**: `noindex`, out of the sitemap, and in production showing only the
  design summary, photos, experience cards and planner links. Research records, with sources,
  are in `docs/research/<id>.md`.
- **4 experience guides** (`src/content/experiences/`), also drafts: the Temple of the Sacred
  Tooth Relic, Mirissa whale watching, Horton Plains and World's End, and the Minneriya
  elephant safari.
- **98 experience cards** (`src/data/experiences.mjs`), each labelled as a main attraction,
  an activity or a nearby excursion. All are arranged through partners and the owner has
  confirmed the list (`confirmed.experiences`); cards don't say who provides them.
- **New destinations**: 11 places were evaluated. Five are covered by excursion cards; five
  are recommended as future pages. See `docs/research/new-destinations.md`.
- **Photos**: reviewed against their alt text. Six main photos that were watermarked, low quality
  or not of the place were replaced with credited Wikimedia Commons photos (November 2026).
  See `docs/research/photos.md` and `/photo-credits/`.

## Before anything is published

Run `npm run checklist` and work through `docs/research/owner-checklist.md`. In order of
impact:

1. **Site-wide facts** still open in `site.config.mjs → confirmed`: shuttle fares, the
   destination descriptions, and photo rights for the photos that came with the design and your
   own (the six Commons photos are licensed and credited).
2. **Each guide's `verify:` list.** Many questions ask whether a visit, ticket or activity is
   arranged; the answer for activities is now known (all through partners), so focus on what
   each page should say about it. Answer the questions, correct the text, then add a
   `reviewed:` date and set `status: published`. The build refuses to publish a page with
   open questions.

### Re-check just before publishing (these change)

- **Rail after Cyclone Ditwah.** In early November 2026 only Nanu Oya–Badulla (via Ella) was
  running in the hills; trains to Peradeniya/Gampola were suspended again on 25 October, and
  the bridge into Kandy and Gampola–Nanu Oya were still being rebuilt (official target: end of
  2026). Kandy, Nuwara Eliya, Ella and Adam's Peak quote this status with its date.
- **Adam's Peak season**: 2026–27 runs from Unduvap Poya (23 December 2026) to Vesak Poya
  (19 May 2027, per the gazette); confirm against the official announcement.
- **Park closures and rules**: Yala's annual closure (14 September–15 October in 2026), Kumana
  closures, Horton Plains access rules, possible jeep caps and e-ticketing at Yala.
- **Festival dates**: the Esala Perahera 2027 dates (announced by the temple each year).
- **Places with uncertain access**: Coconut Tree Hill (private land), Brief Garden, Maduwanwela
  Walawwa, Sithulpawwa, Moon Plains, Ritigala (guide-only rumours).

### Suggested publishing order

By likely demand and how closely each place fits the business (based in Hikkaduwa):

1. Hikkaduwa, Galle, Mirissa (home area; whale watching)
2. Kandy, Sigiriya, Ella (the classic route)
3. Yala, Nuwara Eliya, Bentota, Udawalawe
4. Dambulla, Polonnaruwa, Anuradhapura
5. Trincomalee, Arugam Bay, Adam's Peak (seasonal or out of the way)

Experience guides go live with, or after, their destination page: Temple of the Tooth with
Kandy, whale watching with Mirissa, Horton Plains with Nuwara Eliya, Minneriya with Sigiriya.

## What to write next

### Experience guides (one page per distinct search intent)

Write these only where the search intent differs from the destination page; otherwise improve
the destination page instead.

**Recommended**
- **The Kandy–Ella train** — very high search interest. Write it once the line has reopened,
  so it doesn't go out of date immediately.
- **Esala Perahera** — seasonal; publish by May 2027 for the July/August festival.
- **Madu River boat safari** — common query; explain the Ramsar wetland and the island temple,
  and say plainly that visitors can skip the captive-crocodile and fish-pool stops.
- **Stilt fishermen: where, when and what is real** — popular question with poor answers
  online; fits the site's honest approach.
- **Pigeon Island snorkelling** — Trincomalee's main draw, with reef condition and rules.

**Worth considering**
- Mirissa, Weligama, Hiriketiya or Tangalle: where to stay on the south coast (also covers the
  candidate places without new pages).
- Udawalawe or Yala: choosing a park.
- Whale watching from Trincomalee (pairs with the Mirissa guide for May–September travellers).
- Visiting Lunuganga and Brief Garden.
- Kumana from Arugam Bay; Arugam Bay surf breaks by level.

**Not recommended as separate pages** (they would compete with the destination page for the
same searches): a Yala safari guide, a Sigiriya climbing guide, a Galle Fort walking guide,
Hikkaduwa snorkelling and turtles, the Dambulla caves. Keep improving those destination pages
instead.

### New destinations

In order: Negombo (first/last night near the airport), Sinharaja, Tangalle, Colombo, Jaffna;
Kalpitiya later if at all. Each needs the owner to confirm coverage and a licensed photo first.
Details, sights and researched cards: `docs/research/new-destinations.md`.

### Photos

Every destination has at least one photo, but nine have only one. Own photos taken on tours
(with consent from anyone identifiable), or more credited Commons photos, would improve most
pages; the gaps are listed in `docs/research/photos.md`. The main photos of Mirissa,
Trincomalee, Udawalawe and Yala can't be identified from the image alone, so confirm them or
replace them the same way.

## Ground rules (unchanged)

- **Only write what you can stand behind.** Link to official pages for hours and prices rather
  than quoting them. Qualify seasons and journey times.
- **Never imply a service that isn't confirmed** — guides, tickets, meals, boats, jeeps,
  pickups, partnerships.
- **Wildlife is never guaranteed**; captive or managed facilities are labelled as such, and
  captive-animal interactions are not listed.
- **One page per search intent.** A destination page answers "should I include X, and how does
  it fit my trip?"; an experience guide answers one activity in depth; a tour page
  (`/private-tours/<slug>/`) exists only for a product you actually sell.

The writing standard and publishing rules are in `docs/content-guide.md`.
