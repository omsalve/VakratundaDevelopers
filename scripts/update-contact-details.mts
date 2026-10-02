/**
 * Moves the published contact details to the new office and inbox, in the CMS.
 *
 *   npm run update:contact              — dry run: prints every change, writes nothing
 *   npm run update:contact -- --apply   — writes them
 *
 * WHY A SCRIPT. The database was seeded from lib/content.ts and lib/pages, so
 * every field below already holds the OLD value, and a filled field wins over
 * the code. Changing the code alone changes nothing a visitor sees. This makes
 * the same edits the code got, in every global and every article and project,
 * wherever the old value sits — including inside rich text.
 *
 *   info@vakratundagroup.com            → rmo@vakratundagroup.com
 *   Vakratunda CHS Ltd, Bandra East     → 2505, Prestige Turf Towers
 *   Mumbai — 400 051                    → Mahalaxmi, Mumbai — 400 011 (an address line)
 *                                         Mumbai — 400 011 (a meta row)
 *   the office "in Bandra East"         → in Mahalaxmi
 *   the footer's "Let's build it together", a bare mailto: → /contact#enquiry
 *
 * Only these exact strings are touched: "Bandra East" as the name of a project's
 * suburb, or in a photograph's caption, is left alone.
 *
 * Revalidation is skipped on every write, as in the seed: the deployed site
 * picks the change up on its 60-second timer; restart `next dev` to see it
 * locally.
 */

import { getPayload, type CollectionSlug, type GlobalSlug } from "payload";

import config from "../payload.config";

const APPLY = process.argv.includes("--apply");

const OLD_EMAIL = "info@vakratundagroup.com";
const NEW_EMAIL = "rmo@vakratundagroup.com";

type Json = Record<string, unknown>;
type Change = { path: string; from: unknown; to: unknown };

function rewriteString(value: string, path: string[]): string {
  const dotted = path.join(".");
  // The close's one action: the enquiry desk rather than a bare mailto, which
  // does nothing on a device with no mail app set to answer it.
  if (dotted === "finalCta.ctaHref" && value === `mailto:${OLD_EMAIL}`) {
    return "/contact#enquiry";
  }
  // Whole address lines.
  if (value === "Vakratunda CHS Ltd, Bandra East") return "2505, Prestige Turf Towers";
  if (value === "Mumbai — 400 051") {
    return path.includes("addressLines")
      ? "Mahalaxmi, Mumbai — 400 011"
      : "Mumbai — 400 011";
  }
  if (value === "Bandra East" && path.includes("meta")) return "Mahalaxmi";

  return value
    .replaceAll(`, except the RMO line, which reaches ${NEW_EMAIL}`, "")
    .replaceAll(
      "Vakratunda CHS Ltd, Bandra East, Mumbai — 400 051",
      "2505, Prestige Turf Towers, Mahalaxmi, Mumbai — 400 011",
    )
    .replaceAll("our Bandra East office", "our office")
    .replaceAll("office in Bandra East", "office in Mahalaxmi")
    .replaceAll("Vakratunda Group in Bandra East", "Vakratunda Group in Mahalaxmi")
    .replaceAll(OLD_EMAIL, NEW_EMAIL);
}

/** Rewrites a document in place and records what moved. */
function rewrite(node: unknown, path: string[], changes: Change[]): unknown {
  if (typeof node === "string") {
    const next = rewriteString(node, path);
    if (next !== node) changes.push({ path: path.join("."), from: node, to: next });
    return next;
  }
  if (Array.isArray(node)) {
    return node.map((item, i) => rewrite(item, [...path, String(i)], changes));
  }
  if (node && typeof node === "object") {
    const obj = node as Json;
    // The contact page's office heading, "Bandra *East*".
    if (obj.before === "Bandra " && obj.swash === "East") {
      changes.push({ path: path.join("."), from: "Bandra *East*", to: "*Mahalaxmi*" });
      obj.before = "";
      obj.swash = "Mahalaxmi";
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
