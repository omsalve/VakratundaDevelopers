"use client";

import { useRef, useState, type FormEvent } from "react";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import styles from "./ContactForm.module.css";

/**
 * The enquiry form.
 *
 * IT COMPOSES, IT DOES NOT POST. The project has no submission endpoint and
 * no store to put an enquiry in, and a form that accepts what a society
 * committee writes into it and silently drops it is worse than no form at
 * all. So the submit builds a `mailto:` to the office — subject already set
 * from the chosen line, the fields laid out in the body — and hands the
 * enquiry to the sender's own client, where they keep a copy of what they
 * sent. Nothing is lost, and nothing is claimed to have been received.
 *
 * WHEN THERE IS AN ENDPOINT, this becomes a server action: swap the body of
 * `handleSubmit` for the action and the markup below is unchanged. The fields
 * are already the ones a Payload `enquiries` collection would carry.
 *
 * The controls are the site's own vocabulary — a hairline under each field,
 * no box, no fill, the rose on focus — and the button is SectionCoda's ghost
 * pill. The entrance is the house `revealOnEnter`, on the same trigger and
 * stagger every other band uses.
 */

const SUBJECTS = [
  "Buying a home or commercial space",
  "Society redevelopment",
  "Land and joint development",
  "Buying as a non-resident",
  "Careers",
  "Press and media",
  "Something else",
] as const;

export function ContactForm({
  email,
  label,
  heading,
  standfirst,
  note,
}: {
  /** The office address the enquiry is composed to. */
  email: string;
  label: string;
  heading: string;
  standfirst: string;
  note: string;
}) {
  const root = useRef<HTMLDivElement | null>(null);
  const [sent, setSent] = useState(false);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter("[data-reveal]", root.current, {
      start: "top 86%",
      stagger: 0.06,
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const body = [
      "Name: " + get("name"),
      "Email: " + get("email"),
      get("phone") ? "Phone: " + get("phone") : null,
      get("locality") ? "Locality or project: " + get("locality") : null,
      "",
      get("message"),
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    const subject = encodeURIComponent("Enquiry — " + get("subject"));
    window.location.href =
      "mailto:" + email + "?subject=" + subject + "&body=" + encodeURIComponent(body);

    setSent(true);
  }

  return (
    <div ref={root} className={`u-shell ${styles.field}`}>
      <div className={styles.intro}>
        <p className="u-label" data-reveal="up">
          {label}
        </p>
        <h2 className={styles.heading} data-reveal="up">
          {heading}
        </h2>
        <p className={styles.standfirst} data-reveal="up">
          {standfirst}
        </p>
        <p className={`u-caption ${styles.note}`} data-reveal="up">
          {note}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} data-reveal="up">
        <p className={styles.row}>
          <label className={styles.label} htmlFor="cf-name">
            Your name
          </label>
          <input
            className={styles.input}
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </p>

        <p className={styles.row}>
          <label className={styles.label} htmlFor="cf-email">
            Email
          </label>
          <input
            className={styles.input}
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </p>

        <p className={styles.row}>
          <label className={styles.label} htmlFor="cf-phone">
            Phone <span className={styles.optional}>optional</span>
          </label>
          <input
            className={styles.input}
            id="cf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
          />
        </p>

        <p className={styles.row}>
          <label className={styles.label} htmlFor="cf-locality">
            Locality or project <span className={styles.optional}>optional</span>
          </label>
          <input
            className={styles.input}
            id="cf-locality"
            name="locality"
            type="text"
          />
        </p>

        <p className={`${styles.row} ${styles.rowWide}`}>
          <label className={styles.label} htmlFor="cf-subject">
            What is this about
          </label>
          <select
            className={styles.input}
            id="cf-subject"
            name="subject"
            defaultValue={SUBJECTS[0]}
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </p>

        <p className={`${styles.row} ${styles.rowWide}`}>
          <label className={styles.label} htmlFor="cf-message">
            Your enquiry
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            id="cf-message"
            name="message"
            rows={5}
            required
          />
        </p>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit}>
            <span>Compose the enquiry</span>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          {/* Announced rather than left to the eye: the page does not navigate,
              so nothing else tells a screen reader what happened. */}
          <p className={styles.status} role="status">
            {sent
              ? `Your mail client should now be open, addressed to ${email}. If it did not open, write to that address directly.`
              : ""}
          </p>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
