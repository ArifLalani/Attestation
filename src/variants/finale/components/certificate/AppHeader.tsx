"use client";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ReviewToolbar } from "@/variants/finale/components/reviews/ReviewToolbar";
import { ActiveFilterChips } from "@/variants/finale/components/reviews/ActiveFilterChips";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { tokens } from "@/theme/theme";
import { sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;
/** Content column: phone width up to 640 px, then 1100 px centred on desktop. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;

/**
 * Figma "Top Header": trust banner + section tabs, pinned to the top (Sticky variant once scrolled).
 * Phones and tablets, while reading the reviews (the Avis toolbar pinned): scrolling down slides the banner and the tabs
 * away so only the Avis toolbar and its filter chips stay at the top; the smallest scroll up brings them back.
 */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);
  const { toolbarPinned } = useCertificate();
  const returningToReviews = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  // Height of the banner + tabs (how far the header slides up when they hide).
  const [barsHeight, setBarsHeight] = useState(0);
  const hiddenRef = useRef(false);
  const compact = useMediaQuery("(max-width:899.95px)", { noSsr: true });
  const [barsHidden, setBarsHidden] = useState(false);
  // Programmatic scrolls (a tab, Lire les avis…) must not hide the bars on their way down.
  const quietUntil = useRef(0);

  // Leaving the reviews (or a wider screen) always shows the bars again.
  if (barsHidden && (!toolbarPinned || !compact)) setBarsHidden(false);
  const hideBars = barsHidden && toolbarPinned && compact;

  // The visible height of the header, for the scrolls that stop under it (sections, a review's details).
  // Measured from the page each time: on every size change of the header and whenever the bars hide or show.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const write = () => {
      const bars = (bannerRef.current?.offsetHeight ?? 0) + (tabsRef.current?.offsetHeight ?? 0);
      setBarsHeight(bars);
      document.documentElement.style.setProperty("--certificate-header-height", `${header.offsetHeight - (hiddenRef.current ? bars : 0)}px`);
    };
    const observer = new ResizeObserver(write);
    observer.observe(header);
    write();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--certificate-header-height");
    };
  }, []);
  useEffect(() => {
    hiddenRef.current = hideBars;
    const header = headerRef.current;
    if (!header) return;
    const bars = (bannerRef.current?.offsetHeight ?? 0) + (tabsRef.current?.offsetHeight ?? 0);
    document.documentElement.style.setProperty("--certificate-header-height", `${header.offsetHeight - (hideBars ? bars : 0)}px`);
  }, [hideBars]);

  // Direction of the scroll: about 24 px down hides, about 4 px up shows (so a small jitter does nothing).
  useEffect(() => {
    if (!compact) return;
    let lastY = window.scrollY;
    let travel = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (performance.now() < quietUntil.current) {
        travel = 0;
        return;
      }
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > 24) setBarsHidden(true);
      else if (travel < -4) setBarsHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [compact]);

  const select = (id: SectionId) => {
    setBarsHidden(false);
    quietUntil.current = performance.now() + 1200;
    onSelect(id);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      component="header"
      ref={headerRef}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        transform: hideBars ? `translateY(-${barsHeight}px)` : "none",
        transition: "transform 220ms cubic-bezier(0.2, 0, 0, 1)",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box ref={bannerRef} inert={hideBars} sx={{ background: "linear-gradient(to right, #001c4e, #11141a)", boxShadow: tokens.elevation3 }}>
        <Box sx={{ ...pageColumnSx, display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <FigmaIcon name="os-icon-logo" />
          <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: tokens.blanc, lineHeight: "normal" }}>
            {t("brand")}
          </Typography>
          {/* A small verified badge before « Réputation vérifiée ». */}
          <Typography sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: { xs: 10, sm: 12 }, fontWeight: 600, color: tokens.vertOs, letterSpacing: { xs: "0.5px", sm: "0.8px" }, lineHeight: "normal", whiteSpace: "nowrap", "@media (min-width:400px)": { fontSize: 12, letterSpacing: "0.8px" } }}>
            <VerifiedRounded aria-hidden sx={{ fontSize: "1.45em" }} />
            {t("badge")}
          </Typography>
        </Box>
      </Box>
      <Box
        component="nav"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.96)",
          boxShadow: scrolled ? "0px 4px 12px 0px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 200ms ease",
          backdropFilter: "saturate(180%) blur(8px)",
        }}
      >
        <Tabs
          ref={tabsRef}
          inert={hideBars}
          value={active}
          onChange={(_, id: SectionId) => select(id)}
          variant="fullWidth"
          aria-label={t("tabsLabel")}
          sx={{
            ...contentColumnSx,
            px: 2,
            minHeight: 48,
            "& .MuiTabs-indicator": { height: 3, bgcolor: tokens.vertOs },
          }}
        >
          {sectionIds.map((id) => (
            <Tab
              key={id}
              value={id}
              label={t(`tabs.${id}`)}
              disableRipple
              sx={{
                minWidth: 0,
                minHeight: 48,
                px: 2,
                py: 1.5,
                fontSize: 14,
                lineHeight: "normal",
                fontWeight: 400,
                color: tokens.bleuFonce,
                "&.Mui-selected": { color: tokens.bleuFonce, fontWeight: 600 },
              }}
            />
          ))}
        </Tabs>
        {/* Figma "Top Header" Sticky + showFilteres: the review toolbar follows while scrolling the reviews. */}
        <Collapse in={toolbarPinned} timeout={180} onExited={() => {
          if (returningToReviews.current) {
            returningToReviews.current = false;
            // Collapsing the toolbar changes the header's height in the page flow.
            onSelect("avis");
          }
        }}>
          <Box sx={{ ...contentColumnSx, bgcolor: tokens.blanc, px: 2, py: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <ReviewToolbar onCountClick={() => { returningToReviews.current = true; select("avis"); }} />
              <ActiveFilterChips />
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
