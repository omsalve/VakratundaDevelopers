/**
 * Puts the October 2026 gallery into the CMS: the new photographs into the
 * media library, the revamped /experiences page into its global, and two
 * frames of the landing page's spread swapped for the new ones.
 *
 *   npm run update:imagery              — dry run: prints every change, writes nothing
 *   npm run update:imagery -- --apply   — uploads and writes them
 *
 * WHY A SCRIPT. These globals were seeded and then edited, so the database
 * holds an editor's values and a filled field wins over the code. `npm run
 * seed` never overwrites a filled field, so it cannot make this change; this
 * makes it, and only where the field still holds exactly what was there when
 * it was written. Anything an editor has changed since is left alone and
 * reported.
 *
 *   1. media             — the five new renders (gallery/bedroom, balcony,
 *                          skyline-gym, roof-lounge, roof-pool) and the pool
 *                          at dusk (gallery/pool169), uploaded once each;
 *                          an upload already in the library is reused by
 *                          its filename, as the seed does.
 *   2. experiences-page  — the opening photograph; the six postcards in place
 *                          of the four moments; the rack of every other
 *                          space; the standfirst and SEO line that named the
 *                          old moments. All of it from lib/pages/living.ts.
 *   3. home              — in the spread ("Spaces you don't just see"): the
 *                          frame under "Interior, and out" becomes the bedroom
 *                          and the frame under "Exterior" becomes the roof
 *                          lounge, whose note moves from the foot of the tower
 *                          to the roof. Nothing else on the landing page moves.
 *
 * Revalidation is skipped on every write, as in the seed: the deployed site
 * picks the change up on its 60-second timer.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload, type Payload } from "payload";
import sharp from "sharp";

import config from "../payload.config";
import type { ImageAsset } from "../lib/content";
import { experiencesPage } from "../lib/pages";
import { SITE_IMAGES_BASE, siteImage } from "../lib/siteImages";

const APPLY = process.argv.includes("--apply");
const IMAGES = path.resolve(import.meta.dirname, "../public/images");
const LONG_EDGE = 2560;

type Json = Record<string, unknown>;

/** A fresh context per call — see the note on `context` in scripts/seed.mts. */
const context = () => ({ disableRevalidate: true });

/* ------------------------------------------------------------ the media */

/** The library's filename for a shipped photograph, as the seed names it. */
function filenameOf(asset: ImageAsset): string {
  const file = asset.src.slice(SITE_IMAGES_BASE.length + 1);
  return `${path.basename(file).replace(/\.[^.]+$/, "").toLowerCase()}.jpg`;
}

async function source(asset: ImageAsset): Promise<Buffer> {
  const file = asset.src.slice(SITE_IMAGES_BASE.length + 1);
  const local = path.join(IMAGES, file);
  if (existsSync(local)) return readFile(local);
  const response = await fetch(siteImage(file));
  if (!response.ok) throw new Error(`No source for ${file}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const library = new Map<string, number>();
let pendingId = -1;

/**
 * The library id for a shipped photograph: the existing upload of the same
 * filename, or a new one. In a dry run a missing file gets a negative
 * placeholder id, so the plan can still be printed in full.
 */
async function mediaFor(payload: Payload, asset: ImageAsset): Promise<number> {
  const filename = filenameOf(asset);
  const known = library.get(filename);
  if (known !== undefined) return known;

  const { docs } = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  });
  if (docs[0]) {
    library.set(filename, docs[0].id);
    return docs[0].id;
  }

  if (!APPLY) {
    console.log(`  media: would upload ${filename}`);
    library.set(filename, pendingId);
    return pendingId--;
  }

  const data = await sharp(await source(asset))
    .rotate()
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  const doc = await payload.create({
    collection: "media",
    data: { alt: asset.alt },
    file: { data, mimetype: "image/jpeg", name: filename, size: data.length },
    context: context(),
  });
  console.log(`  media: uploaded ${filename} (#${doc.id}, ${(data.length / 1048576).toFixed(1)} MB)`);
  library.set(filename, doc.id);
  return doc.id;
}

/* ------------------------------------------------------------- reporting */

let changes = 0;
const skipped: string[] = [];

function change(where: string, from: unknown, to: unknown) {
  if (JSON.stringify(from) === JSON.stringify(to)) return;
  changes++;
  console.log(`  ${where}`);
  console.log(`    − ${JSON.stringify(from)}`);
  console.log(`    + ${JSON.stringify(to)}`);
}

const idOf = (value: unknown) =>
  value && typeof value === "object" ? (value as { id?: unknown }).id : value;

/* ------------------------------------------------- the experiences page */

/** What the global held before the revamp, field by field. */
const OLD = {
  standfirst:
    "A home is judged by everyday life, not by its launch render. So that is what we design for: the walk in, the play downstairs, the terrace shared with neighbours.",
  seoDescription:
    "Homes designed around everyday life — the arrival, the play space, the terrace and the rooms a community shares — and what comes standard in every Vakratunda home.",
  moments: ["Arrival", "Play", "Leisure", "Community"],
};

async function updateExperiences(payload: Payload) {
  console.log("\nexperiences-page");
  const page = experiencesPage;
  const data = {
    ...((await payload.findGlobal({ slug: "experiences-page", depth: 0 })) as unknown as Json),
  };
  const before = changes;

  const hero = (data.hero ?? {}) as Json;
  if (!hero.image && page.hero.image) {
    const id = await mediaFor(payload, page.hero.image);
    change("hero.image", null, `${filenameOf(page.hero.image)} (#${id})`);
    hero.image = id;
  }
  if (hero.standfirst === OLD.standfirst) {
    change("hero.standfirst", hero.standfirst, page.hero.standfirst);
    hero.standfirst = page.hero.standfirst;
  } else if (hero.standfirst !== page.hero.standfirst) {
    skipped.push("experiences-page hero.standfirst (edited since)");
  }
  data.hero = hero;

  const seo = (data.seo ?? {}) as Json;
  if (seo.description === OLD.seoDescription) {
    change("seo.description", seo.description, page.seo.description);
    seo.description = page.seo.description;
    data.seo = seo;
  }

  // The four moments become the six postcards — only if the four are still
  // exactly the four.
  const day = (data.day ?? {}) as Json;
  const eyebrows = ((day.items ?? []) as Json[]).map((item) => item.eyebrow);
  if (JSON.stringify(eyebrows) === JSON.stringify(OLD.moments)) {
    const figures: Json[] = [];
    for (const figure of page.day.figures) {
      figures.push({ image: await mediaFor(payload, figure), caption: figure.caption ?? null });
    }
    change("day.label", day.label, page.day.label);
    change(
      "day.heading",
      day.heading,
      { before: page.day.heading.before, swash: page.day.heading.swash, after: page.day.heading.after },
    );
    change("day.standfirst", day.standfirst, page.day.standfirst);
    change(
      "day.items",
      eyebrows,
      page.day.items.map((item) => item.eyebrow),
    );
    change(
      "day.figures",
      ((day.figures ?? []) as Json[]).map((row) => row.image),
      figures.map((row) => row.image),
    );
    data.day = {
      ...day,
      label: page.day.label,
      heading: {
        before: page.day.heading.before ?? null,
        swash: page.day.heading.swash,
        after: page.day.heading.after ?? null,
      },
      standfirst: page.day.standfirst,
      figures,
      items: page.day.items.map((item) => ({
        eyebrow: item.eyebrow ?? null,
        title: item.title,
        body: item.body,
      })),
    };
  } else if (JSON.stringify(eyebrows) !== JSON.stringify(page.day.items.map((i) => i.eyebrow))) {
    skipped.push(`experiences-page day (moments are now ${JSON.stringify(eyebrows)})`);
  }

  // The rack: a new field, so it is filled only while it is empty.
  const spaces = (data.spaces ?? {}) as Json;
  if (!((spaces.figures ?? []) as Json[]).length) {
    const figures: Json[] = [];
    for (const figure of page.spaces.figures) {
      figures.push({
        image: await mediaFor(payload, figure),
        name: figure.name,
        caption: figure.caption ?? null,
      });
    }
    change("spaces", null, page.spaces.figures.map((figure) => figure.name));
    data.spaces = {
      label: page.spaces.label,
      heading: {
        before: page.spaces.heading.before ?? null,
        swash: page.spaces.heading.swash,
        after: page.spaces.heading.after ?? null,
      },
      standfirst: page.spaces.standfirst,
      figures,
    };
  }

  if (changes === before) {
    console.log("  nothing to change");
    return;
  }
  if (APPLY) {
    for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete data[key];
    await payload.updateGlobal({
      slug: "experiences-page",
      data: data as never,
      depth: 0,
      context: context(),
    });
  }
}

/* ----------------------------------------------------- the landing page */

const GARDEN_NOTE = {
  from: "Dusk at the foot of the tower, lit with the same care as the homes above it.",
  to: "Dusk on the roof, lit with the same care as the homes below it.",
};

async function updateHome(payload: Payload) {
  console.log("\nhome — the spread");
  const data = {
    ...((await payload.findGlobal({ slug: "home", depth: 0 })) as unknown as Json),
  };
  const atmosphere = { ...((data.atmosphere ?? {}) as Json) };
  const before = changes;

  const [bedroom, lounge] = [page("bedroom.jpg"), page("roof-lounge.jpg")];
  const { docs: was } = await payload.find({
    collection: "media",
    where: { filename: { in: ["terrace169.png", "bar.jpg"] } },
    depth: 0,
    limit: 2,
  });
  const terraceId = was.find((doc) => doc.filename === "terrace169.png")?.id;
  const barId = was.find((doc) => doc.filename === "bar.jpg")?.id;

  // "Interior, and out" — the open-air terrace that sat under it becomes the
  // bedroom, whose wall of glass the note already describes.
  if (terraceId !== undefined && idOf(atmosphere.glass) === terraceId) {
    const id = await mediaFor(payload, bedroom);
    change("atmosphere.glass", `terrace169.png (#${terraceId})`, `bedroom.jpg (#${id})`);
    atmosphere.glass = id;
  } else {
    skipped.push(`home atmosphere.glass (now #${String(idOf(atmosphere.glass))})`);
  }

  // "Exterior" — the lounge interior that sat under it becomes the roof lounge.
  if (barId !== undefined && idOf(atmosphere.garden) === barId) {
    const id = await mediaFor(payload, lounge);
    change("atmosphere.garden", `bar.jpg (#${barId})`, `roof-lounge.jpg (#${id})`);
    atmosphere.garden = id;
    if (atmosphere.gardenNote === GARDEN_NOTE.from) {
      change("atmosphere.gardenNote", GARDEN_NOTE.from, GARDEN_NOTE.to);
      atmosphere.gardenNote = GARDEN_NOTE.to;
    } else {
      skipped.push("home atmosphere.gardenNote (edited since)");
    }
  } else {
    skipped.push(`home atmosphere.garden (now #${String(idOf(atmosphere.garden))})`);
  }

  if (changes === before) {
    console.log("  nothing to change");
    return;
  }
  if (APPLY) {
    data.atmosphere = atmosphere;
    for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete data[key];
    await payload.updateGlobal({ slug: "home", data: data as never, depth: 0, context: context() });
  }
}

/** One of the experiences page's own photographs, by its library filename. */
function page(filename: string): ImageAsset {
  const all = [
    experiencesPage.hero.image,
    ...experiencesPage.day.figures,
    ...experiencesPage.spaces.figures,
  ].filter((asset): asset is ImageAsset => Boolean(asset));
  const asset = all.find((candidate) => filenameOf(candidate) === filename);
  if (!asset) throw new Error(`${filename} is not one of the experiences page's photographs`);
  return asset;
}

/* ------------------------------------------------------------------- run */

const payload = await getPayload({ config: await config });

console.log(APPLY ? "Applying." : "Dry run — nothing is written.");
await updateExperiences(payload);
await updateHome(payload);

if (skipped.length > 0) {
  console.log(`\nLeft alone, because an editor has changed them since:\n  ${skipped.join("\n  ")}`);
}
console.log(
  changes === 0
    ? "\nNothing to change."
    : APPLY
      ? `\nWrote ${changes} change${changes === 1 ? "" : "s"}.`
      : `\nDry run: ${changes} change${changes === 1 ? "" : "s"} found. Re-run with --apply to write them.`,
);
process.exit(0);
