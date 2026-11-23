"use client";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";
import { sectionIds, type SectionId } from "@/components/certificate/CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;
/** Content column: phone width up to 640 px, then 1100 px centred on desktop. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;

/** Light blue of the active tab's underline (from option F). */
const underline = "#2c95ff";
/** Phones: the logo row folds away past this scroll, and comes back near the top (a gap so it never flickers). */
const FOLD_AT = 80;
const UNFOLD_AT = 24;

/**
 * Header (stakeholder review, 2026-11-23): one navy block, always pinned.
 * Desktop: one 64 px row with the opinionsystem.fr logo, the « N°1 des avis contrôlés » line, the tabs and a yellow Inscrire mon entreprise.
 * Phones: a small logo row with the Réputation vérifiée badge, then the tabs; the logo row folds away on scroll, only the tabs stay.
 */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);
  const [folded, setFolded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 4);
      setFolded((was) => (was ? y > UNFOLD_AT : y > FOLD_AT));
    };
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
        background: "linear-gradient(to right, #001c4e, #11141a)",
        boxShadow: scrolled ? "0px 4px 14px 0px rgba(4, 27, 68, 0.2)" : tokens.elevation3,
        transition: "box-shadow 200ms ease",
        // While the reviews' search line is stuck under the tabs it carries the shadow; once it has slid away the header takes it back.
        '&:has(nav[data-reviews-stuck="on"]:not([data-reviews-search-hidden="on"]))': { boxShadow: "none" },
      }}
    >
      <Box sx={{ ...pageColumnSx, display: "flex", flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "center", columnGap: 3, px: { xs: 0, md: 2 } }}>
        {/* Logo row. On phones it folds to 0 once the visitor scrolls; on desktop it is the left of the single row. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            width: { xs: "100%", md: "auto" },
            flex: { md: "none" },
            px: { xs: 2, md: 0 },
            height: { xs: folded ? 0 : 46, md: 64 },
            opacity: { xs: folded ? 0 : 1, md: 1 },
            overflow: "hidden",
            transition: "height 220ms ease, opacity 180ms ease",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
          aria-hidden={folded ? true : undefined}
        >
          <Box
            component="a"
            href={opinionSystemLinks.home}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("homeLabel")}
            tabIndex={folded ? -1 : undefined}
            sx={{ position: "relative", flex: "none", display: "block", width: { xs: 62, md: 86 }, height: { xs: 26, md: 36 } }}
          >
            <Image src="/variantes/f/os-logo-white.svg" alt="" fill sizes="86px" unoptimized priority />
          </Box>
          <Typography sx={{ display: { xs: "none", lg: "block" }, fontSize: 12, lineHeight: 1.3, color: "rgba(255, 255, 255, 0.8)", whiteSpace: "nowrap" }}>
            {t("taglineTop")}
            <br />
            {t("taglineBottom")}
          </Typography>
          <Box sx={{ flex: 1, display: { md: "none" } }} />
          <Typography sx={{ display: { xs: "inline-flex", md: "none" }, alignItems: "center", gap: 0.5, fontSize: 10, fontWeight: 600, color: tokens.vertOs, letterSpacing: "0.5px", lineHeight: "normal", whiteSpace: "nowrap", "@media (min-width:400px)": { fontSize: 11, letterSpacing: "0.7px" } }}>
            <VerifiedRounded aria-hidden sx={{ fontSize: "1.45em" }} />
            {t("badge")}
          </Typography>
        </Box>

        <Box component="nav" sx={{ flex: { md: 1 }, width: { xs: "100%", md: "auto" }, minWidth: 0, display: "flex", justifyContent: "center", px: { xs: 1, md: 0 } }}>
          <Tabs
            value={active}
            onChange={(_, id: SectionId) => onSelect(id)}
            variant="fullWidth"
            aria-label={t("tabsLabel")}
            sx={{
              width: "100%",
              maxWidth: { md: 520 },
              minHeight: { xs: 48, md: 64 },
              "& .MuiTabs-indicator": { height: 3, borderRadius: "2px", bgcolor: underline },
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
                  minHeight: { xs: 48, md: 64 },
                  px: { xs: 1, md: 2 },
                  py: 1.5,
                  fontSize: { xs: 14, md: 15 },
                  lineHeight: "normal",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.72)",
                  "&:hover": { color: tokens.blanc },
                  "&.Mui-selected": { color: tokens.blanc, fontWeight: 600 },
                  "&.Mui-focusVisible": { outline: `2px solid ${underline}`, outlineOffset: -4, borderRadius: "6px" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CtaButton
          href={opinionSystemLinks.signup}
          target="_blank"
          rel="noopener noreferrer"
          icon={null}
          sx={{ display: { xs: "none", md: "inline-flex" }, width: "auto", flex: "none", minHeight: 40, py: 1, px: 2, whiteSpace: "nowrap" }}
        >
          {t("signup")}
        </CtaButton>
      </Box>
    </Box>
  );
}
