"use client";

import { useRef } from "react";
import type { FinalCtaContent } from "@/lib/content";
import { gsap, revealOnEnter, useGsapScope } from "@/lib/motion";
import { Logo, LogoMark } from "./Logo";
import Swash from "./Swash";
import styles from "./FinalCTA.module.css";

/**
 * The close. The brand guide ends on a single line set large and centred
 * (CP_Final p.16); the page ends the same way, then hands over the three
 * facts that answer "why you" and the one action worth taking.
 *
 * The mark behind the quote turns very slowly as the section passes — the
 * page's last piece of motion, and the quietest.
 */

export function FinalCTA({
  content,
  legal,
}: {
  content: FinalCtaContent;
  legal: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    if (!root.current) return;

    revealOnEnter(`.${styles.quote}`, root.current, { start: "top 72%" });
    revealOnEnter(`.${styles.proof}`, root.current, {
      start: "top 62%",
      stagger: 0.12,
    });
    revealOnEnter(`.${styles.action}`, root.current, { start: "top 58%" });

    gsap.to(`.${styles.watermark}`, {
      rotate: 42,
      ease: "none",
      scrollTrigger: {
        trigger: root.current,
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });
  }, []);

  return (
    <section
      ref={root}
      id="contact"
      className={styles.section}
      aria-labelledby="contact-title"
    >
      <LogoMark className={styles.watermark} size={780} />

      <div className={`u-shell ${styles.inner}`}>
        <h2 id="contact-title" className={styles.quote}>
          <span className={styles.quoteMark} aria-hidden="true">
            &ldquo;
          </span>
          <Swash heading={content.quote} />
          <span className={styles.quoteMark} aria-hidden="true">
            &rdquo;
          </span>
        </h2>

        <ul className={styles.proofs}>
          {content.proofs.map((proof) => (
            <li key={proof.title} className={styles.proof}>
              <h3 className={styles.proofTitle}>{proof.title}</h3>
              <p className={styles.proofBody}>{proof.body}</p>
            </li>
          ))}
        </ul>

        <div className={styles.action}>
          <a className={styles.cta} href={content.primaryCta.href}>
            <span>{content.primaryCta.label}</span>
            <svg
              className={styles.ctaIcon}
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
          </a>
          <p className={styles.attribution}>{content.attribution}</p>
        </div>
      </div>

      <footer className={styles.footer}>

        <div className={`u-shell ${styles.footerInner}`}>
          <Logo layout="inline" size={44} className={styles.footerLogo} />

          <address className={styles.contact}>
            <a className={styles.email} href={`mailto:${content.contact.email}`}>
              {content.contact.email}
            </a>
            {content.contact.addressLines.map((line) => (
              <span key={line} className={styles.addressLine}>
                {line}
              </span>
            ))}
          </address>

          <p className={styles.legal}>{legal}</p>
        </div>
      </footer>
    </section>
  );
}

export default FinalCTA;
