"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import SearchOff from "@mui/icons-material/SearchOff";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { SortSheet } from "@/variants/finale/components/certificate/SortSheet";
import { ChoiceChip } from "@/variants/finale/components/ui/FilterChip";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import type { Product, Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters, emptyFilters, sortReviews, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import { tokens } from "@/theme/theme";
import { ActiveFilterChips, quickProducts } from "./ActiveFilterChips";
import { FiltersSheet } from "./FiltersSheet";
import { ReportSheet } from "./ReportSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewSearchField } from "./ReviewSearchField";

const endButtonSx = { width: { xs: "100%", sm: "auto" }, minWidth: { sm: 180 }, px: 2.5, bgcolor: tokens.blanc } as const;
const PAGE_SIZE = 3;
/** The sort choices by theme, as in the Trier par sheet. */
const sortGroups: { key: "date" | "note" | "other"; sorts: ReviewSort[] }[] = [
  { key: "date", sorts: ["recent", "oldest"] },
  { key: "note", sorts: ["best", "worst"] },
  { key: "other", sorts: ["useful", "verified"] },
];

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

/** The white cards of the section: the header card and the empty state (the reviews use the same look). */
const cardSx = { bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft } as const;

/** Filtres and the sort, on the search line: pills as tall as the search, icon only on phones. */
const barButtonSx = {
  ...toolButtonSx,
  height: 48,
  minWidth: 48,
  borderRadius: "999px",
  pl: { xs: 0, sm: 1.75 },
  pr: { xs: 0, sm: 2 },
  justifyContent: "center",
  "& svg": { fontSize: 20 },
} as const;

/** A quick filter: navy with a check when chosen, like the sort chips of the collaborator picker. */
/**
 * Avis (layout from option C, drawn in the page's look). A header card holds the title with the review count and Déposer un avis, the search with Filtres and the sort
 * on one line, and the quick filters; then each review floats on the background as its own card.
 */
export function ReviewsSection() {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const tvf = useTranslations("VarianteFinale.filters");
  const tp = useTranslations("Products");
  const tf = useTranslations("Filters");
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
  const active = countActiveFilters(filters);

  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const toggleProduct = (product: Product) =>
    update({ products: filters.products.includes(product) ? filters.products.filter((item) => item !== product) : [...filters.products, product] });

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

  // Back to the first reviews, and up to the section if its top has scrolled away.
  const showLess = () => {
    setVisible(PAGE_SIZE);
    const section = document.getElementById("avis");
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box component="section" ref={sectionRef} aria-labelledby="reviews-heading" sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      {/* One white Avis card. Top: the title, the search with Filtres and the sort on one line, the quick filters. */}
      <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 3 }, pb: { xs: 0, md: 1 }, display: "flex", flexDirection: "column", gap: { xs: 1.75, md: 2 } }}>
        {/* Title and the yellow Déposer un avis. */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, minHeight: { sm: 45 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
            <Typography id="reviews-heading" component="h2" sx={{ fontSize: 16, fontWeight: 700, color: tokens.vertOs, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: "normal" }}>
              {t("eyebrow")}
            </Typography>
          </Box>
          {/* Tablet and desktop only: on phones it sits under Afficher plus d’avis. */}
          <CtaButton onClick={() => setPanel("reviewRequest")} sx={{ display: { xs: "none", sm: "inline-flex" }, width: "auto", flexShrink: 0, px: 2.5 }}>
            {t("leaveReview")}
          </CtaButton>
        </Box>

        {/* Once this line scrolls under the header, the header shows its own copy of the toolbar. */}
        <Box ref={toolbarRef} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReviewSearchField
            sx={{ flex: 1, minWidth: 0, minHeight: 48, pl: 2, borderRadius: "999px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.grisClair1, color: tokens.gris, "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc } }}
            inputSx={{ color: tokens.bleuFonce, fontSize: 16, "& input": { textOverflow: "ellipsis" } }}
          />
          <Badge
            badgeContent={active}
            invisible={!active}
            overlap="circular"
            sx={{ flexShrink: 0, "& .MuiBadge-badge": { bgcolor: tokens.errorMain, color: tokens.blanc, fontWeight: 700, top: { xs: 6, sm: 8 }, right: { xs: 6, sm: 8 } } }}
          >
            <ButtonBase
              onClick={() => openPanel("filters")}
              aria-label={active ? t("filtersActive", { count: active }) : t("filters")}
              sx={{ ...barButtonSx, ...(active ? { bgcolor: tokens.bleu10, borderColor: tokens.bleu20 } : {}) }}
            >
              <FigmaIcon name="funnel" />
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{t("filters")}</Box>
            </ButtonBase>
          </Badge>
          <ButtonBase onClick={() => openPanel("sort")} aria-haspopup="listbox" aria-label={`${t("sort")} : ${tv(`sortShort.${reviewSort}`)}`} sx={barButtonSx}>
            <FigmaIcon name="sort-ascending" />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tv(`sortShort.${reviewSort}`)}</Box>
          </ButtonBase>
        </Box>

        {/* Quick filters under the search (options from option E): each chip switches its filter on or off at once. */}
        <Box
          role="group"
          aria-label={tv("quickFilters")}
          sx={{ display: "flex", gap: 1, overflowX: { xs: "auto", md: "visible" }, flexWrap: { xs: "nowrap", md: "wrap" }, mx: { xs: -1.5, md: 0 }, px: { xs: 1.5, md: 0 }, py: 0.25, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
        >
          <ChoiceChip
            selected={filters.type === "controle"}
            onClick={() => update({ type: filters.type === "controle" ? undefined : "controle" })}
            icon={<VerifiedRounded sx={{ fontSize: 18, ml: -0.25, color: tokens.vertOs }} />}
          >
            {tvf("typeControle")}
          </ChoiceChip>
          <ChoiceChip selected={filters.period === "year"} onClick={() => update({ period: filters.period === "year" ? undefined : "year" })}>
            {tf("periods.year")}
          </ChoiceChip>
          {quickProducts.map((product) => (
            <ChoiceChip key={product} selected={filters.products.includes(product)} onClick={() => toggleProduct(product)}>
              {tp(product)}
            </ChoiceChip>
          ))}
        </Box>

        {/* Removable chips for the filters that have no quick chip (hidden when there are none). */}
        <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, pt: { xs: 1.5, md: 2 }, "&:empty": { display: "none" } }}>
          <ActiveFilterChips hideQuick />
        </Box>
      </Box>

      {/* Then the count and the reviews, each an outlined card close to the edges (8 px on phones, 16 px on desktop), and Afficher plus / moins. */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.5 } }}>
        {/* The number of reviews shown, above the first one (lined up with the title). */}
        <Box
          component="span"
          aria-live="polite"
          sx={{ alignSelf: "flex-start", ml: { xs: 0, md: 1 }, display: "inline-flex", alignItems: "center", height: 28, px: 1.25, borderRadius: "999px", bgcolor: tokens.bleu10, fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
        >
          {t("count", { count: formatCount(list.length) })}
        </Box>
        {list.slice(0, visible).map((review) => (
          <ReviewCard key={review.id} review={review} onReport={setReporting} outlined />
        ))}
        {!list.length && (
          <Box sx={{ py: 5, px: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: tokens.bleu10, color: tokens.bleu600, display: "grid", placeItems: "center" }}>
              <SearchOff />
            </Box>
            <Typography sx={{ fontSize: 15, color: tokens.gris }}>{t("empty")}</Typography>
            <Link component="button" onClick={() => setFilters(emptyFilters)} sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleu600 }}>
              {t("clearFilters")}
            </Link>
          </Box>
        )}

        {/* Afficher moins / Afficher plus: on the right, stacked on phones with Afficher plus on top. */}
        {list.length > PAGE_SIZE && (
          <Box sx={{ display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, justifyContent: "flex-end", gap: { xs: 1, sm: 1.5 }, mt: 0.5 }}>
            {visible > PAGE_SIZE && (
              <CtaButton variant="secondary" iconUp onClick={showLess} sx={endButtonSx}>
                {tv("showLess")}
              </CtaButton>
            )}
            {visible < list.length && (
              <CtaButton variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)} sx={endButtonSx}>
                {tv("showMore")}
              </CtaButton>
            )}
          </Box>
        )}

        {/* Phones: Déposer un avis, full width, under Afficher plus / moins. */}
        <CtaButton onClick={() => setPanel("reviewRequest")} sx={{ display: { xs: "inline-flex", sm: "none" } }}>
          {t("leaveReview")}
        </CtaButton>
      </Box>

      <FiltersSheet />
      {/* Trier par: its own side sheet on desktop, a bottom sheet on phones, with chips like the filters. One tap applies and closes. */}
      <SortSheet<ReviewSort>
        side
        open={panel === "sort"}
        onClose={() => setPanel(null)}
        anchorEl={panelAnchor}
        value={reviewSort}
        onChange={setReviewSort}
        groups={sortGroups.map((group) => ({ title: tv(`sortGroups.${group.key}`), options: group.sorts.map((value) => ({ value, label: tv(`sortShort.${value}`) })) }))}
      />
      <ReportSheet review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
