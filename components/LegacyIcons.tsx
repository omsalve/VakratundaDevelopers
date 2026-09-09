import type { LegacyIcon } from "@/lib/content";

/**
 * The five line drawings at the head of the legacy discs — CP_Final p.3,
 * redrawn as paths rather than lifted as flat art.
 *
 * They are paths for one reason: every stroked element carries
 * `pathLength={1}`, so its outline is exactly one unit long whatever its real
 * geometry. That lets the stylesheet hold every icon at `stroke-dasharray: 1;
 * stroke-dashoffset: 1` — undrawn — with no measurement at all, and lets
 * Legacy.tsx draw all five with a single tween to `strokeDashoffset: 0`. No
 * `getTotalLength()`, nothing to re-measure on resize, and the initial state
 * lives in CSS where `.motion-on` can gate it.
 *
 * Everything here is stroke; nothing is filled. A filled shape cannot be
 * drawn on, and would appear before its outline arrived.
 */

const VIEW_BOX = "0 0 32 32";

/** One 32×32 field, one stroke weight, one cap style, for all five. */
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

/** A residential tower on its ground line: fifty years of building futures. */
function Tower() {
  return (
    <Field>
      <path pathLength={1} d="M4 28.5H28" />
      <path
        pathLength={1}
        d="M9.5 28.5V9A3.5 3.5 0 0 1 13 5.5h6A3.5 3.5 0 0 1 22.5 9v19.5"
      />
      <path pathLength={1} d="M12.5 11.5h2.7" />
      <path pathLength={1} d="M16.8 11.5h2.7" />
      <path pathLength={1} d="M12.5 16.5h2.7" />
      <path pathLength={1} d="M16.8 16.5h2.7" />
      <path pathLength={1} d="M14 28.5v-5a2 2 0 0 1 4 0v5" />
    </Field>
  );
}

/** A floor plan under its two dimension lines: 2.1 million square feet. */
function Plan() {
  return (
    <Field>
      <path pathLength={1} d="M11 4.5H28" />
      <path pathLength={1} d="M13.2 2.9 11 4.5l2.2 1.6" />
      <path pathLength={1} d="M25.8 2.9 28 4.5l-2.2 1.6" />
      <path pathLength={1} d="M4.5 11V28" />
      <path pathLength={1} d="M2.9 13.2 4.5 11l1.6 2.2" />
      <path pathLength={1} d="M2.9 25.8 4.5 28l1.6-2.2" />
      <path pathLength={1} d="M11 11h17v17H11z" />
      <path pathLength={1} d="M20 11v8h8" />
    </Field>
  );
}

/** Two adults and a child, the group standing in front: 2500+ families. */
function Family() {
  return (
    <Field>
      <circle pathLength={1} cx="10" cy="10" r="3.6" />
      <path pathLength={1} d="M3.6 27.5V22a6.4 6.4 0 0 1 12.8 0v5.5" />
      <circle pathLength={1} cx="22.5" cy="11.5" r="3.2" />
      <path pathLength={1} d="M17 27.5v-4.3a5.5 5.5 0 0 1 11 0v4.3" />
      <circle pathLength={1} cx="16" cy="20" r="2.2" />
      <path pathLength={1} d="M12.9 27.5v-1.7a3.1 3.1 0 0 1 6.2 0v1.7" />
    </Field>
  );
}

/** A tower crane setting a house down: redevelopment, completed. */
function Crane() {
  return (
    <Field>
      <path pathLength={1} d="M3 28.5h26" />
      <path pathLength={1} d="M5.5 28.5 7.2 25h2.1l1.7 3.5" />
      <path pathLength={1} d="M8.25 25V3.4" />
      <path pathLength={1} d="M4 7.2h18" />
      <path pathLength={1} d="M8.25 3.4 4 7.2" />
      <path pathLength={1} d="M8.25 3.4 22 7.2" />
      <path pathLength={1} d="M19.5 7.2v5" />
      <path pathLength={1} d="M18.2 12.2h2.6" />
      <path pathLength={1} d="M13.5 28.5V20.5L20.5 14.8l7 5.7v8" />
      <path pathLength={1} d="M17.8 28.5v-4.3h5.4v4.3" />
    </Field>
  );
}

/** A shield cradled in two hands: trusted by industry giants. */
function Trust() {
  return (
    <Field>
      <path
        pathLength={1}
        d="M16 3.5 23.5 6.4v6.8c0 4.7-3.1 8.1-7.5 9.5-4.4-1.4-7.5-4.8-7.5-9.5V6.4z"
      />
      <path pathLength={1} d="m12.7 12.9 2.3 2.3 4.4-4.6" />
      <path
        pathLength={1}
        d="M9.2 20.2C6.2 21.4 4.4 23.6 4.8 26c.4 2.2 3.8 3.2 7.8 2.8"
      />
      <path pathLength={1} d="M9.2 20.2c-1.2 1.4-1.4 3.2-.6 4.6" />
      <path
        pathLength={1}
        d="M22.8 20.2c3 1.2 4.8 3.4 4.4 5.8-.4 2.2-3.8 3.2-7.8 2.8"
      />
      <path pathLength={1} d="M22.8 20.2c1.2 1.4 1.4 3.2.6 4.6" />
    </Field>
  );
}

const DRAWINGS: Record<LegacyIcon, () => React.ReactElement> = {
  tower: Tower,
  plan: Plan,
  family: Family,
  crane: Crane,
  trust: Trust,
};

export function LegacyIcons({ name }: { name: LegacyIcon }) {
  const Drawing = DRAWINGS[name];
  return <Drawing />;
}

export default LegacyIcons;
