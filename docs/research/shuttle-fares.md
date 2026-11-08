# Airport shuttle prices — current figures

Snapshot of what the site shows on 8 November 2026, for transfers between Bandaranaike
International Airport (CMB) and each place. US dollars, **one way, fixed price per vehicle**; a
return transfer is double. Not yet confirmed (`site.config.mjs → confirmed.shuttleFares`).

How they are worked out (from the design prototype, in `src/data/destinations.mjs`):
- Price = $12 + $0.50 per km, at least $25; then ×1.45 for a van and ×2.4 for a mini coach;
  rounded to $5 (`SHUTTLE_FARES`).
- Distance and drive time are estimates: straight-line distance plus 40% for roads, at about
  40 km/h. They ignore expressways, so they can be well off either way. Real figures can be set
  per route in `ROUTE_TIMES`, and prices follow them.

This file is a snapshot: it does not change the site. Send the real prices (or distances and
times) and they can be put into the data file.

## Table

| Destination | Distance (est.) | Drive (est.) | Car (1–3) | Van (4–7) | Mini coach (8–20) |
|---|---|---|---|---|---|
| Negombo | 10 km | 10 min | $25 | $35 | $60 |
| Colombo Port cruise terminal | 35 km | 1h | $30 | $45 | $70 |
| Colombo city | 40 km | 1h | $30 | $45 | $75 |
| Adam’s Peak | 110 km | 2h 50m | $65 | $95 | $160 |
| Kandy | 115 km | 3h | $70 | $100 | $165 |
| Bentota | 120 km | 3h | $70 | $105 | $175 |
| Nuwara Eliya | 145 km | 3h 40m | $85 | $125 | $205 |
| Dambulla | 160 km | 4h | $90 | $135 | $220 |
| Hikkaduwa | 165 km | 4h 10m | $95 | $135 | $225 |
| Sigiriya | 180 km | 4h 30m | $100 | $150 | $245 |
| Ella | 185 km | 4h 40m | $105 | $150 | $250 |
| Galle | 185 km | 4h 40m | $105 | $150 | $250 |
| Udawalawe | 190 km | 4h 50m | $105 | $155 | $255 |
| Anuradhapura | 195 km | 4h 50m | $110 | $160 | $265 |
| Polonnaruwa | 210 km | 5h 20m | $115 | $170 | $280 |
| Mirissa | 210 km | 5h 20m | $115 | $170 | $280 |
| Yala | 280 km | 7h | $150 | $220 | $365 |
| Trincomalee | 300 km | 7h 30m | $160 | $235 | $390 |
| Arugam Bay | 305 km | 7h 40m | $165 | $240 | $395 |

## For a spreadsheet

Copy the lines below and paste into Excel or Google Sheets; they split into columns.

```
Destination	Distance km (est.)	Drive (est.)	Car USD	Van USD	Mini coach USD
Negombo	10	10 min	25	35	60
Colombo Port cruise terminal	35	1h	30	45	70
Colombo city	40	1h	30	45	75
Adam’s Peak	110	2h 50m	65	95	160
Kandy	115	3h	70	100	165
Bentota	120	3h	70	105	175
Nuwara Eliya	145	3h 40m	85	125	205
Dambulla	160	4h	90	135	220
Hikkaduwa	165	4h 10m	95	135	225
Sigiriya	180	4h 30m	100	150	245
Ella	185	4h 40m	105	150	250
Galle	185	4h 40m	105	150	250
Udawalawe	190	4h 50m	105	155	255
Anuradhapura	195	4h 50m	110	160	265
Polonnaruwa	210	5h 20m	115	170	280
Mirissa	210	5h 20m	115	170	280
Yala	280	7h	150	220	365
Trincomalee	300	7h 30m	160	235	390
Arugam Bay	305	7h 40m	165	240	395
```
