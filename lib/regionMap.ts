/**
 * The region, drawn — the map the Projects section opens onto.
 *
 * THE GROUND IS REAL. The coast, the creeks and the harbour, the lakes and
 * rivers, and the relief of the hills are built from open data —
 * OpenStreetMap for the shapes, SRTM elevation (via the AWS Terrain Tiles)
 * for the relief — by scripts/region-map, and baked into three files in
 * public/map:
 *
 *   · terrain.webp        the ground as a game map: blue relief, contours,
 *                         a survey grid, bronze along the coast and every
 *                         250 m of height
 *   · terrain-height.png  its elevation, for the relief the camera tilts over
 *   · coast.json          the sea coast, so it stays sharp up close
 *
 * The map data is © OpenStreetMap contributors (ODbL), which is why the map
 * carries that credit. Rebuild the files with the scripts, never by hand:
 * the bounds below are written by the same run and must match them.
 *
 * THE ROADS ARE REAL TOO, and few. Seven, each traced along the actual OSM
 * highway it names: the ones that pass through, or join up, Mumbai, Sion,
 * Bandra, Andheri East, Goregaon East, Bhandup, Thane and Badlapur — the
 * eight places the map is labelled with. A project in a locality that is not
 * one of those still gets its pin (the pins come from the project list, not
 * from here); the map just does not print its name until someone asks for it.
 *
 * THE UNIT IS THE KILOMETRE. Every coordinate is written as latitude and
 * longitude and projected here into kilometres east and south of a fixed
 * origin — equirectangular with the longitude scaled by cos(φ), within a
 * fraction of a per cent of true across the sheet. The component that paints
 * this owns the camera; nothing here knows about pixels.
 */

/** [latitude, longitude], in decimal degrees. */
export type LatLon = readonly [number, number];

export interface Point {
  x: number;
  y: number;
}

/* ============================================================================
   Projection
   ========================================================================== */

/** The sheet's north-west corner. Everything is east and south of it. */
const ORIGIN_LAT = 19.5;
const ORIGIN_LON = 72.6;

/** Kilometres per degree at the sheet's middle latitude (19.05° N). */
const KM_PER_DEG_LAT = 110.6;
const KM_PER_DEG_LON = 111.32 * Math.cos((19.05 * Math.PI) / 180);

export function project([lat, lon]: LatLon): Point {
  return {
    x: (lon - ORIGIN_LON) * KM_PER_DEG_LON,
    y: (ORIGIN_LAT - lat) * KM_PER_DEG_LAT,
  };
}

/* ============================================================================
   The terrain — where the baked files sit on the sheet
   ========================================================================== */

/** Written by scripts/region-map/render_map.py — do not edit by hand. */
export const TERRAIN = {
  /** The texture's extent, km. */
  x0: -15.7835,
  y0: 0.0000,
  x1: 107.3415,
  y1: 88.5000,
  /** The height grid: cell centres, spacing and size, and the metres a
   *  value of 255 stands for. */
  grid: {
    x0: -15.5544,
    y0: 0.2292,
    step: 0.458333,
    cols: 269,
    rows: 193,
    maxMetres: 1163.9,
  },
  texture: "/map/terrain.webp",
  heights: "/map/terrain-height.png",
  coast: "/map/coast.json",
} as const;

/**
 * The shoreline file is delta-encoded: each line is [x, y, dx, dy, dx, dy…]
 * in tens of metres, which is what keeps nine thousand points to 20 KB.
 */
export function decodeCoast(lines: number[][]): Point[][] {
  return lines.map((flat) => {
    const out: Point[] = [];
    let x = 0;
    let y = 0;
    for (let i = 0; i < flat.length; i += 2) {
      x = i === 0 ? flat[0] : x + flat[i];
      y = i === 0 ? flat[1] : y + flat[i + 1];
      out.push({ x: x / 100, y: y / 100 });
    }
    return out;
  });
}

/* ============================================================================
   Roads
   ========================================================================== */

export interface Road {
  id: string;
  name: string;
  points: readonly LatLon[];
}

/**
 * THE SEVEN, traced along OpenStreetMap by scripts/region-map/route_roads.py
 * and simplified to about 13 m. Each is written in the direction it is drawn
 * in when the map comes alive: out of the city, north and east.
 */
const ROADS: Road[] = [
  {
    // Colaba to Sion by way of Dadar: the old spine of the island.
    id: "spine",
    name: "Dr Ambedkar Road",
    points: [
      [18.91039, 72.82014], [18.91441, 72.82418], [18.91567, 72.82599], [18.92034, 72.83031],
      [18.92188, 72.83123], [18.92509, 72.8324], [18.92538, 72.83258], [18.92599, 72.83359],
      [18.92647, 72.83392], [18.92815, 72.83407], [18.92946, 72.83462], [18.93049, 72.83542],
      [18.93247, 72.8358], [18.93358, 72.83686], [18.93504, 72.83698], [18.93574, 72.83736],
      [18.93823, 72.83787], [18.93855, 72.83634], [18.93837, 72.83508], [18.93804, 72.83442],
      [18.93925, 72.8348], [18.94082, 72.83471], [18.93982, 72.83489], [18.94448, 72.83442],
      [18.94666, 72.83529], [18.94794, 72.83548], [18.94952, 72.83484], [18.95294, 72.83409],
      [18.95415, 72.83312], [18.95679, 72.8327], [18.95757, 72.83211], [18.96009, 72.83184],
      [18.96473, 72.83226], [18.9676, 72.83283], [18.9715, 72.83264], [18.97209, 72.83274],
      [18.97315, 72.83359], [18.97426, 72.83393], [18.97705, 72.83357], [18.98398, 72.83539],
      [18.98833, 72.8359], [18.99088, 72.83574], [18.99231, 72.8365], [18.9954, 72.83673],
      [18.99744, 72.83759], [18.99952, 72.83777], [19.00392, 72.83895], [19.00515, 72.83964],
      [19.00531, 72.83946], [19.00698, 72.84072], [19.00917, 72.84161], [19.01631, 72.84648],
      [19.01702, 72.847], [19.01687, 72.84727], [19.01736, 72.84765], [19.01753, 72.84811],
      [19.01814, 72.84818], [19.02004, 72.84951], [19.02428, 72.85306], [19.02637, 72.8551],
      [19.02632, 72.85557], [19.0266, 72.85593], [19.0273, 72.85602], [19.02905, 72.85731],
      [19.03106, 72.85835], [19.03718, 72.86079], [19.04074, 72.8626],
    ],
  },
  {
    // Marine Drive, the coastal road and the sea link, into Bandra.
    id: "coastal",
    name: "Coastal Road and Sea Link",
    points: [
      [18.92949, 72.82187], [18.93184, 72.82309], [18.93361, 72.82374], [18.93605, 72.82419],
      [18.93855, 72.82428], [18.94108, 72.82393], [18.94279, 72.82346], [18.9452, 72.82234],
      [18.94704, 72.8212], [18.9501, 72.81883], [18.95294, 72.81617], [18.95408, 72.81535],
      [18.95465, 72.81464], [18.9542, 72.81522], [18.95408, 72.81535], [18.95288, 72.81609],
      [18.94927, 72.81938], [18.94558, 72.82201], [18.95007, 72.81838], [18.95175, 72.81639],
      [18.95341, 72.81328], [18.95783, 72.80117], [18.95898, 72.79971], [18.95997, 72.79922],
      [18.96138, 72.79909], [18.97137, 72.80172], [18.97762, 72.80486], [18.97833, 72.80556],
      [18.97886, 72.80642], [18.97991, 72.81053], [18.98039, 72.81169], [18.98113, 72.81254],
      [18.9823, 72.81313], [18.9834, 72.81318], [18.98441, 72.81282], [18.98519, 72.81222],
      [18.98671, 72.81046], [18.98801, 72.81], [18.98877, 72.81008], [18.99193, 72.81125],
      [18.99368, 72.81147], [18.99542, 72.81138], [18.99841, 72.81066], [19.00121, 72.81071],
      [19.00312, 72.81127], [19.00647, 72.81279], [19.0074, 72.81298], [19.00915, 72.81275],
      [19.00982, 72.81242], [19.01084, 72.81186], [19.01142, 72.81155], [19.01171, 72.81143],
      [19.01384, 72.81123], [19.01204, 72.81092], [19.01142, 72.81103], [19.01074, 72.81172],
      [19.01057, 72.81217], [19.0103, 72.81277], [19.00988, 72.81385], [19.01011, 72.81501],
      [19.00884, 72.81347], [19.0084, 72.81327], [19.00722, 72.81328], [19.00705, 72.81316],
      [19.0081, 72.8132], [19.00909, 72.813], [19.00963, 72.81278], [19.01015, 72.81252],
      [19.01066, 72.81221], [19.01154, 72.81176], [19.01226, 72.81155], [19.01394, 72.81154],
      [19.03867, 72.81798], [19.03995, 72.81872], [19.04119, 72.82009], [19.04499, 72.8283],
      [19.04958, 72.83285], [19.0498, 72.8334], [19.04985, 72.8339], [19.04988, 72.83432],
      [19.04972, 72.83669], [19.04979, 72.83434], [19.04984, 72.83426], [19.0499, 72.83418],
      [19.04997, 72.83411], [19.05026, 72.83402], [19.05071, 72.83432], [19.0507, 72.83476],
      [19.05011, 72.83557], [19.05003, 72.83667], [19.05021, 72.83697], [19.04991, 72.8371],
      [19.04989, 72.83776], [19.05092, 72.8406],
    ],
  },
  {
    // Dadar, across the Mahim causeway, and north up the western suburbs.
    id: "weh",
    name: "Western Express Highway",
    points: [
      [19.01658, 72.84614], [19.01667, 72.84675], [19.01748, 72.84735], [19.01811, 72.84756],
      [19.02096, 72.84304], [19.02186, 72.84258], [19.02297, 72.8424], [19.02377, 72.84129],
      [19.02508, 72.8406], [19.0256, 72.84087], [19.03151, 72.84209], [19.03617, 72.84243],
      [19.03893, 72.84198], [19.04005, 72.84155], [19.04629, 72.8385], [19.04868, 72.83835],
      [19.0492, 72.83944], [19.05019, 72.83984], [19.05075, 72.84067], [19.0505, 72.84006],
      [19.05282, 72.84542], [19.05389, 72.84619], [19.05506, 72.84655], [19.08035, 72.84698],
      [19.08483, 72.84605], [19.08569, 72.84564], [19.08783, 72.84392], [19.08903, 72.84363],
      [19.08989, 72.84375], [19.09096, 72.84441], [19.09165, 72.84537], [19.09268, 72.8499],
      [19.09354, 72.85133], [19.09518, 72.85257], [19.09893, 72.85392], [19.10058, 72.85474],
      [19.10195, 72.85473], [19.10635, 72.85365], [19.10768, 72.8535], [19.1138, 72.85484],
      [19.11978, 72.85577], [19.1238, 72.8567], [19.12499, 72.85654], [19.12642, 72.85565],
      [19.12729, 72.85542], [19.14108, 72.85489], [19.14507, 72.85602], [19.15402, 72.85686],
      [19.16549, 72.85851], [19.17422, 72.85948], [19.17518, 72.85942], [19.17798, 72.8586],
      [19.19106, 72.85844], [19.19167, 72.85857], [19.19444, 72.86003], [19.2014, 72.86153],
      [19.20223, 72.86212], [19.20756, 72.86722], [19.20915, 72.86814], [19.21057, 72.86849],
      [19.21209, 72.8685], [19.21343, 72.86821], [19.22737, 72.86344], [19.23598, 72.86334],
      [19.24715, 72.86498], [19.24895, 72.86575], [19.25559, 72.87044], [19.25583, 72.87017],
      [19.25678, 72.87099], [19.26326, 72.87397], [19.26907, 72.87842], [19.27301, 72.88378],
      [19.27648, 72.88919], [19.27794, 72.89047], [19.27916, 72.89102], [19.28219, 72.89167],
      [19.28488, 72.89216], [19.28628, 72.89211], [19.28668, 72.8923], [19.28695, 72.89278],
      [19.28689, 72.89387], [19.2861, 72.8955], [19.28596, 72.89771], [19.28474, 72.90187],
      [19.28487, 72.90309], [19.2858, 72.90421], [19.28711, 72.90459], [19.29416, 72.90531],
      [19.29781, 72.90637], [19.29868, 72.9063], [19.29971, 72.90588], [19.30715, 72.90116],
      [19.30811, 72.90075], [19.31272, 72.89961], [19.31538, 72.89972], [19.31692, 72.89949],
      [19.31813, 72.89867], [19.32032, 72.89613], [19.32325, 72.89488], [19.32568, 72.89359],
      [19.32746, 72.89343], [19.33221, 72.89553], [19.33359, 72.89587], [19.33445, 72.89579],
      [19.33752, 72.89389], [19.34395, 72.89142], [19.34534, 72.89145], [19.34822, 72.8926],
      [19.35222, 72.89384], [19.35322, 72.89377], [19.35669, 72.89283], [19.36285, 72.8926],
      [19.36389, 72.89286], [19.36975, 72.89536], [19.3714, 72.8955], [19.38091, 72.89549],
      [19.38415, 72.89724], [19.38578, 72.89759], [19.3868, 72.89749], [19.38843, 72.89656],
      [19.39337, 72.89195], [19.39827, 72.88498], [19.39913, 72.88442], [19.40124, 72.88351],
      [19.40349, 72.88278], [19.40323, 72.88244], [19.40359, 72.88173], [19.40375, 72.88004],
      [19.4055, 72.8756], [19.40577, 72.87358], [19.40616, 72.87245], [19.40737, 72.86963],
    ],
  },
  {
    // Sion to Thane along the creek.
    id: "eeh",
    name: "Eastern Express Highway",
    points: [
      [19.04074, 72.8626], [19.04251, 72.8638], [19.04533, 72.86496], [19.04619, 72.86561],
      [19.04772, 72.86723], [19.04836, 72.86837], [19.05272, 72.8804], [19.0529, 72.88139],
      [19.05433, 72.88434], [19.05571, 72.88632], [19.05596, 72.88609], [19.05903, 72.89002],
      [19.07434, 72.91212], [19.07628, 72.91421], [19.08667, 72.92298], [19.08995, 72.92448],
      [19.12728, 72.93991], [19.15115, 72.95448], [19.17084, 72.96777], [19.17242, 72.96827],
      [19.17469, 72.96849], [19.17803, 72.96764], [19.18073, 72.96626], [19.1878, 72.96363],
      [19.18796, 72.96396], [19.19162, 72.96316], [19.19552, 72.96256], [19.1971, 72.96256],
      [19.19859, 72.96309], [19.19954, 72.96368], [19.20023, 72.96437], [19.20686, 72.97136],
      [19.20732, 72.97187], [19.2068, 72.97143], [19.20449, 72.96899], [19.20457, 72.96883],
      [19.20462, 72.96871], [19.2113, 72.97578],
    ],
  },
  {
    // The western suburbs to the eastern, round the south of Powai lake.
    id: "jvlr",
    name: "Jogeshwari–Vikhroli Link Road",
    points: [
      [19.14108, 72.85489], [19.13957, 72.86015], [19.13886, 72.86319], [19.13908, 72.86505],
      [19.13975, 72.86759], [19.13957, 72.86921], [19.13912, 72.87065], [19.13847, 72.87171],
      [19.13695, 72.87307], [19.13427, 72.87442], [19.13149, 72.87483], [19.13061, 72.87575],
      [19.12994, 72.87732], [19.12941, 72.88054], [19.1293, 72.88537], [19.12911, 72.8863],
      [19.12615, 72.89045], [19.12521, 72.89232], [19.12467, 72.89406], [19.12458, 72.89565],
      [19.12423, 72.89681], [19.12314, 72.89812], [19.12038, 72.89948], [19.12001, 72.90022],
      [19.11935, 72.903], [19.1193, 72.90374], [19.11966, 72.90517], [19.12092, 72.90779],
      [19.12156, 72.90825], [19.12335, 72.90868], [19.12381, 72.90922], [19.12368, 72.91202],
      [19.12494, 72.91659], [19.12841, 72.91959], [19.12873, 72.92018], [19.12827, 72.9209],
      [19.12619, 72.9217], [19.12557, 72.92279], [19.12511, 72.92547], [19.12469, 72.93608],
      [19.12415, 72.93818], [19.12728, 72.93991],
    ],
  },
  {
    // Santacruz across to Chembur.
    id: "sclr",
    name: "Santacruz–Chembur Link Road",
    points: [
      [19.08035, 72.84698], [19.07546, 72.85525], [19.07446, 72.8606], [19.07185, 72.86154],
      [19.07135, 72.86225], [19.07122, 72.86307], [19.07512, 72.87222], [19.0749, 72.87234],
      [19.07638, 72.87536], [19.07646, 72.87642], [19.07379, 72.88086], [19.07352, 72.88161],
      [19.07344, 72.88285], [19.07288, 72.88386], [19.07178, 72.88506], [19.06742, 72.88862],
      [19.06753, 72.88895], [19.06631, 72.89045], [19.06458, 72.89683], [19.06478, 72.89777],
      [19.06635, 72.90023], [19.05903, 72.89002],
    ],
  },
  {
    // Out of Thane over the creek, down the Mumbra bypass round the Parsik
    // ridge to Shilphata, and on by the pipeline road to Badlapur — the one
    // road that joins the city to the township.
    id: "badlapur",
    name: "Thane–Badlapur corridor",
    points: [
      [19.20023, 72.96437], [19.21099, 72.97562], [19.21176, 72.97686], [19.21178, 72.97845],
      [19.20826, 73.00093], [19.2084, 73.00239], [19.20902, 73.00399], [19.2094, 73.00459],
      [19.21157, 73.00675], [19.2112, 73.00668], [19.2116, 73.00722], [19.2118, 73.00927],
      [19.21415, 73.0117], [19.21411, 73.01217], [19.21076, 73.01635], [19.21004, 73.01676],
      [19.20563, 73.01829], [19.19981, 73.02287], [19.19865, 73.02335], [19.19807, 73.02324],
      [19.19722, 73.0226], [19.19599, 73.02253], [19.19523, 73.02226], [19.19321, 73.02103],
      [19.19158, 73.02034], [19.18867, 73.01992], [19.18775, 73.01956], [19.18502, 73.01908],
      [19.18454, 73.01913], [19.18392, 73.01955], [19.18207, 73.01983], [19.17944, 73.01874],
      [19.17446, 73.01708], [19.17177, 73.01799], [19.17138, 73.01828], [19.17088, 73.01942],
      [19.17133, 73.02087], [19.1713, 73.02161], [19.1711, 73.02198], [19.17051, 73.02235],
      [19.16976, 73.02233], [19.16723, 73.02139], [19.166, 73.02124], [19.16341, 73.02129],
      [19.16305, 73.02157], [19.16234, 73.02274], [19.16014, 73.03012], [19.1563, 73.03222],
      [19.15378, 73.03413], [19.15114, 73.03569], [19.14759, 73.04049], [19.14557, 73.04234],
      [19.14427, 73.04439], [19.14315, 73.04674], [19.14686, 73.05099], [19.16203, 73.07149],
      [19.16308, 73.0738], [19.17217, 73.083], [19.17129, 73.08714], [19.17113, 73.09435],
      [19.17692, 73.11505], [19.17791, 73.11925], [19.18083, 73.13994], [19.18315, 73.16274],
      [19.19064, 73.19786], [19.18406, 73.21404], [19.18063, 73.21974], [19.17917, 73.22168],
      [19.1776, 73.22343], [19.17054, 73.22876], [19.16903, 73.22963], [19.16673, 73.2305],
      [19.16129, 73.23374], [19.16435, 73.23393], [19.16514, 73.23455], [19.16537, 73.23522],
      [19.16591, 73.23566], [19.1668, 73.23556], [19.16749, 73.23504], [19.16957, 73.23574],
      [19.16837, 73.2365], [19.16727, 73.23749], [19.16671, 73.24135], [19.16591, 73.24343],
      [19.16379, 73.25161], [19.16317, 73.25276], [19.16317, 73.25314], [19.16412, 73.25519],
      [19.16417, 73.25594], [19.16296, 73.25706], [19.16069, 73.25737], [19.1594, 73.25898],
      [19.15695, 73.26283], [19.15671, 73.26362], [19.15579, 73.26419], [19.15534, 73.26481],
      [19.15503, 73.26539], [19.15493, 73.26633], [19.15462, 73.26676], [19.15431, 73.26814],
      [19.15307, 73.26961], [19.1536, 73.27346], [19.15258, 73.27361], [19.15099, 73.27445],
      [19.15041, 73.27531], [19.14925, 73.27608], [19.14878, 73.27778], [19.14781, 73.27858],
      [19.14707, 73.28054], [19.14596, 73.28195],
    ],
  },
];

/* ============================================================================
   Places
   ========================================================================== */

/**
 * Where a locality is, by the name a project is filed under — OpenStreetMap's
 * own point for the suburb wherever it has one. The project list is the only
 * source of pins; this registry only says where each name falls, so a
 * project added in /admin appears on the map with no edit here, as long as
 * its locality is one of these. A name that is not listed leaves its project
 * off the map; the cards still carry it.
 *
 * Keyed by the bare locality: "Andheri East", "Andheri (E)" and "andheri"
 * all resolve to `andheri`. See `placeKey`.
 */
export const PLACES: Record<string, LatLon> = {
  colaba: [18.9151, 72.826],
  mumbai: [18.9333, 72.8345], // Fort — the name sits on the old city
  worli: [19.0117, 72.8179],
  "lower parel": [19.003, 72.8303],
  dadar: [19.018, 72.8435],
  mahim: [19.0423, 72.8398],
  sion: [19.043, 72.8625],
  bandra: [19.0617, 72.8498],
  khar: [19.0725, 72.8337],
  santacruz: [19.0844, 72.8373],
  "vile parle": [19.099, 72.847],
  andheri: [19.1159, 72.8542],
  jogeshwari: [19.137, 72.852],
  goregaon: [19.1693, 72.8553],
  malad: [19.187, 72.85],
  kandivali: [19.206, 72.857],
  borivali: [19.23, 72.8585],
  kurla: [19.072, 72.88],
  chembur: [19.0548, 72.898],
  ghatkopar: [19.0842, 72.9186],
  powai: [19.1187, 72.9073],
  vikhroli: [19.108, 72.928],
  bhandup: [19.1463, 72.9339],
  mulund: [19.172, 72.956],
  thane: [19.1943, 72.9702],
  kolshet: [19.2389, 72.9933],
  kalwa: [19.2, 73.004],
  mumbra: [19.1885, 73.0215],
  airoli: [19.1583, 72.9967],
  vashi: [19.0758, 72.9952],
  dombivli: [19.215, 73.087],
  kalyan: [19.24, 73.13],
  ulhasnagar: [19.2236, 73.1672],
  ambernath: [19.2016, 73.2005],
  badlapur: [19.1605, 73.2455],
};

/** The bare, lower-case locality a project's `locality` field resolves to. */
export function placeKey(locality: string): string {
  return locality
    .toLowerCase()
    .replace(/\((e|w|east|west)\)/g, " ")
    .replace(/\b(east|west)\b/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The eight places the sheet is labelled with, and nothing else. A label that
 * shares its place with a pin (`place`) sits beside the pin; one that does
 * not is marked with a small point of its own.
 */
export interface AreaLabel {
  key: string;
  name: string;
  /** Registry key; the label is anchored where that place is. */
  place: string;
  /** Which side of its point the name is set on. */
  side: "left" | "right" | "below";
  /** The city itself is set larger, in the display face. */
  city?: boolean;
}

export const AREAS: AreaLabel[] = [
  { key: "mumbai", name: "Mumbai", place: "mumbai", side: "left", city: true },
  // Set east of its point, over the open ground toward Chembur: on the left it
  // would sit a finger's width under Bandra's pin.
  { key: "sion", name: "Sion", place: "sion", side: "right" },
  { key: "bandra", name: "Bandra", place: "bandra", side: "left" },
  { key: "andheri", name: "Andheri East", place: "andheri", side: "left" },
  { key: "goregaon", name: "Goregaon East", place: "goregaon", side: "left" },
  { key: "bhandup", name: "Bhandup", place: "bhandup", side: "left" },
  { key: "thane", name: "Thane", place: "thane", side: "left" },
  { key: "badlapur", name: "Badlapur", place: "badlapur", side: "below" },
];

/**
 * The part of the sheet the resting camera frames: Colaba to Thane, the sea
 * off Bandra to the country east of Badlapur. Fitted into whatever the host
 * leaves clear of its own furniture.
 */
export const HOME_BOUNDS = {
  north: 19.252,
  south: 18.886,
  west: 72.748,
  east: 73.292,
};

export function homeRect() {
  const nw = project([HOME_BOUNDS.north, HOME_BOUNDS.west]);
  const se = project([HOME_BOUNDS.south, HOME_BOUNDS.east]);
  return { x: nw.x, y: nw.y, w: se.x - nw.x, h: se.y - nw.y };
}

/* ============================================================================
   The roads, resolved to polylines
   ========================================================================== */

export interface RoadLine {
  id: string;
  name: string;
  /** Kilometres on the sheet, in drawing order. */
  points: Point[];
  /** Distance along the road to each point, km — for drawing it in part. */
  along: number[];
  /** Its whole length, km. */
  length: number;
}

let cached: RoadLine[] | null = null;

/** Every road the map draws, built once per page load. */
export function regionRoads(): RoadLine[] {
  if (cached) return cached;

  cached = ROADS.map((road) => {
    const points = road.points.map(project);
    const along = [0];
    for (let i = 1; i < points.length; i++) {
      along.push(
        along[i - 1] +
          Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y),
      );
    }
    return {
      id: road.id,
      name: road.name,
      points,
      along,
      length: along[along.length - 1],
    };
  });

  return cached;
}
