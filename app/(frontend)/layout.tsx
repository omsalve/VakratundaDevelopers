import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

// Order matters: tokens first, then the rules that consume them.
import "@/styles/vars.css";
import "@/styles/global.css";

/**
 * Root layout for the public site.
 *
 * Payload's admin lives in its own route group, app/(payload)/, with its own
 * root layout. The two never share CSS, which is why removing Tailwind from
 * this side left /admin untouched.
 *
 * FONTS: next/font self-hosts these at build time and emits the @font-face
 * rules with the right `size-adjust`, so there is no runtime request to
 * Google and no preconnect to add — a <link rel="preconnect" href="fonts.
 * gstatic.com"> here would open a connection nothing ever uses. To swap a
 * face, change the import and the `variable` stays the same; nothing else in
 * the codebase names a font.
 */

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"], // italic carries the swash headings
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vakratundagroup.com"),
  title: {
    default: "Vakratunda — Where dreams find an address",
    template: "%s · Vakratunda",
  },
  description:
    "Vakratunda Group has been building in Mumbai since 1973 — 2.1 million sq. ft. delivered, 2,500+ families moved in, and joint ventures with Godrej Properties and Shapoorji Pallonji.",
  openGraph: {
    type: "website",
    siteName: "Vakratunda Group",
    title: "Vakratunda — Where dreams find an address",
    description:
      "Fifty years of residential, commercial and redevelopment work across Mumbai, the suburbs and Thane.",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#161e41",
  colorScheme: "dark",
};

/**
 * Runs before the first paint. `motion-on` is the single gate every entrance
 * animation hangs off — see the "Motion gate" block in styles/global.css.
 * Without JS, or with reduced motion requested, the class is never added and
 * the whole page renders in its final visible state.
 */
const MOTION_GATE = `try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("motion-on")}}catch(e){}`;

const DIRECTION_CONTRACT = `<!--
  THESIS: This page owns continuity — one unbroken line through Mumbai since
  1973, told as a single scroll. It refuses the developer-site default of
  hero photo → amenity card grid → masonry gallery.
  OWN-WORLD: Drenched ink-navy (#161e41) with rose-copper line-work (#E4A8A1):
  hairlines, leader lines, drawn rules, and the mandala petal used as
  structure. Cream (#F6F5F2) enters exactly twice, as lit relief. Playfair
  Display at display scale with one swash-italic word per heading, as the
  brand guide sets it; Inter, tight, for everything else.
  STORY: A society decision-maker learns the practice is 50 years old and has
  really built at scale, believes delivery risk is low (Godrej / Shapoorji
  Pallonji JVs, triple ISO, 100% completion), and makes contact.
  FIRST VIEWPORT: Full-bleed navy, two mandala petals bleeding off opposite
  corners. Centred: mark at 104px, then "Where *dreams* find an address" at
  clamp(2.75rem,6.2vw,6rem), a rose hairline, the standfirst, the 1973 /
  Mumbai / MCHI-CREDAI meta row, and the primary action as a rose pill.
  FORM: cinematic scroll deck. Signature moment: the petal arc wipe, used
  exactly twice, so it stays an event.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->`;

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
        />
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
        {children}
      </body>
    </html>
  );
}
