"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { opinionSystemLinks as links } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";
import { pageColumnSx } from "./AppHeader";
import { useCertificate } from "./CertificateContext";

const groups = [
  { key: "opinionSystem", items: [{ key: "history", href: links.about }, { key: "certifications", href: links.certifications }, { key: "team", href: links.about }] },
  { key: "business", items: [{ key: "reputation", href: links.solution }, { key: "signup", href: links.signup }, { key: "pricing", href: links.signup }] },
  { key: "consumers", items: [{ key: "findPro", href: links.directory }, { key: "account", href: links.account }] },
] as const;

/** Figma OS footer (1433:133104), followed by its separate legal links. */
export function CertificateFooter() {
  const t = useTranslations("Footer");
  const { setPanel } = useCertificate();
  return (
    <Box component="footer" sx={{ ...pageColumnSx, px: 1.5, pb: { xs: "calc(104px + env(safe-area-inset-bottom))", md: 4 } }}>
      <Box sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1.4fr)" }, gap: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Link href={links.home} target="_blank" rel="noopener noreferrer" aria-label={t("home")} sx={{ display: "inline-flex", alignSelf: "flex-start" }}><Image src="/figma/os-logo.png" alt="Opinion System" width={139} height={56} unoptimized /></Link>
            <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("description")}</Typography>
          </Box>
          {[{ key: "email", value: "contact@opinionsystem.fr", href: "mailto:contact@opinionsystem.fr", icon: "footer-email" }, { key: "phone", value: "+33 4 78 24 00 00", href: "tel:+33478240000", icon: "agency-phone" }].map((contact) => (
            <Box key={contact.key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name={contact.icon as "footer-email" | "agency-phone"} /></Box>
              <Link href={contact.href} sx={{ fontSize: 13, fontWeight: 500, overflowWrap: "anywhere" }}>{contact.value}</Link>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, columnGap: { xs: 2, md: 3 }, rowGap: 2, py: { xs: 1.5, md: 0 } }}>
          {groups.map((group) => <Box component="nav" aria-label={t(`groups.${group.key}`)} key={group.key} sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleu400, mb: 1 }}>{t(`groups.${group.key}`)}</Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1 }}>
              {group.items.map((item) => <li key={item.key}><Link href={item.href} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontSize: 14, color: tokens.gris }}>{t(`links.${item.key}`)}</Link></li>)}
              {group.key === "consumers" && <li><Link component="button" onClick={() => setPanel("reviewRequest")} underline="hover" sx={{ fontSize: 14, color: tokens.gris, textAlign: "left", verticalAlign: "baseline" }}>{t("links.leaveReview")}</Link></li>}
            </Box>
          </Box>)}
        </Box>
      </Box>
      <Box component="nav" aria-label={t("legalLabel")} sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: 0.75, rowGap: 0.5, mt: 2, px: 0.5 }}>
        {(["legal", "terms", "privacy"] as const).map((key, index) => <Box key={key} sx={{ display: "inline-flex", alignItems: "baseline", gap: 0.75 }}>
          {index > 0 && <Typography component="span" aria-hidden sx={{ fontSize: 12, color: tokens.gris }}>|</Typography>}
          <Link href={links[key]} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontSize: 12, color: tokens.gris }}>{t(`legal.${key}`)}</Link>
        </Box>)}
      </Box>
    </Box>
  );
}
