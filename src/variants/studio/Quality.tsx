"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import X from "@mui/icons-material/X";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { opinionSystemLinks as links } from "@/data/opinionSystem";
import { a } from "./theme";
import { SectionTitle, Sheet, cardSx, containerSx, focusRing, outlineSx, primarySx } from "./ui";

const certifications = [
  { key: "nf", image: "/figma/nf-service.png", width: 48, height: 56 },
  { key: "iso20252", image: "/figma/iso-20252.svg", width: 48, height: 54 },
  { key: "iso9001", image: "/figma/iso-9001.png", width: 48, height: 48 },
] as const;

/** Démarche Qualité: the badge, the recommendation level, the three certifications. */
export function QualitySection() {
  const t = useTranslations("Quality");
  const { agency, reviews, goToSection, setFilters } = useCertificate();
  const recommendation = useMemo(() => {
    const surveys = reviews.filter((review) => review.status === "controle" && review.survey);
    return surveys.length ? Math.round(surveys.reduce((sum, review) => sum + review.survey!.recommendation, 0) / surveys.length) : null;
  }, [reviews]);

  return (
    <Box component="section" aria-labelledby="a-quality-title" sx={{ ...containerSx, py: { xs: 6, md: 9 }, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) minmax(0,1fr)" }, columnGap: 8, rowGap: 4, alignItems: "start" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <SectionTitle id="a-quality-title" eyebrow={t("eyebrow")} title={t("heading", { name: agency.name })} />
        <Typography sx={{ fontSize: 16, lineHeight: 1.65, color: a.muted }}>{t("description")}</Typography>
        <Box sx={{ ...cardSx, borderRadius: "20px", p: { xs: 2, sm: 3 }, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, background: `linear-gradient(135deg, ${a.white} 50%, ${a.tealTint})` }}>
          <Image src="/figma/quality-badge.png" alt={t("badgeAlt")} width={120} height={120} unoptimized />
          <Box sx={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Image src="/figma/os-logo.png" alt="Opinion System" width={139} height={56} unoptimized />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: a.tealText }}>{t("verified")}</Typography>
            {recommendation !== null && (
              <Box sx={{ mt: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("recommendation")}</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{recommendation} %</Typography>
                </Box>
                <Box aria-hidden sx={{ mt: 0.75, height: 10, borderRadius: 5, bgcolor: a.band, border: `1px solid ${a.line}`, overflow: "hidden" }}>
                  <Box sx={{ width: `${recommendation}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${a.blue}, ${a.teal})` }} />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: { lg: 5 } }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {certifications.map((certification) => (
            <li key={certification.key}>
              <Link
                href={links.certifications}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{ ...cardSx, display: "flex", alignItems: "center", gap: 2, p: 2.25, color: a.navy, transition: `border-color 150ms ease, transform 200ms ${a.ease}`, "&:hover": { borderColor: a.navy, transform: "translateX(2px)" }, ...focusRing }}
              >
                <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: "12px", bgcolor: a.band, display: "grid", placeItems: "center" }}>
                  <Image src={certification.image} alt="" width={certification.width * 0.8} height={certification.height * 0.8} unoptimized />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography component="h3" sx={{ fontSize: 16, fontWeight: 800 }}>{t(`certifications.${certification.key}.title`)}</Typography>
                  <Typography sx={{ fontSize: 14, color: a.muted, lineHeight: 1.45 }}>{t(`certifications.${certification.key}.description`)}</Typography>
                </Box>
                <ChevronRight sx={{ color: a.muted }} />
              </Link>
            </li>
          ))}
        </Box>
        <Button onClick={() => { setFilters(emptyFilters); goToSection("avis"); }} endIcon={<ArrowForward />} sx={{ ...outlineSx, alignSelf: { sm: "flex-start" }, mt: 1 }}>
          {t("readReviews")}
        </Button>
      </Box>
    </Box>
  );
}

/** "Vous êtes une entreprise ?": a navy band with the illustration and a yellow button. */
export function BusinessPitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box sx={{ ...containerSx, pb: { xs: 6, md: 9 } }}>
      <Box component="section" aria-labelledby="a-pitch-title" sx={{ position: "relative", overflow: "hidden", borderRadius: { xs: "24px", md: "28px" }, bgcolor: a.navy, color: a.white, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1.1fr) minmax(0,1fr)" }, alignItems: "center" }}>
        <Box aria-hidden sx={{ position: "absolute", inset: 0, background: "radial-gradient(600px 300px at 0% 0%, rgba(44,149,255,0.35), transparent 70%), radial-gradient(500px 300px at 100% 100%, rgba(67,182,163,0.35), transparent 70%)" }} />
        <Box sx={{ position: "relative", p: { xs: 3, md: 6 }, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <Typography id="a-pitch-title" component="h2" sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7fd9c9" }}>{t("title")}</Typography>
          <Typography component="p" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", textWrap: "balance" }}>{t("heading")}</Typography>
          <Typography sx={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", maxWidth: 480 }}>{t("description")}</Typography>
          <Button href={links.signup} target="_blank" rel="noopener noreferrer" endIcon={<ArrowForward />} sx={{ ...primarySx, mt: 1, px: 3, minHeight: 48 }}>
            {t("signup")}
          </Button>
        </Box>
        <Box sx={{ position: "relative", height: { xs: 200, md: "100%" }, minHeight: { md: 340 } }}>
          <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 900px) 560px, 100vw" style={{ objectFit: "cover" }} />
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

export function Footer() {
  const t = useTranslations("Footer");
  const { setPanel } = useCertificate();
  const linkSx = { fontSize: 14, color: a.muted, fontWeight: 500, "&:hover": { color: a.navy }, ...focusRing } as const;
  return (
    <Box component="footer" sx={{ borderTop: `1px solid ${a.line}`, bgcolor: a.band, pb: { xs: 12, md: 0 } }}>
      <Box sx={{ ...containerSx, py: { xs: 5, md: 7 }, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1fr) minmax(0,1.5fr)" }, gap: { xs: 4, md: 8 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <Link href={links.home} target="_blank" rel="noopener noreferrer" aria-label={t("home")} sx={{ display: "inline-flex", ...focusRing }}>
            <Image src="/figma/os-logo.png" alt="Opinion System" width={139} height={56} unoptimized />
          </Link>
          <Typography sx={{ fontSize: 14, color: a.muted, lineHeight: 1.6, maxWidth: 340 }}>{t("description")}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Link href="mailto:contact@opinionsystem.fr" sx={{ ...linkSx, display: "inline-flex", alignItems: "center", gap: 1, minHeight: 36 }}><EmailOutlined sx={{ fontSize: 18 }} />contact@opinionsystem.fr</Link>
            <Link href="tel:+33478240000" sx={{ ...linkSx, display: "inline-flex", alignItems: "center", gap: 1, minHeight: 36 }}><PhoneOutlined sx={{ fontSize: 18 }} />+33 4 78 24 00 00</Link>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))" }, gap: 3 }}>
          {groups.map((group) => (
            <Box component="nav" key={group.key} aria-label={t(`groups.${group.key}`)}>
              <Typography component="h2" sx={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5 }}>{t(`groups.${group.key}`)}</Typography>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
                {group.items.map((item) => <li key={item.key}><Link href={item.href} target="_blank" rel="noopener noreferrer" underline="hover" sx={linkSx}>{t(`links.${item.key}`)}</Link></li>)}
                {group.key === "consumers" && <li><Link component="button" onClick={() => setPanel("reviewRequest")} underline="hover" sx={{ ...linkSx, textAlign: "left", verticalAlign: "baseline" }}>{t("links.leaveReview")}</Link></li>}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="nav" aria-label={t("legalLabel")} sx={{ ...containerSx, py: 2.5, borderTop: `1px solid ${a.line}`, display: "flex", flexWrap: "wrap", gap: 2.5, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
        {(["legal", "terms", "privacy"] as const).map((key) => <Link key={key} href={links[key]} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ ...linkSx, fontSize: 13 }}>{t(`legal.${key}`)}</Link>)}
      </Box>
    </Box>
  );
}

const networks = [
  { key: "linkedin", icon: <LinkedIn /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "instagram", icon: <Instagram /> },
  { key: "x", icon: <X /> },
] as const;

/** Contacter: call, e-mail, WhatsApp, then the company's social pages. */
export function ContactPanel() {
  const t = useTranslations("Contact");
  const { agency, panel, setPanel } = useCertificate();
  const close = () => setPanel(null);
  const options = [
    { icon: <PhoneOutlined />, label: t("call"), detail: agency.phone, href: `tel:${agency.phone.replace(/\s/g, "")}`, primary: true },
    { icon: <EmailOutlined />, label: t("email"), detail: agency.email, href: `mailto:${agency.email}` },
    ...(agency.whatsapp ? [{ icon: <WhatsApp />, label: t("whatsapp"), detail: agency.phone, href: `https://wa.me/${agency.whatsapp.replace(/\D/g, "")}` }] : []),
  ];
  return (
    <Sheet open={panel === "contact"} onClose={close} title={t("title", { name: agency.name })} closeLabel={t("close")}>
      <Box sx={{ p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column", gap: 1 }}>
        {options.map((option) => (
          <ButtonBase
            key={option.label}
            component="a"
            href={option.href}
            target={option.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={close}
            sx={{ justifyContent: "flex-start", gap: 2, p: 1.75, borderRadius: "14px", border: `1px solid ${a.line}`, textAlign: "left", color: a.navy, "&:hover": { borderColor: a.navy, bgcolor: a.band }, ...focusRing }}
          >
            <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: "primary" in option ? a.yellow : a.band, color: a.navy }}>{option.icon}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{option.label}</Typography>
              <Typography sx={{ fontSize: 14, color: a.muted, fontVariantNumeric: "tabular-nums" }}>{option.detail}</Typography>
            </Box>
            <ChevronRight sx={{ color: a.muted }} />
          </ButtonBase>
        ))}
        <Typography component="h3" sx={{ mt: 2, mb: 0.5, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: a.muted }}>{t("socialsTitle")}</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 1 }}>
          {networks.map(({ key, icon }) => {
            const href = agency.socials[key];
            if (!href) return null;
            return (
              <ButtonBase key={key} component="a" href={href} target="_blank" rel="noopener noreferrer" onClick={close} aria-label={t("newTab", { label: t(key), name: agency.name })} sx={{ flexDirection: "column", gap: 0.5, py: 1.5, borderRadius: "14px", border: `1px solid ${a.line}`, color: a.navy, fontSize: 13, fontWeight: 700, "&:hover": { borderColor: a.navy, bgcolor: a.band }, ...focusRing }}>
                {icon}
                {t(key)}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Sheet>
  );
}
