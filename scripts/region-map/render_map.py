"""Step 3 — bake the ground.

Writes public/map/terrain.webp, terrain-height.png and coast.json, and
.cache/meta.json with the bounds write_ts.py puts into lib/regionMap.ts.

THE LOOK is a game map: monochrome blue at low strength, as if the ground
were projected rather than printed; bronze only where the eye should catch —
the sea coast and every 250 m of height. The roads are the map's own and are
drawn at runtime, in copper, over all of this."""
import json
import math
import os
import pickle

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from shapely.geometry import Polygon

from common import CACHE, KX, KY, ORIGIN_LAT, ORIGIN_LON, PUBLIC, km

os.makedirs(PUBLIC, exist_ok=True)
geo = pickle.load(open(os.path.join(CACHE, "geo.pkl"), "rb"))

# ---- Style -------------------------------------------------------------------------
PPK = 24          # texture pixels per km
QUALITY = 80      # WebP
SEA = "#040817"
SHALLOWS = "#081335"
LAND = "#0c1b44"
HIGH = "#142f68"  # the ground lifts toward this with height
LIT = "#3f6fc6"
SHADE = "#030714"
BLUE_LINE = "#5d8fe8"
BRONZE = "#dc9d5d"
CONTOUR_FINE, CONTOUR_BOLD = 50, 250  # metres
GRID_KM = 5
RELIEF_EXAG = 2.2
HEIGHT_STEP = 11  # texture px per height sample (~2 per km)

# ---- Frame -------------------------------------------------------------------------
minx, miny, maxx, maxy = geo["bbox"].bounds
X0, Y0 = km(minx, maxy)
X1, Y1 = km(maxx, miny)
W, H = math.ceil((X1 - X0) * PPK), math.ceil((Y1 - Y0) * PPK)
print("texture", W, H)


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def over(base, color, alpha):
    a = np.clip(alpha, 0, 1)[..., None]
    return base * (1 - a) + rgb(color) * a


def rasterize(geom, ss=3):
    img = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(img)
    polys = [geom] if isinstance(geom, Polygon) else [g for g in getattr(geom, "geoms", []) if isinstance(g, Polygon)]
    polys.sort(key=lambda p: -p.area)

    def pix(coords):
        return [((x - X0) * PPK * ss, (y - Y0) * PPK * ss) for x, y in (km(lon, lat) for lon, lat in coords)]

    for p in polys:
        d.polygon(pix(p.exterior.coords), fill=255)
        for hole in p.interiors:
            d.polygon(pix(hole.coords), fill=0)
    return np.asarray(img.resize((W, H), Image.BOX), np.float32) / 255


land = rasterize(geo["land"]) > 0.5
sea = rasterize(geo["coastland"]) < 0.5
lake = ~land & ~sea

# ---- Elevation on the sheet ----------------------------------------------------------
dem = np.load(os.path.join(CACHE, "dem.npy"))
dm = json.load(open(os.path.join(CACHE, "dem.json")))
lon = ORIGIN_LON + ((np.arange(W) + 0.5) / PPK + X0) / KX
lat = ORIGIN_LAT - ((np.arange(H) + 0.5) / PPK + Y0) / KY
mx = ((lon + 180) / 360 * 2 ** dm["z"] - dm["x0"]) * 256
lr = np.radians(lat)
my = ((1 - np.log(np.tan(lr) + 1 / np.cos(lr)) / np.pi) / 2 * 2 ** dm["z"] - dm["y0"]) * 256
MY, MX = np.meshgrid(my, mx, indexing="ij")
elev = ndimage.map_coordinates(dem, [MY, MX], order=1, mode="nearest").astype(np.float32)
height = ndimage.gaussian_filter(np.where(land, np.maximum(elev, 0), 0), 1.7)

# ---- Relief: light from the north-west, and a soft knee so survey noise on the
# plains shades nothing while real slopes do.
gy, gx = np.gradient(height * RELIEF_EXAG, 1000 / PPK)
n = np.stack([-gx, -gy, np.ones_like(gx)])
n /= np.linalg.norm(n, axis=0)
light = np.array([-1.0, -1.0, 1.25])
light /= np.linalg.norm(light)
relief = np.tensordot(light, n, axes=1) - light[2]
relief = np.sign(relief) * np.clip(np.abs(relief) - 0.02, 0, None)

# ---- Ground ------------------------------------------------------------------------
ground = np.broadcast_to(rgb(LAND), land.shape + (3,)).copy()
ground = over(ground, HIGH, np.clip(height / 800, 0, 1) * 0.7)
ground = over(ground, LIT, np.clip(relief, 0, None) * 1.3)
ground = over(ground, SHADE, np.clip(-relief, 0, None) * 1.9)

# Contours as distance to the nearest level, so they come out antialiased at
# any slope.
hc = ndimage.gaussian_filter(height, 2.4)
cy, cx = np.gradient(hc)
slope = np.maximum(np.hypot(cx, cy), 1e-3)


def contour(interval, width):
    f = hc / interval
    d = np.abs(f - np.round(f)) * interval / slope
    return np.clip(width / 2 + 0.5 - d, 0, 1) * (hc > interval * 0.6) * land


ground = over(ground, BLUE_LINE, contour(CONTOUR_FINE, 0.9) * 0.3)
ground = over(ground, BRONZE, contour(CONTOUR_BOLD, 1.3) * 0.72)

# ---- Water -------------------------------------------------------------------------
dist_water = ndimage.distance_transform_edt(~land) / PPK  # water → nearest land, km
water = np.broadcast_to(rgb(SEA), land.shape + (3,)).copy()
water = over(water, SHALLOWS, np.clip(1 - dist_water / 2.2, 0, 1) ** 1.6 * 0.9)

color = np.where(land[..., None], ground, water)

# ---- The survey grid ------------------------------------------------------------------
xs = (np.arange(W) + 0.5) / PPK + X0
ys = (np.arange(H) + 0.5) / PPK + Y0
dx = np.abs(((xs + GRID_KM / 2) % GRID_KM) - GRID_KM / 2) * PPK
dy = np.abs(((ys + GRID_KM / 2) % GRID_KM) - GRID_KM / 2) * PPK
grid = np.maximum(np.clip(1 - dx, 0, 1)[None, :], np.clip(1 - dy, 0, 1)[:, None])
color = over(color, BLUE_LINE, grid * 0.1)

# ---- The water's edges: the sea's in bronze, a hairline on the land and a soft
# glow over the water; the rivers and lakes inland in a quiet blue, so the
# coast reads first and the roads are never outshone.
d_sea = ndimage.distance_transform_edt(~sea)
d_lake = ndimage.distance_transform_edt(~lake)
color = over(color, BLUE_LINE, np.clip(1.3 - d_lake, 0, 1) * land * 0.45)
color = over(color, BRONZE, np.clip(1.6 - d_sea, 0, 1) * land * 0.7)
color = over(color, BRONZE, np.clip(1 - dist_water / 0.45, 0, 1) ** 2 * sea * 0.14)

# Dither, so the dark gradients do not band once compressed.
color = color + np.random.default_rng(7).normal(0, 0.8, color.shape)
Image.fromarray(np.clip(color, 0, 255).astype(np.uint8), "RGB").save(
    os.path.join(PUBLIC, "terrain.webp"), "WEBP", quality=QUALITY, method=6)

# ---- Heights for the mesh --------------------------------------------------------------
hgrid = ndimage.gaussian_filter(height, 2.0)[HEIGHT_STEP // 2::HEIGHT_STEP, HEIGHT_STEP // 2::HEIGHT_STEP]
hmax = float(max(1.0, hgrid.max()))
if (hgrid.shape[0] + 2) * (hgrid.shape[1] + 2) > 65535:
    raise SystemExit("height grid too dense for 16-bit indices — raise HEIGHT_STEP")
Image.fromarray(np.clip(hgrid / hmax * 255, 0, 255).astype(np.uint8), "L").save(
    os.path.join(PUBLIC, "terrain-height.png"), optimize=True)

# ---- The sea coast, simplified to ~24 m and delta-encoded in tens of metres ----------
coastland = geo["coastland"]
polys = [coastland] if isinstance(coastland, Polygon) else list(coastland.geoms)
lines = []
for p in polys:
    for ring in [p.exterior, *p.interiors]:
        if Polygon(ring).area * KX * KY < 0.04:
            continue
        pts = []
        for lo, la in ring.simplify(0.00022).coords:
            x, y = km(lo, la)
            if min(abs(x - X0), abs(x - X1), abs(y - Y0), abs(y - Y1)) < 0.05:  # the box's own edge
                if len(pts) > 1:
                    lines.append(pts)
                pts = []
            else:
                pts.append((round(x * 100), round(y * 100)))
        if len(pts) > 1:
            lines.append(pts)
encoded = []
for q in lines:
    flat = list(q[0])
    for (ax, ay), (bx, by) in zip(q[:-1], q[1:]):
        if (ax, ay) != (bx, by):
            flat += [bx - ax, by - ay]
    encoded.append(flat)
json.dump(encoded, open(os.path.join(PUBLIC, "coast.json"), "w"), separators=(",", ":"))

json.dump(dict(x0=X0, y0=Y0, x1=X0 + W / PPK, y1=Y0 + H / PPK,
               grid=dict(step_km=HEIGHT_STEP / PPK, cols=hgrid.shape[1], rows=hgrid.shape[0],
                         x0=X0 + (HEIGHT_STEP / 2) / PPK, y0=Y0 + (HEIGHT_STEP / 2) / PPK, max_m=hmax)),
          open(os.path.join(CACHE, "meta.json"), "w"), indent=1)
for f in ("terrain.webp", "terrain-height.png", "coast.json"):
    print(f, os.path.getsize(os.path.join(PUBLIC, f)) // 1024, "KB")
