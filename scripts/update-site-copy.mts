/**
 * Puts three copy changes into the CMS, where the live site reads them.
 *
 *   npm run update:copy              — dry run: prints every change, writes nothing
 *   npm run update:copy -- --apply   — writes them
 *
 * WHY A SCRIPT. These fields were seeded from lib/content.ts and lib/pages, so
 * the database still holds the OLD values, and a filled field wins over the
 * code. The same edits were made to the code; this makes them in the CMS.
 *
 *   1. home.nav.links          — "Home" (→ /) added first, unless a link to /
 *                                is already there.
 *   2. "Dhawal" → "Dhaval"     — in every global, article, project and media
 *                                item (names and portrait alt text).
 *   3. experiences-page        — the clock times and the day removed from the
 *                                four moments, and the page's copy tightened.
 *                                Only a field that still holds the exact old
 *                                wording is changed, so anything an editor has
 *                                already rewritten is left alone.
 *
 * Revalidation is skipped on every write, as in the seed: the deployed site
 * picks the change up on its 60-second timer; restart `next dev` to see it
 * locally.
 */

import { getPayload, type CollectionSlug, type GlobalSlug } from "payload";

import config from "../payload.config";

const APPLY = process.argv.includes("--apply");

type Json = Record<string, unknown>;
type Change = { path: string; from: unknown; to: unknown };

/** experiences-page: old wording → new, exact strings only. */
const EXPERIENCES: Record<string, string> = {
  // seo.description
  "Where homes don't just exist, they belong — the morning walk out, the hour after school, the terrace at eight, and what comes standard in every Vakratunda home.":
    "Homes designed around everyday life — the arrival, the play space, the terrace and the rooms a community shares — and what comes standard in every Vakratunda home.",
  // hero.standfirst
  "A home isn't measured by its launch render, but by its ordinary evenings. This is what we design for: the walk in, the hour after school, the terrace at eight.":
    "A home is judged by everyday life, not by its launch render. So that is what we design for: the walk in, the play downstairs, the terrace shared with neighbours.",
  // day
  "A day, in order": "Moments we design for",
  "Four moments we design for by name, because long after the keys are handed over, these are the moments a family measures home by.":
    "Four moments we design for by name — long after handover, they are how a family measures home.",
  "The deck, as afternoon slows.": "The landscaped deck, shaded and planted.",
  "The sky deck, at golden hour.": "The sky deck, open to the city.",
  "07:40": "Arrival",
  "The walk out": "The walk in",
  "A lobby that welcomes rather than merely connects, lifts sized for the tower's real morning rush, and a drop-off where the school run and a delivery van never share the same line.":
    "A lobby that welcomes, lifts sized for the real rush, and a drop-off where the school run and deliveries never share a lane.",
  "16:15": "Play",
  "The hour after school": "Play, within sight of home",
  "Play space within sight of the homes above it, shaded through the hottest hours, and surfaced so a fall is only a fall — child-safe by design.":
    "Play areas overlooked by the homes above, shaded from the hottest sun and surfaced so a fall is only a fall — child-safe by design.",
  "20:00": "Leisure",
  "The terrace at eight": "A terrace made for living",
  "The deck isn't just for golden-hour photographs, it's planted to be lived in after dark — lit low, screened from the road, and close enough to the lifts that going up needs no plan.":
    "Planted, softly lit and screened from the road — a deck built to be lived on, not just photographed, and only a lift ride from home.",
  Saturday: "Community",
  "Common spaces sized for the days a building truly comes alive — a society meeting, a festival, a birthday that spills out of a home — because that is when a community is made.":
    "Common spaces sized for the days a building comes alive — society meetings, festivals, birthdays that spill out of a home. That is how a community is made.",
  // standard
  "The foundations of every home — decided once, at the drawing board, and built in so they never need adding later.":
    "Decided at the drawing board and built in from the start — never added later.",
  "Wings turned to the sun path and the monsoon wind, not the plot boundary, so every living room is filled with light, not heat.":
    "Wings turned to the sun and the monsoon wind, not the plot line — so living rooms fill with light, not heat.",
  "Cross-ventilation as a plan rule": "Cross-ventilation as a rule",
  "Openings on two sides wherever the plan allows, and lobbies that breathe rather than trap heat — the most natural cooling a home can have.":
    "Openings on two sides wherever the plan allows, and lobbies that breathe instead of trapping heat — the most natural cooling there is.",
  "Planting that is chosen to thrive": "Planting chosen to thrive",
  "Species selected for a Mumbai monsoon and a Mumbai April, with irrigation and soil depth planned at the podium stage, so every garden takes root for good.":
    "Species picked for Mumbai's monsoon and summer heat, with irrigation and soil depth planned at the podium stage — so gardens take root for good.",
  "Safety, always — drawn first": "Safety, drawn first",
  "Fire tender access, refuge floors and hydrant runs are set before the home layouts, in strict adherence to IS codes and NBC — safety is never an afterthought.":
    "Fire-tender access, refuge floors and hydrant lines are planned before the homes, to IS codes and the NBC. Safety is never an afterthought.",
  // coda
  "Built to last, designed for life — each of these is drawn in from the start, which is why our homes still feel right, five decades on.":
    "Built to last, designed for life — which is why our homes still feel right, five decades on.",
};

function rewriteString(value: string, slug: string): string {
  if (slug === "experiences-page" && value in EXPERIENCES) {
    return EXPERIENCES[value]!;
  }
  return value.replaceAll("Dhawal", "Dhaval").replaceAll("dhawal", "dhaval");
}

/** Rewrites a document in place and records what moved. */
function rewrite(node: unknown, path: string[], slug: string, changes: Change[]): unknown {
  if (typeof node === "string") {
    const next = rewriteString(node, slug);
    if (next !== node) changes.push({ path: path.join("."), from: node, to: next });
    return next;
  }
  if (Array.isArray(node)) {
    return node.map((item, i) => rewrite(item, [...path, String(i)], slug, changes));
  }
  if (node && typeof node === "object") {
    const obj = node as Json;
    // The day's heading, "From the *morning* walk to the last light".
    if (
      slug === "experiences-page" &&
      obj.before === "From the " &&
      obj.swash === "morning" &&
      obj.after === " walk to the last light"
    ) {
      changes.push({
        path: path.join("."),
        from: "From the *morning* walk to the last light",
        to: "From the front door to the *terrace*",
      });
      obj.before = "From the front door to the ";
      obj.swash = "terrace";
      obj.after = "";
      return obj;
    }
    for (const key of Object.keys(obj)) {
      obj[key] = rewrite(obj[key], [...path, key], slug, changes);
    }
    return obj;
  }
  return node;
}

/** The masthead's Home link, first, unless a link to / is already there. */
function addHome(data: Json, changes: Change[]) {
  const nav = data.nav as { links?: { label: string; href: string }[] } | undefined;
  const links = nav?.links;
  if (!nav || !Array.isArray(links)) return;
  if (links.some((link) => link.href === "/")) return;
  const home = { label: "Home", href: "/" };
  nav.links = [home, ...links];
  changes.push({
    path: "nav.links",
    from: links.map((link) => link.label),
    to: nav.links.map((link) => link.label),
  });
}

function report(where: string, changes: Change[]) {
  console.log(`\n${where}: ${changes.length} change${changes.length === 1 ? "" : "s"}`);
  for (const change of changes) {
    console.log(`  ${change.path}`);
    console.log(`    − ${JSON.stringify(change.from)}`);
    console.log(`    + ${JSON.stringify(change.to)}`);
  }
}

const context = () => ({ disableRevalidate: true });
const payload = await getPayload({ config: await config });
let total = 0;

for (const global of payload.config.globals) {
  const slug = global.slug as GlobalSlug;
  const data = { ...((await payload.findGlobal({ slug, depth: 0 })) as unknown as Json) };
  for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete data[key];
  const changes: Change[] = [];
  if (slug === "home") addHome(data, changes);
  rewrite(data, [], slug, changes);
  if (changes.length === 0) continue;
  total += changes.length;
  report(`global ${slug}`, changes);
  if (APPLY) {
    await payload.updateGlobal({ slug, data: data as never, depth: 0, context: context() });
  }
}

for (const collection of ["posts", "projects", "media"] as CollectionSlug[]) {
  const { docs } = await payload.find({
    collection,
    depth: 0,
    limit: 0,
    pagination: false,
    draft: false,
  });
  for (const doc of docs as unknown as Json[]) {
    const changes: Change[] = [];
    const data: Json = {};
    for (const [key, value] of Object.entries(doc)) {
      // Media file names and URLs are storage keys, not copy.
      if (["id", "createdAt", "updatedAt", "url", "filename", "thumbnailURL", "sizes"].includes(key)) {
        continue;
      }
      const before = changes.length;
      const next = rewrite(structuredClone(value), [key], collection, changes);
      if (changes.length > before) data[key] = next;
    }
    if (changes.length === 0) continue;
    total += changes.length;
    report(`${collection} ${String(doc.slug ?? doc.filename ?? doc.id)}`, changes);
    if (APPLY) {
      await payload.update({
        collection,
        id: doc.id as string | number,
        data: data as never,
        depth: 0,
        context: context(),
      });
    }
  }
}

console.log(
  total === 0
    ? "\nNothing to change."
    : APPLY
      ? `\nWrote ${total} change${total === 1 ? "" : "s"}.`
      : `\nDry run: ${total} change${total === 1 ? "" : "s"} found, nothing written. Re-run with --apply to write them.`,
);
process.exit(0);
