# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Prospective buyers and their families in Mumbai and the MMR, weighing whether the group is who it says it is before they ever talk to sales.
- Existing customers and housing societies looking for customer care, grievance routes and contact details.
- Partners, investors, press and job seekers checking the group's record.

## Product Purpose

The Vakratunda Group website is a brand and customer-service site. Its job is to show the brand and its projects so a visitor comes away sure the group is legitimate: a record since 1973, delivered addresses, the partners it builds beside, its own school, its leadership and what its clients say. It is not a lead-generation site.

## Positioning

A Mumbai developer of five decades that builds residential, commercial and redevelopment projects, works beside Godrej and Shapoorji Pallonji, and runs its own institution (Vihaa International School, Badlapur).

## Operating Context

- Next.js front end over a Payload CMS (hosted Neon Postgres), with media on Cloudinary. The CMS is the source of truth for every line of copy and every photograph; `lib/content.ts` and `lib/pages/*` are only the fallback.
- The landing page is client-approved. Changes there are made by swapping content inside existing sections, not by restructuring.

## Capabilities and Constraints

- No price bands, configurations or possession dates exist to show. Do not propose them.
- No enquiry funnels, sticky call bars or sales CTAs.
- The client asked for clock times and days to be removed from the Experiences page; moments carry one-word names instead.
- Animations and scroll set pieces are part of the approved site: never retune or remove them while restructuring.
- Mobile interaction is optional and tap-driven: no scroll snapping, forced holds, added scroll length, or sideways pans across a cropped photograph on portrait screens.

## Brand Commitments

- The brand guide (CP_Final) supplies the voice and the swash-italic headline device ("The *story* Behind the Structure"). Lines marked AUTHORED in the content files are new writing awaiting approval.
- Photography of amenities is rendered art of the group's developments (much of it Anantaraa, Thane); captions must not claim more than the frame shows.

## Evidence on Hand

- Record: since 1973; 2.1M sq. ft. developed; ISO 9001:2015, 14001:2015 and 45001:2018.
- Partners: Godrej (Skygarden at Godrej Vihaa, Badlapur), Shapoorji Pallonji (Kolshet Road, Thane).
- Vihaa International School photography (`vihaa/`), leadership portraits, client testimonials.
- Amenity renders in `public/images/gallery/` (golden hour and dusk), mirrored to the CMS media library.

## Product Principles

1. Prove, don't sell: every section should make the group's legitimacy easier to see.
2. Customers first: existing residents must reach customer care quickly from anywhere.
3. Claims stay inside the evidence: no invented figures, amenities or warranties.
4. The approved site is preserved: change content inside its frames before changing the frames.
