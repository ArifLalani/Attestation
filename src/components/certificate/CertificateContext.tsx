"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency, Collaborator, Review } from "@/data/types";
import { emptyFilters, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { ScoreView } from "@/lib/scoring";

export { emptyFilters, type ReviewFilters } from "@/lib/reviewFilters";

/** Panels that several places can open (toolbar in the card and in the pinned header, floating button…). */
export type SharedPanel = "filters" | "sort" | "reviewRequest" | "contact";

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
  reviewSort: ReviewSort;
  setReviewSort: (sort: ReviewSort) => void;
  panel: SharedPanel | null;
  setPanel: (panel: SharedPanel | null) => void;
  /** True while the review toolbar is pinned under the header (Figma "Top Header" Sticky + filters). */
  toolbarPinned: boolean;
  setToolbarPinned: (pinned: boolean) => void;
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
  const [reviewSort, setReviewSort] = useState<ReviewSort>("recent");
  const [panel, setPanel] = useState<SharedPanel | null>(null);
  const [toolbarPinned, setToolbarPinned] = useState(false);

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
      reviewSort,
      setReviewSort,
      panel,
      setPanel,
      toolbarPinned,
      setToolbarPinned,
      goToSection,
    }),
    [agency, team, reviews, scoreView, scoreCollaboratorId, filters, reviewSort, panel, toolbarPinned, goToSection],
  );

  return <CertificateContext value={value}>{children}</CertificateContext>;
}

export function useCertificate() {
  const state = useContext(CertificateContext);
  if (!state) throw new Error("useCertificate must be used inside CertificateProvider");
  return state;
}
