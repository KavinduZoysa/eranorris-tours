# Writing destination and experience guides

How the guide pages under `/places/<id>/` and `/experiences/<slug>/` are written, checked and
published. `src/content/places/kandy.md` is the reference example.

## Files

| Page | Content file | Research record |
|---|---|---|
| `/places/<id>/` | `src/content/places/<id>.md` (id from `DESTS`) | `docs/research/<id>.md` |
| `/experiences/<slug>/` | `src/content/experiences/<slug>.md` | `docs/research/experience-<slug>.md` |

The research record is for the owner and editors. It lists sources, verified facts, open
questions and anything that can change. It is never published.

## Front matter

```yaml
---
status: draft            # draft | published
reviewed: 2026-10-21     # date the owner checked the page; required to publish
title: …                 # optional <title>, ≤ 60 characters incl. " | Eranorris"
description: …           # optional meta description, 70–160 characters
h1: …                    # optional H1; defaults to the destination name
intro: …                 # optional hero introduction (1–2 sentences); defaults to the design text
stay: …                  # at a glance: recommended stay
gettingThere: …          # at a glance: typical journey from the airport/Colombo, qualified ("about…")
bestTime: …              # at a glance: when to go, if seasonality matters
goodFor: …               # at a glance: short list of what the place suits
combine:                 # "Nearby places to combine": destination id | note (qualified times)
  - nuwara-eliya | About 2.5–3 hours on winding hill roads; the usual next stop for tea country
sources:                 # "Official information" links shown at the end: label | https URL
  - Temple of the Sacred Tooth Relic — visitor FAQ | https://sridaladamaligawa.lk/faq/
verify:                  # owner checks; never shown. Must be empty to publish.
  - Do we arrange tickets for the Kandyan dance show?
---
```

Used only by experience pages:
- `experience:` the id from `src/data/experiences.mjs`.
- `gallery:` a list of image names from `src/data/galleries.mjs`.

## Body

Plain Markdown with `##` section headings (`###` inside them). Choose the sections that suit
the place. Do not force every page into the same outline. Typical sections are:
- an overview
- the main sights
- practical visiting advice
- how long to stay, with an example day
- the best time to visit
- getting there and onward routes

Special pieces:

- **`<!-- experiences -->`** on its own line inserts the "Things to do" cards (from
  `src/data/experiences.mjs`) at that point. Without it, the cards follow the body.
- **`## Frequently asked questions`** becomes the accessible FAQ component.
  - Write each question as a `###` heading ending in `?`, followed by the answer.
  - Questions must be specific to the place. Answers are short and useful.
- **Links:** link other pages on the site with root-relative URLs, e.g.
  `[Sigiriya](/places/sigiriya/)`. The build checks that they exist. External links should go
  to official or authoritative pages.
- **Comments:** HTML comments are writing notes and are never sent to the browser.

## Writing standard

- **Write for a traveller deciding whether and how to visit.** Be concrete and specific to the
  place. Avoid filler, superlatives and repeating the place name for search engines.
- **Separate general facts from the business.**
  - General travel facts come from research, ideally checked in two sources, with official
    sources first.
  - Anything about what Eranorris does comes only from verified business information: the
    planner, this repo, or eranorrissrilanka.com. Never say a guide, tickets, meals or an
    activity are included unless the owner has confirmed it. Put open questions under
    `verify:`.
- **Don't hard-code what changes.** Opening hours, ticket prices and timetables go out of
  date. Link to the official page (and add it to `sources:`) instead of quoting figures.
  Seasons and dress codes may be summarised if the source is official.
- **Qualify journey times.** Say "about", give a range, and say what affects them. Never present
  the planner's formula estimate as a measured road time.
- **Wildlife:**
  - Wild animals in their habitat are never guaranteed.
  - Hatcheries, orphanages and similar places are captive or managed facilities; say so,
    neutrally.
  - Make no claims about welfare or conservation benefits.
- **Original wording.** Summarise sources in your own words; don't copy paragraphs.

## Experience cards (`src/data/experiences.mjs`)

Experiences are the "Things to do" cards on a destination page and in the map planner, where
visitors tick them to add to a quote request. The field list is at the top of the file; the
build rejects entries that break these rules.

- **Kind** (required): `attraction` — one of the main sights of the place; `activity` —
  something you do or visit there (a safari drive, hike, class, show, boat trip, workshop);
  `excursion` — a separate place that needs extra travel. An excursion must have `where`,
  naming the place and roughly how far it is ("Minneriya National Park, about 45 minutes by
  road from Sigiriya"). Cards are listed and grouped in that order.
- **Category**: culture, history, nature, wildlife, local life, food, adventure, or beach &
  water.
- **Text**: `shortDescription` (≤ 200 characters) is what the map shows; `details` is the
  fuller card text on the page. Both are general facts, checked like guide text. Typical
  durations go in `details`, in words. The `duration` and `price` fields are only for what you
  have confirmed for your own offer.
- **Who provides it** is not shown. All experiences are arranged through partners (owner,
  November 2026), so cards never say who runs them, and never claim Eranorris does.
- **Source**: `eranorrissrilanka.com`, `design`, `brief` or `research`. Research entries have
  their sources in `docs/research/<destination>.md`.
- **Responsible travel**: never promise sightings; label captive or managed facilities as
  such; don't list captive-animal interactions (rides, bathing, feeding, handling).
- **Ids are permanent**: they are saved in visitors' trips. To retire one, set
  `available: false`.

## Photos

- Use the business's own photos, or openly licensed photos (CC0, CC BY or CC BY-SA, never NC or
  ND) from Wikimedia Commons, where each file's place and licence are documented.
- A photo must show the place it illustrates — never one place standing in for another — and
  carry no watermark. Check the file's description, category or GPS position, not just its
  title.
- Openly licensed main photos go in `PHOTO_SOURCES` (the Commons URL) and `PHOTO_CREDITS` (title,
  photographer, licence, source) in `src/data/destinations.mjs`; the credit is then shown under
  the photo and on `/photo-credits/`. Record the choice in `docs/research/photos.md`.
- Alt text says what the photo shows ("A train curving across the Nine Arches Bridge…").

## Owner checklist

`npm run checklist` writes `docs/research/owner-checklist.md`: the unconfirmed site-wide facts,
every open `verify:` question and every experience whose provider isn't confirmed. Answer the
items in their own files and run it again.

## Publishing

A page goes live (indexable, in the sitemap, content visible in production) only when all
of these hold. The build enforces each one:

1. `status: published`
2. a `reviewed:` date
3. no `verify:` items left
4. no `[TODO]`/`TBD`
5. at least 200 words (120 for experience pages)
6. every internal link resolves

Preview drafts with `npm run build:staging && npm run serve`. Production draft pages show only
the design summary, the photos, the experience cards and the planner links.
