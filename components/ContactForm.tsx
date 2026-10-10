"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import {
  ENQUIRY_LIMITS,
  ENQUIRY_SUBJECTS,
  INITIAL_ENQUIRY,
  enquiryStatusMessage,
} from "@/lib/enquiry";
import { revealOnEnter, useGsapScope } from "@/lib/motion";
import { sendEnquiry } from "@/lib/sendEnquiry";
import styles from "./ContactForm.module.css";

/**
 * The enquiry form.
 *
 * NOT CURRENTLY RENDERED — /contact uses ContactDesk, which carries the same
 * fields beside the office panel. Kept in step with it so it can come back.
 *
 * IT SENDS. The submit goes to the `sendEnquiry` server action, which emails
 * the office with the visitor as Reply-To (lib/sendEnquiry.ts). It is
 * dispatched from onSubmit rather than `<form action>` so a failed send does
 * not reset the fields; they are cleared only once the office has the
 * message. See ContactDesk for the longer note.
 *
 * The controls are the site's own vocabulary — a hairline under each field,
 * no box, no fill, the rose on focus — and the button is SectionCoda's ghost
 * pill. The entrance is the house `revealOnEnter`, on the same trigger and
 * stagger every other band uses.
 */

export function ContactForm({
  email,
  label,
  heading,
  standfirst,
  note,
}: {
  /** The office address, named in every failure message as the way round. */
  email: string;
  label: string;
  heading: string;
  standfirst: string;
  note: string;
}) {
  const root = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, dispatch, pending] = useActionState(sendEnquiry, INITIAL_ENQUIRY);

  useEffect(() => {
    if (state.status === "sent") formRef.current?.reset();
  }, [state]);

  useGsapScope(root, () => {
    if (!root.current) return;
    revealOnEnter("[data-reveal]", root.current, {
      start: "top 86%",
      stagger: 0.06,
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
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

      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        data-reveal="up"
      >
        <p className={styles.row}>
          <label className={styles.label} htmlFor="cf-name">
            Your name
          </label>
          <input
            className={styles.input}
            id="cf-name"
            name="name"
            maxLength={ENQUIRY_LIMITS.name}
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
            maxLength={ENQUIRY_LIMITS.email}
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
            maxLength={ENQUIRY_LIMITS.phone}
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
            maxLength={ENQUIRY_LIMITS.locality}
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
            defaultValue={ENQUIRY_SUBJECTS[0]}
          >
            {ENQUIRY_SUBJECTS.map((subject) => (
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
            maxLength={ENQUIRY_LIMITS.message}
            rows={5}
            required
          />
        </p>

        {/* The honeypot (lib/sendEnquiry.ts): out of sight, out of the tab
            order and out of the accessibility tree, so only a bot fills it. */}
        <p className="u-visually-hidden" aria-hidden="true">
          <label htmlFor="cf-website">Leave this empty</label>
          <input
            id="cf-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </p>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit} disabled={pending}>
            <span>{pending ? "Sending…" : "Send the enquiry"}</span>
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
            {enquiryStatusMessage(state, email)}
          </p>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
