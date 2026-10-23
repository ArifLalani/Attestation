"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency, Collaborator, Criterion, Product, Review, ReviewStatus } from "@/data/types";
import type { ScoreView, StarBucket } from "@/lib/scoring";

/** Review list filters, shared by the Avis section and the Réputation star rows. */
export interface ReviewFilters {
  type?: ReviewStatus;
  source?: "opinion_system" | "imported";
  /** Filter panel: ≥ stars. Réputation star rows: exactly that bucket. */
  note?: { stars: StarBucket; exact: boolean };
  period?: "today" | "week" | "month" | "year";
  products: Product[];
  criteria: Criterion[];
  collaboratorId?: string;
}

export const emptyFilters: ReviewFilters = { products: [], criteria: [] };

interface CertificateState {
  agency: Agency;
  team: Collaborator[];
  reviews: Review[];
  scoreView: ScoreView;
  setScoreView: (view: ScoreView) => void;
  /** Staff member the Réputation score is shown for. `undefined` = whole team. */
  scoreCollaboratorId?: string;
  setScoreCollaboratorId: (id: string | undefined) => void;
  filters: ReviewFilters;
  setFilters: (filters: ReviewFilters) => void;
  goToSection: (id: SectionId) => void;
}

export const sectionIds = ["synthese", "avis", "agences", "qualite"] as const;
export type SectionId = (typeof sectionIds)[number];

const CertificateContext = createContext<CertificateState | null>(null);

export function CertificateProvider({
  agency,
  goToSection,
  children,
}: {
  agency: Agency;
  goToSection: (id: SectionId) => void;
  children: React.ReactNode;
}) {
  const { team, reviews } = useMemo(() => getAgencyDataset(agency), [agency]);
  const [scoreView, setScoreView] = useState<ScoreView>("global");
  const [scoreCollaboratorId, setScoreCollaboratorId] = useState<string>();
  const [filters, setFilters] = useState<ReviewFilters>(emptyFilters);

  const value = useMemo(
    () => ({
      agency,
      team,
      reviews,
      scoreView,
      setScoreView,
      scoreCollaboratorId,
      setScoreCollaboratorId,
      filters,
      setFilters,
      goToSection,
    }),
    [agency, team, reviews, scoreView, scoreCollaboratorId, filters, goToSection],
  );

  return <CertificateContext value={value}>{children}</CertificateContext>;
}

export function useCertificate() {
  const state = useContext(CertificateContext);
  if (!state) throw new Error("useCertificate must be used inside CertificateProvider");
  return state;
}
