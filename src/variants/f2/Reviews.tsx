"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import CloseRounded from "@mui/icons-material/CloseRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import SwapVertRounded from "@mui/icons-material/SwapVertRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import type { Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters, sortReviews, type ReviewFilters } from "@/lib/reviewFilters";
import { FiltersB, SortB } from "./Filters";
import { ReportSheetB } from "./Forms";
import { pageWidthSx } from "./Header";
import { ReviewCardB } from "./ReviewCard";
import { b } from "./theme";
import { focusSx, HEADER_VAR, PersonAvatar, Pill, SectionTitle, TextLink } from "./ui";

const PAGE_SIZE = 3;

function ActiveChips() {
  const t = useTranslations("Filters");
  const tr = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { filters, setFilters, team } = useCertificate();
  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const chips: { key: string; label: React.ReactNode; text: string; remove: () => void }[] = [];

  if (filters.type) {
    const text = t(filters.type === "controle" ? "chip.controle" : "chip.nonControle");
    chips.push({ key: "type", label: text, text, remove: () => update({ type: undefined }) });
  }
  if (filters.source) {
    const text = t(filters.source === "opinion_system" ? "sourceOs" : "sourceImported");
    chips.push({ key: "source", label: text, text, remove: () => update({ source: undefined }) });
  }
  if (filters.note) {
    const { stars, exact } = filters.note;
    const prefix = exact || stars === 5 ? `${stars}` : `${stars}+`;
    chips.push({ key: "note", label: <>{prefix}<StarRounded sx={{ fontSize: 16 }} /></>, text: `${prefix}★`, remove: () => update({ note: undefined }) });
  }
  if (filters.period) {
    const text = t(`periods.${filters.period}`);
    chips.push({ key: "period", label: text, text, remove: () => update({ period: undefined }) });
  }
  for (const product of filters.products) {
    const text = tp(product);
    chips.push({ key: `p-${product}`, label: text, text, remove: () => update({ products: filters.products.filter((item) => item !== product) }) });
  }
  for (const criterion of filters.criteria) {
    const text = tc(criterion);
    chips.push({ key: `c-${criterion}`, label: text, text, remove: () => update({ criteria: filters.criteria.filter((item) => item !== criterion) }) });
  }
  const person = team.find((member) => member.id === filters.collaboratorId);
  if (person) {
    chips.push({ key: "collaborator", label: <><PersonAvatar person={person} size={24} />{person.name}</>, text: person.name, remove: () => update({ collaboratorId: undefined }) });
  }
  if (!chips.length) return null;

  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, flexWrap: { sm: "wrap" } }}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <ButtonBase
            onClick={chip.remove}
            aria-label={tr("removeFilter", { label: chip.text })}
            sx={{ gap: 0.75, minHeight: 40, pl: chip.key === "collaborator" ? 0.75 : 1.75, pr: 1.25, borderRadius: 999, bgcolor: b.ink, color: b.white, fontFamily: b.sans, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", "&:hover": { bgcolor: "#000" }, ...focusSx }}
          >
            {chip.label}
            <CloseRounded sx={{ fontSize: 16 }} />
          </ButtonBase>
        </li>
      ))}
    </Box>
  );
}

/** Avis: a pinned toolbar (count, filters, sort, active filters) over story cards, two per row on desktop. */
export function Reviews() {
  const t = useTranslations("Reviews");
  const tr = useTranslations("ReviewSort");
  const tb = useTranslations("VarianteB.reviews");
  const { reviews, filters, setFilters, reviewSort, setPanel, goToSection } = useCertificate();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reporting, setReporting] = useState<Review | null>(null);
  const [listKey, setListKey] = useState({ filters, reviewSort });

  if (listKey.filters !== filters || listKey.reviewSort !== reviewSort) {
    setListKey({ filters, reviewSort });
    setVisible(PAGE_SIZE);
  }

  const list = useMemo(() => sortReviews(applyFilters(reviews, filters), reviewSort), [reviews, filters, reviewSort]);
  const active = countActiveFilters(filters);

  return (
    <Box component="section" aria-labelledby="b-reviews-title" sx={{ ...pageWidthSx, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <SectionTitle id="b-reviews-title" subtitle={tb("subtitle")}>{t("heading")}</SectionTitle>

      <Box sx={{ position: "sticky", top: HEADER_VAR, zIndex: 5, mx: { xs: -2, sm: -3, md: -4 }, px: { xs: 2, sm: 3, md: 4 }, py: 1.25, bgcolor: "rgba(236, 243, 251, 0.94)", backdropFilter: "saturate(180%) blur(10px)", display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ButtonBase onClick={() => goToSection("avis")} aria-label={t("backToStart", { count: formatCount(list.length) })} sx={{ flex: 1, minWidth: 0, justifyContent: "flex-start", borderRadius: 1, ...focusSx }}>
            <Typography aria-live="polite" sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 700, whiteSpace: "nowrap" }}>
              {t("count", { count: formatCount(list.length) })}
            </Typography>
          </ButtonBase>
          <Pill
            variant="outline"
            small
            onClick={() => setPanel("filters")}
            aria-haspopup="dialog"
            aria-label={active ? t("filtersActive", { count: active }) : t("filters")}
            startIcon={<TuneRounded />}
            sx={{ px: { xs: 1.5, sm: 2 }, boxShadow: `inset 0 0 0 ${active ? 2 : 1}px ${b.ink}` }}
          >
            {t("filters")}
            {active > 0 && (
              <Box component="span" sx={{ minWidth: 22, height: 22, px: 0.75, borderRadius: 999, bgcolor: b.accent, color: b.white, fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>
                {active}
              </Box>
            )}
          </Pill>
          <Pill variant="outline" small onClick={() => setPanel("sort")} aria-haspopup="dialog" aria-label={`${t("sort")} : ${tr(reviewSort)}`} startIcon={<SwapVertRounded />} sx={{ px: { xs: 1.5, sm: 2 } }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tr(reviewSort)}</Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{t("sortShort")}</Box>
          </Pill>
        </Box>
        <ActiveChips />
      </Box>

      {list.length ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 1.5, md: 2.5 }, alignItems: "start" }}>
          {list.slice(0, visible).map((review) => (
            <ReviewCardB key={review.id} review={review} onReport={setReporting} />
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 6, px: 2, textAlign: "center", borderRadius: "24px", bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.line}` }}>
          <Typography sx={{ fontFamily: b.serif, fontSize: 22, fontWeight: 600, mb: 0.5 }}>{tb("emptyTitle")}</Typography>
          <Typography sx={{ fontSize: 15, color: b.muted, mb: 1 }}>{t("empty")}</Typography>
          <TextLink onClick={() => setFilters(emptyFilters)}>{t("clearFilters")}</TextLink>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", gap: 1.5, pt: 1 }}>
        {visible < list.length && (
          <Pill variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            {tb("showMore", { count: formatCount(Math.min(PAGE_SIZE, list.length - visible)), total: formatCount(list.length - visible) })}
          </Pill>
        )}
        <Pill variant="primary" onClick={() => setPanel("reviewRequest")} aria-haspopup="dialog">{t("leaveReview")}</Pill>
      </Box>

      <FiltersB />
      <SortB />
      <ReportSheetB review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
