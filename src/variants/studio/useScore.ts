"use client";

import { useMemo } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { headingFor, isPublic, reviewsForScore, summarize } from "@/lib/scoring";

/** The score as currently displayed: Avis global or Contrôlés, for the team or one person. */
export function useScore() {
  const { agency, team, reviews, scoreView, scoreCollaboratorId } = useCertificate();
  return useMemo(() => {
    const summary = summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId));
    const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
    return {
      summary,
      visible,
      heading: visible ? headingFor(summary.average!) : ("start" as const),
      person: team.find((member) => member.id === scoreCollaboratorId),
      counts: {
        global: reviewsForScore(reviews, "global", scoreCollaboratorId).length,
        controle: reviewsForScore(reviews, "controle", scoreCollaboratorId).length,
      },
    };
  }, [agency.publicThreshold, team, reviews, scoreView, scoreCollaboratorId]);
}
