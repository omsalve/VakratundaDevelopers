/**
 * Generates the placeholder images the site ships with.
 *
 *   node scripts/make-placeholders.mjs
 *
 * Each file is written at its FINAL path, format and pixel size, so replacing
 * one with real photography is a straight file swap — no code change, no
 * layout shift, no re-crop.
 *
 * MANIFEST is the single source of truth: it drives this script and is
 * reproduced in README.md for whoever is shooting or sourcing the assets.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images");

const NAVY = "#161e41";
const NAVY_DEEP = "#0c1230";
const ROSE = "#e4a8a1";

/** @type {{path:string,w:number,h:number,format:'jpeg'|'png',intent:string,blank?:boolean}[]} */
const MANIFEST = [
  {
    path: "journey.jpg",
    w: 2400,
    h: 4800,
    format: "jpeg",
    // The only image in the opening section. Everything the hero and the
    // impact figures sit over is one frame of this file.
    blank: true,
    intent:
      "The opening descent, as ONE tall continuous frame — 1:2 portrait, framed as three stacked viewports. The section scrolls it from its top edge to its bottom edge over its whole readable length, so nothing in it may repeat and it must read as a single unbroken image. Mumbai at dusk: sky at the top, where the brand line sits; down through the skyline; city at the bottom. Sits at 46% opacity behind type the whole way down, so favour a dark, low-contrast frame.",
  },
  {
    path: "concept.jpg",
    w: 1600,
    h: 2000,
    format: "jpeg",
    intent:
      "A delivered Vakratunda facade at dusk, shot from street level. Portrait 4:5.",
  },
  {
    path: "og.jpg",
    w: 1200,
    h: 630,
    format: "jpeg",
    intent: "Social share card. Wordmark on navy, safe margins all round.",
  },
];

/** Project cards, all 4:5 portrait. Ids match lib/content.ts. */
const PROJECTS = [
  ["bkc-9", "BKC 9, Bandra"],
  ["godrej-skygarden", "Godrej Skygarden, Badlapur"],
  ["bkc-32", "BKC 32, Bandra"],
  ["parijat", "Parijat, Kandivali"],
  ["kolshet", "Kolshet Road, Thane"],
  ["badlapur-east", "Badlapur East"],
  ["bkc-28", "BKC 28, Bandra"],
  ["godrej-vihaa", "Godrej Vihaa, Badlapur"],
  ["dilkhush", "Dilkhush, Andheri"],
  ["dilbahar", "Dilbahar, Santacruz"],
  ["corporate-park", "Corporate Park, Goregaon"],
  ["royale", "Vakratunda Royale, Sion"],
  ["palace", "Vakratunda Palace, Bhandup"],
  ["residency", "Vakratunda Residency, Thane"],
];

for (const [id, label] of PROJECTS) {
  MANIFEST.push({
    path: `projects/${id}.jpg`,
    w: 1200,
    h: 1500,
    format: "jpeg",
    intent: `${label} — project render or photograph, portrait 4:5.`,
  });
}

function svgFor({ w, h, format, blank }) {
  const unit = Math.min(w, h) / 100;
  const transparent = format === "png";
  const inset = unit * 6;

  // `blank` files are stand-ins for artwork that is being supplied, not
  // sourced: they ship as plain ground so nothing on the page reads as
  // placeholder line-work while it is waited on.
  if (blank) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY_DEEP}"/>
      <stop offset="0.5" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#ground)"/>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="hatch" width="${unit * 6}" height="${unit * 6}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="${unit * 6}" stroke="${ROSE}" stroke-width="1" opacity="0.18"/>
    </pattern>
  </defs>

  ${transparent ? "" : `<rect width="${w}" height="${h}" fill="${NAVY_DEEP}"/>`}
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="${transparent ? "none" : NAVY}"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="url(#hatch)"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
        fill="none" stroke="${ROSE}" stroke-width="${Math.max(2, unit * 0.35)}" opacity="0.8"/>
  <line x1="${inset}" y1="${inset}" x2="${w - inset}" y2="${h - inset}" stroke="${ROSE}" stroke-width="1" opacity="0.35"/>
  <line x1="${w - inset}" y1="${inset}" x2="${inset}" y2="${h - inset}" stroke="${ROSE}" stroke-width="1" opacity="0.35"/>

</svg>`;
}

async function main() {
  await mkdir(join(OUT, "projects"), { recursive: true });

  for (const entry of MANIFEST) {
    const svg = Buffer.from(svgFor(entry));
    const target = join(OUT, entry.path);
    await mkdir(dirname(target), { recursive: true });

    const pipeline = sharp(svg, { density: 96 });
    const buffer =
      entry.format === "png"
        ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
        : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    await writeFile(target, buffer);
    console.log(
      `  ${entry.path.padEnd(34)} ${String(entry.w).padStart(4)}×${String(entry.h).padEnd(5)} ${(buffer.length / 1024).toFixed(0)} KB`,
    );
  }

  console.log(`\n${MANIFEST.length} placeholders written to public/images/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
