import config from "@payload-config";
import { getPayload } from "payload";

export function getPayloadClient() {
  return getPayload({ config });
}

/**
 * Never let the CMS take a page down.
 *
 * A missing table, an unreachable database, or a cold start mid-migration all
 * resolve to the shipped copy plus a server-side warning, rather than a 500 on
 * the page a prospective client is looking at. Every string and image a page
 * needs already exists in lib/content.ts or lib/pages; Payload is an override
 * layer, not a hard dependency.
 *
 * Every CMS read in the app goes through here, so there is one error policy.
 */
export async function readWithFallback<T>(
  source: string,
  read: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.warn(
      `[cms] ${source}: falling back to shipped copy — Payload read failed: ${describe(error)}`,
    );
    return fallback;
  }
}

/**
 * The reason, not the query. Drizzle wraps the database's own error — a
 * missing table, a missing column — in a "Failed query: <sql>" error whose
 * message is the whole statement, so the useful part is on `cause`.
 */
function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause instanceof Error ? error.cause.message : undefined;
  if (cause) return cause;
  return error.message.startsWith("Failed query:")
    ? "database query failed"
    : error.message;
}
