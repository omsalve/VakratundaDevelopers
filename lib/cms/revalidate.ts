import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  RequestContext,
} from "payload";

/**
 * On-demand revalidation for content edited in /admin.
 *
 * Every public route also revalidates on a 60-second timer; these hooks are
 * what make a save show on the next request rather than within the minute.
 * They never throw — a failed revalidation leaves the timer to pick the edit
 * up, where a thrown error would fail the save the editor just made.
 *
 * `next/cache` is imported lazily, and this file uses relative, type-only
 * imports, because payload.config.ts is also loaded outside Next by
 * scripts/generate-types.mts, where there is no cache to revalidate.
 *
 * A bulk script can skip revalidation per operation with
 * `context: { disableRevalidate: true }`.
 */

export interface RevalidateTarget {
  path: string;
  /** "layout" revalidates every page under the path, not only the path. */
  type?: "page" | "layout";
}

async function revalidate(
  targets: RevalidateTarget[],
  context: RequestContext,
): Promise<void> {
  if (context.disableRevalidate || targets.length === 0) return;
  try {
    const { revalidatePath } = await import("next/cache");
    for (const target of targets) revalidatePath(target.path, target.type);
  } catch (error) {
    console.warn(
      `[revalidate] ${targets.map((target) => target.path).join(", ")}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export function revalidateGlobal(
  ...targets: RevalidateTarget[]
): GlobalAfterChangeHook {
  return async ({ doc, req }) => {
    await revalidate(targets, req.context);
    return doc;
  };
}

/**
 * `targetsFor` receives the saved document and, on change, the previous one —
 * so a renamed slug revalidates the URL it moved away from as well.
 */
export function revalidateCollection(
  targetsFor: (
    doc: Record<string, unknown>,
    previousDoc?: Record<string, unknown>,
  ) => RevalidateTarget[],
): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await revalidate(targetsFor(doc, previousDoc), req.context);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidate(targetsFor(doc), req.context);
        return doc;
      },
    ],
  };
}
