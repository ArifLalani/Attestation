"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import CloseRounded from "@mui/icons-material/CloseRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ReportSheet } from "@/variants/finale/components/reviews/ReportSheet";
import { ReviewCard } from "@/variants/finale/components/reviews/ReviewCard";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import type { Collaborator, Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { normalize } from "@/lib/assistant";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "./ReputationCard";

const networks = [
  { key: "instagram", icon: <Instagram /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "linkedin", icon: <LinkedIn /> },
] as const;

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** Instagram, Facebook, LinkedIn in one dark blue (from option G). */
function SocialLinks({ person }: { person: Collaborator }) {
  const t = useTranslations("Team");
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
      {networks.map(({ key, icon }) => person.socials[key] ? (
        <IconButton
          key={key} component="a" href={person.socials[key]} target="_blank" rel="noopener noreferrer"
          aria-label={t("social", { network: t(`networks.${key}`), name: person.name })}
          sx={{ width: 40, height: 40, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.bleu10 }, "& svg": { fontSize: 20 }, ...focusSx }}
        >
          {icon}
        </IconButton>
      ) : null)}
    </Box>
  );
}

/** "★ 4,7" in a white pill over the bottom of the photo (from option G), with H's yellow star. */
function ScorePill({ value }: { value: number }) {
  return (
    <Box sx={{ position: "absolute", left: "50%", bottom: -10, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 0.25, height: 24, pl: 0.75, pr: 1, borderRadius: "999px", bgcolor: tokens.blanc, boxShadow: "0 2px 8px rgba(4, 27, 68, 0.16)", fontSize: 13, fontWeight: 700, lineHeight: 1, color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
      <FigmaIcon name="star-small" />
      {formatScore(value)}
    </Box>
  );
}

/** A person: a white card with a thin border that lifts on hover, like the reviews in the Avis card. */
const personCardSx = {
  height: "100%",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
  pt: 2.5,
  pb: 1,
  px: 1,
  bgcolor: tokens.blanc,
  border: "1px solid #d6e4f3",
  borderRadius: "16px",
  textAlign: "center",
  transition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
  "@media (hover: hover)": {
    "&:hover": { boxShadow: "0px 10px 28px 0px rgba(4, 27, 68, 0.16)", transform: "translateY(-2px)", borderColor: "transparent" },
  },
  "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
} as const;

/** Search by name or job, drawn like the search of the Avis card. */
function TeamSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("VarianteFinale.team");
  return (
    <Box
      role="search"
      sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 48, pl: 2, pr: 0.5, borderRadius: "999px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.grisClair1, color: tokens.gris, transition: "border-color 150ms ease", "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc } }}
    >
      <SearchRounded aria-hidden sx={{ fontSize: 20, flexShrink: 0 }} />
      <InputBase
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder={t("searchPlaceholder")}
        inputProps={{ "aria-label": t("search"), "aria-controls": "team-grid", enterKeyHint: "search" }}
        sx={{ flex: 1, minWidth: 0, fontSize: 16, color: tokens.bleuFonce, "& input": { textOverflow: "ellipsis" }, "& input::-webkit-search-cancel-button": { display: "none" }, "& input::placeholder": { opacity: 1, color: tokens.gris } }}
      />
      {value && (
        <IconButton size="small" onClick={() => onChange("")} aria-label={t("searchClear")} sx={{ color: "inherit" }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

/** Desktop: the same size and place as Afficher plus d’avis in the Avis card. */
const teamButtonSx = { width: { md: "auto" }, minWidth: { md: 180 }, px: { md: 2.5 }, alignSelf: { md: "flex-end" } } as const;

/**
 * L'équipe (cards and profile from option G, in H's look): the score pill overlaps each photo; a tap opens the profile,
 * a side sheet on desktop and a bottom sheet on phones.
 */
export function TeamSection() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const tv = useTranslations("VarianteFinale.team");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  const people = useMemo(() => team.map((person) => ({
    person, summary: summarize(reviewsForScore(reviews, scoreView, person.id)),
  })).filter(({ summary }) => isPublic(summary.count, agency.publicThreshold))
    .sort((a, b) => (b.summary.average ?? 0) - (a.summary.average ?? 0) || a.person.name.localeCompare(b.person.name, "fr")),
  [team, reviews, scoreView, agency.publicThreshold]);
  const selected = people.find(({ person }) => person.id === selectedId);
  // While searching, every match shows (no "Voir toute l'équipe"); each word must be in the name or the job, accents ignored.
  const words = normalize(query).split(" ").filter(Boolean);
  const matches = words.length ? people.filter(({ person }) => words.every((word) => normalize(`${person.name} ${person.role}`).includes(word))) : people;
  const shown = words.length ? matches : expanded ? people : people.slice(0, 4);
  // The profile shows both scores with their number of reviews, whichever view the page is on.
  const scores = selected
    ? (["global", "controle"] as const).map((view) => ({ view, ...summarize(reviewsForScore(reviews, view, selected.person.id)) }))
    : [];
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
    <Box component="section" aria-labelledby="team-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: 1.5, py: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: 2 }}>
      <CardTitle id="team-title" eyebrow={t("eyebrow")} heading={t("heading")} />
      {people.length > 4 && <TeamSearch value={query} onChange={setQuery} />}
      <Box id="team-grid" component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1, md: 2 } }}>
        {shown.map(({ person, summary }) => (
          <li key={person.id}>
            <Box component="article" sx={personCardSx}>
              <ButtonBase onClick={() => setSelectedId(person.id)} aria-label={t("openProfile", { name: person.name })} aria-haspopup="dialog" sx={{ flexDirection: "column", width: "100%", px: 0.5, borderRadius: "12px", ...focusSx }}>
                <Box sx={{ position: "relative", borderRadius: "50%", p: "3px", bgcolor: tokens.blanc, boxShadow: "0 0 0 1px #d6e4f3" }}>
                  <StaffAvatar person={person} size={80} />
                  {summary.average !== null && <ScorePill value={summary.average} />}
                </Box>
                <Typography component="h3" sx={{ mt: 2, fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: tokens.bleuFonce }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: tokens.gris, lineHeight: 1.35, minHeight: 35 }}>{person.role}</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13, fontWeight: 600, color: tokens.bleuFonce }}>{t("reviewCount", { count: formatCount(summary.count) })}</Typography>
              </ButtonBase>
              <SocialLinks person={person} />
            </Box>
          </li>
        ))}
      </Box>
      {!people.length && <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("empty")}</Typography>}
      {people.length > 0 && words.length > 0 && !matches.length && (
        <Box role="status" sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, textAlign: "center" }}>
          <Typography sx={{ fontSize: 15, color: tokens.gris }}>{tv("noMatch", { query: query.trim() })}</Typography>
          <Link component="button" onClick={() => setQuery("")} sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleu600 }}>{tv("searchClear")}</Link>
        </Box>
      )}
      {/* Full width on phones and tablets; on desktop the size of Afficher plus d’avis, on the right. */}
      {people.length > 4 && !words.length && <CtaButton variant="secondary" aria-expanded={expanded} aria-controls="team-grid" onClick={() => setExpanded((value) => !value)} sx={{ "& img": { transform: expanded ? "rotate(180deg)" : "none" }, ...teamButtonSx }}>{t(expanded ? "showLess" : "showMore")}</CtaButton>}

      <ResponsiveSheet
        side
        open={Boolean(selected)}
        onClose={() => setSelectedId(undefined)}
        title={t("profile")}
        closeLabel={t("close")}
        footer={selected ? <Box sx={{ p: 2, borderTop: `1px solid ${tokens.grisMoyen1}` }}><CtaButton onClick={seeReviews}>{t("seeReviews")}</CtaButton></Box> : undefined}
      >
        {selected && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* The profile card (option G): photo, name and role on the left, the numbers on the right. */}
            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)", alignItems: "center", gap: 2, p: 2, borderRadius: "16px", bgcolor: tokens.blanc, boxShadow: tokens.shadowCard }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, textAlign: "center", minWidth: 0 }}>
                <StaffAvatar person={selected.person} size={96} />
                <Typography sx={{ mt: 0.5, fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: tokens.bleuFonce }}>{selected.person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: tokens.gris, lineHeight: 1.35 }}>{selected.person.role}</Typography>
                {/* The number of reviews under the job, as on the cards (saves a row on the right). */}
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.bleuFonce }}>{t("reviewCount", { count: formatCount(selected.summary.count) })}</Typography>
              </Box>
              <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column" }}>
                {[
                  // Avis Contrôlés in the green of the Réputation display.
                  ...scores.map(({ view, average, count }) => ({ label: `${tr(`views.${view}`)} (${formatCount(count)})`, value: average !== null ? <>{formatScore(average)}<FigmaIcon name="star-small" /></> : "—", color: view === "controle" ? tokens.vertOs : undefined })),
                  { label: tv("agency"), value: agency.city, color: undefined },
                ].map((stat, index) => (
                  <Box key={stat.label} sx={{ display: "flex", flexDirection: "column-reverse", py: 1.25, borderTop: index ? `1px solid ${tokens.grisMoyen1}` : "none" }}>
                    <Typography component="dt" sx={{ fontSize: 12, fontWeight: 600, color: stat.color ?? tokens.gris }}>{stat.label}</Typography>
                    <Box component="dd" sx={{ m: 0, display: "flex", alignItems: "center", gap: 0.25, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: stat.color ?? tokens.bleuFonce }}>{stat.value}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <ButtonBase
                component="a"
                href={`mailto:${selected.person.email}`}
                sx={{ maxWidth: "100%", height: 40, gap: 1, px: 1.75, borderRadius: "999px", bgcolor: tokens.bleu10, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 600, "&:hover": { bgcolor: tokens.bleu20 }, ...focusSx }}
              >
                <EmailOutlined sx={{ fontSize: 18 }} />
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.person.email}</Box>
              </ButtonBase>
              <SocialLinks person={selected.person} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}` }} />
            <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600, color: tokens.bleuFonce }}>{t("recentReviews")}</Typography>
            {recent.map((review) => <ReviewCard key={review.id} review={review} onReport={setReporting} outlined />)}
          </Box>
        )}
      </ResponsiveSheet>
      <ReportSheet review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
