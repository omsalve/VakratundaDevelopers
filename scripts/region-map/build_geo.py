"""Step 2 — OpenStreetMap geometry -> land, sea and inland water.

The coastline arrives as open ways; noded against the bounding box they cut it
into faces, and each face is land or sea by which side of the coast it lies
on (OSM draws land on the left of the way). Lakes, reservoirs and river areas
are then cut out of the land. Writes .cache/geo.pkl."""
import json
import os
import pickle

import numpy as np
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import polygonize, unary_union
from shapely.strtree import STRtree

from common import CACHE, EAST, KX, KY, NORTH, SOUTH, WEST

BBOX = box(WEST, SOUTH, EAST, NORTH)


def load(name):
    return json.load(open(os.path.join(CACHE, f"osm-{name}.json"), encoding="utf-8"))["elements"]


def way_line(el):
    return [(p["lon"], p["lat"]) for p in el.get("geometry", []) if p]


# ---- Coast -> the land the sea does not cover ---------------------------------
coast = [LineString(way_line(e)) for e in load("coast")
         if e["type"] == "way" and len(e.get("geometry", [])) > 1]
segs = [(a, b) for ln in coast for a, b in zip(list(ln.coords)[:-1], list(ln.coords)[1:])]
tree = STRtree([LineString(s) for s in segs])

noded = unary_union([g for g in (ln.intersection(BBOX) for ln in coast) if not g.is_empty]
                    + [BBOX.exterior])
faces = list(polygonize(noded))


def is_land(face):
    """Vote over a few interior points: which side of the nearest stretch of
    coast is each on?"""
    rng = np.random.default_rng(1)
    pts = [face.representative_point()]
    minx, miny, maxx, maxy = face.bounds
    for _ in range(200):
        if len(pts) >= 7:
            break
        p = Point(rng.uniform(minx, maxx), rng.uniform(miny, maxy))
        if face.contains(p):
            pts.append(p)
    votes = 0
    for p in pts:
        (ax, ay), (bx, by) = segs[tree.nearest(p)]
        votes += 1 if (bx - ax) * (p.y - ay) - (by - ay) * (p.x - ax) > 0 else -1
    return votes > 0


coastland = unary_union([f for f in faces if is_land(f)])
print("coast ways", len(coast), "faces", len(faces))


# ---- Inland water ------------------------------------------------------------------
def relation_area(el):
    outers, inners = [], []
    for m in el.get("members", []):
        if m.get("type") != "way" or not m.get("geometry"):
            continue
        coords = [(p["lon"], p["lat"]) for p in m["geometry"] if p]
        if len(coords) >= 2:
            (inners if m.get("role") == "inner" else outers).append(LineString(coords))

    def rings(lines):
        return unary_union(list(polygonize(unary_union(lines)))) if lines else None

    o = rings(outers)
    if o is None or o.is_empty:
        return None
    i = rings(inners)
    return o.difference(i) if i is not None and not i.is_empty else o


water = []
for e in load("water"):
    g = None
    if e["type"] == "way":
        c = way_line(e)
        if len(c) >= 4 and c[0] == c[-1]:
            g = Polygon(c)
    elif e["type"] == "relation":
        g = relation_area(e)
    if g is None or g.is_empty:
        continue
    g = (g if g.is_valid else g.buffer(0)).intersection(BBOX)
    if g.area * KX * KY >= 0.03:  # km²; ponds below this are noise at map scale
        water.append(g)
inland = unary_union(water).intersection(coastland)
land = coastland.difference(inland)
print("inland water km²", round(inland.area * KX * KY, 1))

pickle.dump(dict(land=land, coastland=coastland, inland=inland, bbox=BBOX),
            open(os.path.join(CACHE, "geo.pkl"), "wb"))
