"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { formatCount, formatScore } from "@/lib/format";
import { headingFor, reviewsForScore } from "@/lib/scoring";
import { OpenBadge, WeekTable } from "./Hours";
import { Laurel } from "./Laurel";
import { b } from "./theme";
import { focusSx, Hairline, Stars, TextLink } from "./ui";
import { useScore } from "./useScore";

/** Airbnb's "Coup de cœur" banner: laurels around the verdict, then the score and the number of reviews. */
export function ScoreBanner() {
  const t = useTranslations("Reputation");
  const tb = useTranslations("VarianteB.banner");
  const { summary, visible, controle } = useScore();
  if (!visible) return null;
  const color = controle ? b.sage : b.ink;
  const score = formatScore(summary.average!);
  const go = () => {
    const target = document.getElementById("b-reputation");
    target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  };

  return (
    <ButtonBase
      onClick={go}
      aria-label={tb("aria", { score, count: formatCount(summary.count), heading: t(`heading.${headingFor(summary.average!)}`) })}
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) 1px minmax(0, 1fr) 1px minmax(0, 1fr)",
        alignItems: "center",
        columnGap: { xs: 1.5, sm: 2.5 },
        px: { xs: 1.5, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        bgcolor: b.white,
        borderRadius: "20px",
        boxShadow: `inset 0 0 0 1px ${b.line}`,
        textAlign: "center",
        color: b.ink,
        transition: "box-shadow 200ms ease, transform 200ms ease",
        "&:hover": { boxShadow: `inset 0 0 0 1px ${b.lineStrong}, ${b.shadowLift}`, transform: "translateY(-1px)" },
        "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
        ...focusSx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 0.5, sm: 1 } }}>
        <Laurel side="left" color={color} height={44} />
        <Typography component="span" sx={{ fontFamily: b.serif, fontVariationSettings: '"SOFT" 100', fontWeight: 600, fontSize: { xs: 15, sm: 18 }, lineHeight: 1.15 }}>
          {t(`heading.${headingFor(summary.average!)}`)}
        </Typography>
        <Laurel side="right" color={color} height={44} />
      </Box>
      <Box sx={{ height: 40, bgcolor: b.line }} />
      <Box>
        <Typography component="span" sx={{ display: "block", fontSize: { xs: 20, sm: 22 }, fontWeight: 700, lineHeight: 1.1, color }}>
          {score}
        </Typography>
        <Stars value={summary.average!} size={12} color={color} />
      </Box>
      <Box sx={{ height: 40, bgcolor: b.line }} />
      <Box>
        <Typography component="span" sx={{ display: "block", fontSize: { xs: 20, sm: 22 }, fontWeight: 700, lineHeight: 1.1 }}>
          {formatCount(summary.count)}
        </Typography>
        <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "2px" }}>
          {tb("reviews")}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function Row({ icon, title, children }: { icon: React.ReactNode; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Box component="li" sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
      <Box sx={{ width: 28, pt: 0.25, display: "flex", justifyContent: "center", color: b.ink, flexShrink: 0, "& svg": { fontSize: 28 } }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{title}</Box>
        {children && <Box sx={{ fontSize: 14, color: b.muted, lineHeight: 1.5, mt: 0.25 }}>{children}</Box>}
      </Box>
    </Box>
  );
}

/** The agency in three lines, like Airbnb's listing highlights. */
export function Highlights() {
  const t = useTranslations("Business");
  const tb = useTranslations("VarianteB.highlights");
  const { agency, reviews } = useCertificate();
  const [hoursOpen, setHoursOpen] = useState(false);
  const hoursId = useId();
  const verified = useMemo(() => reviewsForScore(reviews, "controle").length, [reviews]);
  const goToMap = () => document.getElementById("nos-agences")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: b.ink, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Box component="img" src="/figma/os-icon-logo.svg" alt="" sx={{ width: 26, height: 26 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{tb("hostTitle", { name: agency.name, city: agency.city })}</Typography>
          <Typography sx={{ fontSize: 14, color: b.muted }}>{tb("hostText", { since: agency.memberSince })}</Typography>
        </Box>
      </Box>
      <Hairline />
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Row icon={<VerifiedOutlined />} title={tb("verifiedTitle")}>
          {tb("verifiedText", { count: formatCount(verified) })}
        </Row>
        <Row icon={<ScheduleRounded />} title={<OpenBadge hours={agency.hours} size={16} />}>
          <TextLink onClick={() => setHoursOpen((value) => !value)} aria-expanded={hoursOpen} aria-controls={hoursId} sx={{ minHeight: 32, px: 0, fontSize: 14, color: b.muted }}>
            {tb(hoursOpen ? "hoursHide" : "hoursShow")}
          </TextLink>
          <Collapse in={hoursOpen}>
            <Box sx={{ maxWidth: 360, mt: 1, p: 1.5, bgcolor: b.white, borderRadius: "16px", boxShadow: `inset 0 0 0 1px ${b.line}` }}>
              <WeekTable hours={agency.hours} id={hoursId} />
            </Box>
          </Collapse>
        </Row>
        <Row icon={<LocationOnOutlined />} title={agency.address}>
          <TextLink onClick={goToMap} aria-label={t("addressLink", { address: agency.address })} sx={{ minHeight: 32, px: 0, fontSize: 14, color: b.muted }}>
            {tb("mapLink", { count: agency.sisterAgencyIds.length + 1 })}
          </TextLink>
        </Row>
      </Box>
    </Box>
  );
}
