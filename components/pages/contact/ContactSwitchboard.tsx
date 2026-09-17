"use client";

import { useRef } from "react";
import type { LedgerBand, PageHeroContent } from "@/lib/pages";
import { gsap, maskReveal, useGsapScope } from "@/lib/motion";
import Swash from "@/components/Swash";
import styles from "./ContactSwitchboard.module.css";

/**
 * /contact — the switchboard.
 *
 * THE SHORTEST OPENING ON THE SITE, and that is the design. Every other page
 * here can afford to hold a screen: /about takes a full viewport for its line,
 * /careers for its arch. Somebody on a contact page has already decided to get
 * in touch, and a screen of atmosphere between them and a phone number is a
 * page enjoying itself at the visitor's expense.
 *
 * SO THE CHANNELS ARE IN THE FIRST SCREEN, beside the title rather than a
 * scroll below it, and they are the largest type in the band — larger than the
 * headline. Each is a real `tel:` or `mailto:` link where the content gives
 * one, set at heading scale because on this page the phone number IS the
 * content.
 *
 * A channel with no `href` is a statement of hours or a note, and it is set as
 * plain type with its `state` beside it — never as something that looks
 * tappable and is not.
 */

export function ContactSwitchboard({
  content,
  channels,
}: {
  content: PageHeroContent;
  channels: LedgerBand;
}) {
  const root = useRef<HTMLElement | null>(null);

  useGsapScope(root, () => {
    const rootEl = root.current;
    if (!rootEl) return;

    gsap.to(`.${styles.stack} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.08,
    });

    maskReveal(`.${styles.channelRule}`, rootEl, {
      from: "left",
      duration: 0.9,
      stagger: 0.09,
      delay: 0.2,
    });

    gsap.to(`.${styles.channel} > [data-reveal]`, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.3,
    });
  }, [channels.entries.length]);

  return (
    <section ref={root} className={styles.section} aria-labelledby="page-title">
      <div className={`u-shell ${styles.inner}`}>
        <div className={styles.stack}>
          <p className={`u-label ${styles.label}`} data-reveal="up">
            {content.label}
          </p>

          <h1 id="page-title" className={`u-h1 ${styles.heading}`} data-reveal="up">
            <Swash heading={content.heading} />
          </h1>

          <p className={styles.standfirst} data-reveal="up">
            {content.standfirst}
          </p>

          <ul className={styles.meta} data-reveal="up">
            {content.meta.map((item) => (
              <li key={item} className={styles.metaItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.board} aria-labelledby="channels-title">
          <h2 id="channels-title" className={`u-label ${styles.boardLabel}`}>
            {channels.label ?? channels.heading.swash}
          </h2>

          <ul className={styles.channels}>
            {channels.entries.map((entry) => (
              <li key={entry.id} className={styles.channel}>
                <span className={styles.channelRule} aria-hidden="true" />

                <span className={`u-label ${styles.channelTerm}`} data-reveal="up">
                  {entry.meta}
                </span>

                <span className={styles.channelValue} data-reveal="up">
                  {entry.href ? (
                    <a className={styles.channelLink} href={entry.href}>
                      {entry.title}
                    </a>
                  ) : (
                    <span className={styles.channelPlain}>{entry.title}</span>
                  )}

                  {entry.note ? (
                    <span className={styles.channelNote}>{entry.note}</span>
                  ) : null}
                </span>

                {!entry.href && entry.state ? (
                  <span className={styles.channelState} data-reveal="up">
                    {entry.state}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          {channels.note ? (
            <p className={`u-caption ${styles.boardNote}`}>{channels.note}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ContactSwitchboard;
