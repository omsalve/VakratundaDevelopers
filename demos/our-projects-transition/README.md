# "Projects" — scroll-driven transitional section

A self-contained recreation of the reference transition (Era Residence–style),
adapted as the **Our Projects** section for Vakratunda Developers:

1. Two vertical gallery panels enter with a seam of paper between them and a
   subtle vertical offset (inter-panel parallax).
2. On scroll, the seam closes and the merged image expands to a full-bleed hero.
3. The monumental serif wordmark (**PROJECTS**) reveals — overscaled at first,
   then pinned across the hero.
4. Bougainvillea boughs breach the lower corners and drift out slower than the
   scroll (parallax), leaving the clean hero.
5. A left rail tracks progress (thin line + counter), the fixed chrome flips
   from navy to paper-white once the image owns the viewport, and the section
   departs upward to hand the viewport to the next content.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup: fixed chrome, lead-in, the pinned stage, next-content section. The bougainvillea is authored SVG (`#sprig` / `#bloom` symbols) — no floral asset needed. |
| `styles.css` | All styling. The split geometry lives in four custom properties (`--gap`, `--fx`, `--ft`, `--fb`) that the timeline animates. |
| `scripts.js` | One scrubbed GSAP timeline pinned over the section. All beats are placed on a 0–1 progress axis. |
| `assets/skydeck.jpg` | The gallery image (copied from `public/images/Web_Photo_Editor.jpg`). Swap freely; both panes must reference the **same** image so the halves merge seamlessly. |

## Dependencies

- **GSAP 3.12 + ScrollTrigger** — loaded from jsDelivr CDN (the only JS
  dependency). For production, `npm i gsap` and import instead.
- **Google Fonts** — Bodoni Moda (display serif) and Archivo (tracked
  micro-caps). Self-host for production if you prefer.

No build step. Serve the folder statically (e.g. `npx http-server .`) — opening
`index.html` via `file://` also works.

## Configuration

Top of `scripts.js`:

```js
var CONFIG = {
  counterFrom: 1,     // rail counter at section entry (reference site: 77)
  counterTo: 14,      // rail counter at section exit  (reference site: 83)
  counterPad: 2,      // zero-padding width: 2 -> "01"
  scrollLength: 3.2,  // pin duration, in viewport-heights of scroll
  scrub: 0.9          // scrub smoothing in seconds (0 = hard-linked)
};
```

The choreography is beat-placed on the timeline's 0–1 axis (see the comment
block in `scripts.js`), so retiming a beat is a one-number change. The initial
split geometry (panel inset and seam width) is set in `:root` in `styles.css`.

## Behavior & fallbacks

- **Reduced motion / no JS / CDN blocked** — the page rests in the final merged
  state (full-bleed image, wordmark visible, white chrome). Handled by the
  `html.no-js` / `html.static-motion` classes; no content is lost.
- **QA hook** — append `?p=0.55` (any 0–1) to freeze the choreography at that
  progress for visual-regression captures.
- **Responsive** — below 860px the frame insets tighten, the rail condenses,
  and the boughs re-anchor to the lower corners. The seam/merge behavior is
  identical.

## Integrating into the Next.js app

- Make the section a client component (`"use client"`), run the timeline in a
  `useEffect`/`useGSAP` hook, and kill it on unmount:
  `ScrollTrigger.getAll().forEach(t => t.kill())`.
- Serve `skydeck.jpg` through `next/image` (`fill` + `object-fit: cover`) or
  keep plain `<img>` — the clip-path technique doesn't care which.
- The image is ~6 MB at 4096×2160; for production, export a ~2000px-wide
  WebP/AVIF (and ideally `preload` it, since the section owns the viewport).
- The fixed chrome (monogram / corner nav) belongs in the site layout, not the
  section — it's included here so the demo is a faithful, complete recreation.
- Wordmark, counter range, and project list are the obvious CMS fields
  (Payload: `Projects` collection count can drive `counterTo`).

## Sample content to verify before publishing

The project names, locations, and the "Fourteen addresses" line are taken from
the repo's existing `public/images/projects/` assets — verify they reflect the
portfolio you want to present (and how you present third-party brand names like
Godrej) before this ships anywhere public. The monogram ring text is authored
placeholder branding.
