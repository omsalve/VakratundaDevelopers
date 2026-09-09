import type { TeamRoleIcon } from "@/lib/content";

/**
 * The six line drawings on the core-teams slide.
 *
 * SAME VOCABULARY AS LegacyIcons.tsx, deliberately: one 32×32 field, one
 * 1.4 stroke, round caps and joins, nothing filled, and every stroked element
 * carrying `pathLength={1}` so its outline is exactly one unit long whatever
 * its real geometry. That is what lets the stylesheet hold an icon undrawn at
 * `stroke-dasharray: 1; stroke-dashoffset: 1` with no measurement at all, and
 * lets one tween draw all six.
 *
 * The `Field` wrapper is restated here rather than imported so that neither
 * icon set can be changed by an edit to the other — they are two drawings in
 * one hand, not one component with a mode. Keep the four constants below in
 * step with LegacyIcons.tsx if either ever moves.
 *
 * THEY ARE DRAWINGS OF THE WORK, not interface glyphs: a pair of compasses,
 * a site level on its tripod, a door and its key, a plumb bob under a spirit
 * level, a leaf over a parapet, a hard hat. Each one is the object the role
 * actually holds.
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

/** A pair of compasses standing on the arc it has just drawn: planning. */
function Design() {
  return (
    <Field>
      <path pathLength={1} d="M6.5 27A12 12 0 0 1 25.5 27" />
      <circle pathLength={1} cx="16" cy="5.5" r="1.7" />
      <path pathLength={1} d="M16 3.8V1.9" />
      <path pathLength={1} d="M15 6.9 9.3 24.5" />
      <path pathLength={1} d="M17 6.9 22.7 24.5" />
      <path pathLength={1} d="m20.9 21.6 3.2 1.3" />
    </Field>
  );
}

/** A site level on its tripod: operations, from land selection onward. */
function Operations() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path pathLength={1} d="M16 17.5 8.5 28.5" />
      <path pathLength={1} d="M16 17.5 23.5 28.5" />
      <path pathLength={1} d="M16 17.5v11" />
      <path
        pathLength={1}
        d="M11.5 10.5h9a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 10 15v-3a1.5 1.5 0 0 1 1.5-1.5z"
      />
      <path pathLength={1} d="M22 13.5h3.5" />
      <path pathLength={1} d="M10 13.5H6.5" />
    </Field>
  );
}

/** A door and the key to it: the first conversation about a home. */
function Sales() {
  return (
    <Field>
      <path pathLength={1} d="M4 28.5h24" />
      <path
        pathLength={1}
        d="M9.5 28.5V7a3.5 3.5 0 0 1 3.5-3.5h5A3.5 3.5 0 0 1 21.5 7v21.5"
      />
      <circle pathLength={1} cx="18.4" cy="17" r="1" />
      <circle pathLength={1} cx="25.6" cy="9.4" r="2.4" />
      <path pathLength={1} d="M25.6 11.8v7.4" />
      <path pathLength={1} d="M25.6 15.2h2.3" />
      <path pathLength={1} d="M25.6 17.4h1.8" />
    </Field>
  );
}

/** A plumb bob hung under a spirit level: quality, checked on site. */
function Quality() {
  return (
    <Field>
      <path
        pathLength={1}
        d="M4.5 7.5h23a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-23A1.5 1.5 0 0 1 3 12V9a1.5 1.5 0 0 1 1.5-1.5z"
      />
      <path pathLength={1} d="M13 8.7h6v3.6h-6z" />
      <circle pathLength={1} cx="16.7" cy="10.5" r="0.9" />
      <path pathLength={1} d="M16 13.5v8.4" />
      <path pathLength={1} d="M13.9 21.9h4.2L16 28.4z" />
    </Field>
  );
}

/** A leaf grown from a parapet: built for tomorrow, not only for today. */
function Sustainability() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path pathLength={1} d="M5.5 28.5v-7h7.5v7" />
      <path pathLength={1} d="M13 21.5c2.2-1.8 3.5-4 3.5-6.5" />
      <path pathLength={1} d="M16.5 15c0-5 3.5-8.5 9-9 .6 5.6-2.8 9-9 9z" />
      <path pathLength={1} d="M17.6 13.8c1.9-3.3 4.4-5.7 7.3-7.1" />
    </Field>
  );
}

/** A hard hat on the ground line: the crews who build the thing. */
function Site() {
  return (
    <Field>
      <path pathLength={1} d="M3.5 28.5h25" />
      <path
        pathLength={1}
        d="M6.5 25.5h19a1.5 1.5 0 0 0 0-3h-19a1.5 1.5 0 0 0 0 3z"
      />
      <path pathLength={1} d="M9.5 22.5V18a6.5 6.5 0 0 1 13 0v4.5" />
      <path pathLength={1} d="M13.2 22.5c0-4 .5-7.2 1.5-9.4" />
      <path pathLength={1} d="M18.8 22.5c0-4-.5-7.2-1.5-9.4" />
      <path pathLength={1} d="M14.7 13.1h2.6" />
    </Field>
  );
}

const DRAWINGS: Record<TeamRoleIcon, () => React.ReactElement> = {
  design: Design,
  operations: Operations,
  sales: Sales,
  quality: Quality,
  sustainability: Sustainability,
  site: Site,
};

export function TeamIcons({ name }: { name: TeamRoleIcon }) {
  const Drawing = DRAWINGS[name];
  return <Drawing />;
}

export default TeamIcons;
