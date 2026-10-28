"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { opinionSystemLinks as links } from "@/data/opinionSystem";
import { Bar } from "./Reputation";
import { Pill, SectionCard } from "./ui";
import { focusRing, pc } from "./theme";

const certifications = [
  { key: "nf", image: "/figma/nf-service.png", width: 40, height: 46 },
  { key: "iso20252", image: "/figma/iso-20252.svg", width: 40, height: 45 },
  { key: "iso9001", image: "/figma/iso-9001.png", width: 42, height: 42 },
] as const;

/** Démarche Qualité: the badge, the recommendation level, the three certifications. */
export function Quality() {
  const t = useTranslations("Quality");
  const tv = useTranslations("VarianteC");
  const { agency, reviews, goToSection, setFilters, setScoreCollaboratorId } = useCertificate();
  const recommendation = useMemo(() => {
    const surveys = reviews.filter((review) => review.status === "controle" && review.survey);
    return surveys.length ? Math.round(surveys.reduce((sum, review) => sum + review.survey!.recommendation, 0) / surveys.length) : null;
  }, [reviews]);

  return (
    <SectionCard titleId="vc-quality-title" title={tv("qualityTitle")} subtitle={t("heading", { name: agency.name })}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: 2, borderRadius: "20px", bgcolor: pc.emeraldTint }}>
            <Image src="/figma/quality-badge.png" alt={t("badgeAlt")} width={96} height={96} unoptimized />
            <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Image src="/figma/os-logo.png" alt="Opinion System" width={112} height={45} unoptimized />
              <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start", color: pc.emeraldText }}>
                <VerifiedUser sx={{ fontSize: 18, mt: "1px" }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{t("verified")}</Typography>
              </Box>
            </Box>
          </Box>
          {recommendation !== null && (
            <Box sx={{ p: 2, borderRadius: "20px", border: `1px solid ${pc.outline}` }}>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("recommendation")}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: pc.indigoDark, lineHeight: 1 }}>{recommendation} %</Typography>
              </Box>
              <Bar value={recommendation} color={pc.indigo} height={10} track={pc.indigoSoft} />
            </Box>
          )}
          <Typography sx={{ fontSize: 14, color: pc.muted, lineHeight: 1.6 }}>{t("description")}</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            {certifications.map((certification) => (
              <li key={certification.key}>
                <Link
                  href={links.certifications}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.75, minHeight: 72, borderRadius: "20px", border: `1px solid ${pc.outline}`, color: pc.ink, transition: "background-color 150ms ease", "&:hover": { bgcolor: pc.surfaceDim }, "&:focus-visible": focusRing }}
                >
                  <Box sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: "14px", bgcolor: "#fff", border: `1px solid ${pc.outline}`, display: "grid", placeItems: "center" }}>
                    <Image src={certification.image} alt="" width={certification.width} height={certification.height} unoptimized style={{ objectFit: "contain", width: "auto", height: "auto", maxWidth: 40, maxHeight: 44 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700 }}>{t(`certifications.${certification.key}.title`)}</Typography>
                    <Typography sx={{ fontSize: 13, color: pc.muted, lineHeight: 1.4 }}>{t(`certifications.${certification.key}.description`)}</Typography>
                  </Box>
                  <ChevronRight sx={{ color: pc.muted }} />
                </Link>
              </li>
            ))}
          </Box>
          <Pill
            tone="tonal"
            endIcon={<ArrowForward />}
            onClick={() => {
              setFilters(emptyFilters);
              setScoreCollaboratorId(undefined);
              goToSection("avis");
            }}
            sx={{ mt: { md: "auto" } }}
          >
            {t("readReviews")}
          </Pill>
        </Box>
      </Box>
    </SectionCard>
  );
}

/** "Vous êtes une entreprise ?": an indigo band with the illustration. */
export function Pitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box
      component="section"
      aria-labelledby="vc-pitch-title"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        p: { xs: 2.5, sm: 4 },
        color: "#fff",
        background: `linear-gradient(135deg, ${pc.indigoDark} 0%, ${pc.indigo} 55%, #6d64f0 100%)`,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.3fr) minmax(0, 1fr)" },
        gap: 3,
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
        <Typography id="vc-pitch-title" component="h2" sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", opacity: 0.9 }}>{t("title")}</Typography>
        <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{t("heading")}</Typography>
        <Typography sx={{ fontSize: 15, lineHeight: 1.55, opacity: 0.92 }}>{t("description")}</Typography>
        <Pill href={links.signup} target="_blank" rel="noopener noreferrer" endIcon={<ArrowForward />} sx={{ mt: 1, bgcolor: "#fff", color: pc.indigoDark, "&:hover": { bgcolor: pc.indigoSoft } }}>
          {t("signup")}
        </Pill>
      </Box>
      <Box sx={{ position: "relative", aspectRatio: "522 / 274", borderRadius: "20px", overflow: "hidden", bgcolor: "rgba(255,255,255,0.12)" }}>
        <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 900px) 400px, 90vw" style={{ objectFit: "cover" }} />
      </Box>
    </Box>
  );
}

const groups = [
  { key: "opinionSystem", items: [{ key: "history", href: links.about }, { key: "certifications", href: links.certifications }, { key: "team", href: links.about }] },
  { key: "business", items: [{ key: "reputation", href: links.solution }, { key: "signup", href: links.signup }, { key: "pricing", href: links.signup }] },
  { key: "consumers", items: [{ key: "findPro", href: links.directory }, { key: "account", href: links.account }] },
] as const;

/** Opinion System footer, then the legal links. */
export function FooterC() {
  const t = useTranslations("Footer");
  const { setPanel } = useCertificate();
  const linkSx = { fontSize: 14, color: pc.muted, "&:hover": { color: pc.ink }, "&:focus-visible": focusRing } as const;
  return (
    <Box component="footer" sx={{ pt: 1, pb: { xs: "calc(120px + env(safe-area-inset-bottom))", lg: 6 } }}>
      <Box sx={{ borderRadius: "24px", border: `1px solid ${pc.outline}`, bgcolor: "#fff", p: { xs: 2.5, sm: 3 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1.5fr)" }, gap: { xs: 3, md: 4 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
          <Link href={links.home} target="_blank" rel="noopener noreferrer" aria-label={t("home")} sx={{ display: "inline-flex", borderRadius: "8px", "&:focus-visible": focusRing }}>
            <Image src="/figma/os-logo.png" alt="Opinion System" width={124} height={50} unoptimized />
          </Link>
          <Typography sx={{ fontSize: 14, color: pc.muted, lineHeight: 1.5 }}>{t("description")}</Typography>
          <Link href="mailto:contact@opinionsystem.fr" sx={{ ...linkSx, display: "inline-flex", alignItems: "center", gap: 1, minHeight: 32, color: pc.ink, fontWeight: 600 }}>
            <EmailOutlined sx={{ fontSize: 18, color: pc.indigoDark }} />contact@opinionsystem.fr
          </Link>
          <Link href="tel:+33478240000" sx={{ ...linkSx, display: "inline-flex", alignItems: "center", gap: 1, minHeight: 32, color: pc.ink, fontWeight: 600 }}>
            <PhoneOutlined sx={{ fontSize: 18, color: pc.indigoDark }} />+33 4 78 24 00 00
          </Link>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, columnGap: 2, rowGap: 2.5 }}>
          {groups.map((group) => (
            <Box component="nav" aria-label={t(`groups.${group.key}`)} key={group.key} sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{t(`groups.${group.key}`)}</Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0.75 }}>
                {group.items.map((item) => (
                  <li key={item.key}><Link href={item.href} target="_blank" rel="noopener noreferrer" underline="hover" sx={linkSx}>{t(`links.${item.key}`)}</Link></li>
                ))}
                {group.key === "consumers" && (
                  <li><Link component="button" onClick={() => setPanel("reviewRequest")} underline="hover" sx={{ ...linkSx, textAlign: "left", verticalAlign: "baseline" }}>{t("links.leaveReview")}</Link></li>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="nav" aria-label={t("legalLabel")} sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2, mt: 2 }}>
        {(["legal", "terms", "privacy"] as const).map((key) => (
          <Link key={key} href={links[key]} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontSize: 12, color: pc.muted, "&:focus-visible": focusRing }}>{t(`legal.${key}`)}</Link>
        ))}
      </Box>
    </Box>
  );
}
