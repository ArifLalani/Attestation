"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import SearchOff from "@mui/icons-material/SearchOff";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { SortSheet } from "@/variants/finale/components/certificate/SortSheet";
import { ChoiceChip } from "@/variants/finale/components/ui/FilterChip";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import type { Product, Review } from "@/data/types";
import { applyFilters, emptyFilters, sortReviews, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import { tokens } from "@/theme/theme";
import { quickProducts } from "./ActiveFilterChips";
import { FiltersSheet } from "./FiltersSheet";
import { ReportSheet } from "./ReportSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilterSummary, ReviewSearchBar } from "./ReviewToolbar";

const endButtonSx = { width: { xs: "100%", sm: "auto" }, minWidth: { sm: 180 }, px: 2.5, bgcolor: tokens.blanc } as const;
const PAGE_SIZE = 3;
/** The sort choices by theme, as in the Trier par sheet. */
const sortGroups: { key: "date" | "note" | "other"; sorts: ReviewSort[] }[] = [
  { key: "date", sorts: ["recent", "oldest"] },
  { key: "note", sorts: ["best", "worst"] },
  { key: "other", sorts: ["useful", "verified"] },
];


/** The white cards of the section: the header card and the empty state (the reviews use the same look). */
/** Under the lowest stuck line of the reviews' top. */
const stuckShadow = "0px 6px 16px 0px rgba(4, 27, 68, 0.10)";

/**
 * Once stuck, a line of the reviews' top spreads its white across the whole width of the page, like the header above it
 * (a band behind it, from the left edge of the screen to the right one, measured: never wider, so no sideways scroll).
 * The shadow goes under the band. Switched by data attributes written during the scroll, so React never redraws the list
 * at that moment (that redraw is what made the sticking stutter).
 */
const stuckBandSx = {
  "&::before": {
    content: "\"\"",
    position: "absolute",
    // One pixel over each neighbour, so no seam shows between the bands with screen scaling.
    top: -1,
    bottom: -1,
    left: "var(--reviews-band-left, 0px)",
    width: "var(--reviews-band-width, 100%)",
    zIndex: -1,
    bgcolor: tokens.blanc,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 120ms ease, box-shadow 120ms ease, transform 220ms cubic-bezier(0.2, 0, 0, 1)",
  },
  '&[data-band="on"]::before': { opacity: 1 },
  '&[data-shadow="on"]::before': { boxShadow: stuckShadow },
} as const;

/**
 * Reading down the reviews slides the stuck lines up under the tabs; the smallest scroll up brings them back.
 * The sticky boxes themselves never move (they are measured to know when they are stuck): their content and their
 * white band slide, and the box lets taps through while it is empty. `shift` is how far up they go.
 */
const slideAwaySx = (shift: string) =>
  ({
    "& > *": { transition: "transform 220ms cubic-bezier(0.2, 0, 0, 1)" },
    // Set on the line itself (not on the page or the section): only this line's style is recomputed when it toggles.
    '&[data-hide="on"]': {
      bgcolor: "transparent",
      pointerEvents: "none",
      "& > *, &::before": { transform: `translateY(calc(-1 * ${shift}))` },
    },
    "@media (prefers-reduced-motion: reduce)": { "& > *, &::before": { transition: "none" } },
  }) as const;

const cardSx = { bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft } as const;


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
  const { reviews, filters, setFilters, reviewSort, setReviewSort, panel, setPanel, panelAnchor } = useCertificate();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reporting, setReporting] = useState<Review | null>(null);
  const [listKey, setListKey] = useState({ filters, reviewSort });
  const sectionRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // A new filter or sort starts the list again from the top.
  if (listKey.filters !== filters || listKey.reviewSort !== reviewSort) {
    setListKey({ filters, reviewSort });
    setVisible(PAGE_SIZE);
  }

  const list = useMemo(() => sortReviews(applyFilters(reviews, filters), reviewSort), [reviews, filters, reviewSort]);

  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const toggleProduct = (product: Product) =>
    update({ products: filters.products.includes(product) ? filters.products.filter((item) => item !== product) : [...filters.products, product] });

  // Two sticky lines, plain CSS so they move exactly with the scroll: the search line stops under the header,
  // and the count with the active filters stops under the search line. Both leave with the end of the reviews.
  // The search line's height is handed to the second one as a CSS variable.
  useEffect(() => {
    const section = sectionRef.current;
    const toolbar = toolbarRef.current;
    if (!section || !toolbar) return;
    const write = () => {
      section.style.setProperty("--reviews-search-height", `${toolbar.offsetHeight}px`);
      // How far each stuck line slides up to hide under the tabs (its own height, the lines above it, and its shadow).
      const summaryHeight = summaryRef.current?.offsetHeight ?? 0;
      section.style.setProperty("--reviews-search-shift", `${toolbar.offsetHeight + 20}px`);
      section.style.setProperty("--reviews-summary-shift", `${toolbar.offsetHeight + summaryHeight + 20}px`);
      // The stuck lines' white band runs from the screen's left edge to its right edge (scrollbar excluded).
      section.style.setProperty("--reviews-band-left", `${-toolbar.getBoundingClientRect().left}px`);
      section.style.setProperty("--reviews-band-width", `${document.documentElement.clientWidth}px`);
    };
    const observer = new ResizeObserver(write);
    observer.observe(toolbar);
    if (summaryRef.current) observer.observe(summaryRef.current);
    observer.observe(document.documentElement);
    write();
    return () => observer.disconnect();
  }, []);

  // Notes which line is stuck, for the white band and the shadow under the lowest stuck one, and tells the header
  // (solid tabs). Written straight on the page as data attributes: no React state, so nothing redraws while scrolling.
  useEffect(() => {
    let frame = 0;
    // Hide after about 24 px down while stuck; show again after about 6 px up (so a small jitter does nothing).
    let lastY = window.scrollY;
    let travel = 0;
    let hidden = false;
    const update = () => {
      frame = 0;
      const toolbarEl = toolbarRef.current;
      const summaryEl = summaryRef.current;
      if (!toolbarEl || !summaryEl) return;
      const toolbar = toolbarEl.getBoundingClientRect();
      const summary = summaryEl.getBoundingClientRect();
      // Both read on screen (with any browser zoom or screen scaling), with a little slack for sub-pixel rounding.
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? tokens.headerHeight;
      const stuck = Math.abs(toolbar.top - headerBottom) <= 2;
      const summaryStuck = stuck && Math.abs(summary.top - toolbar.bottom) <= 2;
      const set = (el: HTMLElement, key: string, on: boolean) => {
        const value = on ? "on" : "off";
        if (el.dataset[key] !== value) el.dataset[key] = value;
      };
      set(toolbarEl, "band", stuck);
      set(toolbarEl, "shadow", stuck && !summaryStuck);
      set(summaryEl, "band", summaryStuck);
      set(summaryEl, "shadow", summaryStuck);
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      const typing = toolbarEl.contains(document.activeElement);
      if (!stuck || typing) hidden = false;
      else if (travel > 24) hidden = true;
      else if (travel < -6) hidden = false;
      set(toolbarEl, "hide", hidden);
      set(summaryEl, "hide", hidden && summaryStuck);
      // The tabs bar: solid while the search line is stuck under it, its own shadow back once the line has slid away.
      const nav = document.querySelector<HTMLElement>("header nav");
      if (nav) {
        set(nav, "reviewsStuck", stuck);
        set(nav, "reviewsSearchHidden", hidden);
      }
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
      const nav = document.querySelector<HTMLElement>("header nav");
      if (nav) {
        delete nav.dataset.reviewsStuck;
        delete nav.dataset.reviewsSearchHidden;
      }
    };
  }, []);

  // Once more reviews have been loaded and the visitor has scrolled past the whole section (on to Nos Agences), the list folds back
  // to the first three, so coming back up is short. It waits until the scroll has settled (so a smooth scroll to a tab is never cut),
  // and the page is shifted by what was removed above the screen, so nothing moves under the visitor.
  const foldFrom = useRef<number | null>(null);
  useEffect(() => {
    if (visible <= PAGE_SIZE) return;
    let timer = 0;
    const check = () => {
      const section = sectionRef.current;
      if (!section) return;
      const bottom = section.getBoundingClientRect().bottom;
      if (bottom >= 0) return;
      foldFrom.current = bottom;
      setVisible(PAGE_SIZE);
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [visible]);
  useLayoutEffect(() => {
    const before = foldFrom.current;
    const section = sectionRef.current;
    if (before === null || !section) return;
    foldFrom.current = null;
    // The browser may already have kept the place (scroll anchoring); only the remaining difference is corrected.
    const shift = section.getBoundingClientRect().bottom - before;
    if (Math.abs(shift) > 0.5) window.scrollBy({ top: shift, behavior: "instant" });
  }, [visible]);

  // Back to the first reviews, and up to the section if its top has scrolled away.
  const showLess = () => {
    setVisible(PAGE_SIZE);
    const section = document.getElementById("avis");
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box component="section" ref={sectionRef} aria-labelledby="reviews-heading" sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      {/* One white Avis card: the title; the search line, sticky; the suggested filters; the count with the active filters; the reviews. */}
      <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 3 } }}>
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
      </Box>

      {/* The search line scrolls with the page until it reaches the header, then stays there to the end of the reviews. */}
      <Box
        ref={toolbarRef}
        sx={{
          position: "sticky",
          top: "var(--certificate-header-height, 104px)",
          zIndex: 3,
          px: { xs: 1.5, md: 3 },
          pt: { xs: 1.25, md: 1.5 },
          pb: 0.5,
          bgcolor: tokens.blanc,
          ...stuckBandSx,
          ...slideAwaySx("var(--reviews-search-shift, 80px)"),
        }}
      >
        <ReviewSearchBar />
      </Box>

      {/* The suggested filters scroll on, under the search line. */}
      <Box sx={{ px: { xs: 1.5, md: 3 }, pt: 0.75, pb: { xs: 1.5, md: 2 } }}>
        {/* Suggested filters under the search: tapping one moves it down to the active filters; its × there brings it back up here.
            The row disappears when every suggestion is in use. */}
        <Box
          role="group"
          aria-label={tv("quickFilters")}
          sx={{ display: "flex", gap: 1, overflowX: { xs: "auto", md: "visible" }, flexWrap: { xs: "nowrap", md: "wrap" }, mx: { xs: -1.5, md: 0 }, px: { xs: 1.5, md: 0 }, py: 0.25, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, "&:empty": { display: "none" } }}
        >
          {filters.type !== "controle" && (
            <ChoiceChip
              selected={false}
              onClick={() => update({ type: "controle" })}
              icon={<Box component="span" sx={{ ml: -0.25, display: "inline-flex" }}><FigmaIcon name="rv-controle" size={18} /></Box>}
            >
              {tvf("typeControle")}
            </ChoiceChip>
          )}
          {filters.period !== "year" && (
            <ChoiceChip selected={false} onClick={() => update({ period: "year" })}>
              {tf("periods.year")}
            </ChoiceChip>
          )}
          {quickProducts
            .filter((product) => !filters.products.includes(product))
            .map((product) => (
              <ChoiceChip key={product} selected={false} onClick={() => toggleProduct(product)}>
                {tp(product)}
              </ChoiceChip>
            ))}
        </Box>
      </Box>

      {/* Under a thin line: the number of reviews shown and every active filter as a removable chip (the suggested ones included).
          Sticky too: it stops right under the search line and stays with it. */}
      <Box
        ref={summaryRef}
        sx={{
          position: "sticky",
          top: "calc(var(--certificate-header-height, 104px) + var(--reviews-search-height, 72px))",
          zIndex: 2,
          px: { xs: 1.5, md: 3 },
          pb: { xs: 1, md: 1.25 },
          bgcolor: tokens.blanc,
          ...stuckBandSx,
          ...slideAwaySx("var(--reviews-summary-shift, 140px)"),
        }}
      >
        <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, pt: 1 }}>
          <ReviewFilterSummary />
        </Box>
      </Box>

      {/* Then the reviews, each an outlined card close to the edges (8 px on phones, 16 px on desktop), and Afficher plus / moins. */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.5 } }}>
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
