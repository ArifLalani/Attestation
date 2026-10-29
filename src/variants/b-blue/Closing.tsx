"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { opinionSystemLinks as links } from "@/data/opinionSystem";
import { pageWidthSx } from "./Header";
import { b } from "./theme";
import { focusSx, Pill } from "./ui";

const certifications = [
  { key: "nf", image: "/figma/nf-service.png", width: 41, height: 48 },
  { key: "iso20252", image: "/figma/iso-20252.svg", width: 43, height: 48 },
  { key: "iso9001", image: "/figma/iso-9001.png", width: 48, height: 48 },
] as const;

/** Démarche Qualité: a sage band with the badge, the recommendation level and the three certifications. */
export function Quality() {
  const t = useTranslations("Quality");
  const tb = useTranslations("VarianteB.quality");
  const { agency, reviews, goToSection, setFilters, setScoreCollaboratorId } = useCertificate();
  const recommendation = useMemo(() => {
    const surveys = reviews.filter((review) => review.status === "controle" && review.survey);
    return surveys.length ? Math.round(surveys.reduce((sum, review) => sum + review.survey!.recommendation, 0) / surveys.length) : null;
  }, [reviews]);

  return (
    <Box sx={pageWidthSx}>
      <Box component="section" aria-labelledby="b-quality-title" sx={{ position: "relative", overflow: "hidden", borderRadius: "32px", bgcolor: b.sageTint, p: { xs: 2.5, sm: 4, md: 5 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: { xs: 3, md: 6 } }}>
        <Box aria-hidden sx={{ position: "absolute", right: -80, bottom: -80, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(28, 100, 180, 0.06)" }} />
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 0.75, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: b.white, color: b.sageText, fontSize: 13, fontWeight: 700 }}>
            <VerifiedRounded sx={{ fontSize: 16 }} />
            {tb("eyebrow")}
          </Box>
          <Typography id="b-quality-title" component="h2" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: { xs: 26, md: 32 }, lineHeight: 1.15, color: b.ink }}>
            {t("heading", { name: agency.name })}
          </Typography>
          <Typography sx={{ fontSize: 15, lineHeight: 1.65, color: "#345775" }}>{t("description")}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 2, borderRadius: "24px", bgcolor: b.white }}>
            <Box sx={{ width: { xs: 76, sm: 96 }, flexShrink: 0, "& img": { width: "100%", height: "auto" } }}>
              <Image src="/figma/quality-badge.png" alt={t("badgeAlt")} width={96} height={96} unoptimized />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
              <Image src="/figma/os-logo.png" alt="Opinion System" width={104} height={42} unoptimized />
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t("verified")}</Typography>
              {recommendation !== null && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, fontSize: 14, fontWeight: 600, mb: 0.75 }}>
                    <span>{t("recommendation")}</span>
                    <Box component="span" sx={{ fontWeight: 800, color: b.sageText, whiteSpace: "nowrap" }}>{recommendation}&nbsp;%</Box>
                  </Box>
                  <Box aria-hidden sx={{ height: 8, borderRadius: 4, bgcolor: b.sageTint, overflow: "hidden" }}>
                    <Box sx={{ width: `${recommendation}%`, height: "100%", borderRadius: 4, bgcolor: b.sage }} />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 1.5, justifyContent: "center" }}>
          {certifications.map((certification) => (
            <Link
              key={certification.key}
              href={links.certifications}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: "20px", bgcolor: b.white, color: b.ink, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", transition: "transform 200ms ease, box-shadow 200ms ease", "&:hover": { transform: "translateX(4px)", boxShadow: b.shadow }, "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } }, ...focusSx }}
            >
              <Box sx={{ width: 52, height: 52, flexShrink: 0, display: "grid", placeItems: "center" }}>
                <Image src={certification.image} alt="" width={certification.width} height={certification.height} unoptimized />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700 }}>{t(`certifications.${certification.key}.title`)}</Typography>
                <Typography sx={{ fontSize: 14, color: b.muted }}>{t(`certifications.${certification.key}.description`)}</Typography>
              </Box>
              <ChevronRightRounded sx={{ color: b.muted }} />
            </Link>
          ))}
          <Pill
            variant="dark"
            onClick={() => {
              setFilters(emptyFilters);
              setScoreCollaboratorId(undefined);
              goToSection("avis");
            }}
            sx={{ mt: 1, alignSelf: { xs: "stretch", md: "flex-start" } }}
          >
            {t("readReviews")}
          </Pill>
        </Box>
      </Box>
    </Box>
  );
}

/** Vous êtes une entreprise ? */
export function Pitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box sx={pageWidthSx}>
      <Box component="section" aria-labelledby="b-pitch-title" sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, alignItems: "center", gap: { xs: 2.5, md: 5 }, p: { xs: 1.5, md: 2 }, pr: { md: 5 }, borderRadius: "32px", bgcolor: b.white, boxShadow: b.shadow }}>
        <Box sx={{ position: "relative", aspectRatio: "1376 / 768", borderRadius: "24px", overflow: "hidden" }}>
          <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 900px) 560px, 100vw" style={{ objectFit: "cover" }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: { xs: 1, md: 0 }, pb: { xs: 1, md: 0 } }}>
          <Typography id="b-pitch-title" component="h2" sx={{ fontSize: 14, fontWeight: 700, color: b.accent, letterSpacing: "0.02em" }}>{t("title")}</Typography>
          <Typography component="p" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: { xs: 24, md: 30 }, lineHeight: 1.15 }}>{t("heading")}</Typography>
          <Typography sx={{ fontSize: 15, color: b.muted, lineHeight: 1.6 }}>{t("description")}</Typography>
          <Pill variant="primary" href={links.signup} target="_blank" rel="noopener noreferrer" sx={{ mt: 1, alignSelf: { xs: "stretch", sm: "flex-start" } }}>
            {t("signup")}
          </Pill>
        </Box>
      </Box>
    </Box>
  );
}

const groups = [
  { key: "opinionSystem", items: [{ key: "history", href: links.about }, { key: "certifications", href: links.certifications }, { key: "team", href: links.about }] },
  { key: "business", items: [{ key: "reputation", href: links.solution }, { key: "signup", href: links.signup }, { key: "pricing", href: links.signup }] },
  { key: "consumers", items: [{ key: "findPro", href: links.directory }, { key: "account", href: links.account }] },
] as const;

const footerLinkSx = { fontSize: 14, color: b.ink, textUnderlineOffset: "3px", borderRadius: 0.5, "&:focus-visible": { outline: "none", boxShadow: b.focus } } as const;

export function FooterB() {
  const t = useTranslations("Footer");
  const { setPanel } = useCertificate();
  return (
    <Box component="footer" sx={{ bgcolor: b.sand, borderTop: `1px solid ${b.line}`, mt: { xs: 6, md: 10 }, pb: { xs: "calc(96px + env(safe-area-inset-bottom))", md: 0 } }}>
      <Box sx={{ ...pageWidthSx, py: { xs: 4, md: 6 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.2fr) minmax(0, 2fr)" }, gap: { xs: 4, md: 6 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
          <Link href={links.home} target="_blank" rel="noopener noreferrer" aria-label={t("home")} sx={{ display: "inline-flex", borderRadius: 1, ...focusSx }}>
            <Image src="/figma/os-logo.png" alt="Opinion System" width={124} height={50} unoptimized />
          </Link>
          <Typography sx={{ fontSize: 14, color: b.muted, lineHeight: 1.6, maxWidth: 320 }}>{t("description")}</Typography>
          {[
            { key: "email", value: "contact@opinionsystem.fr", href: "mailto:contact@opinionsystem.fr", icon: <EmailOutlined /> },
            { key: "phone", value: "+33 4 78 24 00 00", href: "tel:+33478240000", icon: <PhoneOutlined /> },
          ].map((contact) => (
            <Link key={contact.key} href={contact.href} underline="hover" sx={{ ...footerLinkSx, display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 600, "& svg": { fontSize: 18 } }}>
              {contact.icon}
              {contact.value}
            </Link>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
          {groups.map((group) => (
            <Box component="nav" key={group.key} aria-label={t(`groups.${group.key}`)}>
              <Typography component="h2" sx={{ fontSize: 15, fontWeight: 700, mb: 1.5 }}>{t(`groups.${group.key}`)}</Typography>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} target="_blank" rel="noopener noreferrer" underline="hover" sx={footerLinkSx}>{t(`links.${item.key}`)}</Link>
                  </li>
                ))}
                {group.key === "consumers" && (
                  <li>
                    <Link component="button" onClick={() => setPanel("reviewRequest")} underline="hover" sx={{ ...footerLinkSx, textAlign: "left", verticalAlign: "baseline", fontFamily: b.sans }}>{t("links.leaveReview")}</Link>
                  </li>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ borderTop: `1px solid ${b.sandDeep}` }}>
        <Box component="nav" aria-label={t("legalLabel")} sx={{ ...pageWidthSx, py: 2.5, display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 3 }, justifyContent: { xs: "center", md: "flex-start" } }}>
          <Typography component="span" sx={{ fontSize: 13, color: b.muted }}>© Opinion System</Typography>
          {(["legal", "terms", "privacy"] as const).map((key) => (
            <Link key={key} href={links[key]} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ ...footerLinkSx, fontSize: 13 }}>{t(`legal.${key}`)}</Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
