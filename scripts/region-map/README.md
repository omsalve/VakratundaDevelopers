# Region map — the build

The Projects section's map (`components/RegionMap.tsx`) stands on real ground:
the coast, harbour, creeks, rivers and lakes from OpenStreetMap, and the relief
from SRTM elevation. This folder turns that open data into the three files the
map loads from `public/map/`, and writes the numbers that locate them into
`lib/regionMap.ts`.

| Output | What it is |
| --- | --- |
| `public/map/terrain.webp` | The ground, drawn as a game map: blue relief, 50 m contours, a 5 km grid, bronze along the sea coast and every 250 m of height. |
| `public/map/terrain-height.png` | Elevation, 8-bit, for the relief the camera tilts over. |
| `public/map/coast.json` | The sea coast as delta-encoded polylines, so it stays sharp up close. |
| `lib/regionMap.ts` | The `TERRAIN` bounds and the seven `ROADS`, rewritten in place. |

## Running it

Needs Python 3.11+ with `numpy`, `scipy`, `shapely` and `Pillow`:

```sh
pip install numpy scipy shapely pillow
python scripts/region-map/fetch.py        # OSM + elevation into .cache/ (once)
python scripts/region-map/build_geo.py    # land, sea and inland water
python scripts/region-map/render_map.py   # the three files in public/map
python scripts/region-map/route_roads.py  # the seven roads, traced on OSM
python scripts/region-map/write_ts.py     # TERRAIN + ROADS in lib/regionMap.ts
```

`fetch.py` is the only step that goes to the network, and it caches: rerun the
rest as often as the style needs. The look lives at the top of
`render_map.py` (colours, contour intervals, grid, bronze); the roads'
waypoints and preferred names live in `route_roads.py`.

## Licences

- **OpenStreetMap** — © OpenStreetMap contributors, ODbL. The map shows that
  credit whenever it is live; keep it if you move the map.
- **Elevation** — AWS Terrain Tiles (Terrarium), which for this region are
  SRTM, GMTED and ETOPO1: public domain.

The screenshot the map was matched against was used only as a visual
reference. Nothing here is traced from a commercial map.
