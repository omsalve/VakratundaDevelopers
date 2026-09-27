"""Step 1 — download the open data into .cache/ (skips what is already there).

  · OpenStreetMap, through the Overpass API: coastline, inland water, and the
    road network (major roads, their links, and secondaries).
  · Elevation: AWS Terrain Tiles (Terrarium PNGs) at zoom 12, mosaicked.
"""
import json
import math
import os
import time
import urllib.parse
import urllib.request

import numpy as np
from PIL import Image

from common import CACHE, EAST, NORTH, SOUTH, WEST

AGENT = {"User-Agent": "vakratunda-region-map/1.0"}
ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
QUERIES = {
    "coast": '(way["natural"="coastline"];);out geom;',
    "water": '(way["natural"="water"];relation["natural"="water"];'
             'way["waterway"="riverbank"];relation["waterway"="riverbank"];);out geom;',
    "roads": '(way["highway"~"^(motorway|trunk|primary)$"];);out geom;',
    "links": '(way["highway"~"^(motorway_link|trunk_link|primary_link)$"];);out geom;',
    "secondary": '(way["highway"="secondary"];);out geom;',
}


def overpass(name, body):
    path = os.path.join(CACHE, f"osm-{name}.json")
    if os.path.exists(path):
        return
    query = f"[out:json][timeout:300][bbox:{SOUTH},{WEST},{NORTH},{EAST}];{body}"
    data = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(6):
        url = ENDPOINTS[attempt % len(ENDPOINTS)]
        try:
            req = urllib.request.Request(url, data=data, headers=AGENT)
            with urllib.request.urlopen(req, timeout=320) as r:
                raw = r.read()
            json.loads(raw)  # a busy server answers with HTML
            open(path, "wb").write(raw)
            print(f"osm {name}: {len(raw) // 1024} KB")
            return
        except Exception as e:  # noqa: BLE001 — retry on anything
            print(f"osm {name}: {url} failed ({e}); retrying")
            time.sleep(8)
    raise SystemExit(f"could not fetch {name}")


def tile_x(lon, z):
    return (lon + 180) / 360 * 2 ** z


def tile_y(lat, z):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z


def elevation(z=12):
    out = os.path.join(CACHE, "dem.npy")
    if os.path.exists(out):
        return
    x0, x1 = int(tile_x(WEST, z)), int(tile_x(EAST, z))
    y0, y1 = int(tile_y(NORTH, z)), int(tile_y(SOUTH, z))
    mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), np.float32)
    tiles = os.path.join(CACHE, "tiles")
    os.makedirs(tiles, exist_ok=True)
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            # Each tile is kept, so a dropped connection costs one tile.
            tile = os.path.join(tiles, f"{z}_{tx}_{ty}.png")
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{tx}/{ty}.png"
            for attempt in range(5):
                if os.path.exists(tile):
                    break
                try:
                    req = urllib.request.Request(url, headers=AGENT)
                    with urllib.request.urlopen(req, timeout=60) as r:
                        open(tile, "wb").write(r.read())
                except Exception as e:  # noqa: BLE001 — retry on anything
                    print(f"tile {tx},{ty}: {e}; retrying")
                    time.sleep(3 * (attempt + 1))
            rgb = np.asarray(Image.open(tile).convert("RGB"), np.float32)
            h = rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768
            mosaic[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = h
    np.save(out, mosaic)
    json.dump(dict(z=z, x0=x0, y0=y0), open(os.path.join(CACHE, "dem.json"), "w"))
    print("elevation", mosaic.shape, "min", mosaic.min(), "max", mosaic.max())


if __name__ == "__main__":
    for name, body in QUERIES.items():
        overpass(name, body)
    elevation()
