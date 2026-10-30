"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import StarRounded from "@mui/icons-material/StarRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";
import { formatCount, formatScore } from "@/lib/format";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { b } from "./theme";
import { focusSx, Pill } from "./ui";
import { useScore } from "./useScore";

export const pageWidthSx = { width: "100%", maxWidth: 1180, mx: "auto", px: { xs: 2, sm: 3, md: 4 } } as const;

/**
 * Pinned header. Desktop: logo, the section links and, once the contact card has scrolled away,
 * the score and a Contacter button (like Airbnb's "Réserver" in its sub-header). Phones: the four sections only.
 */
export function Header({ active, onSelect, onHeight }: { active: SectionId; onSelect: (id: SectionId) => void; onHeight: (height: number) => void }) {
  const t = useTranslations("Header");
  const tb = useTranslations("VarianteB");
  const { setPanel } = useCertificate();
  const { summary, visible, controle } = useScore();
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [cardGone, setCardGone] = useState(false);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--b-header-height", `${height}px`);
      onHeight(height);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--b-header-height");
    };
  }, [onHeight]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The score + Contacter appear when the sticky contact card is no longer on screen.
  useEffect(() => {
    const card = document.getElementById("b-contact-card");
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setCardGone(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component="header"
      ref={ref}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        overflow: "hidden",
        bgcolor: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid ${scrolled ? b.line : "transparent"}`,
        boxShadow: scrolled ? "0 1px 12px rgba(4, 27, 68, 0.06)" : "none",
        transition: "box-shadow 200ms ease, border-color 200ms ease",
      }}
    >
      <Box
        component="a"
        href={opinionSystemLinks.home}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("brand")}
        sx={{ display: { xs: "none", md: "block" }, position: "absolute", left: 0, top: 0, height: 76, width: "max(250px, calc((100vw - 1180px) / 2 + 250px))", ...focusSx }}
      >
        <Box component="span" sx={{ position: "absolute", inset: 0, background: b.gradient, clipPath: "polygon(0 0, 100% 0, calc(100% - 40px) 100%, 0 72%)" }} />
        <Box component="span" sx={{ position: "absolute", right: 62, top: 12, width: 118, height: 49 }}>
          <Image src="/variantes/f/os-logo-white.svg" alt="" fill sizes="118px" unoptimized />
        </Box>
      </Box>
      <Box sx={{ ...pageWidthSx, position: "relative", display: "flex", alignItems: "center", gap: { xs: 0, md: 3 }, height: { xs: 56, md: 76 }, px: { xs: 0.5, sm: 2, md: 4 } }}>
        {/* Room for the logo block, which is pinned to the left edge of the window. */}
        <Box sx={{ display: { xs: "none", md: "block" }, width: { md: 190, lg: 210 }, flexShrink: 0 }} />

        <Box component="nav" aria-label={t("tabsLabel")} sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: { xs: "space-between", md: "center" }, gap: { md: 1 } }}>
          {sectionIds.map((id) => {
            const selected = id === active;
            return (
              <ButtonBase
                key={id}
                onClick={() => onSelect(id)}
                aria-current={selected ? "true" : undefined}
                sx={{
                  position: "relative",
                  flex: { xs: "1 1 0", md: "0 0 auto" },
                  minHeight: 44,
                  px: { xs: 0.5, md: 2 },
                  borderRadius: 999,
                  fontFamily: b.serif,
                  fontSize: 15,
                  fontWeight: selected ? 700 : 500,
                  color: selected ? b.ink : b.muted,
                  transition: "color 150ms ease, background-color 150ms ease",
                  "&:hover": { color: b.ink, bgcolor: { md: b.sand } },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "50%",
                    bottom: { xs: -6, md: 2 },
                    height: 3,
                    width: selected ? 28 : 0,
                    transform: "translateX(-50%)",
                    borderRadius: 2,
                    bgcolor: b.accent,
                    transition: "width 220ms cubic-bezier(0.2, 0, 0, 1)",
                  },
                  ...focusSx,
                }}
              >
                {t(`tabs.${id}`)}
              </ButtonBase>
            );
          })}
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end", flexShrink: 0, minWidth: { md: 140, lg: 300 } }}>
          <Fade in={cardGone}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {visible && (
                <ButtonBase
                  onClick={() => onSelect("synthese")}
                  sx={{ display: { xs: "none", lg: "inline-flex" }, gap: 0.5, borderRadius: 1, fontSize: 14, color: b.ink, ...focusSx }}
                >
                  <StarRounded sx={{ fontSize: 18, color: controle ? b.sage : b.ink }} />
                  <Typography component="span" sx={{ fontWeight: 700, fontSize: 15 }}>{formatScore(summary.average!)}</Typography>
                  <Typography component="span" sx={{ fontSize: 14, color: b.muted, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    {tb("bar.count", { count: formatCount(summary.count) })}
                  </Typography>
                </ButtonBase>
              )}
              <Pill variant="primary" small onClick={() => setPanel("contact")} aria-haspopup="dialog">
                {tb("header.contact")}
              </Pill>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
