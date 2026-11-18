"use client";

import { ReviewRequestSheet } from "@/variants/finale/components/reviews/ReviewRequestSheet";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ActionWidget } from "./ActionWidget";
import { ContactSheet } from "./ContactSheet";
import { HoursSheet } from "./HoursSheet";

/** The floating button (score, open status; opens the agency card) and the panels it opens. */
export function CertificateActions() {
  const { agency, panel, setPanel } = useCertificate();
  return (
    <>
      <ActionWidget />
      <ContactSheet agency={agency} open={panel === "contact"} onClose={() => setPanel(null)} />
      {/* Opened by the hero's open/closed status and by Horaires in the agency card. */}
      <HoursSheet agency={agency} open={panel === "hours"} onClose={() => setPanel(null)} />
      <ReviewRequestSheet />
    </>
  );
}
