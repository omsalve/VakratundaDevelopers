/**
 * Uploads the bytes for Media rows that point at a Cloudinary asset which was
 * never actually stored.
 *
 *   npm run repair:cloudinary -- --dry-run     inspect, upload nothing
 *   npm run repair:cloudinary
 *
 * WHY THERE ARE ANY. scripts/seed.mts used to pass one shared `context` object
 * to every `payload.create`. Payload hands that object to `req.context` by
 * reference, and @payloadcms/plugin-cloud-storage leaves `skipCloudStorage:
 * true` on it — it deletes that key from the copy its own nested update made,
 * not from the caller's object. So from the second upload onward its
 * afterChange hook returned early: the Media row was written with a Cloudinary
 * URL and a null `cloudinaryPublicId`, no bytes were sent, and nothing threw.
 * The 17 September seed put 1 of 28 files in Cloudinary and reported success.
 * seed.mts now builds a fresh context per call; this repairs what it left.
 *
 * HOW A ROW IS MATCHED BACK TO ITS FILE. The bytes are not on disk anywhere —
 * `disableLocalStorage` is on — so they are re-derived from public/images with
 * the same pipeline seed.mts uses. Two rows have an ambiguous name (`bkc-28`
 * and `dilkhush` each exist under hero/ and projects/), so nothing here guesses:
 * every candidate file is re-encoded both ways and accepted ONLY if it comes
 * out at exactly the byte count, width and height the row already records. A
 * row that matches no candidate, or more than one, is reported and skipped.
 *
 * Re-running is harmless: rows already carrying a public id are left alone, and
 * an upload that is somehow repeated overwrites itself in place.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import pg from "pg";
import sharp from "sharp";

const IMAGES = path.resolve(import.meta.dirname, "../public/images");
const LONG_EDGE = 2560;
const PREFIX = "payload-media";
const DRY_RUN = process.argv.includes("--dry-run");

/** Rows whose name matches no file: seed.mts renamed these on the way in. */
const RENAMED: Record<string, string> = {
  // An article cannot be saved without a photograph, so a post whose shipped
  // card is placeholder art gets one named `placeholder-<slug>`.
  "placeholder-reading-a-rera-registration": "projects/bkc-32.jpg",
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function filesUnder(dir: string, base = ""): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await filesUnder(path.join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out;
}

const stem = (file: string) => path.basename(file).replace(/\.[^.]+$/, "").toLowerCase();

/** seed.mts's encode, both ways — the caller picks by what the row records. */
async function encode(file: string, png: boolean) {
  const input = await readFile(path.join(IMAGES, file));
  const resized = sharp(input).rotate().resize({
    width: LONG_EDGE,
    height: LONG_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  const data = png
    ? await resized.png({ compressionLevel: 9 }).toBuffer()
    : await resized.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  const meta = await sharp(data).metadata();
  return { data, width: meta.width, height: meta.height };
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query(
  `select id, filename, mime_type, filesize, width, height, cloudinary_public_id
     from media order by id`,
);
const broken = rows.filter((r) => !r.cloudinary_public_id);
console.log(`${rows.length} media rows, ${broken.length} without a Cloudinary public id\n`);

const shipped = await filesUnder(IMAGES);
const repaired: string[] = [];
const unmatched: string[] = [];

for (const row of broken) {
  const base = stem(row.filename);
  const png = row.mime_type === "image/png";
  const candidates = RENAMED[base]
    ? [RENAMED[base]!]
    : shipped.filter((file) => stem(file) === base);

  // filesize/width/height are `numeric` columns, which node-pg hands back as
  // strings to keep precision — compare as numbers or nothing ever matches.
  const wantBytes = Number(row.filesize);
  const wantWidth = Number(row.width);
  const wantHeight = Number(row.height);

  const matches: { file: string; data: Buffer }[] = [];
  for (const file of candidates) {
    const { data, width, height } = await encode(file, png);
    if (data.length === wantBytes && width === wantWidth && height === wantHeight) {
      matches.push({ file, data });
    }
  }

  // Several candidates are allowed only when they are the same picture: the
  // shipped tree keeps one file in two places (`hero/bkc-28.png` is a byte copy
  // of `projects/bkc-28.jpg`, extension notwithstanding), so either encodes to
  // the same bytes and the choice cannot be wrong.
  const identical =
    matches.length > 1 && matches.every((m) => m.data.equals(matches[0]!.data));

  if (matches.length !== 1 && !identical) {
    unmatched.push(
      `${row.filename} — ${candidates.length} candidate(s) [${candidates.join(", ")}], ${matches.length} matched ${wantBytes} B / ${wantWidth}×${wantHeight}`,
    );
    continue;
  }

  const { file, data } = matches[0]!;
  const publicId = `${PREFIX}/${base}`;
  if (DRY_RUN) {
    console.log(`  would upload ${file.padEnd(34)} → ${publicId}`);
    repaired.push(row.filename);
    continue;
  }

  const result = await new Promise<{ public_id: string; resource_type: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: "auto", overwrite: true },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Cloudinary upload returned no result"));
            return;
          }
          resolve(uploaded);
        },
      );
      stream.end(data);
    },
  );

  await client.query(
    `update media set cloudinary_public_id = $1, cloudinary_resource_type = $2 where id = $3`,
    [result.public_id, result.resource_type, row.id],
  );
  console.log(
    `  ${file.padEnd(34)} → ${result.public_id} (${(data.length / 1048576).toFixed(1)} MB)`,
  );
  repaired.push(row.filename);
}

await client.end();

console.log(`\n${DRY_RUN ? "Would repair" : "Repaired"} ${repaired.length} of ${broken.length}`);
if (unmatched.length > 0) {
  console.log(`\nNOT repaired — resolve by hand:`);
  for (const line of unmatched) console.log(`  ${line}`);
}
process.exit(unmatched.length > 0 ? 1 : 0);
