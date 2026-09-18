/**
 * Regenerates app/(payload)/admin/importMap.js.
 *
 *   npm run generate:importmap
 *
 * WHY THIS EXISTS instead of `npx payload generate:importmap`: same reason as
 * generate-types.mts — Payload's CLI boots the config through tsx, and on
 * Node 24 that path is broken (ERR_MODULE_NOT_FOUND on @payloadcms/db-postgres
 * from the `?namespace=…` query tsx appends). This script skips tsx entirely.
 *
 * It reads the config only — no database connection is opened.
 *
 * If a future Payload or tsx release fixes the CLI, delete this file and
 * point back at `payload generate:importmap`.
 */

import path from "path";
import { pathToFileURL } from "url";

import config from "../payload.config";

// Not part of Payload's public `exports` map, so it has to be reached by file
// URL rather than by bare specifier.
const generateImportMapPath = pathToFileURL(
  path.resolve("node_modules/payload/dist/bin/generateImportMap/index.js"),
).href;
const { generateImportMap } = await import(generateImportMapPath);

const sanitized = await config;
await generateImportMap(sanitized, { force: true });

console.log("Import map regenerated.");
