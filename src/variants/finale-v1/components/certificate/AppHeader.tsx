"use client";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon } from "@/variants/finale-v1/components/ui/FigmaIcon";
import { tokens } from "@/theme/theme";
import { sectionIds, type SectionId } from "@/components/certificate/CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;
/** Content column: phone width up to 640 px, then 1100 px centred on desktop. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;

/**
 * Figma "Top Header": trust banner + section tabs, always pinned to the top (phones and desktop).
 * While reading the reviews, their search line sticks right under it.
 */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  // The height of the header, for what sits right under it (the reviews' sticky search line) and for the scrolls to a section.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const write = () => document.documentElement.style.setProperty("--certificate-header-height", `${header.offsetHeight}px`);
    const observer = new ResizeObserver(write);
    observer.observe(header);
    write();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--certificate-header-height");
    };
  }, []);

  const select = (id: SectionId) => {
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
      }}
    >
      <Box ref={bannerRef} sx={{ background: "linear-gradient(to right, #001c4e, #11141a)", boxShadow: tokens.elevation3 }}>
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
          // No shadow while the reviews' search line is stuck under the tabs: it carries the shadow.
          boxShadow: scrolled ? "0px 4px 12px 0px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 200ms ease",
          backdropFilter: "saturate(180%) blur(8px)",
          // While the reviews' search line is stuck under it (set by the reviews during the scroll, without a redraw):
          // solid white and no shadow of its own, so tabs and search read as one block with one shadow under it.
          '&[data-reviews-stuck="on"]': { bgcolor: tokens.blanc, boxShadow: "none", backdropFilter: "none" },
          // The search line has slid away under the tabs: the tabs carry the shadow again.
          '&[data-reviews-stuck="on"][data-reviews-search-hidden="on"]': { boxShadow: "0px 4px 12px 0px rgba(0,0,0,0.08)" },
        }}
      >
        <Tabs
          ref={tabsRef}
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
      </Box>
    </Box>
  );
}
