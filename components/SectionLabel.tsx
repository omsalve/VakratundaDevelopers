import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <span
      className={`block font-sans text-xs uppercase tracking-[0.15em] text-rust ${className}`}
    >
      {children}
    </span>
  );
}
