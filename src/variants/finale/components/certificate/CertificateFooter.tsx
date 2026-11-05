"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { opinionSystemLinks as links } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";
import { contentColumnSx } from "./AppHeader";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { AskYourAi } from "./AskYourAi";

const groups = [
  { key: "opinionSystem", items: [{ key: "history", href: links.about }, { key: "certifications", href: links.certifications }, { key: "team", href: links.about }] },
  { key: "business", items: [{ key: "reputation", href: links.solution }, { key: "signup", href: links.signup }, { key: "pricing", href: links.signup }] },
  { key: "consumers", items: [{ key: "findPro", href: links.directory }, { key: "account", href: links.account }] },
] as const;

const footerLinkSx = { fontSize: 14, color: tokens.bleuFonce, textUnderlineOffset: "3px", "&:focus-visible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2, borderRadius: "4px" } } as const;

/** The content's width: on desktop the text lines up with the cards' edge, on phones with the text inside them. */
const footerColumnSx = { ...contentColumnSx, px: { xs: 3, md: 1.5 } } as const;

/**
 * The Opinion System footer in option G's layout: a full-width band in white under a divider (the page is light grey-blue),
 * the logo and contacts beside the 3 link groups, the "Demander à votre IA" row, then a second divider and the legal line.
 */
export function CertificateFooter() {
  const t = useTranslations("Footer");
  const { setPanel } = useCertificate();
  return (
    <Box component="footer" sx={{ bgcolor: tokens.blanc, borderTop: `1px solid ${tokens.grisMoyen1}`, mt: { xs: 4, md: 6 }, pb: { xs: "calc(96px + env(safe-area-inset-bottom))", md: 8 } }}>
      <Box sx={{ ...footerColumnSx, pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.2fr) minmax(0, 2fr)" }, gap: { xs: 4, md: 6 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.5 }}>
          <Link href={links.home} target="_blank" rel="noopener noreferrer" aria-label={t("home")} sx={{ display: "inline-flex" }}><Image src="/figma/os-logo.png" alt="Opinion System" width={124} height={50} unoptimized /></Link>
          <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: 1.6, maxWidth: 320 }}>{t("description")}</Typography>
          {[{ key: "email", value: "contact@opinionsystem.fr", href: "mailto:contact@opinionsystem.fr", icon: "footer-email" }, { key: "phone", value: "+33 4 78 24 00 00", href: "tel:+33478240000", icon: "agency-phone" }].map((contact) => (
            <Link key={contact.key} href={contact.href} underline="hover" sx={{ ...footerLinkSx, display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 600, overflowWrap: "anywhere" }}>
              <FigmaIcon name={contact.icon as "footer-email" | "agency-phone"} />
              {contact.value}
            </Link>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
          {groups.map((group) => <Box component="nav" aria-label={t(`groups.${group.key}`)} key={group.key} sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, mb: 1.5 }}>{t(`groups.${group.key}`)}</Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1.25 }}>
              {group.items.map((item) => <li key={item.key}><Link href={item.href} target="_blank" rel="noopener noreferrer" underline="hover" sx={footerLinkSx}>{t(`links.${item.key}`)}</Link></li>)}
              {group.key === "consumers" && <li><Link component="button" onClick={() => setPanel("reviewRequest")} underline="hover" sx={{ ...footerLinkSx, fontFamily: "inherit", textAlign: "left", verticalAlign: "baseline" }}>{t("links.leaveReview")}</Link></li>}
            </Box>
          </Box>)}
        </Box>
      </Box>
      {/* Just above the legal line: open your own AI with a question about this page. */}
      <Box sx={{ ...footerColumnSx, pb: { xs: 3, md: 4 } }}>
        <AskYourAi />
      </Box>
      <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}` }}>
        <Box component="nav" aria-label={t("legalLabel")} sx={{ ...footerColumnSx, py: 2.5, display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 3 }, justifyContent: { xs: "center", md: "flex-start" } }}>
          <Typography component="span" sx={{ fontSize: 13, color: tokens.gris }}>© Opinion System</Typography>
          {(["legal", "terms", "privacy"] as const).map((key) => <Link key={key} href={links[key]} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ ...footerLinkSx, fontSize: 13 }}>{t(`legal.${key}`)}</Link>)}
        </Box>
      </Box>
    </Box>
  );
}
