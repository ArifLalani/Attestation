"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import type { Collaborator, Review } from "@/data/types";
import { formatCount } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { ScorePill } from "./CollaboratorPickerC";
import { ReportSheetC } from "./Forms";
import { ReviewItem } from "./ReviewItem";
import { Pill, SectionCard, Sheet } from "./ui";
import { focusRing, pc } from "./theme";

const networks = [
  { key: "instagram", icon: <Instagram /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "linkedin", icon: <LinkedIn /> },
] as const;

function Socials({ person }: { person: Collaborator }) {
  const t = useTranslations("Team");
  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      {networks.map(({ key, icon }) =>
        person.socials[key] ? (
          <IconButton
            key={key}
            component="a"
            href={person.socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("social", { network: t(`networks.${key}`), name: person.name })}
            sx={{ width: 44, height: 44, bgcolor: pc.indigoSoft, color: pc.indigoDark, "&:hover": { bgcolor: pc.indigoTonal } }}
          >
            {icon}
          </IconButton>
        ) : null,
      )}
    </Box>
  );
}

/** L'équipe: a swipeable row of profile cards ("Tout voir" turns it into a grid); a card opens the profile sheet. */
export function Team() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const tv = useTranslations("VarianteC");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  const people = useMemo(
    () =>
      team
        .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, scoreView, person.id)) }))
        .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold))
        .sort((a, b) => (b.summary.average ?? 0) - (a.summary.average ?? 0) || a.person.name.localeCompare(b.person.name, "fr")),
    [team, reviews, scoreView, agency.publicThreshold],
  );
  const selected = people.find(({ person }) => person.id === selectedId);
  const recent = selected ? reviewsForScore(reviews, scoreView, selected.person.id).slice().sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 3) : [];

  const seeReviews = () => {
    if (!selected) return;
    setFilters({ ...emptyFilters, collaboratorId: selected.person.id, type: scoreView === "controle" ? "controle" : undefined });
    setScoreCollaboratorId(selected.person.id);
    setReviewSort("recent");
    setSelectedId(undefined);
    window.setTimeout(() => goToSection("avis"), 350);
  };

  return (
    <SectionCard
      titleId="vc-team-title"
      title={tv("teamTitle")}
      subtitle={t("heading")}
      action={
        people.length > 4 ? (
          <Pill tone="text" aria-expanded={expanded} aria-controls="vc-team-list" onClick={() => setExpanded((value) => !value)} sx={{ mt: -0.5, mr: -1 }}>
            {expanded ? t("showLess") : tv("seeAll", { count: people.length })}
          </Pill>
        ) : undefined
      }
    >
      <Box
        id="vc-team-list"
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "grid",
          gap: 1.5,
          ...(expanded
            ? { gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" } }
            : { gridAutoFlow: "column", gridAutoColumns: { xs: "44%", sm: "200px" }, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, mx: { xs: -2, sm: -3 }, px: { xs: 2, sm: 3 }, scrollPaddingInline: { xs: "16px", sm: "24px" } }),
        }}
      >
        {people.map(({ person, summary }) => (
          <Box component="li" key={person.id} sx={{ scrollSnapAlign: "start", minWidth: 0 }}>
            <ButtonBase
              onClick={() => setSelectedId(person.id)}
              aria-label={t("openProfile", { name: person.name })}
              sx={{ width: "100%", height: "100%", flexDirection: "column", gap: 1, p: 2, pt: 2.5, borderRadius: "20px", border: `1px solid ${pc.outline}`, bgcolor: pc.surfaceDim, textAlign: "center", transition: "background-color 150ms ease, border-color 150ms ease, transform 150ms ease", "&:hover": { bgcolor: pc.indigoSoft, borderColor: pc.indigoTonal }, "&:active": { transform: "scale(0.98)" }, "&.Mui-focusVisible": focusRing }}
            >
              <StaffAvatar person={person} size={72} />
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: pc.muted, lineHeight: 1.3, minHeight: 34 }}>{person.role}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {summary.average !== null && <ScorePill value={summary.average} />}
                <Typography component="span" sx={{ fontSize: 12, color: pc.muted, fontWeight: 600 }}>{tv("reviewsShort", { count: formatCount(summary.count) })}</Typography>
              </Box>
            </ButtonBase>
          </Box>
        ))}
      </Box>
      {!people.length && <Typography sx={{ fontSize: 15, color: pc.muted }}>{t("empty")}</Typography>}

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelectedId(undefined)}
        title={t("profile")}
        closeLabel={t("close")}
        width={600}
        footer={selected ? <Pill fullWidth onClick={seeReviews}>{t("seeReviews")}</Pill> : undefined}
      >
        {selected && (
          <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, textAlign: "center", p: 2.5, borderRadius: "24px", bgcolor: pc.surfaceDim }}>
              <StaffAvatar person={selected.person} size={96} />
              <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, mt: 0.5 }}>{selected.person.name}</Typography>
              <Typography sx={{ fontSize: 15, color: pc.muted }}>{selected.person.role}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selected.summary.average !== null && <ScorePill value={selected.summary.average} />}
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t("reviewCount", { count: formatCount(selected.summary.count) })}</Typography>
                <Typography component="span" sx={{ fontSize: 13, color: pc.muted }}>· {tr(`views.${scoreView}`)}</Typography>
              </Box>
              <Link href={`mailto:${selected.person.email}`} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, minHeight: 36, fontSize: 14, fontWeight: 600, color: pc.indigoDark, overflowWrap: "anywhere", textUnderlineOffset: "3px" }}>
                <EmailOutlined sx={{ fontSize: 18 }} />
                {selected.person.email}
              </Link>
              <Socials person={selected.person} />
            </Box>
            <Typography component="h3" sx={{ fontSize: 17, fontWeight: 700 }}>{t("recentReviews")}</Typography>
            <Box sx={{ mt: -2.5 }}>
              {recent.map((review) => <ReviewItem key={review.id} review={review} onReport={setReporting} />)}
            </Box>
          </Box>
        )}
      </Sheet>
      <ReportSheetC review={reporting} onClose={() => setReporting(null)} />
    </SectionCard>
  );
}
