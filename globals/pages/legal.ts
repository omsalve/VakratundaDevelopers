import { proseDoc } from "../../fields/pageFields";
import { pageGlobal } from "./pageGlobal";

/**
 * Terms, Disclaimer and Grievance Redressal — see lib/pages/legal.ts, and its
 * notice about counsel sign-off, before publishing any edit to these.
 */

function legalPage(slug: string, label: string, path: string) {
  return pageGlobal({
    slug,
    label,
    path,
    tabs: [{ label: "Document", fields: [proseDoc()] }],
  });
}

export const TermsPage = legalPage("terms-page", "Terms & Conditions", "/terms");

export const DisclaimerPage = legalPage(
  "disclaimer-page",
  "Disclaimer",
  "/disclaimer",
);

export const GrievancePage = legalPage(
  "grievance-page",
  "Grievance Redressal",
  "/grievance-redressal",
);
