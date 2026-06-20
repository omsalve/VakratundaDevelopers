import Link from "next/link";
import { Container } from "@/components/Container";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/SocialIcons";
import type { FooterContent, SocialPlatform } from "@/lib/content";

const socialIcons: Record<SocialPlatform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";

export function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className="bg-blush">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1fr_auto]">
          {content.columns.map((column, index) => (
            <nav key={index} aria-label={`Footer links ${index + 1}`}>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`font-sans text-sm text-stone transition-colors hover:text-ink ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col items-start gap-4 md:items-end">
            <span className="font-serif text-2xl font-semibold tracking-[0.08em] text-ink">
              {content.wordmark}
            </span>
            <div className="flex items-center gap-3">
              {content.socials.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <Link
                    key={social.icon}
                    href={social.href}
                    aria-label={social.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-rust ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-14 text-center font-sans text-xs text-stone">{content.copyright}</p>
      </Container>
    </footer>
  );
}
