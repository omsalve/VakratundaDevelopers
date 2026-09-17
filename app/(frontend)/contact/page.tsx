import type { Metadata } from "next";
import ContactDesk from "@/components/pages/contact/ContactDesk";
import ContactSwitchboard from "@/components/pages/contact/ContactSwitchboard";
import PageShell from "@/components/PageShell";
import { getPageMetadata, getStandingPage } from "@/lib/getPageContent";

/**
 * Contact Us — THE DESK.
 *
 * The shortest opening on the site: the channels are in the first screen,
 * beside the title rather than a scroll below it, and they are the largest
 * type in the band. Somebody here has already decided to get in touch, and a
 * screen of atmosphere between them and a phone number is a page enjoying
 * itself at the visitor's expense.
 *
 * Then the desk — the only two-panel working layout on the site. The enquiry
 * takes the working column and the office stays beside it, sticky: the
 * photograph, the address, the hours and the direct email all in view while
 * the form is being filled in, so somebody weighing "write, or just turn up?"
 * can see both answers at once. The old page put the address a full screen
 * below the box you were writing in.
 *
 * NOTHING IS POSTED ANYWHERE. The submit composes the fields into a plain-text
 * body and hands it to the visitor's own mail client — behaviour carried over
 * unchanged from the component this replaces.
 *
 * Content: the `contact-page` global over lib/pages/people.ts, shape untouched.
 */

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contact", "/contact");
}

export default async function ContactPage() {
  const { site, page } = await getStandingPage("contact");

  return (
    <PageShell
      page="contact"
      nav={site.nav}
      close={{ content: site.finalCta, legal: site.legal }}
    >
      <ContactSwitchboard content={page.hero} channels={page.channels} />

      <ContactDesk
        form={page.form}
        office={page.office}
        email={site.finalCta.contact.email}
      />
    </PageShell>
  );
}
