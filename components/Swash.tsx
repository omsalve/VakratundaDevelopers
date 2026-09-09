import type { SwashHeading } from "@/lib/content";

/**
 * Renders a headline with one word in the swash italic, the device the brand
 * guide uses on almost every slide ("The *story* Behind the Structure",
 * "Blueprints of *Versatility*", "*Ongoing* Projects").
 *
 * Pairs with the `.u-display` / `.u-h1` / `.u-h2` classes in global.css —
 * those set the size, this sets the emphasis.
 */
export function Swash({ heading }: { heading: SwashHeading }) {
  return (
    <>
      {heading.before}
      <em className="u-swash">{heading.swash}</em>
      {heading.after}
    </>
  );
}

export default Swash;
