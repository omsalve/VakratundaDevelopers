"""Shared constants for the region-map build. The projection must match
lib/regionMap.ts exactly."""
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
CACHE = os.path.join(HERE, ".cache")
PUBLIC = os.path.join(REPO, "public", "map")
os.makedirs(CACHE, exist_ok=True)

# The area the data covers: well beyond what the map frames at rest, so a
# wide screen or a tilted camera does not run out of ground — and where one
# still could, the renderer fades the ground out over its last few km.
SOUTH, WEST, NORTH, EAST = 18.70, 72.45, 19.50, 73.62

# The sheet projection — lib/regionMap.ts `project()`.
ORIGIN_LAT, ORIGIN_LON = 19.5, 72.6
KY = 110.6
KX = 111.32 * math.cos(math.radians(19.05))


def km(lon, lat):
    return (lon - ORIGIN_LON) * KX, (ORIGIN_LAT - lat) * KY


def dist_km(a, b):
    """Distance between two (lon, lat) points, km."""
    return math.hypot((a[0] - b[0]) * KX, (a[1] - b[1]) * KY)
