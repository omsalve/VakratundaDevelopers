# Design — "Projects" transitional section (demo scope)

Scope: `demos/our-projects-transition/` only. The Next.js app's visual system is
separate and not governed by this file.

## World

Boutique architecture-editorial: a gallery wall where one image earns the whole
viewport. Plaster off-white ground with a faint fractal-noise tooth, deep navy
ink, monumental Didone display type, hairline rules, tracked micro-caps, and
bougainvillea magenta as the only saturated accent.

## Tokens (`:root` in styles.css)

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f2efe6` | Ground (plaster off-white) |
| `--paper-deep` | `#e9e5d8` | Scrollbar track / recessed paper |
| `--ink` | `#1b2340` | Text, rules, chrome (navy) |
| `--ink-soft` | `rgba(27,35,64,.62)` | Secondary labels |
| `--magenta` / `-deep` / `-bright` / `-pale` | `#cf2d8b` `#a91e6f` `#e858b2` `#f2a3cd` | Bougainvillea bract palette; `-deep` is the hover/accent ink |
| `--leaf` / `--leaf-deep` | `#7da84c` / `#55803a` | Foliage |
| `--stem` | `#6a4a44` | Branch strokes |
| `--gap` `--fx` `--ft` `--fb` | animated | Split-frame geometry (seam width, frame insets) — owned by the GSAP timeline |

## Type

- **Display / headings / nav-major:** Bodoni Moda (400–500). Wordmark: 19vw
  (21vw under 860px), uppercase, near-zero tracking, line-height 0.94, white
  over imagery with a soft navy shadow.
- **Micro-caps / labels:** Archivo 600, 0.6–0.74rem, tracked 0.26–0.5em,
  uppercase. Counter uses tabular numerals.

## Recurring moves

- Chrome (monogram, corner nav, rail) inherits `currentColor` throughout and is
  flipped navy → paper-white by the timeline at 40% progress; legibility over
  imagery is carried by soft navy text/drop shadows, never boxes.
- Panels are clip-path windows (`inset(...)` with `--gap`) over the same
  full-frame image, so the seam closes into a seamless merge.
- Bougainvillea is authored SVG: three bract-geometry variants (`#bloom`,
  `#bloom2`, `#bloom3`) in the four magenta tones, composed into `#sprig`
  boughs; depth via a blurred, reduced-opacity back layer.
- Hovers move by transform and recolor to `--magenta-deep`; focus is a 2px
  magenta outline, offset 4px. Selection is magenta on paper.
- Motion grammar: one scrubbed pinned timeline, beats placed on a 0–1 axis
  (close seam → expand frame → reveal wordmark → boughs exit → depart upward).
  Reduced motion / no JS rests in the final merged state via `html.no-js` /
  `html.static-motion`.
