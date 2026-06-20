"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, MessageCircle, NotebookPen, Search, X } from "lucide-react";
import { Container } from "../components/Container";
import type { NavActionIcon, NavContent } from "@/app/app/lib/content";

const actionIcons: Record<NavActionIcon, typeof Search> = {
  enquire: NotebookPen,
  chat: MessageCircle,
  search: Search,
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";

export function Navbar({ content }: { content: NavContent }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.85);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const textTone = isScrolled ? "text-ink" : "text-cream";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 motion-reduce:transition-none ${
        isScrolled ? "bg-cream shadow-sm" : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className={`font-serif text-xl font-semibold tracking-[0.08em] ${textTone} ${focusRing}`}
          >
            {content.wordmark}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {content.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1 font-sans text-sm uppercase tracking-[0.08em] transition-colors hover:text-rust ${textTone} ${focusRing}`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            {content.actions.map((action) => {
              const Icon = actionIcons[action.icon];
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-2 font-sans text-sm uppercase tracking-[0.08em] transition-colors hover:text-rust ${textTone} ${focusRing}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {action.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-drawer"
            className={`flex items-center justify-center lg:hidden ${textTone} ${focusRing}`}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col gap-8 bg-cream px-6 py-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-semibold tracking-[0.08em] text-ink">
                {content.wordmark}
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
                className={`text-ink ${focusRing}`}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-6" aria-label="Mobile primary">
              {content.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center gap-2 font-sans text-base uppercase tracking-[0.08em] text-ink ${focusRing}`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-5 border-t border-ink/10 pt-6">
              {content.actions.map((action) => {
                const Icon = actionIcons[action.icon];
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 font-sans text-sm uppercase tracking-[0.08em] text-ink ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
