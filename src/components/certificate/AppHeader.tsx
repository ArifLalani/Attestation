"use client";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ReviewToolbar } from "@/components/reviews/ReviewToolbar";
import { ActiveFilterChips } from "@/components/reviews/ActiveFilterChips";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { tokens } from "@/theme/theme";
import { sectionIds, useCertificate, type SectionId } from "./CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1200 }, mx: "auto" } as const;
/** Reading column: phone width up to 640 px, then 720 px on desktop so nothing looks stretched. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 720 }, mx: "auto" } as const;

/** Figma "Top Header": trust banner + section tabs, pinned to the top (Sticky variant once scrolled). */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);
  const { toolbarPinned } = useCertificate();
  const returningToReviews = useRef(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--certificate-header-height", `${header.getBoundingClientRect().height}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--certificate-header-height");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box component="header" ref={headerRef} sx={{ position: "sticky", top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <Box sx={{ background: "linear-gradient(to right, #001c4e, #11141a)", boxShadow: tokens.elevation3 }}>
        <Box sx={{ ...pageColumnSx, display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <FigmaIcon name="os-icon-logo" />
          <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: tokens.blanc, lineHeight: "normal" }}>
            {t("brand")}
          </Typography>
          <Typography sx={{ fontSize: { xs: 10, sm: 12 }, fontWeight: 600, color: tokens.vertOs, letterSpacing: { xs: "0.5px", sm: "0.8px" }, lineHeight: "normal", whiteSpace: "nowrap", "@media (min-width:400px)": { fontSize: 12, letterSpacing: "0.8px" } }}>
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
          value={active}
          onChange={(_, id: SectionId) => onSelect(id)}
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
              <ReviewToolbar onCountClick={() => { returningToReviews.current = true; onSelect("avis"); }} />
              <ActiveFilterChips />
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
