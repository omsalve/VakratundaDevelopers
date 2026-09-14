import type { GlobalConfig } from "payload";

import { CareersPage, ContactPage } from "./people";
import { DisclaimerPage, GrievancePage, TermsPage } from "./legal";
import { InvestorsPage, NriPage } from "./investing";
import { AboutPage, ProjectsPage, SustainabilityPage } from "./standing";
import { AwardsPage, BlogPage, PressPage } from "./newsroom";
import { ExperiencesPage, HospitalityPage } from "./living";

/**
 * Every standing page's global, in the order /admin lists them under "Pages" —
 * the footer's order, roughly: the group, the work, the newsroom, the people,
 * then the documents.
 */
export const pageGlobals: GlobalConfig[] = [
  AboutPage,
  ProjectsPage,
  SustainabilityPage,
  ExperiencesPage,
  HospitalityPage,
  NriPage,
  InvestorsPage,
  PressPage,
  AwardsPage,
  BlogPage,
  CareersPage,
  ContactPage,
  TermsPage,
  DisclaimerPage,
  GrievancePage,
];
