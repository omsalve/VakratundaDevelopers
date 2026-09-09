"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * The small non-modal disclosure used by the impact hotspots and the presence
 * timeline. One grammar for both: click or Enter to open, Escape to close,
 * click-away and focus-away to dismiss, focus returned to the trigger.
 *
 * Deliberately not a modal — two lines of context should never take the page
 * hostage. <Lightbox> is the one place a real modal is warranted.
 */
export function usePopover<T extends HTMLElement, B extends HTMLElement>(): {
  open: boolean;
  toggle: () => void;
  close: (returnFocus?: boolean) => void;
  groupRef: RefObject<T | null>;
  triggerRef: RefObject<B | null>;
} {
  const [open, setOpen] = useState(false);
  const groupRef = useRef<T | null>(null);
  const triggerRef = useRef<B | null>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const toggle = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open) return;

    const isOutside = (target: EventTarget | null) =>
      !groupRef.current?.contains(target as Node);

    const onPointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) close(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open, close]);

  return { open, toggle, close, groupRef, triggerRef };
}
