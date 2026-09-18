import React from "react";

/**
 * Payload admin branding. Both read the same cropped mark the public site
 * renders (`public/brand/brand-mark.png`), so the CMS and the site never
 * carry two different versions of the logo.
 */

const MARK_SRC = "/brand/brand-mark.png";

/** Nav rail icon — small and square, shown collapsed and expanded. */
export function Icon() {
  return (
    <img
      src={MARK_SRC}
      alt=""
      width={24}
      height={24}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}

/** Login screen lockup — mark beside the wordmark, no image for the text. */
export function Logo() {
  return (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <img
        src={MARK_SRC}
        alt=""
        width={40}
        height={40}
        style={{ display: "block", objectFit: "contain" }}
      />
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        Vakratunda
      </span>
    </div>
  );
}
