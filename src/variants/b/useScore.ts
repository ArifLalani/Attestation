"use client";

import { useMemo } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";

/** The score on show: follows the Avis global / Avis Contrôlés switch and the selected collaborator. */
export function useScore() {
  const { agency, reviews, scoreView, scoreCollaboratorId } = useCertificate();
  const scored = useMemo(() => reviewsForScore(reviews, scoreView, scoreCollaboratorId), [reviews, scoreView, scoreCollaboratorId]);
  const summary = useMemo(() => summarize(scored), [scored]);
  const counts = useMemo(
    () => ({
      global: reviewsForScore(reviews, "global", scoreCollaboratorId).length,
      controle: reviewsForScore(reviews, "controle", scoreCollaboratorId).length,
    }),
    [reviews, scoreCollaboratorId],
  );
  return {
    scored,
    summary,
    counts,
    visible: summary.average !== null && isPublic(summary.count, agency.publicThreshold),
    controle: scoreView === "controle",
  };
}
