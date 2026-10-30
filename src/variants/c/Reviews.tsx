"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import SearchOff from "@mui/icons-material/SearchOff";
import SwapVert from "@mui/icons-material/SwapVert";
import Tune from "@mui/icons-material/Tune";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import type { Criterion, Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters, emptyFilters, sortReviews } from "@/lib/reviewFilters";
import { ReviewSearchField } from "@/components/reviews/ReviewSearchField";
import { ActiveFilters, FiltersSheetC, SortControl, criteria } from "./Filters";
import { ReportSheetC } from "./Forms";
import { ReviewItem } from "./ReviewItem";
import { ChipC, Pill, SectionCard } from "./ui";
import { focusRing, pc } from "./theme";

const PAGE_SIZE = 3;

const toolButtonSx = {
  height: 40,
  gap: 0.75,
  pl: 1.25,
  pr: 1.75,
  borderRadius: "12px",
  border: `1px solid ${pc.outlineStrong}`,
  bgcolor: "#fff",
  color: pc.ink,
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
  "&:hover": { bgcolor: pc.surfaceDim },
  "&.Mui-focusVisible": focusRing,
  "& svg": { fontSize: 18, color: pc.indigoDark },
} as const;

/** Avis: frequent topics, a toolbar pinned under the tabs (filters, sort, active chips), then the list. */
export function Reviews() {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteC");
  const tc = useTranslations("Criteria");
  const { reviews, filters, setFilters, reviewSort, setPanel } = useCertificate();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reporting, setReporting] = useState<Review | null>(null);
  const [sortEl, setSortEl] = useState<HTMLElement | null>(null);
  const [listKey, setListKey] = useState({ filters, reviewSort });

  // A new filter or sort starts the list again from the top.
  if (listKey.filters !== filters || listKey.reviewSort !== reviewSort) {
    setListKey({ filters, reviewSort });
    setVisible(PAGE_SIZE);
  }

  const list = useMemo(() => sortReviews(applyFilters(reviews, filters), reviewSort), [reviews, filters, reviewSort]);
  // Topic counts follow the other filters, so each chip says how many reviews it would show.
  const topics = useMemo(() => {
    const scope = applyFilters(reviews, { ...filters, criteria: [] });
    const counts = new Map<Criterion, number>(criteria.map((criterion) => [criterion, 0]));
    for (const review of scope) for (const criterion of review.criteria) counts.set(criterion, (counts.get(criterion) ?? 0) + 1);
    return [...counts.entries()].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  }, [reviews, filters]);
  const active = countActiveFilters(filters);

  const toggleTopic = (criterion: Criterion) =>
    setFilters({ ...filters, criteria: filters.criteria.includes(criterion) ? filters.criteria.filter((item) => item !== criterion) : [...filters.criteria, criterion] });

  return (
    <SectionCard
      titleId="vc-reviews-title"
      title={tv("reviewsTitle")}
      subtitle={t("heading")}
      action={
        <Pill tone="tonal" startIcon={<RateReviewOutlined />} onClick={() => setPanel("reviewRequest")} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
          {t("leaveReview")}
        </Pill>
      }
      sx={{ pb: { xs: 2, sm: 3 } }}
    >
      <ReviewSearchField sx={{ minHeight: 48, pl: 2, borderRadius: 999, borderColor: pc.outlineStrong, bgcolor: "#fff", color: pc.muted, "&:focus-within": { borderColor: pc.indigo, boxShadow: `0 0 0 1px ${pc.indigo}` } }} inputSx={{ color: pc.ink }} />

      <Box>
        <Typography component="h3" sx={{ fontSize: 14, fontWeight: 700, color: pc.muted, mb: 1.25 }}>{tv("topics")}</Typography>
        <Box role="group" aria-label={tv("topics")} sx={{ display: "flex", gap: 1, overflowX: { xs: "auto", md: "visible" }, flexWrap: { xs: "nowrap", md: "wrap" }, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, py: 0.25, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
          {topics.map(([criterion, count]) => (
            <ChipC key={criterion} selected={filters.criteria.includes(criterion)} onClick={() => toggleTopic(criterion)} ariaLabel={tv("topicAria", { topic: tc(criterion), count: formatCount(count) })}>
              {tc(criterion)}
              <Box component="span" sx={{ fontWeight: 500, opacity: 0.75 }}>{formatCount(count)}</Box>
            </ChipC>
          ))}
        </Box>
      </Box>

      {/* Pinned under the section tabs while the list scrolls. */}
      <Box sx={{ position: "sticky", top: "var(--vc-sticky-top)", zIndex: 3, mx: { xs: -2, sm: -3 }, px: { xs: 2, sm: 3 }, py: 1.25, bgcolor: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${pc.outline}`, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700 }}>{t("count", { count: formatCount(list.length) })}</Typography>
          <Badge badgeContent={active} invisible={!active} overlap="rectangular" sx={{ "& .MuiBadge-badge": { bgcolor: pc.indigo, color: "#fff", fontWeight: 700, top: 4, right: 4 } }}>
            <ButtonBase onClick={() => setPanel("filters")} aria-label={active ? t("filtersActive", { count: active }) : t("filters")} sx={{ ...toolButtonSx, ...(active ? { bgcolor: pc.indigoTonal, borderColor: "transparent", color: pc.indigoDark } : {}) }}>
              <Tune />
              {t("filters")}
            </ButtonBase>
          </Badge>
          <ButtonBase
            onClick={(event) => {
              setSortEl(event.currentTarget);
              setPanel("sort");
            }}
            aria-haspopup="listbox"
            aria-label={`${t("sort")} : ${tv(`sortShort.${reviewSort}`)}`}
            sx={toolButtonSx}
          >
            <SwapVert />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tv(`sortShort.${reviewSort}`)}</Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{t("sortShort")}</Box>
          </ButtonBase>
        </Box>
        <ActiveFilters />
      </Box>

      <Box sx={{ mt: -2.5 }}>
        {list.slice(0, visible).map((review) => <ReviewItem key={review.id} review={review} onReport={setReporting} />)}
        {!list.length && (
          <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: pc.indigoSoft, color: pc.indigoDark, display: "grid", placeItems: "center" }}>
              <SearchOff />
            </Box>
            <Typography sx={{ fontSize: 15, color: pc.muted }}>{t("empty")}</Typography>
            <Pill tone="tonal" onClick={() => setFilters(emptyFilters)}>{t("clearFilters")}</Pill>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "center", borderTop: list.length ? `1px solid ${pc.outline}` : "none", pt: list.length ? 2.5 : 0, mt: -2.5 }}>
        {visible < list.length && (
          <Pill tone="outlined" onClick={() => setVisible((count) => count + PAGE_SIZE)} sx={{ minWidth: { sm: 220 } }}>
            {t("showMore")} ({formatCount(list.length - visible)})
          </Pill>
        )}
        <Pill tone="filled" startIcon={<RateReviewOutlined />} onClick={() => setPanel("reviewRequest")} sx={{ minWidth: { sm: 220 } }}>
          {t("leaveReview")}
        </Pill>
      </Box>

      <FiltersSheetC />
      <SortControl anchorEl={sortEl} onClose={() => setSortEl(null)} />
      <ReportSheetC review={reporting} onClose={() => setReporting(null)} />
    </SectionCard>
  );
}
