/**
 * Loaded via --import before `npm run generate:types` runs.
 *
 * payload.config.ts imports `sharp`, whose CommonJS dependency chain
 * (ci-info) throws under tsx's interop on Node 24. Type generation never
 * touches image processing, so `sharp` is redirected to an inert stub for the
 * duration of that one script. Both resolvers are patched because tsx loads
 * the config through CJS require() on this project.
 *
 * Nothing but the generate:types script loads this file.
 */
import Module from "node:module";
import { createRequire } from "node:module";
import { register } from "node:module";

const require = createRequire(import.meta.url);
const STUB = require.resolve("./sharp-stub.cjs");

// CJS path (the one tsx actually takes here).
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "sharp") return STUB;
  return originalResolve.call(this, request, ...rest);
};

// ESM path, in case a future toolchain change loads the config as a module.
register("./stub-sharp.mjs", import.meta.url);
