import type { MapImage, MapPoint } from "@/components/LocationMap";
import type { ProjectSlide } from "@/lib/content";

/**
 * The portfolio, placed on the metropolitan map.
 *
 * Two things live here and nothing else: the map file's own facts, and where
 * each locality sits on it. The copy in the panels is not authored here — it
 * is derived from the same project list the section already renders, so a
 * project added in Payload appears on the map without a second edit.
 */

/** public/images/maps.png — the navy-and-rose plate of the region. */
export const MUMBAI_MAP: MapImage = {
  src: "/images/maps.png",
  alt: "Map of the Mumbai metropolitan region, from Mira Bhayandar south to the island city and east through Thane to Badlapur",
  width: 3344,
  height: 1880,
};

/**
 * Where each locality sits on maps.png, in per cent of the SOURCE IMAGE —
 * never of whatever box it is painted into. Read off the plate itself, and
 * nudged clear of its printed place names so a pin never lands on a letter.
 *
 * Declared roughly north to south, then east: this is also the order the pins
 * are tabbed through.
 *
 * Adding a project in a locality that is not listed here simply leaves it off
 * the map — the card grid below still carries it.
 */
export const MUMBAI_PLACES: Record<string, { x: number; y: number }> = {
  Kandivali: { x: 29.5, y: 23.9 },
  Goregaon: { x: 33.4, y: 39.6 },
  Andheri: { x: 30.1, y: 47.6 },
  Santacruz: { x: 29.5, y: 53.2 },
  Bandra: { x: 30.8, y: 59.6 },
  Sion: { x: 32.4, y: 64.8 },
  Bhandup: { x: 41.4, y: 41.5 },
  Thane: { x: 46.4, y: 30.3 },
  Badlapur: { x: 82.5, y: 50.5 },
};

/**
 * How many project photographs a panel's picture strip carries. Three across
 * a 20rem panel are still photographs; a fourth is a texture. A locality with
 * more sends its first three and the list underneath names the rest.
 */
const PANEL_SHOTS = 3;

/**
 * The project list, folded into one pin per locality.
 *
 * One pin per address, not per project: three towers in the BKC corridor are
 * three names at one point on a map of this scale, and three overlapping pins
 * would be a worse map and a worse target. The panel carries the names — and
 * a strip of their photographs above them, so a point on the map is answered
 * with the building rather than only with its name.
 */
export function projectMapPoints(slides: ProjectSlide[]): MapPoint[] {
  const byPlace = new Map<string, ProjectSlide[]>();

  for (const slide of slides) {
    if (!(slide.locality in MUMBAI_PLACES)) continue;
    const group = byPlace.get(slide.locality);
    if (group) group.push(slide);
    else byPlace.set(slide.locality, [slide]);
  }

  // Registry order, not slide order — see the note on MUMBAI_PLACES.
  return Object.entries(MUMBAI_PLACES).flatMap(([place, coords]) => {
    const group = byPlace.get(place);
    if (!group) return [];

    return [
      {
        id: place.toLowerCase(),
        ...coords,
        eyebrow: `${String(group.length).padStart(2, "0")} ${
          group.length === 1 ? "Project" : "Projects"
        }`,
        title: place,
        // A single project has a line of its own worth reading. A locality
        // with several does not, and the list below says it better.
        description: group.length === 1 ? group[0].blurb : undefined,
        // A slide whose card image never resolved carries an empty src, and
        // an empty box is worse than a shorter strip — so it is dropped here
        // rather than reserved for.
        media: group
          .filter((slide) => Boolean(slide.image.src))
          .slice(0, PANEL_SHOTS)
          .map((slide) => ({
            id: slide.id,
            src: slide.image.src,
            alt: slide.image.alt,
            width: slide.image.width,
            height: slide.image.height,
          })),
        items: group.map((slide) => ({
          // Two projects can share a name (a delivered phase and its
          // successor); the slide id is what is actually unique.
          id: slide.id,
          label: slide.name,
          note: slide.status,
        })),
      },
    ];
  });
}
