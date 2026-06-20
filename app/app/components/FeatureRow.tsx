import Image from "next/image";
import { Container } from "@/app/app/components/Container";
import { SectionLabel } from "@/app/app/components/SectionLabel";
import { GhostButton } from "@/app/app/components/GhostButton";
import type { FeatureRowContent } from "@/app/app/lib/content";

interface FeatureRowProps extends FeatureRowContent {
  imageSide: "left" | "right";
}

export function FeatureRow({
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  image,
  imageSide,
}: FeatureRowProps) {
  const isImageLeft = imageSide === "left";

  return (
    <section className="bg-cream py-24 md:py-32 lg:py-36">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div
            className={`relative aspect-[4/3] w-full overflow-hidden ${
              isImageLeft ? "md:order-1" : "md:order-2"
            }`}
          >
            {/* TODO(Cloudinary): point this src at the Cloudinary-hosted asset. */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className={isImageLeft ? "md:order-2" : "md:order-1"}>
            <SectionLabel>{eyebrow}</SectionLabel>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-stone">
              {body}
            </p>
            <div className="mt-8">
              <GhostButton href={ctaHref}>{ctaLabel}</GhostButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
