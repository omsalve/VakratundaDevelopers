"""Step 4 — trace the seven roads along the real OSM network.

Each road is a list of waypoints; consecutive waypoints are joined by the
shortest path over motorway / trunk / primary ways (their link roads, and
secondaries at a penalty), with the ways named for that road strongly
preferred, so a route keeps to its own carriageway rather than a parallel
street. Where a road meets another, its end is joined to it. Writes
.cache/roads.json as [lat, lon] lists."""
import heapq
import json
import os
import re

from shapely.geometry import LineString

from common import CACHE, dist_km

ROUTES = {
    "spine": dict(prefer=r"Ambedkar|Bhagat Singh|Naoroji|Colaba|Causeway|Sion|Dadar|Tilak|Parel|Byculla|Hindmata|Mahatma Jyotiba",
                  points=[(18.906, 72.8245), (18.941, 72.836), (18.976, 72.834), (18.995, 72.839), (19.017, 72.845), (19.041, 72.862)]),
    "coastal": dict(prefer=r"Marine Drive|Coastal|Sea Link|Netaji|Bandra.Worli|Rajiv Gandhi",
                    points=[(18.927, 72.8225), (18.955, 72.815), (18.984, 72.8095), (19.01, 72.812), (19.04, 72.82), (19.051, 72.833), (19.06, 72.849)]),
    "weh": dict(prefer=r"Western Express",
                points=[(19.017, 72.845), (19.039, 72.843), (19.06, 72.849), (19.082, 72.854), (19.117, 72.857), (19.16, 72.859), (19.232, 72.869), (19.282, 72.878), (19.33, 72.879), (19.41, 72.87)]),
    "eeh": dict(prefer=r"Eastern Express",
                points=[(19.041, 72.862), (19.068, 72.899), (19.105, 72.929), (19.145, 72.941), (19.197, 72.968), (19.212, 72.975)]),
    "jvlr": dict(prefer=r"Jogeshwari|Vikhroli|JVLR",
                 points=[(19.135, 72.858), (19.127, 72.88), (19.119, 72.903), (19.124, 72.938)], join=("weh", "eeh")),
    "sclr": dict(prefer=r"Santa ?Cruz|Chembur|SCLR",
                 points=[(19.082, 72.854), (19.074, 72.878), (19.068, 72.899)], join=("weh", "eeh")),
    "badlapur": dict(prefer=r"Mumbra|Kausa|Shil|Pipeline|Nevali|Badlapur|NH48|Kalwa",
                     points=[(19.197, 72.968), (19.177, 73.025), (19.172, 73.097), (19.163, 73.24), (19.15, 73.29)], join=("eeh", None)),
}

ways, nodes = [], {}
for name in ("roads", "links", "secondary"):
    for e in json.load(open(os.path.join(CACHE, f"osm-{name}.json"), encoding="utf-8"))["elements"]:
        if e["type"] != "way" or "nodes" not in e:
            continue
        tags = e.get("tags", {})
        label = " ".join(str(v) for k, v in tags.items() if k in ("name", "ref", "official_name", "alt_name"))
        ways.append((e["nodes"], label, tags.get("highway", "")))
        for nid, g in zip(e["nodes"], e["geometry"]):
            nodes[nid] = (g["lon"], g["lat"])

out = {}
for rid, spec in ROUTES.items():
    pref = re.compile(spec["prefer"], re.I)
    graph, own = {}, set()
    for ids, label, hw in ways:
        mine = bool(pref.search(label))
        if mine:
            own.update(ids)
        w = 1.0 if mine else (1.2 if hw.endswith("_link") else (5.0 if hw == "secondary" else 3.5))
        for a, b in zip(ids[:-1], ids[1:]):
            d = dist_km(nodes[a], nodes[b]) * w
            graph.setdefault(a, []).append((b, d))
            graph.setdefault(b, []).append((a, d))

    def snap(lat, lon):
        pool = own or nodes.keys()
        best = min(pool, key=lambda n: dist_km(nodes[n], (lon, lat)))
        if dist_km(nodes[best], (lon, lat)) > 1.5:
            best = min(nodes, key=lambda n: dist_km(nodes[n], (lon, lat)))
        return best

    stops = [snap(*p) for p in spec["points"]]
    path = []
    for a, b in zip(stops[:-1], stops[1:]):
        dist, prev, heap = {a: 0.0}, {}, [(0.0, a)]
        while heap:
            d, u = heapq.heappop(heap)
            if u == b:
                break
            if d > dist.get(u, 1e18):
                continue
            for v, w in graph.get(u, []):
                if d + w < dist.get(v, 1e18):
                    dist[v], prev[v] = d + w, u
                    heapq.heappush(heap, (d + w, v))
        seg, u = [b], b
        while u != a:
            u = prev.get(u)
            if u is None:
                raise SystemExit(f"{rid}: no route")
            seg.append(u)
        seg.reverse()
        path.extend(seg if not path else seg[1:])

    line = LineString([nodes[n] for n in path]).simplify(0.00012)  # ~13 m
    out[rid] = [[round(la, 5), round(lo, 5)] for lo, la in line.coords]
    print(f"{rid}: {len(out[rid])} points")

# Where a road meets another, make it touch.
for rid, spec in ROUTES.items():
    for end, other in zip((0, -1), spec.get("join", (None, None))):
        if not other:
            continue
        p = out[rid][end]
        q = min(out[other], key=lambda o: dist_km((o[1], o[0]), (p[1], p[0])))
        if dist_km((q[1], q[0]), (p[1], p[0])) > 0.05:
            out[rid].insert(0, q) if end == 0 else out[rid].append(q)

json.dump(out, open(os.path.join(CACHE, "roads.json"), "w"))
