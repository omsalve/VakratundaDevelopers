import RouteState from "@/components/RouteState";

/**
 * The loading state for every public route.
 *
 * Rarely seen by a visitor: every route is prerendered and revalidated in the
 * background, so it only shows while a page renders on demand — the first
 * request for an article published after the last build, or in development.
 */
export default function Loading() {
  return (
    <RouteState busy>
      <p role="status" className="u-visually-hidden">
        Loading
      </p>
    </RouteState>
  );
}
