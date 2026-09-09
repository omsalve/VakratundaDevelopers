/**
 * Node ESM resolve hook: retries a failed relative import with a TypeScript
 * extension.
 *
 * Node 24 strips types from .ts files natively, which is all the type
 * generator needs — but Node's resolver still demands an explicit extension,
 * while the Payload config and its imports are written extensionless for the
 * bundler. This bridges the two without touching a single source file.
 *
 * Loaded only by `npm run generate:types` (see scripts/register-hooks.mjs).
 */
const CANDIDATES = [".ts", ".tsx", ".mts", "/index.ts"];

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    const isRelative = specifier.startsWith(".") || specifier.startsWith("/");
    if (!isRelative) throw error;

    for (const extension of CANDIDATES) {
      try {
        return await next(specifier + extension, context);
      } catch {
        // Try the next candidate.
      }
    }
    throw error;
  }
}
