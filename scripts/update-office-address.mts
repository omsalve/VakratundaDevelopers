/**
 * Writes the office's full postal address and the new inbox into the CMS.
 *
 *   npm run update:address              — dry run: prints every change, writes nothing
 *   npm run update:address -- --apply   — writes them
 *
 * WHY A SCRIPT. As with update-contact-details.mts: the database holds the
 * values the code shipped with, and a filled field wins over the code, so the
 * matching edits in lib/content.ts and lib/pages change nothing a visitor sees
 * until the CMS is changed too.
 *
 *   the office's address lines
 *     → 2505, Prestige Turf Towers, Turf Estate
 *       315, Shakti Mills Ln, Mahalakshmi
 *       Mumbai, Maharashtra 400011, India
 *   Mahalaxmi                           → Mahalakshmi (everywhere)
 *   info@vakratundagroup.com            → rmo@vakratundagroup.com
 *
 * It also carries what update-contact-details.mts was written to do but never
 * wrote: the CMS still held the Bandra East office ("Vakratunda CHS Ltd,
 * Bandra East", "Mumbai — 400 051", the office "in Bandra East") and
 * info@vakratundagroup.com, and those go straight to the new values here.
 * "Bandra East" as a project's suburb is left alone.
 *
 * The contact form's recipient is not here: it is ENQUIRY_TO in the
 * environment, and stays the Gmail inbox.
 *
 * Revalidation is skipped on every write, as in the seed: the deployed site
 * picks the change up on its 60-second timer; restart `next dev` to see it
 * locally.
 */

import { getPayload, type CollectionSlug, type GlobalSlug } from "payload";

import config from "../payload.config";

const APPLY = process.argv.includes("--apply");

// rma@ was a typo for rmo@ that briefly reached the CMS.
const OLD_EMAILS = ["info@vakratundagroup.com", "rma@vakratundagroup.com"];
const NEW_EMAIL = "rmo@vakratundagroup.com";
const NEW_POSTAL =
  "2505, Prestige Turf Towers, Turf Estate, 315, Shakti Mills Ln, Mahalakshmi, Mumbai, Maharashtra 400011, India";

const NEW_LINES = [
  "2505, Prestige Turf Towers, Turf Estate",
  "315, Shakti Mills Ln, Mahalakshmi",
  "Mumbai, Maharashtra 400011, India",
];
/** The lines the new three replace; anything else (a "Vakratunda Group" line) stays. */
const OLD_LINES = new Set([
  "Vakratunda CHS Ltd, Bandra East",
  "Mumbai — 400 051",
  "2505, Prestige Turf Towers",
  "Mahalaxmi, Mumbai — 400 011",
  "Maharashtra, India",
]);

type Json = Record<string, unknown>;
type Change = { path: string; from: unknown; to: unknown };

function rewriteString(value: string, path: string[]): string {
  const dotted = path.join(".");
  // The close's one action: the enquiry desk, as in lib/content.ts, rather
  // than a bare mailto to an inbox that is no longer the office's.
  if (dotted === "finalCta.ctaHref" && value.startsWith("mailto:")) return "/contact#enquiry";
  // Meta rows: the locality, then the city and PIN.
  if (path.includes("meta")) {
    if (value === "Bandra East" || value === "Mahalaxmi") return "Mahalakshmi";
    if (value === "Mumbai — 400 051" || value === "Mumbai — 400 011") return "Mumbai — 400011";
  }

  let next = value
    // Every inbox on the site is the one address now, so the RMO aside goes.
    .replaceAll(/, except the RMO line, which reaches [\w.]+@vakratundagroup\.com/g, "")
    .replaceAll("Vakratunda CHS Ltd, Bandra East, Mumbai — 400 051, Maharashtra, India", NEW_POSTAL)
    .replaceAll("2505, Prestige Turf Towers, Mahalaxmi, Mumbai — 400 011, Maharashtra, India", NEW_POSTAL)
    .replaceAll("our Bandra East office", "our office")
    .replaceAll("office in Bandra East", "office in Mahalakshmi")
    .replaceAll("Vakratunda Group in Bandra East", "Vakratunda Group in Mahalakshmi")
    .replaceAll("Mahalaxmi", "Mahalakshmi");
  for (const email of OLD_EMAILS) next = next.replaceAll(email, NEW_EMAIL);
  return next;
}

/** An address block: the old lines out, the new three in where the first stood. */
function rewriteAddressLines(rows: Json[], path: string[], changes: Change[]): Json[] {
  const texts = rows.map((row) => row.text);
  if (!texts.some((text) => typeof text === "string" && OLD_LINES.has(text))) return rows;
  const next: Json[] = [];
  let placed = false;
  for (const row of rows) {
    if (typeof row.text === "string" && OLD_LINES.has(row.text)) {
      if (!placed) next.push(...NEW_LINES.map((text) => ({ text })));
      placed = true;
    } else {
      next.push(row);
    }
  }
  changes.push({ path: path.join("."), from: texts, to: next.map((row) => row.text) });
  return next;
}

/** Rewrites a document in place and records what moved. */
function rewrite(node: unknown, path: string[], changes: Change[]): unknown {
  if (typeof node === "string") {
    const next = rewriteString(node, path);
    if (next !== node) changes.push({ path: path.join("."), from: node, to: next });
    return next;
  }
  if (Array.isArray(node)) {
    if (path.at(-1) === "addressLines") {
      node = rewriteAddressLines(node as Json[], path, changes);
    }
    return (node as unknown[]).map((item, i) => rewrite(item, [...path, String(i)], changes));
  }
  if (node && typeof node === "object") {
    const obj = node as Json;
    // The contact page's office heading, "Bandra *East*" or "*Mahalaxmi*".
    if (
      (obj.before === "Bandra " && obj.swash === "East") ||
      (obj.before === "" && obj.swash === "Mahalaxmi")
    ) {
      changes.push({
        path: path.join("."),
        from: `${obj.before}*${obj.swash}*`,
        to: "*Mahalakshmi*",
      });
      obj.before = "";
      obj.swash = "Mahalakshmi";
    }
    for (const key of Object.keys(obj)) {
      obj[key] = rewrite(obj[key], [...path, key], changes);
    }
    return obj;
  }
  return node;
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
  rewrite(data, [], changes);
  if (changes.length === 0) continue;
  total += changes.length;
  report(`global ${slug}`, changes);
  if (APPLY) {
    await payload.updateGlobal({ slug, data: data as never, depth: 0, context: context() });
  }
}

for (const collection of ["posts", "projects"] as CollectionSlug[]) {
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
      if (["id", "createdAt", "updatedAt"].includes(key)) continue;
      const before = changes.length;
      const next = rewrite(structuredClone(value), [key], changes);
      if (changes.length > before) data[key] = next;
    }
    if (changes.length === 0) continue;
    total += changes.length;
    report(`${collection} ${String(doc.slug ?? doc.id)}`, changes);
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
