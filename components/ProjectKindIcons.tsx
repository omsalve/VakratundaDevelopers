import type { ProjectKindIcon } from "@/lib/content";

/**
 * The three drawings on the project-kind tiles under the Concept prose —
 * greenfield, brownfield, redevelopment. Same field, stroke weight and caps as
 * LegacyIcons, so they read as the same hand; drawn fresh rather than reused,
 * because the Legacy discs one section further down already spend the crane.
 */

function Field({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
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

/** A sprout on open ground, between two survey pegs. */
function Greenfield() {
  return (
    <Field>
      <path d="M3 27.5h26" />
      <path d="M16 27.5V17" />
      <path d="M16 21c-4.4 0-7-2.5-7-6.4 4.4 0 7 2.5 7 6.4z" />
      <path d="M16 17.6c0-3.9 2.6-6.4 7-6.4 0 3.9-2.6 6.4-7 6.4z" />
      <path d="M5.5 27.5v-8l3.2 1.5-3.2 1.5" />
      <path d="M26.5 27.5v-8l-3.2 1.5 3.2 1.5" />
    </Field>
  );
}

/** A sawtooth-roofed works and its chimney: land that has had a life before. */
function Brownfield() {
  return (
    <Field>
      <path d="M3 27.5h26" />
      <path d="M5 27.5V16.5l5-3.5v3.5l5-3.5v3.5l5-3.5v14.5" />
      <path d="M23 27.5V8.5h3.5v19" />
      <path d="M10.5 27.5v-4.5h3.5v4.5" />
      <path d="M16.5 20h1.5" />
    </Field>
  );
}

/** A home inside two turning arrows: the same address, rebuilt. */
function Redevelopment() {
  return (
    <Field>
      <path d="M5.66 12.74A11 11 0 0 1 24.43 9.43" />
      <path d="M24.45 6.03 24.43 9.43 21.08 8.85" />
      <path d="M26.34 20.26A11 11 0 0 1 7.57 23.57" />
      <path d="M7.56 26.97 7.57 23.57 10.93 24.15" />
      <path d="M11.5 22v-6.8L16 11.5l4.5 3.7V22z" />
      <path d="M14.6 22v-3.2h2.8V22" />
    </Field>
  );
}

const DRAWINGS: Record<ProjectKindIcon, () => React.ReactElement> = {
  greenfield: Greenfield,
  brownfield: Brownfield,
  redevelopment: Redevelopment,
};

export function ProjectKindIcons({ name }: { name: ProjectKindIcon }) {
  const Drawing = DRAWINGS[name];
  return <Drawing />;
}

export default ProjectKindIcons;
