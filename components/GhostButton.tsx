import type { ReactNode } from "react";
import Link from "next/link";

interface GhostButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  "aria-label"?: string;
}

const baseClasses =
  "inline-flex items-center justify-center border border-rust px-8 py-3 font-sans text-sm tracking-[0.05em] text-rust transition-colors duration-300 hover:bg-rust hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust motion-reduce:transition-none";

export function GhostButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  ...rest
}: GhostButtonProps) {
  const classes = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}
