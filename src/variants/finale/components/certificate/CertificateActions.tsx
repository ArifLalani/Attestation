"use client";

import { ReviewRequestSheet } from "@/variants/finale/components/reviews/ReviewRequestSheet";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ActionWidget } from "./ActionWidget";
import { AssistantPanel } from "./AssistantPanel";
import { ContactSheet } from "./ContactSheet";

/** The floating contact widget (replaces the FAB and the desktop score pill) and the panels it opens. */
export function CertificateActions() {
  const { agency, panel, setPanel } = useCertificate();
  return (
    <>
      <ActionWidget />
      <ContactSheet agency={agency} open={panel === "contact"} onClose={() => setPanel(null)} />
      <ReviewRequestSheet />
      <AssistantPanel />
    </>
  );
}
