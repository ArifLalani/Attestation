"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import StarRounded from "@mui/icons-material/StarRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { appGradientWide } from "@/variants/finale/appGradient";
import { sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;
/** Content column: phone width up to 640 px, then 1100 px centred on desktop. */
export const contentColumnSx = { width: "100%", maxWidth: { xs: 640, md: 1100 }, mx: "auto" } as const;

/** Light blue of the active tab's underline (from option F). */
const underline = "#2c95ff";

const fade = (shown: boolean) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  gap: { xs: 1, md: 2 },
  opacity: shown ? 1 : 0,
  transform: shown ? "none" : "translateY(6px)",
  pointerEvents: shown ? "auto" : "none",
  transition: "opacity 220ms ease, transform 220ms ease",
  "@media (prefers-reduced-motion: reduce)": { transition: "none", transform: "none" },
}) as const;

/** The Opinion System logo (white), linked to opinionsystem.fr. */
function OsLogo({ label, small = false, tabIndex }: { label: string; small?: boolean; tabIndex?: number }) {
  return (
    <Box
      component="a"
      href={opinionSystemLinks.home}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      tabIndex={tabIndex}
      sx={{ position: "relative", flex: "none", display: "block", width: small ? 62 : { xs: 62, md: 86 }, height: small ? 26 : { xs: 26, md: 36 } }}
    >
      <Image src="/variantes/f/os-logo-white.svg" alt="" fill sizes="86px" unoptimized priority />
    </Box>
  );
}

/**
 * Header, option 1 « swap on scroll » (stakeholder review, 2026-11-24). One navy bar, always pinned.
 * At the top of the page it shows the Opinion System logo and « Réputation vérifiée »; once the company's name has scrolled away
 * that row cross-fades to the company (logo, name, score), tapping it goes back to the top. The tabs stay: under that row on phones,
 * beside it on desktop (with the Opinion System logo moving to the right end once scrolled).
 */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const { agency, reviews, scoreView, scoreCollaboratorId } = useCertificate();
  const [scrolled, setScrolled] = useState(false);
  const [company, setCompany] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const average = isPublic(summary.count, agency.publicThreshold) ? summary.average : null;

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

  // The company shows in the bar once its name (the hero's heading) has gone under the bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
      const heading = document.querySelector("main h1");
      const barBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      setCompany(heading ? heading.getBoundingClientRect().bottom < barBottom : window.scrollY > 200);
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
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <>
      <Box
        component="header"
        ref={headerRef}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          background: appGradientWide,
          boxShadow: scrolled ? "0px 4px 14px 0px rgba(4, 27, 68, 0.2)" : tokens.elevation3,
          transition: "box-shadow 200ms ease",
          // While the reviews' search line is stuck under the bar it carries the shadow; once it has slid away the bar takes it back.
          '&:has(nav[data-reviews-stuck="on"]:not([data-reviews-search-hidden="on"]))': { boxShadow: "none" },
        }}
      >
        <Box sx={{ ...pageColumnSx, display: "flex", flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "center", columnGap: 3, px: { xs: 0, md: 2 } }}>
          {/* Left: Opinion System + Réputation vérifiée at the top of the page, the company once scrolled. */}
          <Box sx={{ position: "relative", height: { xs: 48, md: 64 }, width: { xs: "100%", md: "auto" }, flex: { md: "0 0 340px" }, minWidth: 0, mx: { xs: 2, md: 0 } }}>
            <Box sx={fade(!company)} aria-hidden={company || undefined}>
              <OsLogo label={t("homeLabel")} tabIndex={company ? -1 : undefined} />
              <Box sx={{ flex: { xs: 1, md: "none" } }} />
              <Typography sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: { xs: 10.5, md: 12 }, fontWeight: 600, color: tokens.vertOs, letterSpacing: "0.6px", lineHeight: "normal", whiteSpace: "nowrap" }}>
                <VerifiedRounded aria-hidden sx={{ fontSize: "1.45em" }} />
                {t("badge")}
              </Typography>
            </Box>
            <ButtonBase
              onClick={toTop}
              aria-hidden={!company || undefined}
              tabIndex={company ? 0 : -1}
              aria-label={agency.name}
              sx={{ ...fade(company), justifyContent: "flex-start", textAlign: "left", fontFamily: "inherit", borderRadius: "8px", "&.Mui-focusVisible": { outline: `2px solid ${underline}`, outlineOffset: 2 } }}
            >
              <Box sx={{ flex: "none", width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 }, borderRadius: "7px", overflow: "hidden", bgcolor: tokens.blanc, display: "grid", placeItems: "center" }}>
                <Box sx={{ position: "relative", width: "80%", height: "72%", overflow: "hidden" }}>
                  <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                    <Image src={agency.logo} alt="" fill sizes="40px" />
                  </Box>
                </Box>
              </Box>
              <Typography component="span" sx={{ minWidth: 0, flex: { xs: 1, md: "0 1 auto" }, fontSize: { xs: 16, md: 18 }, fontWeight: 700, letterSpacing: "-0.03em", color: tokens.blanc, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {agency.name}
              </Typography>
              {average !== null && (
                <Box component="span" sx={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 14, fontWeight: 700, color: tokens.blanc }}>
                  <StarRounded aria-hidden sx={{ fontSize: 18, color: tokens.rating }} />
                  {formatScore(average)}
                </Box>
              )}
            </ButtonBase>
          </Box>

          {/* The tabs: a second row on phones, the middle of the bar on desktop. */}
          <Box component="nav" aria-label={t("tabsLabel")} sx={{ flex: { md: 1 }, width: { xs: "100%", md: "auto" }, minWidth: 0, display: "flex", justifyContent: "center", px: { xs: 1, md: 0 } }}>
            <Tabs
              value={active}
              onChange={(_, id: SectionId) => onSelect(id)}
              variant="fullWidth"
              sx={{ width: "100%", maxWidth: { md: 520 }, minHeight: { xs: 48, md: 64 }, "& .MuiTabs-indicator": { height: 3, borderRadius: "2px", bgcolor: underline } }}
            >
              {sectionIds.map((id) => (
                <Tab
                  key={id}
                  value={id}
                  label={t(`tabs.${id}`)}
                  disableRipple
                  sx={{
                    minWidth: 0, minHeight: { xs: 48, md: 64 }, px: { xs: 1, md: 2 }, py: 1.5, fontSize: { xs: 14, md: 15 }, lineHeight: "normal", fontWeight: 400,
                    color: "rgba(255, 255, 255, 0.72)",
                    "&:hover": { color: tokens.blanc },
                    "&.Mui-selected": { color: tokens.blanc, fontWeight: 600 },
                    "&.Mui-focusVisible": { outline: `2px solid ${underline}`, outlineOffset: -4, borderRadius: "6px" },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Desktop, once scrolled: the Opinion System logo moves to the right end. */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flex: "0 0 340px", justifyContent: "flex-end", opacity: company ? 1 : 0, transition: "opacity 220ms ease" }} aria-hidden={!company || undefined}>
            <OsLogo label={t("homeLabel")} small tabIndex={company ? undefined : -1} />
          </Box>
        </Box>
      </Box>

    </>
  );
}
