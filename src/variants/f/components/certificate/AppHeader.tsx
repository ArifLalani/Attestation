"use client";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ReviewToolbar } from "@/variants/f/components/reviews/ReviewToolbar";
import { ActiveFilterChips } from "@/variants/f/components/reviews/ActiveFilterChips";
import Button from "@mui/material/Button";
import Image from "next/image";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { poppins, tokens } from "@/variants/f/theme";
import { sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;
/** Content column: phone width up to 640 px, then 1100 px centred on desktop. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;

/** Figma "Top Header": trust banner + section tabs, pinned to the top (Sticky variant once scrolled). */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const tf = useTranslations("VarianteF");
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
      {/* Live page header: the slanted blue logo block, the "N°1 des avis contrôlés" line and the blue sign-up button. */}
      <Box sx={{ position: "relative", height: 64, bgcolor: "rgba(255, 255, 255, 0.92)", backdropFilter: "saturate(180%) blur(8px)", overflow: "hidden" }}>
        <Box
          component="a"
          href={opinionSystemLinks.home}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tf("homeLabel")}
          sx={{ position: "absolute", left: 0, top: 0, height: 64, width: { xs: 224, md: "max(260px, calc((100vw - 1100px) / 2 + 250px))" }, display: "block" }}
        >
          {/* The SVG stretches to the block (preserveAspectRatio none), so the logo is drawn separately to keep its shape. */}
          <Box component="span" sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #005aa9, #102d69)", clipPath: "polygon(0 0, 100% 0, calc(100% - 34px) 100%, 0 70%)" }} />
          <Box component="span" sx={{ position: "absolute", right: { xs: 50, md: 58 }, top: 9, width: 108, height: 45 }}>
            <Image src="/variantes/f/os-logo-white.svg" alt="" fill sizes="108px" unoptimized />
          </Box>
        </Box>
        <Box sx={{ ...pageColumnSx, height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, px: 2, pl: { md: "250px" } }}>
          <Typography sx={{ display: { xs: "none", md: "block" }, flex: 1, fontFamily: poppins, fontSize: 15, lineHeight: 1.2, color: tokens.marine, textTransform: "uppercase" }}>
            {tf("taglineTop")}
            <br />
            {tf("taglineBottom")}
          </Typography>
          <Button
            href={opinionSystemLinks.signup}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: { xs: "none", md: "inline-flex" }, bgcolor: tokens.bleuOs, color: tokens.blanc, borderRadius: "2px", px: 2, py: 1, fontSize: 13, letterSpacing: "1px", textTransform: "uppercase", boxShadow: tokens.shadowCard, "&:hover": { bgcolor: tokens.marine, boxShadow: tokens.shadowCard } }}
          >
            {tf("signup")}
          </Button>
        </Box>
      </Box>
      <Box
        component="nav"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.96)",
          borderTop: `1px solid ${tokens.grisMoyen1}`,
          boxShadow: scrolled ? tokens.shadowCard : "0px 1px 0px 0px rgba(4, 27, 68, 0.06)",
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
            "& .MuiTabs-indicator": { height: 3, bgcolor: tokens.bleu400 },
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
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: tokens.titre,
                "&.Mui-selected": { color: tokens.bleuOs, fontWeight: 500 },
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
