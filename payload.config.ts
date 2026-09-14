import { postgresAdapter } from "@payloadcms/db-postgres";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Projects } from "./collections/Projects";
import { Home } from "./globals/Home";
import { pageGlobals } from "./globals/pages";
import { cloudinaryAdapter } from "./lib/cloudinaryAdapter";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, Posts],
  globals: [Home, ...pageGlobals],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    /**
     * Schema auto-push is OFF by default, deliberately.
     *
     * DATABASE_URL currently points at a schema that also holds an unrelated
     * Prisma application (User, Account, Session, Plan, Task, PlanWeek,
     * _prisma_migrations, …). With push enabled, drizzle-kit sees Payload's
     * new tables, cannot tell a new table from a renamed one, and interactively
     * offers to RENAME those Prisma tables into Payload ones. Answering wrong
     * there is unrecoverable.
     *
     * Turn it on only against a database Payload owns outright:
     *   PAYLOAD_DB_PUSH=true npm run dev
     *
     * See README, "The database needs a decision", for the two ways to make
     * this safe permanently.
     */
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),
  sharp,
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter(),
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
          prefix: "payload-media",
        },
      },
    }),
  ],
});
