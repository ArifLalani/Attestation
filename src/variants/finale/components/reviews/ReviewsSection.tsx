"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import SearchOff from "@mui/icons-material/SearchOff";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "@/variants/finale/components/certificate/ReputationCard";
import { SortSheet } from "@/variants/finale/components/certificate/SortSheet";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import type { Criterion, Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters, emptyFilters, sortReviews, type ReviewSort } from "@/lib/reviewFilters";
import { tokens } from "@/theme/theme";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { FiltersSheet } from "./FiltersSheet";
import { ReportSheet } from "./ReportSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewSearchField } from "./ReviewSearchField";

const desktopCtaSx = { width: { xs: "100%", md: "auto" }, minWidth: { md: 220 }, px: { md: 3 } } as const;
const PAGE_SIZE = 3;
const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

const toolButtonSx = {
  height: 40,
  gap: 0.75,
  pl: 1.25,
  pr: 1.75,
  borderRadius: "8px",
  border: `1px solid ${tokens.grisMoyen1}`,
  bgcolor: tokens.blanc,
  color: tokens.bleuFonce,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
  "&:hover": { bgcolor: tokens.grisClair1 },
  ...focusSx,
} as const;

/** A frequent topic: navy with a check when chosen, like the sort chips of the collaborator picker. */
function TopicChip({ selected, onClick, ariaLabel, children }: { selected: boolean; onClick: () => void; ariaLabel: string; children: React.ReactNode }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      sx={{
        flexShrink: 0,
        gap: 0.75,
        height: 40,
        px: 1.5,
        borderRadius: "8px",
        bgcolor: selected ? tokens.bleuFonce : tokens.blanc,
        border: `1px solid ${selected ? tokens.bleuFonce : tokens.grisMoyen1}`,
        color: selected ? tokens.blanc : tokens.bleuFonce,
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, color 150ms ease",
        "&:hover": { bgcolor: selected ? tokens.bleuFonce : tokens.grisClair1 },
        ...focusSx,
      }}
    >
      {selected && <Check sx={{ fontSize: 18, mr: -0.25 }} />}
      {children}
    </ButtonBase>
  );
}

/**
 * Avis (layout from option C, drawn in the page's look): title with Déposer un avis, search, frequent topics,
 * the count with Filtres and the sort, then the reviews as a list.
 */
export function ReviewsSection() {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const tc = useTranslations("Criteria");
  const ts = useTranslations("ReviewSort");
  const { reviews, filters, setFilters, reviewSort, setReviewSort, panel, setPanel, openPanel, panelAnchor, setToolbarPinned } = useCertificate();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reporting, setReporting] = useState<Review | null>(null);
  const [listKey, setListKey] = useState({ filters, reviewSort });
  const sectionRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

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

  // Pin the toolbar under the header once it scrolls past, while still inside the reviews card.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const toolbar = toolbarRef.current?.getBoundingClientRect();
      const section = sectionRef.current?.getBoundingClientRect();
      if (!toolbar || !section) return;
      setToolbarPinned(toolbar.top < tokens.headerHeight && section.bottom > tokens.headerHeight + 120);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      setToolbarPinned(false);
    };
  }, [setToolbarPinned]);

  return (
    <Box
      component="section"
      ref={sectionRef}
      aria-labelledby="reviews-heading"
      sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <CardTitle id="reviews-heading" eyebrow={t("eyebrow")} heading={t("heading")} />
        <ButtonBase
          onClick={() => setPanel("reviewRequest")}
          sx={{ ...toolButtonSx, display: { xs: "none", sm: "inline-flex" }, border: 0, bgcolor: tokens.bleu10, px: 2, "&:hover": { bgcolor: tokens.bleu20 }, "& svg": { fontSize: 20, color: tokens.bleu600 } }}
        >
          <RateReviewOutlined />
          {t("leaveReview")}
        </ButtonBase>
      </Box>

      <ReviewSearchField
        sx={{ minHeight: 48, pl: 2, borderRadius: "999px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.grisClair1, color: tokens.gris, "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc } }}
        inputSx={{ color: tokens.bleuFonce, fontSize: 16 }}
      />

      {topics.length > 0 && (
        <Box>
          <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, color: tokens.gris, mb: 1.25 }}>{tv("topics")}</Typography>
          <Box
            role="group"
            aria-label={tv("topics")}
            sx={{ display: "flex", gap: 1, overflowX: { xs: "auto", md: "visible" }, flexWrap: { xs: "nowrap", md: "wrap" }, mx: -2, px: 2, py: 0.25, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
          >
            {topics.map(([criterion, count]) => (
              <TopicChip key={criterion} selected={filters.criteria.includes(criterion)} onClick={() => toggleTopic(criterion)} ariaLabel={tv("topicAria", { topic: tc(criterion), count: formatCount(count) })}>
                {tc(criterion)}
                <Box component="span" sx={{ fontWeight: 500, opacity: 0.7 }}>{formatCount(count)}</Box>
              </TopicChip>
            ))}
          </Box>
        </Box>
      )}

      {/* Count, Filtres and sort. Once it scrolls under the header, the header shows its own copy. */}
      <Box ref={toolbarRef} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: tokens.bleuFonce }}>
            {t("count", { count: formatCount(list.length) })}
          </Typography>
          <Badge
            badgeContent={active}
            invisible={!active}
            overlap="rectangular"
            sx={{ "& .MuiBadge-badge": { bgcolor: tokens.errorMain, color: tokens.blanc, fontWeight: 700, top: 4, right: 4 } }}
          >
            <ButtonBase
              onClick={(event) => openPanel("filters", event.currentTarget)}
              aria-label={active ? t("filtersActive", { count: active }) : t("filters")}
              sx={{ ...toolButtonSx, ...(active ? { bgcolor: tokens.bleu10, borderColor: tokens.bleu20 } : {}) }}
            >
              <FigmaIcon name="funnel" />
              {t("filters")}
            </ButtonBase>
          </Badge>
          <ButtonBase onClick={(event) => openPanel("sort", event.currentTarget)} aria-haspopup="listbox" aria-label={`${t("sort")} : ${tv(`sortShort.${reviewSort}`)}`} sx={toolButtonSx}>
            <FigmaIcon name="sort-ascending" />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tv(`sortShort.${reviewSort}`)}</Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{t("sortShort")}</Box>
          </ButtonBase>
        </Box>
        <ActiveFilterChips />
      </Box>

      <Box sx={{ mt: -1 }}>
        {list.slice(0, visible).map((review) => (
          <ReviewCard key={review.id} review={review} onReport={setReporting} />
        ))}
        {!list.length && (
          <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: tokens.bleu10, color: tokens.bleu600, display: "grid", placeItems: "center" }}>
              <SearchOff />
            </Box>
            <Typography sx={{ fontSize: 15, color: tokens.gris }}>{t("empty")}</Typography>
            <Link component="button" onClick={() => setFilters(emptyFilters)} sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleu600 }}>
              {t("clearFilters")}
            </Link>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: { md: "center" }, gap: 2, borderTop: list.length ? `1px solid ${tokens.grisMoyen1}` : "none", pt: list.length ? 2.5 : 0, mt: -2.5 }}>
        {visible < list.length && (
          <CtaButton variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)} sx={desktopCtaSx}>
            {t("showMore")} ({formatCount(list.length - visible)})
          </CtaButton>
        )}
        <CtaButton onClick={() => setPanel("reviewRequest")} sx={desktopCtaSx}>{t("leaveReview")}</CtaButton>
      </Box>

      <FiltersSheet />
      <SortSheet<ReviewSort>
        open={panel === "sort"}
        onClose={() => setPanel(null)}
        anchorEl={panelAnchor}
        value={reviewSort}
        onChange={setReviewSort}
        options={sorts.map((value) => ({ value, label: ts(value), hint: ts(`${value}Hint`) }))}
      />
      <ReportSheet review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
