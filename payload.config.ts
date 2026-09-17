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
     * Schema auto-push is ON in development; Payload never pushes when
     * NODE_ENV is "production". Opt out with PAYLOAD_DB_PUSH=false.
     *
     * This is safe only because DATABASE_URL points at a database Payload owns
     * outright (`vakratunda` on Neon). Never point it at `neondb`: that database
     * holds an unrelated Prisma application (User, Account, Plan, Task, …), and
     * push would interactively offer to RENAME those tables into Payload ones.
     *
     * Before the first production deploy, create a baseline migration
     * (`payload migrate:create`) and ship schema changes as migrations.
     */
    push: process.env.PAYLOAD_DB_PUSH !== "false",
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
