"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import type { Collaborator, Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { ReportPanel, ReviewCardA } from "./Reviews";
import { a, viewColor } from "./theme";
import { PersonAvatar, RatingPill, SectionTitle, Sheet, SheetFooter, StarTiles, cardSx, containerSx, focusRing, outlineSx, primarySx } from "./ui";

const networks = [
  { key: "linkedin", icon: <LinkedIn sx={{ fontSize: 20 }} /> },
  { key: "instagram", icon: <Instagram sx={{ fontSize: 20 }} /> },
  { key: "facebook", icon: <Facebook sx={{ fontSize: 20 }} /> },
] as const;

function SocialLinks({ person }: { person: Collaborator }) {
  const t = useTranslations("Team");
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
      {networks.map(({ key, icon }) =>
        person.socials[key] ? (
          <IconButton key={key} component="a" href={person.socials[key]} target="_blank" rel="noopener noreferrer" aria-label={t("social", { network: t(`networks.${key}`), name: person.name })} sx={{ width: 40, height: 40, color: a.muted, "&:hover": { color: a.navy, bgcolor: a.band } }}>
            {icon}
          </IconButton>
        ) : null,
      )}
    </Box>
  );
}

/** L'équipe: cards with photo, role and score; a tap opens the profile with recent reviews. */
export function TeamSection() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  const people = useMemo(
    () =>
      team
        .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, scoreView, person.id)) }))
        .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold))
        .sort((x, y) => (y.summary.average ?? 0) - (x.summary.average ?? 0) || x.person.name.localeCompare(y.person.name, "fr")),
    [team, reviews, scoreView, agency.publicThreshold],
  );
  const selected = people.find(({ person }) => person.id === selectedId);
  const recent = selected ? reviewsForScore(reviews, scoreView, selected.person.id).slice().sort((x, y) => x.daysAgo - y.daysAgo).slice(0, 3) : [];
  const shown = expanded ? people : people.slice(0, 8);

  const seeReviews = () => {
    if (!selected) return;
    setFilters({ ...emptyFilters, collaboratorId: selected.person.id, type: scoreView === "controle" ? "controle" : undefined });
    setScoreCollaboratorId(selected.person.id);
    setReviewSort("recent");
    setSelectedId(undefined);
    window.setTimeout(() => goToSection("avis"), 350);
  };

  return (
    <Box component="section" aria-labelledby="a-team-title" sx={{ ...containerSx, py: { xs: 6, md: 9 } }}>
      <SectionTitle id="a-team-title" eyebrow={t("eyebrow")} title={t("heading")} />
      <Box id="a-team-grid" component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 4, display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", lg: "repeat(4, minmax(0,1fr))" }, gap: { xs: 1.5, md: 2 } }}>
        {shown.map(({ person, summary }) => (
          <Box component="li" key={person.id} sx={{ ...cardSx, minWidth: 0, display: "flex", flexDirection: "column", transition: `border-color 150ms ease, transform 200ms ${a.ease}, box-shadow 200ms ease`, "&:hover": { borderColor: a.lineStrong, transform: "translateY(-2px)", boxShadow: "0 10px 24px -16px rgba(4,27,68,0.35)" } }}>
            <ButtonBase onClick={() => setSelectedId(person.id)} aria-label={t("openProfile", { name: person.name })} sx={{ flex: 1, flexDirection: "column", gap: 1, px: 1.5, pt: 2.5, pb: 1, borderRadius: "12px 12px 0 0", ...focusRing }}>
              <Box sx={{ p: "3px", borderRadius: "50%", background: `conic-gradient(${viewColor[scoreView]} ${((summary.average ?? 0) / 5) * 360}deg, ${a.line} 0)` }}>
                <Box sx={{ p: "2px", borderRadius: "50%", bgcolor: a.white }}>
                  <PersonAvatar person={person} size={72} />
                </Box>
              </Box>
              <Box sx={{ textAlign: "center", minWidth: 0, width: "100%" }}>
                <Typography component="h3" sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: a.muted, lineHeight: 1.35, minHeight: 36 }}>{person.role}</Typography>
              </Box>
              {summary.average !== null && <RatingPill value={summary.average} count={formatCount(summary.count)} />}
            </ButtonBase>
            <Box sx={{ pb: 1 }}>
              <SocialLinks person={person} />
            </Box>
          </Box>
        ))}
      </Box>
      {!people.length && <Typography sx={{ mt: 2, fontSize: 15, color: a.muted }}>{t("empty")}</Typography>}
      {people.length > 8 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button aria-expanded={expanded} aria-controls="a-team-grid" onClick={() => setExpanded((value) => !value)} endIcon={<ExpandMore sx={{ transform: expanded ? "rotate(180deg)" : "none" }} />} sx={{ ...outlineSx, minWidth: 240 }}>
            {t(expanded ? "showLess" : "showMore")}
          </Button>
        </Box>
      )}

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelectedId(undefined)}
        title={selected?.person.name ?? t("profile")}
        closeLabel={t("close")}
        maxWidth="sm"
        footer={selected ? <SheetFooter><Button onClick={seeReviews} sx={{ ...primarySx, flex: 1 }}>{t("seeReviews")}</Button></SheetFooter> : undefined}
      >
        {selected && (
          <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, pb: 2.5, borderBottom: `1px solid ${a.line}` }}>
              <PersonAvatar person={selected.person} size={88} />
              <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: a.muted }}>{selected.person.role}</Typography>
                {selected.summary.average !== null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <StarTiles value={selected.summary.average} size={20} color={viewColor[scoreView]} label={tr("scoreAria", { score: formatScore(selected.summary.average) })} />
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatScore(selected.summary.average)}</Typography>
                    <Typography sx={{ fontSize: 14, color: a.muted }}>· {t("reviewCount", { count: formatCount(selected.summary.count) })} · {tr(`views.${scoreView}`)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", ml: -1 }}>
                  <Link href={`mailto:${selected.person.email}`} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1, minHeight: 40, fontSize: 14, fontWeight: 600, color: a.blueText, overflowWrap: "anywhere", ...focusRing }}>
                    <EmailOutlined sx={{ fontSize: 18 }} />
                    {selected.person.email}
                  </Link>
                  <SocialLinks person={selected.person} />
                </Box>
              </Box>
            </Box>
            <Typography component="h3" sx={{ mt: 2.5, fontSize: 17, fontWeight: 800 }}>{t("recentReviews")}</Typography>
            {recent.map((review) => <ReviewCardA key={review.id} review={review} onReport={setReporting} flat />)}
          </Box>
        )}
      </Sheet>
      <ReportPanel review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}

