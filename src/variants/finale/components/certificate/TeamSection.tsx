"use client";

import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import ChevronRight from "@mui/icons-material/ChevronRight";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import CloseRounded from "@mui/icons-material/CloseRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ReportSheet } from "@/variants/finale/components/reviews/ReportSheet";
import { ReviewCard, ReviewDetailsContent, ReviewDetailsFooter } from "@/variants/finale/components/reviews/ReviewCard";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import type { Collaborator, Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { normalize } from "@/lib/assistant";
import { displayScore, isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCaseData } from "@/variants/finale/cases";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "./ReputationCard";

const networks = [
  { key: "instagram", icon: <Instagram /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "linkedin", icon: <LinkedIn /> },
] as const;

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** A job or agency line in the profile: grey text with a 15 px outlined icon before it. */
// Left-aligned, the icons in one column; a long job wraps under its own text, not under the icon.
const profileMetaSx = { display: "flex", alignItems: "flex-start", gap: "4px", textAlign: "left", fontSize: 12.5, color: tokens.gris, lineHeight: 1.3, "& svg": { fontSize: 15, flexShrink: 0, mt: "1px" } } as const;

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

/**
 * Under the job, centred in a chip: « 4,8 ★ · 42 avis » in the type of the profile's scores (bold score, semibold count).
 * With Avis Contrôlés chosen in the Réputation tabs the writing turns green (the site's Avis Contrôlés green) and ends with the Contrôlé seal.
 */
function PersonScore({ average, count, controlled }: { average: number | null; count: number; controlled: boolean }) {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation.views");
  const color = controlled ? tokens.vertOs : tokens.bleuFonce;
  return (
    <Box
      sx={{
        mt: 0.75, alignSelf: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.5,
        height: 30, px: 1.25, borderRadius: "8px", border: "1px solid", whiteSpace: "nowrap", color,
        // The light grey of the Réputation tabs' track; only the writing changes colour.
        bgcolor: tokens.grisClair2,
        borderColor: tokens.grisMoyen1,
        transition: "color 200ms ease",
      }}
    >
      {average !== null && (
        <>
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 15, fontWeight: 700, lineHeight: 1 }}>
            {formatScore(average)}
            <StarRounded aria-hidden sx={{ fontSize: 16, color: tokens.rating }} />
          </Box>
          <Box component="span" aria-hidden sx={{ fontSize: 12, opacity: 0.55 }}>·</Box>
        </>
      )}
      <Box component="span" sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>{t("reviewCount", { count: formatCount(count) })}</Box>
      {controlled && (
        <Box component="span" role="img" aria-label={tr("controle")} sx={{ display: "inline-flex" }}>
          <FigmaIcon name="rv-controle" size={16} />
        </Box>
      )}
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
      sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 48, pl: 2, pr: 0.5, borderRadius: "8px", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.grisClair1, color: tokens.gris, transition: "border-color 150ms ease", "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc } }}
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
 * L'équipe (cards and profile from option G, in H's look): the score sits beside the number of reviews under the job; a tap opens the profile,
 * a side sheet on desktop and a bottom sheet on phones.
 */
export function TeamSection() {
  const t = useTranslations("Team");
  const tr = useTranslations("Reputation");
  const tv = useTranslations("VarianteFinale.team");
  const { team, reviews, agency, scoreView, setScoreCollaboratorId, setFilters, setReviewSort, goToSection } = useCertificate();
  const { sector } = useCaseData();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [reporting, setReporting] = useState<Review | null>(null);
  // A review’s details open as the profile’s second page (back arrow), not as a new panel. The review stays set while it slides out.
  const [detailsReview, setDetailsReview] = useState<Review>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const tvr = useTranslations("VarianteFinale.reviews");
  // Desktop: the details are the profile panel’s second page. Phones: a sheet rising from the bottom, over the profile.
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
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

  /** Each score opens the front page's reviews of this person, in that view (all of them, or the controlled ones only). */
  const seeReviews = (view: "global" | "controle") => {
    if (!selected) return;
    setFilters({ ...emptyFilters, collaboratorId: selected.person.id, type: view === "controle" ? "controle" : undefined });
    setScoreCollaboratorId(selected.person.id);
    setReviewSort("recent");
    setSelectedId(undefined);
    // Let the modal release its scroll lock before scrolling to the review section.
    window.setTimeout(() => goToSection("avis"), 350);
  };

  return (
    <Box component="section" aria-labelledby="team-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: 1.5, py: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Case 4: the team as the trade calls it (Nos négociateurs, Nos conseillers, Nos moniteurs, L’équipe). */}
      <CardTitle id="team-title" eyebrow={sector.team === "Équipe" ? "L’équipe" : `Nos ${sector.team.toLowerCase()}`} heading={t("heading", { name: agency.name })} />
      {people.length > 4 && <TeamSearch value={query} onChange={setQuery} />}
      <Box id="team-grid" component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1, md: 2 } }}>
        {shown.map(({ person, summary }) => (
          <li key={person.id}>
            <Box component="article" sx={personCardSx}>
              <ButtonBase onClick={() => setSelectedId(person.id)} aria-label={t("openProfile", { name: person.name })} aria-haspopup="dialog" sx={{ flex: "1 0 auto", flexDirection: "column", justifyContent: "flex-start", width: "100%", px: 0.5, borderRadius: "12px", ...focusSx }}>
                <Box sx={{ position: "relative", borderRadius: "50%", p: "3px", bgcolor: tokens.blanc, boxShadow: "0 0 0 1px #d6e4f3" }}>
                  <StaffAvatar person={person} size={80} />
                </Box>
                <Typography component="h3" sx={{ mt: 1, fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: tokens.bleuFonce }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: tokens.gris, lineHeight: 1.35 }}>{person.role}</Typography>
                <PersonScore average={summary.average} count={summary.count} controlled={scoreView === "controle"} />
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
        onClose={() => {
          setSelectedId(undefined);
          setDetailsOpen(false);
        }}
        title={t("profile")}
        closeLabel={t("close")}
        subPage={
          selected
            ? {
                open: detailsOpen,
                title: tvr("details"),
                backLabel: tv("backToProfile"),
                onBack: () => setDetailsOpen(false),
                children: detailsReview ? <ReviewDetailsContent review={detailsReview} /> : null,
                footer: detailsReview ? <ReviewDetailsFooter review={detailsReview} onReport={setReporting} /> : undefined,
              }
            : undefined
        }
      >
        {selected && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* The profile card: photo, name, job and agency on the left, a divider, the two scores on the right.
                Two even halves: the person centred on the left, the score buttons filling the right (never narrower than the « Tous les avis (61) » line). */}
            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 1px minmax(max-content, 1fr)", alignItems: "center", columnGap: 1.5, p: 1.5, borderRadius: "16px", bgcolor: tokens.blanc, boxShadow: tokens.shadowCard }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25, textAlign: "center", minWidth: 0 }}>
                <StaffAvatar person={selected.person} size={72} />
                <Typography sx={{ mt: 0.75, fontSize: 17, fontWeight: 600, lineHeight: 1.2, color: tokens.bleuFonce }}>{selected.person.name}</Typography>
                {/* The job, then the agency, each with its outlined icon (briefcase, map pin as in Nos agences); the scores on the right carry the numbers of reviews. */}
                <Box sx={{ maxWidth: "100%", display: "flex", flexDirection: "column", gap: 0.25 }}>
                  <Typography sx={profileMetaSx}><WorkOutlineOutlined aria-hidden />{selected.person.role}</Typography>
                  <Typography sx={profileMetaSx}><PlaceOutlined aria-hidden />{tv("agency")} {agency.city}</Typography>
                </Box>
              </Box>
              <Box aria-hidden sx={{ alignSelf: "stretch", bgcolor: tokens.grisMoyen1 }} />
              <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
                {[
                  // Avis Contrôlés in the green of the Réputation display.
                  ...scores.map(({ view, average, count }) => ({ key: view, view: count > 0 ? view : undefined, count, label: `${tr(`views.${view}`)} (${formatCount(count)})`, value: average !== null ? <>{formatScore(average)}<Rating value={displayScore(average)} precision={0.1} readOnly aria-hidden icon={<StarRounded fontSize="inherit" />} emptyIcon={<StarRounded fontSize="inherit" />} sx={{ ml: 0.5, fontSize: 16, "& .MuiRating-iconFilled": { color: tokens.rating }, "& .MuiRating-iconEmpty": { color: "#8ea6ba", opacity: 0.48 } }} /></> : "—", color: view === "controle" ? tokens.vertOs : undefined }))
                ].map((stat, index, stats) => {
                  // The score of the view chosen in the Réputation tabs is highlighted (blue for all reviews, green for controlled ones).
                  const current = stat.key === scoreView;
                  const lineAbove = index > 0 && !current && stats[index - 1].key !== scoreView;
                  return (
                  <Box key={stat.key} sx={{
                    position: "relative", display: "flex", flexDirection: "column-reverse", py: 1.25, px: 1, pr: stat.view ? 3 : 1,
                    borderRadius: current ? "10px" : 0, border: "1px solid transparent", borderTopColor: lineAbove ? tokens.grisMoyen1 : "transparent",
                    ...(current && { bgcolor: stat.key === "controle" ? tokens.successLight2 : tokens.bleu10, borderColor: stat.key === "controle" ? "#b8e6d3" : "rgba(44, 149, 255, 0.25)" }),
                    transition: "background-color 200ms ease, border-color 200ms ease",
                    "&:hover .stat-chevron": { transform: "translateX(2px)" },
                  }}>
                    {/* The two scores open these reviews on the page: the whole row is the button. */}
                    {stat.view && (
                      <>
                        <ButtonBase
                          onClick={() => seeReviews(stat.view!)}
                          aria-label={t("seeViewReviews", { view: tr(`views.${stat.view}`), count: formatCount(stat.count), name: selected.person.name })}
                          sx={{ position: "absolute", inset: 0, borderRadius: "8px", "&:hover": { bgcolor: "rgba(44, 149, 255, 0.06)" }, ...focusSx }}
                        />
                        <ChevronRight aria-hidden className="stat-chevron" sx={{ position: "absolute", right: 2, top: "50%", mt: "-10px", fontSize: 20, color: tokens.bleuFonce, pointerEvents: "none", transition: "transform 150ms ease" }} />
                      </>
                    )}
                    <Typography component="dt" sx={{ pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12, fontWeight: 600, color: stat.color ?? tokens.gris }}>
                      {stat.label}
                    </Typography>
                    <Box component="dd" sx={{ pointerEvents: "none", m: 0, display: "flex", alignItems: "center", gap: 0.25, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: stat.color ?? tokens.bleuFonce }}>{stat.value}</Box>
                  </Box>
                  );
                })}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
              <ButtonBase
                component="a"
                href={`mailto:${selected.person.email}`}
                sx={{ maxWidth: "100%", height: 40, gap: 1, px: 1.75, borderRadius: "8px", bgcolor: tokens.bleu10, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 600, "&:hover": { bgcolor: tokens.bleu20 }, ...focusSx }}
              >
                <EmailOutlined sx={{ fontSize: 20 }} />
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.person.email}</Box>
              </ButtonBase>
              <SocialLinks person={selected.person} />
            </Box>
            <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}` }} />
            <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600, color: tokens.bleuFonce }}>{t("recentReviews")}</Typography>
            {recent.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReport={setReporting}
                outlined
                detailsBackLabel={tv("backToProfile")}
                onOpenDetails={
                  desktop
                    ? (chosen) => {
                        setDetailsReview(chosen);
                        setDetailsOpen(true);
                      }
                    : undefined
                }
              />
            ))}
          </Box>
        )}
      </ResponsiveSheet>
      <ReportSheet review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
