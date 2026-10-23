"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ReportSheet } from "@/components/reviews/ReportSheet";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { CtaButton } from "@/components/ui/CtaButton";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { RatingChip } from "@/components/ui/RatingChip";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import type { Collaborator, Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "./CertificateContext";
import { CardTitle } from "./ReputationCard";

const networks = ["instagram", "facebook", "linkedin"] as const;

function SocialLinks({ person }: { person: Collaborator }) {
  const t = useTranslations("Team");
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 0.5 }}>
      {networks.map((network) => person.socials[network] ? (
        <IconButton
          key={network} component="a" href={person.socials[network]} target="_blank" rel="noopener noreferrer"
          aria-label={t("social", { network: t(`networks.${network}`), name: person.name })}
          sx={{ p: 0.5, borderRadius: 1 }}
        >
          <FigmaIcon name={`social-${network}`} />
        </IconButton>
      ) : null)}
    </Box>
  );
}

/** Figma Equipe (1395:110736); profile panel composes the existing sheet and review cards. */
export function TeamSection() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  const people = useMemo(() => team.map((person) => ({
    person, summary: summarize(reviewsForScore(reviews, scoreView, person.id)),
  })).filter(({ summary }) => isPublic(summary.count, agency.publicThreshold))
    .sort((a, b) => (b.summary.average ?? 0) - (a.summary.average ?? 0) || a.person.name.localeCompare(b.person.name, "fr")),
  [team, reviews, scoreView, agency.publicThreshold]);
  const selected = people.find(({ person }) => person.id === selectedId);
  const recent = selected ? reviewsForScore(reviews, scoreView, selected.person.id).slice().sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 3) : [];

  const seeReviews = () => {
    if (!selected) return;
    setFilters({ ...emptyFilters, collaboratorId: selected.person.id, type: scoreView === "controle" ? "controle" : undefined });
    setScoreCollaboratorId(selected.person.id);
    setReviewSort("recent");
    setSelectedId(undefined);
    // Let the modal release its scroll lock before scrolling to the review section.
    window.setTimeout(() => goToSection("avis"), 350);
  };

  return (
    <Box component="section" aria-labelledby="team-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: 1.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <CardTitle id="team-title" eyebrow={t("eyebrow")} heading={t("heading")} />
      <Box id="team-grid" sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        {(expanded ? people : people.slice(0, 4)).map(({ person, summary }) => (
          <Box key={person.id} component="article" sx={{ position: "relative", bgcolor: tokens.grisClair1, border: `1px solid ${tokens.grisMoyen1}`, borderRadius: "12px", py: 1.5, minWidth: 0 }}>
            <ButtonBase onClick={() => setSelectedId(person.id)} aria-label={t("openProfile", { name: person.name })} sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%", px: 0.5, borderRadius: 1, "&:focus-visible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}>
              <StaffAvatar person={person} size={60} />
              <Box sx={{ width: "100%", textAlign: "center" }}>
                <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal" }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 12, color: tokens.gris, lineHeight: "normal", minHeight: 18 }}>{person.role}</Typography>
              </Box>
              {summary.average !== null && <Box sx={{ position: "absolute", right: 7, top: 9 }}><RatingChip value={summary.average} /></Box>}
            </ButtonBase>
            <SocialLinks person={person} />
          </Box>
        ))}
      </Box>
      {!people.length && <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("empty")}</Typography>}
      {people.length > 4 && <CtaButton variant="secondary" aria-expanded={expanded} aria-controls="team-grid" onClick={() => setExpanded((value) => !value)} sx={{ "& img": { transform: expanded ? "rotate(180deg)" : "none" } }}>{t(expanded ? "showLess" : "showMore")}</CtaButton>}

      <ResponsiveSheet open={Boolean(selected)} onClose={() => setSelectedId(undefined)} title={selected?.person.name ?? t("profile")} closeLabel={t("close")}
        footer={selected ? <Box sx={{ p: 2, borderTop: `1px solid ${tokens.grisMoyen1}` }}><CtaButton onClick={seeReviews}>{t("seeReviews")}</CtaButton></Box> : undefined}>
        {selected && <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <StaffAvatar person={selected.person} size={80} />
            <Typography sx={{ fontSize: 14, color: tokens.gris }}>{selected.person.role}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {selected.summary.average !== null && <RatingChip value={selected.summary.average} />}
              <Typography sx={{ fontSize: 14 }}>{t("reviewCount", { count: formatCount(selected.summary.count) })}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: tokens.gris }}>{tr(`views.${scoreView}`)}</Typography>
            <Link href={`mailto:${selected.person.email}`} sx={{ fontSize: 14, overflowWrap: "anywhere" }}>{selected.person.email}</Link>
            <SocialLinks person={selected.person} />
          </Box>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600 }}>{t("recentReviews")}</Typography>
          {recent.map((review) => <ReviewCard key={review.id} review={review} onReport={setReporting} />)}
        </Box>}
      </ResponsiveSheet>
      <ReportSheet review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
