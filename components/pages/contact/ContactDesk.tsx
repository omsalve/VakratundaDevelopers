"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import type { ContactPageContent } from "@/lib/pages";
import { maskReveal, revealOnEnter, useGsapScope } from "@/lib/motion";
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
 * THE SUBMIT BEHAVIOUR IS CARRIED OVER UNCHANGED from the old ContactForm:
 * the fields are composed into a plain-text body and handed to the visitor's
 * own mail client. There is no endpoint, nothing is posted anywhere, and the
 * result is announced in a live region because the page does not navigate.
 *
 * THE FORM IS A FIELD, NOT A PANEL — no boxes and no fills, only a label, a
 * line of type and the hairline under it, with the rose marking focus exactly
 * as it marks an active control everywhere else on the site. That rule is
 * inherited from the component this replaces and is the reason the form reads
 * as part of the page rather than as something dropped onto it.
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
  const [sent, setSent] = useState(false);

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
    <section ref={root} className={styles.section} aria-labelledby="enquiry-title">
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

          <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
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

            <p className={styles.row} data-reveal="up">
              <label className={styles.label} htmlFor="cf-locality">
                Locality or project{" "}
                <span className={styles.optional}>optional</span>
              </label>
              <input
                className={styles.input}
                id="cf-locality"
                name="locality"
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
                defaultValue={SUBJECTS[0]}
              >
                {SUBJECTS.map((subject) => (
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
                rows={5}
                required
              />
            </p>

            <div className={styles.actions} data-reveal="up">
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

              {/* Announced rather than left to the eye: the page does not
                  navigate, so nothing else tells a screen reader what
                  happened. */}
              <p className={styles.status} role="status">
                {sent
                  ? `Your mail client should now be open, addressed to ${email}. If it did not open, write to that address directly.`
                  : ""}
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
