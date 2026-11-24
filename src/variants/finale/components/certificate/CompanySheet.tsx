"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import StarRounded from "@mui/icons-material/StarRounded";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { OpenStatus } from "./OpenStatus";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** One fact: icon, small grey label, the value (a link when it can be acted on). */
function Fact({ icon, label, children, href, external, onClick }: { icon: React.ReactNode; label: string; children: React.ReactNode; href?: string; external?: boolean; onClick?: () => void }) {
  const interactive = Boolean(href || onClick);
  return (
    <ButtonBase
      component={href ? "a" : onClick ? "button" : "div"}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      disabled={!interactive}
      sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.5, py: 1.25, px: 2, textAlign: "left", fontFamily: "inherit", color: tokens.bleuFonce, "&.Mui-disabled": { color: tokens.bleuFonce }, "&:hover": interactive ? { bgcolor: tokens.grisClair2 } : undefined, ...focusSx }}
    >
      <Box component="span" sx={{ display: "grid", placeItems: "center", width: 36, height: 36, flexShrink: 0, borderRadius: "8px", bgcolor: tokens.bleu10, color: tokens.bleu600, "& svg": { fontSize: 20 } }}>{icon}</Box>
      <Box component="span" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box component="span" sx={{ fontSize: 12, color: tokens.gris, lineHeight: 1.3 }}>{label}</Box>
        <Box component="span" sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.35, overflowWrap: "anywhere" }}>{children}</Box>
      </Box>
      {interactive && <ChevronRight aria-hidden sx={{ fontSize: 20, color: tokens.gris }} />}
    </ButtonBase>
  );
}

/**
 * Opened by tapping the company name in the business card: who the agency is at a glance.
 * Its logo and full name, both scores, how to reach it, today's hours, the team and since when its reviews are verified.
 */
export function CompanySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("VarianteFinale.hero");
  const tv = useTranslations("Reputation.views");
  const tc = useTranslations("Contact");
  const { agency, team, reviews, setPanel, goToSection, filters, setFilters } = useCertificate();
  const scores = useMemo(
    () => (["global", "controle"] as const).map((view) => {
      const summary = summarize(reviewsForScore(reviews, view));
      return { view, count: summary.count, average: isPublic(summary.count, agency.publicThreshold) ? summary.average : null };
    }),
    [reviews, agency.publicThreshold],
  );
  const website = agency.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const agencies = 1 + agency.sisterAgencyIds.length;

  const then = (action: () => void) => () => {
    onClose();
    // Let the sheet release its scroll lock first.
    window.setTimeout(action, 300);
  };

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t("companyTitle")}
      closeLabel={tc("close")}
      footer={<Box sx={{ p: 2, borderTop: `1px solid ${tokens.grisMoyen1}` }}><CtaButton onClick={then(() => setPanel("contact"))}>{t("companyContact")}</CtaButton></Box>}
    >
      {/* Who: logo, full name, sector and city. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, pt: 2, pb: 1.5 }}>
        <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: "12px", overflow: "hidden", bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, display: "grid", placeItems: "center" }}>
          <Box sx={{ position: "relative", width: 48, height: 43, overflow: "hidden" }}>
            <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
              <Image src={agency.logo} alt="" fill sizes="64px" />
            </Box>
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", color: tokens.bleuFonce, overflowWrap: "anywhere" }}>{agency.name}</Typography>
          <Typography sx={{ mt: 0.25, fontSize: 13, color: tokens.gris }}>{t("sector", { sector: agency.sector, city: agency.city })}</Typography>
        </Box>
      </Box>

      {/* Both scores; each opens the reviews in that view. */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, px: 2, pb: 2 }}>
        {scores.map(({ view, average, count }) => {
          const controlled = view === "controle";
          return (
            <ButtonBase
              key={view}
              onClick={then(() => {
                setFilters({ ...emptyFilters, collaboratorId: filters.collaboratorId, type: controlled ? "controle" : undefined });
                goToSection("avis");
              })}
              sx={{ flexDirection: "column", alignItems: "flex-start", gap: 0.25, p: 1.25, borderRadius: "10px", border: `1px solid ${controlled ? "#b8e6d3" : tokens.grisMoyen1}`, bgcolor: controlled ? tokens.successLight2 : tokens.grisClair2, fontFamily: "inherit", textAlign: "left", ...focusSx }}
            >
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 12, fontWeight: 600, color: controlled ? tokens.vertOs : tokens.gris }}>
                <FigmaIcon name={controlled ? "rv-controle" : "rv-all"} size={16} />
                {tv(view)}
              </Box>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 22, fontWeight: 700, lineHeight: 1.15, color: controlled ? tokens.vertOs : tokens.bleuFonce }}>
                {average !== null ? formatScore(average) : "—"}
                <StarRounded aria-hidden sx={{ fontSize: 20, color: tokens.rating }} />
              </Box>
              <Box component="span" sx={{ fontSize: 12, color: tokens.gris }}>{t("reviews", { count: formatCount(count) })}</Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, py: 0.5 }}>
        <Fact icon={<ScheduleOutlined />} label={t("companyHours")} onClick={then(() => setPanel("hours"))}>
          <OpenStatus hours={agency.hours} split colors={{ open: "#1d7a6b", closed: "#ae391b" }} />
        </Fact>
        <Fact icon={<PlaceOutlined />} label={t("companyAddress")} onClick={then(() => goToSection("agences"))}>{agency.address}</Fact>
        <Fact icon={<PhoneOutlined />} label={t("companyPhone")} href={`tel:${agency.phone.replace(/\s/g, "")}`}>{agency.phone}</Fact>
        <Fact icon={<EmailOutlined />} label={t("companyEmail")} href={`mailto:${agency.email}`}>{agency.email}</Fact>
        <Fact icon={<LanguageOutlined />} label={t("companyWebsite")} href={agency.website} external>{website}</Fact>
        <Fact icon={<GroupsOutlined />} label={t("companyTeam")} onClick={then(() => goToSection("agences"))}>
          {t("companyTeamCount", { count: team.length })}{agencies > 1 ? ` · ${t("companyAgencyCount", { count: agencies })}` : ""}
        </Fact>
        <Fact icon={<VerifiedOutlined />} label={t("companySince")}>{agency.memberSince}</Fact>
      </Box>
    </ResponsiveSheet>
  );
}
