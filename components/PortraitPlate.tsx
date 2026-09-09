import Image from "next/image";
import clsx from "clsx";
import type { ImageAsset } from "@/lib/content";
import styles from "./PortraitPlate.module.css";

/**
 * A portrait, or — until the photograph exists — the plate that stands in its
 * place.
 *
 * ONE CONDITION, AND IT REMOVES ITSELF. An `ImageAsset` whose `src` is empty
 * is a portrait that has not been supplied yet; fill the `src` in and this
 * renders `<Image>` with the alt text that was already written for it, with
 * no other edit anywhere. Nothing in the layout moves: the plate and the
 * photograph occupy the same box at the same ratio.
 *
 * WHAT THE PLATE IS. Not a grey rectangle and not a silhouette: a mounted
 * monogram, in the language the rest of the site already draws in — a cream
 * ground, a rose hairline mount inset from the edge the way a print sits in
 * its mat, the initials in the display face, and a rule under them. It reads
 * as a considered blank rather than as a missing asset, which is the whole
 * difference between a placeholder and a hole.
 *
 * It is `aria-hidden`: every place this is used, the person's name is set in
 * type directly beside it, and a screen reader should not hear the initials
 * announced a second time. The real photograph, when it arrives, carries its
 * own alt text and is not hidden.
 */

/**
 * "Mr. Ram Kantilal Makhecha" → "RM".
 *
 * Honorifics are dropped, and the first and last remaining words are what is
 * taken — a middle name should not push the surname's initial off the plate.
 */
const HONORIFICS = new Set(["mr", "mrs", "ms", "dr", "shri", "smt"]);

export function initialsOf(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ""))
    .filter((word) => word.length > 0 && !HONORIFICS.has(word.toLowerCase()));

  if (words.length === 0) return "";
  const first = words[0]!;
  const last = words[words.length - 1]!;
  return (words.length === 1 ? first.slice(0, 2) : first[0]! + last[0]!)
    .toUpperCase();
}

type Props = {
  image: ImageAsset;
  /** Read for the plate's initials, and nothing else. */
  name: string;
  /** `sizes` for the real photograph. Ignored by the plate. */
  sizes: string;
  /** The box's aspect ratio, as a CSS `aspect-ratio` value. */
  ratio?: string;
  className?: string;
  priority?: boolean;
};

export function PortraitPlate({
  image,
  name,
  sizes,
  ratio = "4 / 5",
  className,
  priority = false,
}: Props) {
  const box = clsx(styles.box, className);

  if (image.src) {
    return (
      <div className={box} style={{ aspectRatio: ratio }} data-plate>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          quality={82}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={styles.photo}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(box, styles.plate)}
      style={{ aspectRatio: ratio }}
      data-plate
      aria-hidden="true"
    >
      <span className={styles.mount} />
      <span className={styles.initials}>{initialsOf(name)}</span>
      <span className={styles.rule} />
    </div>
  );
}

export default PortraitPlate;
