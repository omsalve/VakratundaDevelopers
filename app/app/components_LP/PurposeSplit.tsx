import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/app/app/components/Container";
import { SectionLabel } from "@/app/app/components/SectionLabel";
import type { PurposeContent } from "@/app/app/lib/content";

export function PurposeSplit({ content }: { content: PurposeContent }) {
  return (
    <section className="bg-cream py-24 md:py-32 lg:py-36">
      <Container>
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="flex flex-col justify-center">
            <SectionLabel>{content.eyebrow}</SectionLabel>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              {content.heading}
            </h2>
            <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-stone">
              {content.body}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {content.panels.map((panel) => (
              <Link
                key={panel.label}
                href={panel.href}
                className="group relative block aspect-[3/4] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
              >
                {/* TODO(Cloudinary): point this src at the Cloudinary-hosted asset. */}
                <Image
                  src={panel.image.src}
                  alt={panel.image.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-1 font-sans text-sm text-cream underline-offset-4 group-hover:underline">
                  {panel.label}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
