/**
 * The standing pages' content, in one import.
 *
 * `@/lib/pages` is the only path any route or component imports; the files
 * behind it are split by subject so that editing the careers copy does not
 * mean opening the terms of use. Types live in ./types and are shared by all
 * of them — a new page is a content file and a route, not a new set of shapes.
 */

export * from "./types";
export * from "./standing";
export * from "./living";
export * from "./newsroom";
export * from "./investing";
export * from "./people";
export * from "./legal";
