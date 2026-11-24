# Airport shuttle prices — current figures

> **Update, November 2026:** the site no longer shows these prices. A transfer is now a request
> between any two places, and the guest gets a quotation from the team. This file is kept as a
> reference for quoting.

## Car prices from the airport, budget level (owner, 2026-11-23)

For quoting only: the website does not show these prices yet. The owner will say when to show
them. They replace the older US-dollar car prices further down, which the owner never confirmed.

- **What they cover:** Bandaranaike International Airport (CMB) → each destination, **one way,
  by car, for 1–2 people**, priced for budget travellers. Road tolls are assumed to be included,
  as for Hikkaduwa.
- **How they are worked out:** the owner's price for Hikkaduwa is **LKR 16,500**. That is 148 km
  in the planner's road data (`src/data/route-times.mjs`), so about **LKR 111.5 per km**. Each
  price is the road distance × 111.5, rounded to the nearest LKR 500. Example: Galle, 161 km ×
  111.5 = 17,949 → LKR 18,000.
- **Distances and times** are the planner's road data (OpenStreetMap, normal driving, no stops
  or heavy traffic). Yala is to the Palatupana park gate and Adam’s Peak to Dalhousie.
- **Not compared** with other companies' prices.

| Destination | Road distance | Drive time (no traffic) | Car, 1–2 people (LKR) |
|---|---|---|---|
| Bentota | 115 km | 2 h | 13,000 |
| Kandy | 118 km | 3 h 4 min | 13,000 |
| Dambulla | 132 km | 3 h 23 min | 14,500 |
| **Hikkaduwa** | 148 km | 2 h 24 min | **16,500** (owner's price) |
| Sigiriya | 150 km | 3 h 53 min | 16,500 |
| Galle | 161 km | 2 h 25 min | 18,000 |
| Adam’s Peak (Dalhousie) | 166 km | 4 h 38 min | 18,500 |
| Anuradhapura | 178 km | 4 h 44 min | 20,000 |
| Mirissa | 186 km | 2 h 50 min | 20,500 |
| Nuwara Eliya | 189 km | 4 h 41 min | 21,000 |
| Polonnaruwa | 201 km | 5 h 2 min | 22,500 |
| Trincomalee | 238 km | 5 h 59 min | 26,500 |
| Udawalawe | 275 km | 4 h 9 min | 30,500 |
| Yala (Palatupana gate) | 307 km | 4 h 55 min | 34,000 |
| Ella | 341 km | 5 h 30 min | 38,000 |
| Arugam Bay | 423 km | 7 h 32 min | 47,000 |

### Check before showing these on the website
- **Ella may be too high.** The road data takes the fastest route, along the southern
  expressway (341 km). The shorter road through Ratnapura and Haputale is roughly 200–230 km but
  slower (an estimate, not measured); priced on that road, Ella would be about LKR 23,000–26,000.
- **Distance only, not time.** Hill roads are slow: Sigiriya costs the same as Hikkaduwa
  (LKR 16,500) but takes about 1.5 hours longer. Kandy, Dambulla, Sigiriya, Adam’s Peak and
  Nuwara Eliya could be priced higher to pay for the driver's time.
- **Short trips are not listed.** Colombo city (39 km), the Colombo port (43 km) and Negombo
  (8 km) need a minimum price from the owner; the per-km rate would give too little (Negombo
  about LKR 900).

### For a spreadsheet

Copy the lines below and paste into Excel or Google Sheets; they split into columns.

```
Destination	Distance km	Car 1-2 people LKR
Bentota	115	13000
Kandy	118	13000
Dambulla	132	14500
Hikkaduwa	148	16500
Sigiriya	150	16500
Galle	161	18000
Adam's Peak	166	18500
Anuradhapura	178	20000
Mirissa	186	20500
Nuwara Eliya	189	21000
Polonnaruwa	201	22500
Trincomalee	238	26500
Udawalawe	275	30500
Yala	307	34000
Ella	341	38000
Arugam Bay	423	47000
```

## Earlier figures (8 November 2026, not confirmed)

Snapshot of what the site showed on 8 November 2026, for transfers between Bandaranaike
International Airport (CMB) and each place. US dollars, **one way, fixed price per vehicle**; a
return transfer is double. These figures were never confirmed by the owner.

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

## In Sri Lankan rupees (at LKR 330 = US$1)

The same prices converted at an assumed rate of LKR 330 to the US dollar (9 November 2026), not
rounded. One way, fixed price per vehicle; a return transfer is double. The site itself shows US
dollars only.

| Destination | Distance (est.) | Drive (est.) | Car (1–3) | Van (4–7) | Mini coach (8–20) |
|---|---|---|---|---|---|
| Negombo | 10 km | 10 min | LKR 8,250 | LKR 11,550 | LKR 19,800 |
| Colombo Port cruise terminal | 35 km | 1h | LKR 9,900 | LKR 14,850 | LKR 23,100 |
| Colombo city | 40 km | 1h | LKR 9,900 | LKR 14,850 | LKR 24,750 |
| Adam’s Peak | 110 km | 2h 50m | LKR 21,450 | LKR 31,350 | LKR 52,800 |
| Kandy | 115 km | 3h | LKR 23,100 | LKR 33,000 | LKR 54,450 |
| Bentota | 120 km | 3h | LKR 23,100 | LKR 34,650 | LKR 57,750 |
| Nuwara Eliya | 145 km | 3h 40m | LKR 28,050 | LKR 41,250 | LKR 67,650 |
| Dambulla | 160 km | 4h | LKR 29,700 | LKR 44,550 | LKR 72,600 |
| Hikkaduwa | 165 km | 4h 10m | LKR 31,350 | LKR 44,550 | LKR 74,250 |
| Sigiriya | 180 km | 4h 30m | LKR 33,000 | LKR 49,500 | LKR 80,850 |
| Ella | 185 km | 4h 40m | LKR 34,650 | LKR 49,500 | LKR 82,500 |
| Galle | 185 km | 4h 40m | LKR 34,650 | LKR 49,500 | LKR 82,500 |
| Udawalawe | 190 km | 4h 50m | LKR 34,650 | LKR 51,150 | LKR 84,150 |
| Anuradhapura | 195 km | 4h 50m | LKR 36,300 | LKR 52,800 | LKR 87,450 |
| Polonnaruwa | 210 km | 5h 20m | LKR 37,950 | LKR 56,100 | LKR 92,400 |
| Mirissa | 210 km | 5h 20m | LKR 37,950 | LKR 56,100 | LKR 92,400 |
| Yala | 280 km | 7h | LKR 49,500 | LKR 72,600 | LKR 120,450 |
| Trincomalee | 300 km | 7h 30m | LKR 52,800 | LKR 77,550 | LKR 128,700 |
| Arugam Bay | 305 km | 7h 40m | LKR 54,450 | LKR 79,200 | LKR 130,350 |

### For a spreadsheet (LKR)

Copy the lines below and paste into Excel or Google Sheets; they split into columns.

```
Destination	Distance km (est.)	Drive (est.)	Car LKR	Van LKR	Mini coach LKR
Negombo	10	10 min	8250	11550	19800
Colombo Port cruise terminal	35	1h	9900	14850	23100
Colombo city	40	1h	9900	14850	24750
Adam’s Peak	110	2h 50m	21450	31350	52800
Kandy	115	3h	23100	33000	54450
Bentota	120	3h	23100	34650	57750
Nuwara Eliya	145	3h 40m	28050	41250	67650
Dambulla	160	4h	29700	44550	72600
Hikkaduwa	165	4h 10m	31350	44550	74250
Sigiriya	180	4h 30m	33000	49500	80850
Ella	185	4h 40m	34650	49500	82500
Galle	185	4h 40m	34650	49500	82500
Udawalawe	190	4h 50m	34650	51150	84150
Anuradhapura	195	4h 50m	36300	52800	87450
Polonnaruwa	210	5h 20m	37950	56100	92400
Mirissa	210	5h 20m	37950	56100	92400
Yala	280	7h	49500	72600	120450
Trincomalee	300	7h 30m	52800	77550	128700
Arugam Bay	305	7h 40m	54450	79200	130350
```
