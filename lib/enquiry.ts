/**
 * The enquiry form's shared vocabulary — read by the form in the browser and
 * by the server action that sends it (lib/sendEnquiry.ts).
 *
 * THE SUBJECTS ARE A CLOSED LIST. The server checks the submitted subject
 * against this array rather than putting whatever arrives into the email's
 * subject line, so a direct POST cannot write its own headline into the
 * office's inbox. Add a line here and both ends pick it up.
 *
 * Nothing in this file may import from the server: it ships to the client.
 */

export const ENQUIRY_SUBJECTS = [
  "Buying a home or commercial space",
  "Society redevelopment",
  "Land and joint development",
  "Buying as a non-resident",
  "Careers",
  "Press and media",
  "Something else",
] as const;

export type EnquirySubject = (typeof ENQUIRY_SUBJECTS)[number];

/** Character caps per field — `maxLength` on the inputs, enforced again on the server. */
export const ENQUIRY_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  locality: 160,
  message: 10_000,
} as const;

/**
 * What the action hands back. `at` makes every result a distinct value, so
 * the form can tell a second successful send from the first.
 *
 * - `invalid` — a required field is missing or malformed (only reachable when
 *   the browser's own validation was bypassed).
 * - `limited` — too many sends from one connection in the window.
 * - `failed`  — the mail server refused or could not be reached, or the
 *   transport is not configured. The visitor's text is still in the form.
 */
export type EnquiryState =
  | { status: "idle" }
  | { status: "sent" | "invalid" | "limited" | "failed"; at: number };

export const INITIAL_ENQUIRY: EnquiryState = { status: "idle" };

/**
 * The live-region line under the button. Every failure names the office
 * address, so no outcome leaves somebody without a way to reach us.
 */
export function enquiryStatusMessage(state: EnquiryState, email: string): string {
  switch (state.status) {
    case "idle":
      return "";
    case "sent":
      return "Thank you — your enquiry has reached the office. A person will reply to the email address you gave.";
    case "invalid":
      return `Please add your name, a valid email address and your enquiry. Or write to ${email} directly.`;
    case "limited":
      return `Several enquiries have just been sent from this connection. Please wait a few minutes, or write to ${email} directly.`;
    case "failed":
      return `Your enquiry did not send — it is still in the form, so you can try again. Or write to ${email} directly.`;
  }
}
