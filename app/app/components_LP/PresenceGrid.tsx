import Image from "next/image";
import { Container } from "@/app/app/components/Container";
import { SectionLabel } from "@/app/app/components/SectionLabel";
import { GhostButton } from "@/app/app/components/GhostButton";
import type { PresenceContent } from "@/app/app/lib/content";

export function PresenceGrid({ content }: { content: PresenceContent }) {
  return (
    <section className="bg-cream py-24 md:py-32 lg:py-36">
      <Container>
        <div className="text-center">
          <SectionLabel className="mx-auto">{content.eyebrow}</SectionLabel>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {content.heading}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.projects.map((project) => (
            <figure key={project.name}>
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {/* TODO(Cloudinary): point this src at the Cloudinary-hosted asset. */}
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 font-sans text-sm text-stone">
                {project.name} | {project.location}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <GhostButton href={content.ctaHref}>{content.ctaLabel}</GhostButton>
        </div>
      </Container>
    </section>
  );
}
