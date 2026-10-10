/**
 * Puts the contact form's new copy into the CMS, where the live site reads it.
 *
 *   npm run update:contact-form              — dry run: prints every change, writes nothing
 *   npm run update:contact-form -- --apply   — writes them
 *
 * WHY. The form used to open the visitor's mail client; it now sends the
 * enquiry itself (lib/sendEnquiry.ts). Three fields of the `contact-page`
 * global still described the old behaviour — one even said there was no
 * contact form — and a filled field wins over lib/pages/people.ts.
 *
 * Only a field that still holds the exact old wording is changed, so anything
 * an editor has already rewritten is left alone. Revalidation is skipped, as
 * in the seed: the deployed site picks the change up on its 60-second timer.
 */

import { getPayload, type GlobalSlug } from "payload";

import config from "../payload.config";

const APPLY = process.argv.includes("--apply");
const SLUG = "contact-page" as GlobalSlug;

/** Dotted path → [old wording, new wording]. */
const CHANGES: Record<string, [string, string]> = {
  "channels.note": [
    "Everything above reaches info@vakratundagroup.com, except the RMO line, which reaches rmo@vakratundagroup.com. There is no contact form on this site: an enquiry from a society committee is worth more than a form submission, and it is answered by a person.",
    "Everything above reaches info@vakratundagroup.com, except the RMO line, which reaches rmo@vakratundagroup.com. Every enquiry, whether written to us directly or through the form below, is answered by a person.",
  ],
  "form.standfirst": [
    "The same office, reached the other way round: fill this in and it is laid out into an email for you, addressed and titled, ready to send.",
    "The same office, reached the other way round: fill this in and it arrives in our inbox, addressed and titled, with nothing else to do.",
  ],
  "form.note": [
    "The form does not send anything by itself. It opens the enquiry in your own mail client, so you keep a copy of exactly what you sent and we reply to an address you already use.",
    "Your enquiry goes straight to our office and is answered by a person, by email, at the address you give.",
  ],
};

type Json = Record<string, unknown>;

const payload = await getPayload({ config: await config });
const data = { ...((await payload.findGlobal({ slug: SLUG, depth: 0 })) as unknown as Json) };
for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete data[key];

let count = 0;
for (const [path, [from, to]] of Object.entries(CHANGES)) {
  const [group, field] = path.split(".") as [string, string];
  const parent = data[group] as Json | undefined;
  const current = parent?.[field];

  if (current === to) {
    console.log(`  ${path}: already updated`);
  } else if (current !== from) {
    console.log(`  ${path}: SKIPPED — it no longer holds the old wording:\n    ${JSON.stringify(current)}`);
  } else {
    parent![field] = to;
    count++;
    console.log(`  ${path}\n    − ${JSON.stringify(from)}\n    + ${JSON.stringify(to)}`);
  }
}

if (count > 0 && APPLY) {
  await payload.updateGlobal({
    slug: SLUG,
    data: data as never,
    depth: 0,
    context: { disableRevalidate: true },
  });
}

console.log(
  count === 0
    ? "\nNothing to change."
    : APPLY
      ? `\nWrote ${count} change${count === 1 ? "" : "s"} to ${SLUG}.`
      : `\nDry run: ${count} change${count === 1 ? "" : "s"} found, nothing written. Re-run with --apply to write them.`,
);
process.exit(0);
