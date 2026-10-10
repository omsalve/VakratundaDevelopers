"use server";

import { headers } from "next/headers";

import { text } from "./cms/merge";
import { getPayloadClient, readWithFallback } from "./cms/read";
import { siteContent } from "./content";
import { ENQUIRY_LIMITS as LIMITS, ENQUIRY_SUBJECTS, type EnquiryState } from "./enquiry";
import { sendMail } from "./mailer";

/**
 * The enquiry form's server action: validates what was written, and emails it
 * to the office with the visitor as Reply-To, so answering it is pressing
 * Reply.
 *
 * A SERVER ACTION IS A PUBLIC POST ENDPOINT, whatever page renders it, so
 * nothing the request carries is trusted:
 *
 * - THE RECIPIENT IS NEVER A FORM FIELD. It is `ENQUIRY_TO` from the
 *   environment, or failing that the contact address in the Home global —
 *   the one printed beside the form. A recipient taken from the request
 *   would make this a relay that sends anybody's mail to anybody.
 * - The subject must be one of ENQUIRY_SUBJECTS; anything else is filed
 *   under "Something else".
 * - Single-line fields are collapsed onto one line and every field has a
 *   length cap, matched by `maxLength` on the inputs so nobody typing
 *   normally ever meets it here.
 * - `website` is a honeypot: hidden from people and from assistive tech,
 *   left empty by them and filled by form-stuffing bots. A filled one is told
 *   "sent" and dropped, so the bot learns nothing.
 * - Each connection gets MAX_PER_WINDOW sends per WINDOW_MS. The count lives
 *   in this server process, so on a serverless host it is per instance — a
 *   brake on a script hammering the form, not a guarantee.
 */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recentSends = new Map<string, number[]>();

function overLimit(key: string, now: number): boolean {
  // Forget connections that have gone quiet, so the map cannot grow forever.
  if (recentSends.size > 500) {
    for (const [k, times] of recentSends) {
      if (times.every((t) => now - t >= WINDOW_MS)) recentSends.delete(k);
    }
  }

  const times = (recentSends.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  const limited = times.length >= MAX_PER_WINDOW;
  if (!limited) times.push(now);
  recentSends.set(key, times);
  return limited;
}

async function clientAddress(): Promise<string | null> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    null
  );
}

async function recipient(): Promise<string> {
  const fixed = process.env.ENQUIRY_TO?.trim();
  if (fixed) return fixed;

  const fallback = siteContent.finalCta.contact.email;
  return readWithFallback(
    "home",
    async () => {
      const payload = await getPayloadClient();
      const home = await payload.findGlobal({ slug: "home", depth: 0 });
      return text(home.finalCta?.email, fallback);
    },
    fallback,
  );
}

function field(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** For values that end up in a header or a one-line label. */
function singleLine(data: FormData, key: string): string {
  return field(data, key).replace(/\s+/g, " ");
}

export async function sendEnquiry(
  _previous: EnquiryState,
  data: FormData,
): Promise<EnquiryState> {
  const at = Date.now();

  if (field(data, "website")) return { status: "sent", at };

  const name = singleLine(data, "name");
  const email = singleLine(data, "email");
  const phone = singleLine(data, "phone");
  const locality = singleLine(data, "locality");
  const message = field(data, "message");
  const chosen = singleLine(data, "subject");
  const subject = (ENQUIRY_SUBJECTS as readonly string[]).includes(chosen)
    ? chosen
    : "Something else";

  const tooLong =
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    phone.length > LIMITS.phone ||
    locality.length > LIMITS.locality ||
    message.length > LIMITS.message;

  if (!name || !EMAIL_SHAPE.test(email) || !message || tooLong) {
    return { status: "invalid", at };
  }

  // No address to count against (no proxy in front) means no limit, rather
  // than one shared bucket that throttles every visitor at once.
  const address = await clientAddress();
  if (address && overLimit(address, at)) return { status: "limited", at };

  const body = [
    "Name: " + name,
    "Email: " + email,
    phone ? "Phone: " + phone : null,
    locality ? "Locality or project: " + locality : null,
    "Subject: " + subject,
    "",
    message,
    "",
    "—",
    `Sent from the enquiry form on the website. Reply to this email to answer ${name} directly.`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  try {
    await sendMail({
      to: await recipient(),
      replyTo: { name, address: email },
      subject: `Enquiry — ${subject} — ${name}`,
      text: body,
    });
    return { status: "sent", at };
  } catch (error) {
    console.error(
      "[enquiry] send failed:",
      error instanceof Error ? error.message : error,
    );
    return { status: "failed", at };
  }
}
