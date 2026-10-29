"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import StarRounded from "@mui/icons-material/StarRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import type { Collaborator, Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { ReportSheetB } from "./Forms";
import { pageWidthSx } from "./Header";
import { ReviewCardB } from "./ReviewCard";
import { b } from "./theme";
import { focusSx, Hairline, PersonAvatar, Pill, SectionTitle, Sheet, SheetFooter } from "./ui";

const networks = [
  { key: "instagram", icon: <Instagram /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "linkedin", icon: <LinkedIn /> },
] as const;

function Socials({ person }: { person: Collaborator }) {
  const t = useTranslations("Team");
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
      {networks.map(({ key, icon }) =>
        person.socials[key] ? (
          <IconButton key={key} component="a" href={person.socials[key]} target="_blank" rel="noopener noreferrer" aria-label={t("social", { network: t(`networks.${key}`), name: person.name })} sx={{ width: 44, height: 44, color: b.ink, "&:hover": { bgcolor: b.sand }, "& svg": { fontSize: 20 }, ...focusSx }}>
            {icon}
          </IconButton>
        ) : null,
      )}
    </Box>
  );
}

/** L'équipe: round portraits; a tap opens a host card, like Airbnb's. */
export function Team() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const tb = useTranslations("VarianteB.team");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  const people = useMemo(
    () =>
      team
        .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, scoreView, person.id)) }))
        .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold))
        .sort((a, c) => (c.summary.average ?? 0) - (a.summary.average ?? 0) || a.person.name.localeCompare(c.person.name, "fr")),
    [team, reviews, scoreView, agency.publicThreshold],
  );
  const selected = people.find(({ person }) => person.id === selectedId);
  const recent = selected ? reviewsForScore(reviews, scoreView, selected.person.id).slice().sort((a, c) => a.daysAgo - c.daysAgo).slice(0, 3) : [];
  const shown = expanded ? people : people.slice(0, 4);

  const seeReviews = () => {
    if (!selected) return;
    setFilters({ ...emptyFilters, collaboratorId: selected.person.id, type: scoreView === "controle" ? "controle" : undefined });
    setScoreCollaboratorId(selected.person.id);
    setReviewSort("recent");
    setSelectedId(undefined);
    window.setTimeout(() => goToSection("avis"), 350);
  };

  return (
    <Box component="section" aria-labelledby="b-team-title" sx={{ ...pageWidthSx, display: "flex", flexDirection: "column", gap: 3 }}>
      <SectionTitle id="b-team-title" subtitle={tb("subtitle", { name: agency.name })}>{t("heading")}</SectionTitle>
      <Box id="b-team-grid" component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1.5, md: 2.5 } }}>
        {shown.map(({ person, summary }) => (
          <li key={person.id}>
            <Box component="article" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, pt: 3, pb: 1.5, px: 1.5, bgcolor: b.white, borderRadius: "24px", boxShadow: b.shadow, textAlign: "center", transition: "box-shadow 250ms ease, transform 250ms ease", "&:hover": { boxShadow: b.shadowLift, transform: "translateY(-3px)" }, "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } } }}>
              <ButtonBase onClick={() => setSelectedId(person.id)} aria-label={t("openProfile", { name: person.name })} aria-haspopup="dialog" sx={{ flexDirection: "column", gap: 1, width: "100%", borderRadius: "16px", ...focusSx }}>
                <Box sx={{ position: "relative" }}>
                  <PersonAvatar person={person} size={88} ring />
                  {summary.average !== null && (
                    <Box sx={{ position: "absolute", left: "50%", bottom: -10, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 0.25, px: 1, py: 0.25, borderRadius: 999, bgcolor: b.white, boxShadow: "0 2px 8px rgba(0,0,0,0.14)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      <StarRounded sx={{ fontSize: 14, color: scoreView === "controle" ? b.sage : b.ink }} />
                      {formatScore(summary.average)}
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 1.5, minWidth: 0, width: "100%" }}>
                  <Typography component="h3" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 18, lineHeight: 1.2 }}>{person.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: b.muted, lineHeight: 1.4, minHeight: 36 }}>{person.role}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 0.5 }}>{t("reviewCount", { count: formatCount(summary.count) })}</Typography>
                </Box>
              </ButtonBase>
              <Socials person={person} />
            </Box>
          </li>
        ))}
      </Box>
      {!people.length && <Typography sx={{ fontSize: 15, color: b.muted }}>{t("empty")}</Typography>}
      {people.length > 4 && (
        <Pill variant="outline" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="b-team-grid" sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
          {expanded ? t("showLess") : tb("showAll", { count: people.length })}
        </Pill>
      )}

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelectedId(undefined)}
        title={t("profile")}
        closeLabel={t("close")}
        width={620}
        footer={selected ? <SheetFooter><Pill variant="primary" fullWidth onClick={seeReviews}>{t("seeReviews")}</Pill></SheetFooter> : undefined}
      >
        {selected && (
          <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* The host card: portrait and name on the left, the numbers on the right. */}
            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", alignItems: "center", gap: 2, p: { xs: 2, sm: 3 }, borderRadius: "24px", bgcolor: b.white, boxShadow: b.shadowCard }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, textAlign: "center" }}>
                <Box sx={{ position: "relative" }}>
                  <PersonAvatar person={selected.person} size={104} />
                  <Box sx={{ position: "absolute", right: 0, bottom: 4, width: 32, height: 32, borderRadius: "50%", background: b.gradient, color: b.white, display: "grid", placeItems: "center", boxShadow: `0 0 0 3px ${b.white}` }}>
                    <VerifiedRounded sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 26, lineHeight: 1.1 }}>{selected.person.name}</Typography>
                <Typography sx={{ fontSize: 14, color: b.muted }}>{selected.person.role}</Typography>
              </Box>
              <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column" }}>
                {[
                  { label: tb("reviews"), value: formatCount(selected.summary.count) },
                  { label: tr(`views.${scoreView}`), value: selected.summary.average !== null ? <>{formatScore(selected.summary.average)}<StarRounded sx={{ fontSize: 18 }} /></> : "—" },
                  { label: tb("agency"), value: agency.city },
                ].map((stat, index) => (
                  <Box key={stat.label} sx={{ py: 1.25, borderTop: index ? `1px solid ${b.line}` : "none" }}>
                    <Box component="dd" sx={{ m: 0, display: "flex", alignItems: "center", gap: 0.25, fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{stat.value}</Box>
                    <Typography component="dt" sx={{ fontSize: 12, fontWeight: 600, color: b.muted }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <Pill variant="soft" small href={`mailto:${selected.person.email}`} startIcon={<EmailOutlined />} sx={{ maxWidth: "100%", "& span": { overflow: "hidden", textOverflow: "ellipsis" } }}>
                <span>{selected.person.email}</span>
              </Pill>
              <Socials person={selected.person} />
            </Box>
            <Hairline />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography component="h3" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 22 }}>{t("recentReviews")}</Typography>
              {recent.map((review) => <ReviewCardB key={review.id} review={review} onReport={setReporting} compact />)}
            </Box>
          </Box>
        )}
      </Sheet>
      <ReportSheetB review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
