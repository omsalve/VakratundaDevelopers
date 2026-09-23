"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import clsx from "clsx";
import styles from "./FitImage.module.css";

/**
 * A photograph that is never cut off by the frame it is put in.
 *
 * THE PROBLEM IT SOLVES. Every card, thumbnail and panel on the site is a
 * frame of a fixed shape, and the photographs that go into them come from the
 * CMS in whatever shape they were taken — mostly tall towers shot from the
 * street. `object-fit: cover` in a landscape frame kept the middle of the
 * tower and threw its top and its foot away; in the projects index it kept
 * as little as a third of the picture.
 *
 * WHAT IT DOES INSTEAD. It measures its frame against the photograph:
 *
 *   · when the two are close in shape (the crop would keep `tolerance` of the
 *     picture or more), the photograph simply fills the frame, as before;
 *   · when they are not, the WHOLE photograph is shown, and the space either
 *     side of it is filled with a soft, blurred, enlarged copy of the same
 *     picture — so the frame is never an empty letterbox, and nothing of the
 *     building is lost.
 *
 * The first paint (and a visitor with no JS) gets the whole-photograph
 * version, so the safe reading is the default. Both layers are the same URL at
 * the same `sizes`, so the browser fetches the file once.
 *
 * It fills its frame absolutely: the frame must be positioned and must carry
 * its own size (an aspect ratio, as every frame on the site does). `className`
 * goes on the photograph itself, so a frame's hover and entrance rules keep
 * working; the fit is set inline and outranks any `object-fit` they carry.
 */

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  quality?: number;
  className?: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  /** Where a cover crop is centred, when the photograph does fill the frame. */
  position?: string;
  /** The least of the photograph a fill may keep before it is shown whole
   *  instead. 0.86 lets a near-match fill its frame edge to edge. */
  tolerance?: number;
  draggable?: boolean;
};

export function FitImage({
  src,
  alt,
  width,
  height,
  sizes,
  quality = 82,
  className,
  loading,
  priority,
  position = "50% 45%",
  tolerance = 0.86,
  draggable,
}: Props) {
  const box = useRef<HTMLSpanElement | null>(null);
  const [mode, setMode] = useState<"contain" | "cover">("contain");

  useEffect(() => {
    const el = box.current;
    if (!el || !width || !height) return;
    const ratio = width / height;

    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const frame = w / h;
      const kept = Math.min(ratio / frame, frame / ratio);
      setMode(kept >= tolerance ? "cover" : "contain");
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height, tolerance]);

  const front: CSSProperties = { objectFit: mode, objectPosition: position };

  return (
    <span ref={box} className={styles.fit} data-mode={mode}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        quality={quality}
        loading={priority ? undefined : (loading ?? "lazy")}
        className={styles.backdrop}
        draggable={false}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : loading}
        className={clsx(styles.front, className)}
        style={front}
        draggable={draggable}
      />
    </span>
  );
}

export default FitImage;
