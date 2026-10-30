"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "@/variants/f/components/certificate/ReputationCard";
import { SortSheet } from "@/variants/f/components/certificate/SortSheet";
import { CtaButton } from "@/variants/f/components/ui/CtaButton";
import type { Review } from "@/data/types";
import { applyFilters, emptyFilters, sortReviews, type ReviewSort } from "@/lib/reviewFilters";
import { tokens } from "@/variants/f/theme";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { FiltersSheet } from "./FiltersSheet";
import { ReportSheet } from "./ReportSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewToolbar } from "./ReviewToolbar";
import { ReviewSearchField } from "@/components/reviews/ReviewSearchField";

const desktopCtaSx = { width: { xs: "100%", md: "auto" }, minWidth: { md: 220 }, px: { md: 3 } } as const;
const PAGE_SIZE = 3;
const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];

/** Figma "Reviews" (1380:121663). */
export function ReviewsSection() {
  const t = useTranslations("Reviews");
  const ts = useTranslations("ReviewSort");
  const { reviews, filters, setFilters, reviewSort, setReviewSort, panel, setPanel, panelAnchor, setToolbarPinned } = useCertificate();
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
      sx={{ bgcolor: tokens.blanc, borderRadius: "4px", boxShadow: tokens.shadowCardSoft, py: 1.5, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ px: 2 }}>
        <CardTitle bleedX={2} bleedTop={1.5} id="reviews-heading" eyebrow={t("eyebrow")} heading={t("heading")} />
      </Box>

      <Box sx={{ px: 1.5 }}>
        <ReviewSearchField sx={{ minHeight: 44, borderRadius: tokens.radiusButton, borderColor: tokens.ombre, bgcolor: tokens.blanc, color: tokens.texte, "&:focus-within": { borderColor: tokens.bleuOs, boxShadow: `0 0 0 1px ${tokens.bleuOs}` } }} />
      </Box>

      <Box ref={toolbarRef} sx={{ px: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
        <ReviewToolbar />
        <ActiveFilterChips />
      </Box>

      <Box>
        {list.slice(0, visible).map((review) => (
          <ReviewCard key={review.id} review={review} onReport={setReporting} />
        ))}
        {!list.length && (
          <Box sx={{ gridColumn: "1 / -1", borderTop: `1px solid ${tokens.grisMoyen1}`, px: 2, py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: 14, color: tokens.gris, mb: 1 }}>{t("empty")}</Typography>
            <Link component="button" onClick={() => setFilters(emptyFilters)} sx={{ fontSize: 14, fontWeight: 500, color: tokens.bleu600 }}>
              {t("clearFilters")}
            </Link>
          </Box>
        )}
      </Box>

      {/* Desktop: the two buttons side by side, aligned right, sized to their text. */}
      <Box sx={{ px: 1.5, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: { md: "flex-end" }, gap: 2 }}>
        {visible < list.length && (
          <CtaButton variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)} sx={desktopCtaSx}>
            {t("showMore")}
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
