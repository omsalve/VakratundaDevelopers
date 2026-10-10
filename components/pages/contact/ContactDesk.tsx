"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  ENQUIRY_LIMITS,
  ENQUIRY_SUBJECTS,
  INITIAL_ENQUIRY,
  enquiryStatusMessage,
} from "@/lib/enquiry";
import type { ContactPageContent } from "@/lib/pages";
import { maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
import { sendEnquiry } from "@/lib/sendEnquiry";
import Swash from "@/components/Swash";
import styles from "./ContactDesk.module.css";

/**
 * /contact — the desk: the enquiry and the office it reaches.
 *
 * WHAT THIS REPLACES. Two stacked full-width bands — `ContactForm`, then
 * `OfficePanel` — each running its own internal two-column grid inside a
 * `PageSection`. So the page was four columns' worth of layout in two
 * unrelated systems, and the address you were writing to was a full screen
 * away from the box you were writing in.
 *
 * NOW THEY ARE ONE DESK. The enquiry takes the working column; the office sits
 * beside it and STAYS there, sticky, while the form is filled in — the
 * photograph, the address, the hours and the direct email all in view at the
 * moment somebody is deciding whether to write or simply to turn up. That is
 * the only two-panel working layout on the site, and it is what makes this
 * page unmistakable next to the fourteen others.
 *
 * THE SUBMIT SENDS. The fields go to the `sendEnquiry` server action, which
 * emails them to the office with the visitor as Reply-To (lib/sendEnquiry.ts).
 * The result is announced in a live region because the page does not
 * navigate, and every failure names the office address beside the form.
 *
 * WHY onSubmit AND NOT `<form action>`. React resets an action form's fields
 * once the action settles — on a failed send too, which would wipe a long
 * enquiry at the moment somebody most needs it back. So the submit is
 * dispatched by hand inside a transition, and the fields are cleared only
 * when the office actually has the message.
 *
 * THE FORM IS A FIELD, NOT A PANEL — no boxes and no fills, only a label, a
 * line of type and the hairline under it, with the rose marking focus exactly
 * as it marks an active control everywhere else on the site. That rule is
 * inherited from the component this replaces and is the reason the form reads
 * as part of the page rather than as something dropped onto it.
 */

export function ContactDesk({
  form,
  office,
  email,
}: {
  form: ContactPageContent["form"];
  office: ContactPageContent["office"];
  email: string;
}) {
  const root = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, dispatch, pending] = useActionState(sendEnquiry, INITIAL_ENQUIRY);

  useEffect(() => {
    if (state.status === "sent") formRef.current?.reset();
  }, [state]);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    revealOnEnter(`.${styles.intro} > [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.07,
    });

    revealOnEnter(`.${styles.form} [data-reveal]`, rootEl, {
      start: "top 88%",
      stagger: 0.05,
    });

    maskReveal(`.${styles.frame}`, rootEl, {
      from: "bottom",
      duration: 1.1,
      start: "top 86%",
    });

    revealOnEnter(`.${styles.officeBody} [data-reveal]`, rootEl, {
      start: "top 86%",
      stagger: 0.07,
      delay: 0.1,
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  }

  return (
    // `#enquiry` is where the footer's "Let's build it together" lands.
    <section
      ref={root}
      id="enquiry"
      className={styles.section}
      aria-labelledby="enquiry-title"
    >
      <div className={`u-shell ${styles.desk}`}>
        {/* ---- The enquiry ---- */}
        <div className={styles.working}>
          <div className={styles.intro}>
            <p className="u-label" data-reveal="up">
              {form.label}
            </p>
            <h2 id="enquiry-title" className={styles.heading} data-reveal="up">
              {form.heading}
            </h2>
            <p className={styles.standfirst} data-reveal="up">
              {form.standfirst}
            </p>
            <p className={`u-caption ${styles.note}`} data-reveal="up">
              {form.note}
            </p>
          </div>

          <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
              <label className={styles.label} htmlFor="cf-locality">
                Locality or project{" "}
                <span className={styles.optional}>optional</span>
              </label>
              <input
                className={styles.input}
                id="cf-locality"
                name="locality"
                maxLength={ENQUIRY_LIMITS.locality}
                type="text"
              />
            </p>

            <p className={`${styles.row} ${styles.rowWide}`} data-reveal="up">
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

            <p className={`${styles.row} ${styles.rowWide}`} data-reveal="up">
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

            <div className={styles.actions} data-reveal="up">
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

              {/* Announced rather than left to the eye: the page does not
                  navigate, so nothing else tells a screen reader what
                  happened. */}
              <p className={styles.status} role="status">
                {enquiryStatusMessage(state, email)}
              </p>
            </div>
          </form>
        </div>

        {/* ---- The office, held in view ---- */}
        <aside className={styles.office} aria-labelledby="office-title">
          <figure className={styles.figure}>
            <div className={styles.frame}>
              <Image
                src={office.image.src}
                alt={office.image.alt}
                width={office.image.width}
                height={office.image.height}
                sizes="(max-width: 62rem) 92vw, 34vw"
                quality={82}
                className={styles.image}
              />
            </div>
            {office.image.caption ? (
              <figcaption className={`u-caption ${styles.caption}`}>
                {office.image.caption}
              </figcaption>
            ) : null}
          </figure>

          <div className={styles.officeBody}>
            <p className={`u-label ${styles.officeLabel}`} data-reveal="up">
              {office.label}
            </p>

            <h2 id="office-title" className={`u-h3 ${styles.officeHeading}`} data-reveal="up">
              <Swash heading={office.heading} />
            </h2>

            <p className={styles.officeStandfirst} data-reveal="up">
              {office.standfirst}
            </p>

            <address className={styles.address} data-reveal="up">
              {office.addressLines.map((line) => (
                <span key={line} className={styles.addressLine}>
                  {line}
                </span>
              ))}
            </address>

            <p data-reveal="up">
              <a className={styles.email} href={`mailto:${email}`}>
                {email}
              </a>
            </p>

            <ul className={styles.hours} data-reveal="up">
              {office.hours.map((line) => (
                <li key={line} className={styles.hoursLine}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ContactDesk;
