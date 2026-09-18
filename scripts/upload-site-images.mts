/**
 * Uploads the site's shipped photographs to Cloudinary, under `site/`.
 *
 *   npm run upload:site-images              upload what is not there yet
 *   npm run upload:site-images -- --force   re-upload every one
 *   npm run upload:site-images -- --dry-run list, upload nothing
 *
 * public/images is gitignored: photographs are managed in the CMS. The fallback
 * content still names one for every spot (lib/siteImages.ts), and this is how
 * those files get to where the fallback points. The list is read off the
 * source — every `siteImage("…")`, every `${SITE_IMAGES_BASE}/…` and every
 * literal `/image/upload/site/…` URL — so a path is uploaded exactly when
 * something renders it.
 *
 * Each file is read from public/images and normalised as scripts/seed.mts does
 * it — EXIF rotation applied, long edge capped at 2560px — but keeps its own
 * format, so the extension in the URL still describes the file.
 */

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES = path.join(ROOT, "public/images");
const SCAN = ["app", "components", "lib", "scripts"];
const LONG_EDGE = 2560;
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const REFERENCES = [
  /siteImage\("([^"]+)"\)/g,
  /SITE_IMAGES_BASE\}\/([^`]+)`/g,
  /\/image\/upload\/site\/([^"')\s`]+)/g,
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function sourcesUnder(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sourcesUnder(full)));
    else if (/\.(ts|tsx|mts|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function referenced(): Promise<string[]> {
  const files = new Set<string>();
  for (const dir of SCAN) {
    for (const file of await sourcesUnder(path.join(ROOT, dir))) {
      const text = await readFile(file, "utf8");
      for (const pattern of REFERENCES) {
        for (const match of text.matchAll(pattern)) {
          // Skip template placeholders and elided examples in comments.
          if (/^[\w\- ./]+\.\w+$/.test(match[1])) files.add(match[1]);
        }
      }
    }
  }
  return [...files].sort();
}

async function exists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch {
    return false;
  }
}

async function normalise(input: Buffer): Promise<Buffer> {
  const { format } = await sharp(input).metadata();
  const resized = sharp(input).rotate().resize({
    width: LONG_EDGE,
    height: LONG_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  return format === "png"
    ? resized.png({ compressionLevel: 9 }).toBuffer()
    : resized.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

async function main() {
  const files = await referenced();
  const missing: string[] = [];
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const publicId = `site/${file.replace(/\.[^.]+$/, "")}`;
    const local = path.join(IMAGES, file);
    if (!existsSync(local)) {
      missing.push(file);
      continue;
    }
    if (!FORCE && (await exists(publicId))) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      console.log(`would upload ${file}`);
      continue;
    }

    const data = await normalise(await readFile(local));
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { public_id: publicId, resource_type: "image", overwrite: true, invalidate: true },
          (error) => (error ? reject(error) : resolve()),
        )
        .end(data);
    });
    uploaded++;
    console.log(`uploaded ${file} (${(data.length / 1048576).toFixed(1)} MB)`);
  }

  console.log(`\n${files.length} referenced · ${uploaded} uploaded · ${skipped} already there`);
  if (missing.length > 0) {
    console.log(`not in public/images, so not uploaded:\n  ${missing.join("\n  ")}`);
  }
}

await main();
