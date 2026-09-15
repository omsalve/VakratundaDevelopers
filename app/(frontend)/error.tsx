"use client";

import Link from "next/link";
import { useEffect } from "react";
import RouteState from "@/components/RouteState";
import styles from "@/components/RouteState.module.css";

/**
 * The error boundary for every public route.
 *
 * CMS failures never reach it: a failed Payload read falls back to the shipped
 * copy (lib/cms/read.ts). What reaches it is a render failure the site cannot
 * route around, so it offers the two things that help — try again, or leave.
 *
 * Its copy is fixed rather than CMS-driven, deliberately: it has to render
 * when nothing else can be relied on, including the CMS.
 */
export default function FrontendError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In production the message is redacted; the digest matches the server log.
    console.error("[route error]", error.digest ?? error);
  }, [error]);

  return (
    <RouteState
      label="Something went wrong"
      heading="This page did not load"
      body="It failed while it was being put together. Trying again usually fixes it."
    >
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={() => unstable_retry()}
        >
          Try again
        </button>
        <Link href="/" className={styles.button}>
          Return to the home page
        </Link>
      </div>
    </RouteState>
  );
}
