"""Step 5 — write the build's numbers into lib/regionMap.ts, in place.

Only two blocks change: the TERRAIN bounds (from .cache/meta.json) and the
seven ROADS (from .cache/roads.json). Everything else in the file is authored
by hand and left alone."""
import json
import os
import re

from common import CACHE, REPO

path = os.path.join(REPO, "lib", "regionMap.ts")
src = open(path, encoding="utf-8").read()
meta = json.load(open(os.path.join(CACHE, "meta.json")))
roads = json.load(open(os.path.join(CACHE, "roads.json")))
g = meta["grid"]

terrain = f"""  x0: {meta["x0"]:.4f},
  y0: {meta["y0"]:.4f},
  x1: {meta["x1"]:.4f},
  y1: {meta["y1"]:.4f},
  /** The height grid: cell centres, spacing and size, and the metres a
   *  value of 255 stands for. */
  grid: {{
    x0: {g["x0"]:.4f},
    y0: {g["y0"]:.4f},
    step: {g["step_km"]:.6f},
    cols: {g["cols"]},
    rows: {g["rows"]},
    maxMetres: {g["max_m"]:.1f},
  }},"""
src, n = re.subn(r"(  /\*\* The texture's extent, km\. \*/\n).*?  \},\n(  texture:)",
                 lambda m: m.group(1) + terrain + "\n" + m.group(2), src, flags=re.S)
assert n == 1, "TERRAIN block not found"

for rid, pts in roads.items():
    rows = []
    for i in range(0, len(pts), 4):
        rows.append("      " + ", ".join(f"[{la}, {lo}]" for la, lo in pts[i:i + 4]) + ",")
    body = "\n".join(rows)
    src, n = re.subn(rf'(    id: "{rid}",\n    name: "[^"]*",\n    points: \[\n).*?(\n    \],)',
                     lambda m: m.group(1) + body + m.group(2), src, flags=re.S)
    assert n == 1, f"road {rid} not found"

open(path, "w", encoding="utf-8", newline="\n").write(src)
print("lib/regionMap.ts updated")
