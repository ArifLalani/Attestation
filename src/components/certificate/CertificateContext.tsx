"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AiModel } from "@/components/ui/AiLogo";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency, Collaborator, Review } from "@/data/types";
import { emptyFilters, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { ScoreView } from "@/lib/scoring";

export { emptyFilters, type ReviewFilters } from "@/lib/reviewFilters";

/** Panels that several places can open (toolbar in the card and in the pinned header, floating button…). */
export type SharedPanel = "filters" | "sort" | "reviewRequest" | "contact" | "assistant";

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
  /** Desktop: the button a panel was opened from; the panel shows as a dropdown under it. */
  panelAnchor: HTMLElement | null;
  /** Opens a panel. On desktop, with an anchor, it first scrolls so the dropdown has room below the button. */
  openPanel: (panel: SharedPanel, anchor?: HTMLElement) => void;
  /** True while the review toolbar is pinned under the header (Figma "Top Header" Sticky + filters). */
  toolbarPinned: boolean;
  setToolbarPinned: (pinned: boolean) => void;
  /** AI the "Demander à l'IA" chat answers with (cosmetic: the answers are simulated). */
  assistantModel: AiModel;
  setAssistantModel: (model: AiModel) => void;
  /** Opens the AI chat, optionally switching to the AI the user tapped. */
  openAssistant: (model?: AiModel) => void;
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
  const [filters, setFilters] = useState<ReviewFilters>(emptyFilters);
  const scoreCollaboratorId = filters.collaboratorId;
  const setScoreCollaboratorId = useCallback((id: string | undefined) => {
    setFilters((current) => ({ ...current, collaboratorId: id }));
  }, []);
  const [reviewSort, setReviewSort] = useState<ReviewSort>("recent");
  const [panel, setPanelState] = useState<SharedPanel | null>(null);
  const [panelAnchor, setPanelAnchor] = useState<HTMLElement | null>(null);
  const setPanel = useCallback((next: SharedPanel | null) => {
    setPanelState(next);
    if (!next) setPanelAnchor(null);
  }, []);
  const openPanel = useCallback((next: SharedPanel, anchor?: HTMLElement) => {
    const show = () => {
      setPanelAnchor(anchor ?? null);
      setPanelState(next);
    };
    if (!anchor || !window.matchMedia("(min-width:900px)").matches || anchor.closest("header")) return show();
    // Keep the button below the pinned header, and scroll just enough for a dropdown of ~520 px.
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--certificate-header-height")) || 104;
    const rect = anchor.getBoundingClientRect();
    const scroll = Math.min(rect.bottom + 520 - window.innerHeight, rect.top - headerHeight - 12);
    if (scroll > 0) {
      window.scrollBy({ top: scroll, behavior: "smooth" });
      window.setTimeout(show, 350);
    } else {
      show();
    }
  }, []);
  const [toolbarPinned, setToolbarPinned] = useState(false);
  const [assistantModel, setAssistantModel] = useState<AiModel>("chatgpt");
  const openAssistant = useCallback((model?: AiModel) => {
    if (model) setAssistantModel(model);
    setPanelAnchor(null);
    setPanelState("assistant");
  }, []);

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
      panelAnchor,
      openPanel,
      toolbarPinned,
      setToolbarPinned,
      assistantModel,
      setAssistantModel,
      openAssistant,
      goToSection,
    }),
    [agency, team, reviews, scoreView, scoreCollaboratorId, setScoreCollaboratorId, filters, reviewSort, panel, setPanel, panelAnchor, openPanel, toolbarPinned, assistantModel, openAssistant, goToSection],
  );

  return <CertificateContext value={value}>{children}</CertificateContext>;
}

export function useCertificate() {
  const state = useContext(CertificateContext);
  if (!state) throw new Error("useCertificate must be used inside CertificateProvider");
  return state;
}
