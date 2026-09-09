import type { CommitmentIcon } from "@/lib/content";

/**
 * The four line drawings on the environment side of the responsibility
 * ledger.
 *
 * SAME VOCABULARY AS LegacyIcons.tsx AND TeamIcons.tsx, deliberately: one
 * 32×32 field, one 1.4 stroke, round caps and joins, nothing filled, and
 * every stroked element carrying `pathLength={1}` so its outline is exactly
 * one unit long whatever its real geometry. That is what lets the stylesheet
 * hold an icon undrawn at `stroke-dasharray: 1; stroke-dashoffset: 1` with no
 * measurement at all, and lets one tween draw all four.
 *
 * The `Field` wrapper is restated here for the same reason it is restated in
 * TeamIcons.tsx: three drawings in one hand, not one component with a mode.
 * Keep the four constants below in step with the other two sets if any of
 * them ever moves.
 *
 * THEY ARE DRAWINGS OF THE PRACTICE, not sustainability iconography — no
 * globes, no recycling triangles. A wall and a tree standing on the same
 * ground line; rain arriving in the tank that keeps it; a bin under the loop
 * that empties it; the sun and the blades that hold it off a facade. Each one
 * is the thing that is actually on the site.
 */

const VIEW_BOX = "0 0 32 32";

function Field({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A wall and a tree standing on one ground line: green building practices. */
function Green() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path pathLength={1} d="M5.5 28.5V7.5h5v21" />
      <path pathLength={1} d="M21 28.5V13" />
      <path
        pathLength={1}
        d="M21 17.5c0-4 2.7-6.7 7.2-7.2.5 4.5-2.3 7.2-7.2 7.2z"
      />
      <path
        pathLength={1}
        d="M21 22c0-4-2.7-6.7-7.2-7.2-.5 4.5 2.3 7.2 7.2 7.2z"
      />
    </Field>
  );
}

/** Rain arriving in the tank that keeps it: rainwater harvesting. */
function Rainwater() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path pathLength={1} d="M8 18.5h16" />
      <path pathLength={1} d="M9.5 18.5 11 28.5h10l1.5-10" />
      <path
        pathLength={1}
        d="M16 5.5c1.7 2.1 2.5 3.5 2.5 4.4a2.5 2.5 0 0 1-5 0c0-.9.8-2.3 2.5-4.4z"
      />
      <path
        pathLength={1}
        d="M10.5 10.6c1.1 1.4 1.7 2.3 1.7 2.9a1.7 1.7 0 0 1-3.4 0c0-.6.6-1.5 1.7-2.9z"
      />
      <path
        pathLength={1}
        d="M21.5 10.6c1.1 1.4 1.7 2.3 1.7 2.9a1.7 1.7 0 0 1-3.4 0c0-.6.6-1.5 1.7-2.9z"
      />
    </Field>
  );
}

/** A bin under the loop that empties it: waste management systems. */
function Waste() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path pathLength={1} d="M9 14h14" />
      <path pathLength={1} d="M10.6 14 12 28.5h8L21.4 14" />
      <path pathLength={1} d="M13.5 14v-1.6h5V14" />
      <path pathLength={1} d="M14.4 18v7" />
      <path pathLength={1} d="M17.6 18v7" />
      <path pathLength={1} d="M23.5 9.6A9.5 9.5 0 0 0 8.5 9.6" />
      <path pathLength={1} d="M8.6 5.8v3.8h3.8" />
    </Field>
  );
}

/** The sun, and the blades that hold it off a facade: energy-efficient design. */
function Energy() {
  return (
    <Field>
      <path pathLength={1} d="M9.5 10.5a6.5 6.5 0 0 1 13 0" />
      <path pathLength={1} d="M16 1.8v2.2" />
      <path pathLength={1} d="M7.4 4.9 9 6.5" />
      <path pathLength={1} d="M24.6 4.9 23 6.5" />
      <path pathLength={1} d="M5.5 10.5h21" />
      <path pathLength={1} d="M8 16.4 24 14.6" />
      <path pathLength={1} d="M8 20.9 24 19.1" />
      <path pathLength={1} d="M8 25.4 24 23.6" />
    </Field>
  );
}

const DRAWINGS: Record<CommitmentIcon, () => React.ReactElement> = {
  green: Green,
  rainwater: Rainwater,
  waste: Waste,
  energy: Energy,
};

export function ResponsibilityIcons({ name }: { name: CommitmentIcon }) {
  const Drawing = DRAWINGS[name];
  return <Drawing />;
}

export default ResponsibilityIcons;
