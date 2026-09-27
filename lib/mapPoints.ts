import type { ProjectSlide } from "@/lib/content";
import { PLACES, placeKey, project } from "@/lib/regionMap";

/**
 * The portfolio, placed on the region map.
 *
 * The project list is the only source of pins. Nothing here names a project:
 * each one is filed under its locality, the locality is looked up in the
 * sheet's registry of places (lib/regionMap.ts), and the pin goes there. A
 * project added in Payload appears on the map with no second edit, as long as
 * its locality is one the registry knows.
 */

/** One pin: a locality, and every project the portfolio has there. */
export interface MapPlace {
  /** The registry key — `bandra`, `andheri`. */
  id: string;
  /** The locality as the projects spell it. */
  name: string;
  /** Kilometres on the sheet. */
  x: number;
  y: number;
  projects: ProjectSlide[];
}

/**
 * The project list, folded into one pin per locality.
 *
 * One pin per address, not per project: three buildings in one township are
 * three names at one point on a map of this scale, and three stacked pins
 * would be a worse map and a worse target. The panel and the index carry the
 * names.
 *
 * Returned in registry order — roughly south to north, then east along the
 * corridor — which is also the order the pins are tabbed through and the
 * order the index reads in. Within a place, the projects keep the order the
 * CMS gives them.
 */
export function projectPlaces(slides: ProjectSlide[]): MapPlace[] {
  const byPlace = new Map<string, ProjectSlide[]>();

  for (const slide of slides) {
    const key = placeKey(slide.locality);
    if (!(key in PLACES)) continue;
    const group = byPlace.get(key);
    if (group) group.push(slide);
    else byPlace.set(key, [slide]);
  }

  return Object.keys(PLACES).flatMap((key) => {
    const group = byPlace.get(key);
    if (!group) return [];
    const at = project(PLACES[key]);
    return [
      {
        id: key,
        name: group[0].locality.trim(),
        x: at.x,
        y: at.y,
        projects: group,
      },
    ];
  });
}
