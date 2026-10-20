# Destination content plan

The site already has a page for every destination at `/places/<id>/`. Until a page has real
content it stays a **draft**: `noindex`, left out of the sitemap, and showing only the
design's one-paragraph summary. This plan covers the first five pages to write, in priority
order, and exactly what is needed to publish each one.

## How to publish a page

1. Open the draft file listed for the destination (scaffolds already exist in
   `src/content/places/`). Replace every `[TODO …]` prompt with your own words.
2. Preview: `npm run build:staging && npm run serve`, then open `/places/<id>/`. Draft text
   shows in staging and development previews only, never in production.
3. Set `status: published` and run `npm test`. The build refuses to publish a page with fewer
   than 200 words of visible content or with any `[TODO]`/`TBD` left, and says why.
4. Deploy. The page becomes indexable and joins the sitemap with its own canonical URL. Then
   ask Google Search Console to index the URL.

Aim for 400–800 words written from first-hand experience. Use your own photos where you
can; for people who can be identified in them, get their permission first.

## Ground rules

- **Only write what you know.** Leave out opening hours, ticket prices and similar figures
  unless you will keep them up to date. Point to the official source instead.
- **No invented claims.** Don't add guide qualifications, reviews or "best" claims you
  can't back up.
- **One page per search intent.**
  - A destination page answers "should I include X, and how does it fit my trip?".
  - A tour page (`/private-tours/<slug>/`) exists only for a product you actually sell:
    a specific day tour with a duration and inclusions.
  - Don't write both pages for the same intent. Link the destination page to the tour
    instead (that link is automatic once the tour is published).
- **Drive times on the site are rough estimates.** They come from a formula that ignores
  expressways. Give real figures in `ROUTE_TIMES` in `src/data/destinations.mjs` (e.g.
  airport→Galle) and quote real times in your text.
- **Each page automatically links to its three nearest places.** Mention the ones you
  actually combine on trips, in the text.

## 1. Sigiriya — `src/content/places/sigiriya.md`

- **Search intent:** travellers planning the Cultural Triangle who want a private driver or
  tour. Typical searches: "Sigiriya private tour", "Sigiriya day trip from Kandy/Colombo",
  "how to visit Sigiriya".
- **Help them decide:**
  - day trip or overnight stay
  - how demanding the climb is, and the best time of day
  - how it fits with the nearby sites
- **Sections:**
  - visiting Sigiriya with you: what the day looks like
  - how long to spend (the design suggests 2 nights; confirm)
  - the climb: what to expect
  - combining it with other places
  - practical tips
  - FAQs from real guests
- **Internal links:**
  - Dambulla (`/places/dambulla/`, about 30 min, estimated)
  - Polonnaruwa (about 1h)
  - Anuradhapura (about 2h)
  - Kandy (about 2h 40m)
  - a Sigiriya tour page, if you sell one
- **Business information needed:**
  - Do you offer a dedicated Sigiriya day tour, or only include it in custom routes?
  - Pickup areas and typical start time.
  - What is included: driver only, or a guide at the site? Entrance tickets?
  - Your advice on the climb, from experience.
  - Own photos: `~/villas/tours/sigiriya` (check consent).

## 2. Galle — `src/content/places/galle.md`

- **Search intent:** "Galle Fort tour", "Galle private tour", "Galle day trip from
  Colombo/Hikkaduwa". You are based nearby, so this page can show real local knowledge.
- **Help them decide:** half day, full day or an overnight stay inside the fort, and how
  Galle fits with the south-coast beaches.
- **Sections:**
  - exploring Galle Fort with you: route, what you show guests
  - how long to spend
  - best time of day (from experience)
  - combining with Hikkaduwa and Mirissa
  - getting there from the airport (link to the airport-transfer planner on the homepage)
  - practical tips and FAQs
- **Internal links:**
  - Hikkaduwa (about 40 min, estimated)
  - Mirissa (about 1h)
  - Bentota (about 1h 40m)
  - a Galle tour page, if you sell one
- **Business information needed:**
  - What a Galle visit with you includes, its duration and pickup areas.
  - Walking, tuk-tuk or car inside the fort.
  - Own photos: `~/villas/tours/galle`, `~/villas/tours/galle-fort` (check consent).

## 3. Hikkaduwa — `src/content/places/hikkaduwa.md`

- **Search intent:** "Hikkaduwa tours", "things to do in Hikkaduwa", "Hikkaduwa private
  driver", "airport to Hikkaduwa transfer". This is your home area and likely your
  strongest page.
- **Help them decide:** what they can do with you from Hikkaduwa, how to see the turtles
  and reef responsibly, and day trips along the coast.
- **Sections:**
  - tours and experiences from Hikkaduwa: only the ones you run (your villa site lists a
    cinnamon experience, lagoon kayaking and a Yala safari; confirm which you offer here)
  - turtles and the reef: how you recommend seeing them
  - coast seasons, from experience
  - day trips
  - airport transfers to Hikkaduwa
  - FAQs
- **Internal links:**
  - Galle (about 40 min, estimated)
  - Bentota (about 1h 10m)
  - Mirissa (about 1h 40m)
  - the airport-transfer planner
- **Business information needed:**
  - Which experiences you run, with durations and meeting points.
  - Your view on turtle viewing and hatcheries (don't describe third-party practices you
    haven't verified).
  - Whether to link to eranorrissrilanka.com (same business?).
  - Own photos: `~/villas/kayak-fish-therapy`, `~/villas/selected_cinnamon` (check consent).

## 4. Ella — `src/content/places/ella.md`

- **Search intent:** "Ella private tour", "Kandy to Ella by car", "Nine Arches Bridge".
- **Help them decide:** how many nights, and whether to arrive by car or by the scenic
  train.
- **Sections:**
  - Ella on a private tour: Nine Arches Bridge, Little Adam's Peak, and what else you do
  - how long to stay (the design suggests 2 nights)
  - getting there: describe only what you arrange
  - combining with Nuwara Eliya and Udawalawe or Yala
  - practical tips and FAQs
- **Internal links:**
  - Nuwara Eliya (about 1h, estimated)
  - Udawalawe (about 1h 40m)
  - Kandy (about 2h 20m)
  - Yala
  - Adam's Peak
- **Business information needed:**
  - Do you book train tickets? Does the driver meet guests at the station?
  - Typical hill-country route and real drive times.
  - Hikes you accompany, if any.

## 5. Kandy — `src/content/places/kandy.md`

- **Search intent:** "Kandy private tour", "Kandy day trip from Colombo", "Temple of the
  Tooth visit".
- **Help them decide:** day trip or overnight stay, how Kandy links the Cultural Triangle
  and the hill country, and what to know before visiting the temple.
- **Sections:**
  - Kandy on a private tour
  - visiting the Temple of the Sacred Tooth Relic: check current visitor rules with the
    official source; don't quote times or fees
  - how long to stay (the design suggests 2 nights)
  - routes from the airport or Colombo, onward to Sigiriya or Nuwara Eliya and Ella
  - stops on the way, only ones you actually make
  - FAQs
- **Internal links:**
  - Nuwara Eliya (about 1h 30m, estimated)
  - Adam's Peak (about 2h)
  - Dambulla (about 2h 10m)
  - Ella (about 2h 20m)
  - Sigiriya
- **Business information needed:**
  - What a Kandy visit with you includes.
  - Real drive times from the airport.
  - Own photos.

## After these five

Next by likely demand: Mirissa (whale watching), Yala (safaris), Nuwara Eliya, Dambulla,
Bentota. The other destinations can stay as drafts indefinitely; drafts are harmless.
