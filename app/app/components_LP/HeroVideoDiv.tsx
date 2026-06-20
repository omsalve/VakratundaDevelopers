import type { HeroContent } from "@/app/app/lib/content";

export function HeroVideoDiv({ content }: { content: HeroContent }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <h1 className="sr-only">{content.tagline}</h1>
      {/* TODO(Cloudinary): replace the poster image and <source src> below
          with the Cloudinary-hosted hero poster/video URLs. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={content.poster.src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={content.videoSrc} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
