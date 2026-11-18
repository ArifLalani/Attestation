"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useTranslations } from "next-intl";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ReviewSearchField } from "@/variants/finale/components/reviews/ReviewSearchField";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters } from "@/lib/reviewFilters";
import { tokens } from "@/theme/theme";
import { ActiveFilterChips } from "./ActiveFilterChips";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** Filtres and the sort inside the search bar: quiet round buttons, icon only on phones, with their word on wider screens. */
const inBarButtonSx = {
  position: "relative",
  height: 36,
  minWidth: 36,
  gap: 0.75,
  px: { xs: 0, sm: 1.25 },
  justifyContent: "center",
  borderRadius: "6px",
  color: tokens.bleuFonce,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
  "&:hover": { bgcolor: tokens.bleu10 },
  "& svg": { fontSize: 20 },
  ...focusSx,
} as const;

const divider = <Box component="span" aria-hidden sx={{ width: "1px", height: 22, bgcolor: tokens.grisMoyen1, flexShrink: 0 }} />;

/**
 * Variant B, "tout dans la barre": one pill holding the search, then Filtres and the sort after a thin line (like a maps
 * search bar). Phones: icons only, a red dot on Filtres when a filter is on; wider screens: the words and the number.
 * Phones again: tapping the search gives it the whole pill (Filtres and the sort step aside) with a × that ends the typing;
 * leaving the field does the same. What was typed stays as the search.
 */
export function ReviewSearchBar() {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const { filters, reviewSort, openPanel } = useCertificate();
  const active = countActiveFilters(filters);
  // Measured after the first render, so the page from the server and the first render agree (the short placeholder follows).
  const phone = useMediaQuery("(max-width:599.95px)");
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const expanded = phone && typing;
  return (
    <ReviewSearchField
      inputRef={inputRef}
      onFocus={() => setTyping(true)}
      onBlur={() => setTyping(false)}
      hideClear={expanded}
      placeholder={phone ? tv("searchShort") : undefined}
      sx={{ minHeight: 44, pl: 1.75, pr: 0.5, gap: 1, borderRadius: "8px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.grisClair1, color: tokens.gris, "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc } }}
      inputSx={{ color: tokens.bleuFonce, fontSize: 16, "& input": { textOverflow: "ellipsis" } }}
    >
      {expanded ? (
        // Ends the typing (closes the keyboard); pressed before the field loses the focus, so the tap is never lost.
        <ButtonBase onMouseDown={(event) => event.preventDefault()} onClick={() => inputRef.current?.blur()} aria-label={tv("searchClose")} sx={inBarButtonSx}>
          <CloseRounded />
        </ButtonBase>
      ) : (
        <>
          {divider}
          <ButtonBase onClick={() => openPanel("filters")} aria-label={active ? t("filtersActive", { count: active }) : t("filters")} sx={inBarButtonSx}>
            <FigmaIcon name="funnel" />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{t("filters")}</Box>
            {active > 0 && (
              <>
                {/* Phones: a red dot on the funnel. Wider screens: the number, in red. */}
                <Box component="span" aria-hidden sx={{ display: { xs: "block", sm: "none" }, position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", bgcolor: tokens.errorMain, boxShadow: `0 0 0 2px ${tokens.grisClair1}` }} />
                <Box component="span" aria-hidden sx={{ display: { xs: "none", sm: "inline-grid" }, placeItems: "center", minWidth: 18, height: 18, px: "4px", borderRadius: "9px", bgcolor: tokens.errorMain, color: tokens.blanc, fontSize: 11, fontWeight: 700 }}>
                  {active}
                </Box>
              </>
            )}
          </ButtonBase>
          <Box component="span" sx={{ display: { xs: "none", sm: "flex" } }}>{divider}</Box>
          <ButtonBase onClick={() => openPanel("sort")} aria-haspopup="listbox" aria-label={`${t("sort")} : ${tv(`sortShort.${reviewSort}`)}`} sx={inBarButtonSx}>
            <FigmaIcon name="sort-ascending" />
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{tv(`sortShort.${reviewSort}`)}</Box>
          </ButtonBase>
        </>
      )}
    </ReviewSearchField>
  );
}

/**
 * The number of reviews shown (tap: back to the start of the section) and a removable chip per active filter.
 * Under the search in the Avis card; it stays under the pinned search line while reading the reviews.
 */
export function ReviewFilterSummary() {
  const t = useTranslations("Reviews");
  const { reviews, filters, goToSection } = useCertificate();
  const count = useMemo(() => applyFilters(reviews, filters).length, [reviews, filters]);
  // Always one line: the count stays on the left, the chips slide sideways; a soft fade shows there are more on that side.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const left = scroller.scrollLeft > 1;
      const right = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
      setFade((was) => (was.left === left && was.right === right ? was : { left, right }));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    scroller.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", measure);
    };
  }, [filters]);
  const mask = `linear-gradient(to right, transparent 0, #000 ${fade.left ? 24 : 0}px, #000 calc(100% - ${fade.right ? 32 : 0}px), transparent 100%)`;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <ButtonBase
        onClick={() => goToSection("avis")}
        aria-label={t("backToStart", { count: formatCount(count) })}
        sx={{ flexShrink: 0, height: 28, px: 1.25, borderRadius: "6px", bgcolor: tokens.bleu10, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", "&:hover": { bgcolor: tokens.bleu20 }, ...focusSx }}
      >
        <span aria-live="polite">{t("count", { count: formatCount(count) })}</span>
      </ButtonBase>
      <Box
        ref={scrollerRef}
        sx={{
          flex: 1,
          minWidth: 0,
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          // Room for the chips' focus ring inside the scrolling line.
          py: "3px",
          my: "-3px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        <ActiveFilterChips singleLine />
      </Box>
    </Box>
  );
}
