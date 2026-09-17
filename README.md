# Vakratunda Group

The group's website: a Next.js app with a Payload CMS behind it, on Postgres,
with media on Cloudinary.

```bash
npm run dev          # the site on :3000, /admin on :3000/admin
npm run seed         # put the shipped content into the CMS (safe to re-run)
npm run generate:types
npm run typecheck
npm run lint
```

## Where the content lives

**In the CMS.** Every line of copy and every photograph on every page has a
field in /admin, and `npm run seed` has filled all of them. Editing a page
means editing it there.

| In /admin | What it is |
| --- | --- |
| **Home** | The landing page, one tab per section |
| **Pages → …** | The fifteen standing pages, one global each |
| **Projects** | One document per address. Drives the home-page rail, the map and `/projects` |
| **Articles** | The `/blogs` posts |
| **Media** | Every upload. `alt` is required, and it is the alt text wherever the image is used |

`lib/content.ts` and `lib/pages/*` are the **fallback**, not the site. They are
what renders on a fresh database, or on a request where the database cannot be
read (`lib/cms/read.ts`). Once a field is filled in /admin it wins, so changing
a string in those files does not change a page that has been seeded — change it
there when the shipped default should change too.

Four things are deliberately NOT editable, each for a reason written at the
code that holds it:

- **the site map in the footer** (`lib/navigation.ts`) — a reorderable sitemap
  is a sitemap that can be left pointing at a route that was renamed
- **where each locality sits on the map** (`lib/mapPoints.ts`) — per cent of one
  map file, meaningless apart from it
- **the brand mark** (`components/Logo.tsx`) — swapping it is a rebrand
- **`public/images/og.jpg`** — the last-resort share card, used only if the
  Home global's own share image is cleared

### Seeding

`npm run seed` uploads the shipped photography once and fills every empty field
with the shipped copy. It **never overwrites an editor**: a field that holds
anything is left alone, judged deeply, so a group with one line typed into it
survives untouched. That also makes it the way to top up a global after new
fields are added to it.

Placeholder art (`scripts/make-placeholders.mjs` output) is not uploaded — the
empty field in /admin is the signal that a real photograph is still owed. The
script prints which ones at the end.

### Adding a field

1. add it in `globals/Home.ts` or `fields/pageFields.ts`
2. merge it in `lib/getSiteContent.ts` or `lib/getPageContent.ts`, falling back
   to the shipped value
3. `npm run generate:types`
4. add it to `scripts/seed.mts` and re-run `npm run seed`

Field paths are database columns, and dev-time schema push offers to drop a
column that disappears — so add beside, never rename in place.

## Copy still to approve

Lines marked `AUTHORED` in `lib/content.ts` and `lib/pages/*` are new writing in
the brand guide's voice rather than quotes from it. The three legal documents
(`lib/pages/legal.ts`) are **drafted but not approved by counsel**, and
`/grievance-redressal` cannot go live until a Grievance Officer is named — see
the notice at the head of that file.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
