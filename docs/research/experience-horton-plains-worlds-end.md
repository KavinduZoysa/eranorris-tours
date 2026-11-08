# Research record — Horton Plains and World’s End (experience guide)

Researched 2026-11-06 for `src/content/experiences/horton-plains-worlds-end.md`. See also
`docs/research/nuwara-eliya.md` (October 2026 research and the 2026-11-06 audit), which covers
the park in summary. Internal record, not published.

## Why a separate page
"Horton Plains" and "World’s End hike" are searched on their own (timing, permits, difficulty,
safety, how to get there from Nuwara Eliya or Ella). The Nuwara Eliya page keeps a summary and
links here; the Ella page links from its Horton Plains day-trip line.

Experience id: `nuwara-eliya-horton-plains` — proposed in `.cache/audit/hill-country.json`
(kind `excursion`, category `nature`). It must exist in `src/data/experiences.mjs` before the
page builds.

## Sources
- Sri Lanka Tourism, Horton Plains: https://srilanka.travel/attraction?attraction_id=158
  (about 2,100 m; more than 3,169 ha; named 1834 after Governor Sir Wilmot Horton; 9 km loop,
  about 3 h; World’s End drop about 880 m; fog April–September; best 6–10 am; clearer
  January–March; access 32 km via Ambewela and Pattipola, 38 km via Haputale/Welimada–Boralanda–
  Ohiya; train to Ohiya, about 10 km to the park; cool mornings, warms quickly)
- Department of Wildlife Conservation:
  - Day-visitor e-permit guide: https://www.dwc.gov.lk/?page_id=544 (online reservation; printed
    receipt with QR code "more convenient"; group details must include drivers and guides)
  - Protected areas: https://www.dwc.gov.lk/?page_id=72 (entry by permit after paying the
    prescribed fee; Horton Plains among the most visited parks)
- UNESCO, Central Highlands of Sri Lanka (2010): https://whc.unesco.org/en/list/1203 (not fetched;
  403 to the tool in October)
- IUCN World Heritage Outlook 2025 (finalised 11 October 2025): https://worldheritageoutlook.iucn.org/node/1158
  ("significant concern"; dieback first observed 1946, about 27% of forest affected; visitor
  numbers above carrying capacity at peak times; garbage attracting crows; gorse, trout and carp
  invasives; three components — Peak Wilderness, Horton Plains, Knuckles)
- Wikipedia, Horton Plains National Park: https://en.wikipedia.org/wiki/Horton_Plains_National_Park
  (sanctuary 1969, NP 1988; about 3,160 ha; 2,100–2,300 m; headwaters of the Mahaweli, Kelani and
  Walawe; World’s End 870 m; Baker’s Falls 20 m on the Belihul Oya, named after Samuel Baker;
  rainfall above 2,000 mm; mean about 13 °C; ground frost common in February; IBA; Sri Lanka
  white-eye and wood pigeon among endemics; slender loris photographed 2010; dieback, invasive
  plants, litter, polythene killing sambar)
- Lonely Planet, Farr Inn: https://www.lonelyplanet.com/points-of-interest/farr-inn/1395445
  (former hunting lodge for colonial officials; now the visitor centre)
- Daily Mirror, 9 Dec 2025 — park roads restricted to ticketed visitors again from 7 December:
  https://www.dailymirror.lk/breaking-news/Horton-Plains-roads-closed-to-public-reserved-for-tourists-only/108-327337
- The Pekoe Trail Organisation, 29 Nov 2025 — DWC temporarily closed the park during severe
  weather: https://thepekoetrail.org/public-service-announcements-psa/pekoe-trail-advisory-temporary-closure-of-stages-10-11-12-due-to-severe-weather/
- Fatal fall, November 2018 (German tourist taking a photo; ground crumbled; no railings):
  https://dailymirror.lk/news-features/Postmortem-conducted-on-German-lady-s-remains-Selfies-that-bring-death/131-158441 ;
  https://www.army.lk/archive-news/article/7105 ; Sunday Times 18 Nov 2018 via PressReader
  https://www.pressreader.com/sri-lanka/sunday-times-sri-lanka/20181118/281711205685703
  (says there have been several fatal falls; calls for a fence). Dutch visitor survived a fall in
  2015: https://adaderana.lk/news.php?nid=29881
- Rail status (Pattipola and Ohiya on the Nanu Oya–Badulla section, running since 20 June 2026):
  https://english.newsfirst.lk/2026/06/20/badullananu-oya-train-services-resume-today ;
  https://byc.lk/colombo-kandy-ella-train-status-2026 (status table checked 4 Nov 2026)

## Facts verified (two or more sources unless noted)
- Elevation about 2,100–2,300 m (Tourism, Wikipedia). Sanctuary 1969, national park 1988
  (Wikipedia; DWC protected-area list). UNESCO serial site 2010 (Wikipedia, IUCN).
- Named 1834 after the governor (Tourism; the governor was Sir Robert Wilmot-Horton, 1831–37).
- Loop about 9 km, about 3 hours (Tourism, Wikipedia, travel guides; some give 9.5 km).
- World’s End drop: 870 m (Wikipedia), 880 m (Tourism, Lonely Planet), 884 m (one guide).
  The page says "roughly 870–880 m" in the body and "about 870 m" in the intro.
- Baker’s Falls about 20 m on the Belihul Oya, named after Samuel Baker (Wikipedia; guides).
- Best hours 6–10 am (Tourism); cloud after about 9 am (guides). Clearest January–March; fog
  April–September (Tourism).
- No railings; fatal falls (Daily Mirror 2018, Sunday Times 2018, Lakpura).
- Polythene ban and sambar deaths from plastic (Wikipedia; Lonely Planet in the October research).
- Permit through the DWC (DWC pages).
- Park roads for park visitors only since 7 Dec 2025 (Daily Mirror; single source).
- Temporary closure during Cyclone Ditwah (Pekoe Trail notice; single source but an organisation
  working inside the park buffer zone).

## Uncertain or conflicting
- Opening and walking hours. Third-party sources say the park opens 6 am–6 pm, ticket counters
  close at 2 pm or 4 pm, and walking to the viewpoints is allowed only 6 am–2 pm. None is
  official, so the page links the DWC and gives no times.
- Fees: not stated (USD 75 per foreign adult incl. vehicle in an older guide; not used).
- Bag checks for plastic: blogs say bags are checked at the trailhead; the page says "may be checked".
- A new Dayagama entrance gate (DWC, reported October 2023) — a walking/cycling access road
  about 5 km from the main gate. Not used; confirm with the DWC if it matters for the Pekoe Trail.
- Kirigalpotta (second-highest peak) and Thotupola Kanda trails: a 2005 Sunday Times article says
  prior DWC permission is needed; current status unknown. Left out except as an owner question.
- Whether railings or a fence were installed after 2018: no evidence found. The page says there
  are no railings; re-check.
- Loop direction: the page follows the usual order (Mini World’s End, World’s End, Baker’s Falls)
  without claiming it is enforced.
- Drive time Nuwara Eliya–park (1–1.5 h) and Ella–park (2–2.5 h) are estimates, not measured.

## Owner questions (also in the file’s `verify:`)
- Whether Eranorris arranges the pre-dawn drive or a stop on the Nuwara Eliya–Ella day, and
  whether the driver waits.
- Who pays the permit and vehicle charge.
- Own photos for a gallery.
- Kirigalpotta / Thotupola Kanda.
- Rail status for Pattipola and Ohiya.

## Review again before publishing
- DWC fees, opening hours, walking hours and the e-permit process.
- Any new safety measures at World’s End (fencing, staffed viewpoint).
- Any weather closure notices; trail damage after the north-east monsoon.
- Rail status on the Nanu Oya–Badulla section.

## Photo needs
- The grassland plateau with mist, sambar at a distance (no baiting).
- World’s End on a clear morning (taken from behind the edge, not from an outcrop).
- Baker’s Falls; the cloud forest with rhododendron and dieback stands.
- Farr Inn visitor centre.
