/**
 * Regenerates payload-types.ts.
 *
 *   npm run generate:types
 *
 * WHY THIS EXISTS instead of `npx payload generate:types`:
 * Payload's CLI boots the config through tsx, and on Node 24 that path is
 * broken twice over — tsx appends a `?namespace=…` query the resolver will
 * not strip (ERR_MODULE_NOT_FOUND on @payloadcms/db-postgres), and its
 * JSON-module interop breaks sharp's dependency chain ("vendors.map is not a
 * function" in ci-info). This script skips tsx entirely: Node 24 strips the
 * types itself, and scripts/ts-resolve-hook.mjs supplies the file extensions
 * Node's resolver wants. Same `generateTypes` function, no database
 * connection, no config duplication.
 *
 * It reads the config only — no database connection is opened, so it is safe
 * to run against any environment, or none.
 *
 * If a future Payload or tsx release fixes the CLI, delete this file and
 * point the npm script back at `payload generate:types`.
 */

import { generateTypes } from "payload/node";

import config from "../payload.config";

const sanitized = await config;
await generateTypes(sanitized);

console.log("payload-types.ts regenerated.");
