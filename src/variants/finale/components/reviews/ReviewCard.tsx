"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import Star from "@mui/icons-material/Star";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { FigmaIcon, type FigmaIconName } from "@/variants/finale/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { womenFirstNames } from "@/data/content";
import type { Review, ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { tokens } from "@/theme/theme";
import { useUsefulVote } from "@/components/reviews/useUsefulVotes";
import { DefinitionsSheet } from "@/variants/finale/components/certificate/DefinitionsSheet";
import { HelpButton, definitionFor, type HelpGroup, type HelpRequest } from "./ReviewHelp";

/*
 * Spacing between an icon and its text, the same everywhere:
 * 16 px icons (source line, chips, facts) sit 6 px from their text; 18–20 px icons (actions) 6 px too, rows 8 px.
 */
const iconGap = 0.75;

const sourceIcons: Record<ReviewSource, FigmaIconName> = {
  // Opinion System reviews show their questionnaire (certifié or interne); the Opinion System mark is OpinionSystemIcon.
  os_certified: "rv-q-certifie",
  os_simple: "rv-q-interne",
  import_iso: "rv-import",
  import_other: "rv-import",
};

/** Figma "Source Icon" (1376:92924): a 24 px slot. */
export function SourceIcon({ review, alt = "", size = 24 }: { review: Pick<Review, "source" | "platform">; alt?: string; size?: number }) {
  // The Figma has a Google variant; other non-ISO platforms use the generic "Importé" icon.
  const icon = review.platform === "google" ? "source-google" : sourceIcons[review.source];
  return (
    <Box sx={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& img": { maxWidth: size, maxHeight: size } }}>
      <FigmaIcon name={icon} alt={alt} size={icon.startsWith("rv-") ? size : undefined} />
    </Box>
  );
}

/** The Opinion System mark: the source « Opinion System » (not a questionnaire). */
export function OpinionSystemIcon({ alt = "", size = 24 }: { alt?: string; size?: number }) {
  return (
    <Box sx={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& img": { maxWidth: size, maxHeight: size } }}>
      <FigmaIcon name="source-os-certified" alt={alt} />
    </Box>
  );
}

const womenPhotos = [21, 33, 44, 47, 52, 63, 68, 75, 79, 90];
const menPhotos = [12, 22, 32, 41, 46, 52, 57, 64, 75, 85];
// Initials in the page's own tints: blue, green, yellow, grey-blue.
const initialColors = [
  { bg: tokens.bleu10, fg: tokens.bleu600 },
  { bg: tokens.successLight2, fg: "#1f7a6a" },
  { bg: "rgba(247, 182, 0, 0.16)", fg: "#8a5a00" },
  { bg: tokens.grisClair2, fg: tokens.bleuFonce },
];

function hashOf(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** First-name initial; Google reviewers show a demo profile photo, as Google does. */
function ReviewerAvatar({ review }: { review: Review }) {
  const firstName = review.authorName.split(" ")[0];
  const sx = { width: 40, height: 40, borderRadius: "50%", flexShrink: 0, overflow: "hidden" } as const;
  if (review.platform === "google") {
    const woman = womenFirstNames.has(firstName);
    const photos = woman ? womenPhotos : menPhotos;
    return (
      <Box sx={{ ...sx, position: "relative" }}>
        <Image src={`/images/reviewers/${woman ? "w" : "m"}${photos[hashOf(review.id) % photos.length]}.jpg`} alt="" fill sizes="40px" />
      </Box>
    );
  }
  const color = initialColors[hashOf(review.authorName) % initialColors.length];
  return (
    <Box aria-hidden sx={{ ...sx, display: "grid", placeItems: "center", bgcolor: color.bg, color: color.fg, fontSize: 17, fontWeight: 600 }}>
      {firstName[0]}
    </Box>
  );
}

/** Figma "Type d'avis" (1376:90806): never wraps, so it sits at the end of the stars line. */
function TypeChip({ status }: { status: Review["status"] }) {
  const t = useTranslations("Reviews");
  const controle = status === "controle";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: iconGap, flexShrink: 0, height: 26, pl: 1, pr: 1.25, borderRadius: "6px", bgcolor: controle ? tokens.successLight2 : tokens.bleu10 }}>
      <FigmaIcon name={controle ? "rv-controle" : "rv-non-controle"} size={16} />
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, lineHeight: "18px", color: controle ? tokens.vertOs : tokens.bleu600, whiteSpace: "nowrap" }}>
        {t(controle ? "controle" : "nonControle")}
      </Typography>
    </Box>
  );
}

export function useRelativeDate() {
  const t = useTranslations("Reviews.date");
  return (daysAgo: number) => {
    if (daysAgo <= 0) return t("today");
    if (daysAgo === 1) return t("yesterday");
    if (daysAgo < 7) return t("days", { n: daysAgo });
    if (daysAgo < 30) return t("weeks", { n: Math.floor(daysAgo / 7) });
    if (daysAgo < 365) return t("months", { n: Math.floor(daysAgo / 30) });
    return t("years", { n: Math.floor(daysAgo / 365) });
  };
}

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** The reviewer: avatar, then the name on the full width (a long name wraps cleanly), the project and the date under it. */
function ReviewHead({ review, as = "h3" }: { review: Review; as?: "h3" | "p" }) {
  const tp = useTranslations("Products");
  const relative = useRelativeDate();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <ReviewerAvatar review={review} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component={as} sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce, overflowWrap: "anywhere" }}>{review.authorName}</Typography>
        <Typography sx={{ fontSize: 13, lineHeight: 1.4, mt: "2px", color: tokens.gris }}>
          {tp(review.product)} · {relative(review.daysAgo)}
        </Typography>
      </Box>
    </Box>
  );
}

/** Stars and the score on the left, the Contrôlé / Non contrôlé chip on the right. */
function RatingLine({ review }: { review: Review }) {
  const t = useTranslations("Reviews");
  return (
    // On the narrowest phones the chip drops under the stars instead of running past the card.
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 1 }}>
      <Rating
        value={review.rating}
        precision={0.1}
        readOnly
        aria-label={t("ratingAria", { score: formatScore(review.rating) })}
        icon={<Star fontSize="inherit" />}
        emptyIcon={<Star fontSize="inherit" />}
        sx={{ fontSize: 20, "& .MuiRating-iconFilled": { color: tokens.rating }, "& .MuiRating-iconEmpty": { color: "#c3d5ea" } }}
      />
      <Typography component="span" sx={{ fontSize: 15, fontWeight: 700, color: tokens.bleuFonce, fontVariantNumeric: "tabular-nums" }}>{formatScore(review.rating)}</Typography>
      {/* Right-aligned on phones; on wide cards (desktop) it follows the score instead of floating far away. */}
      <Box sx={{ ml: "auto", "@container review (max-width: 239px)": { ml: 0 }, "@container review (min-width: 520px)": { ml: 0.5 } }}>
        <TypeChip status={review.status} />
      </Box>
    </Box>
  );
}

/** Title of a block in the details, with its ⓘ on the right. */
function BlockTitle({ title, onHelp }: { title: string; onHelp: (anchor: HTMLElement) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5, minHeight: 24 }}>
      <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>{title}</Typography>
      <HelpButton title={title} onOpen={onHelp} />
    </Box>
  );
}

/** A section of the review details: a thin rule above, its title with the ⓘ, then its content. */
function DetailSection({ title, onHelp, children }: { title: string; onHelp: (anchor: HTMLElement) => void; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, pt: 2, mt: 2 }}>
      <BlockTitle title={title} onHelp={onHelp} />
      {children}
    </Box>
  );
}

/** One fact of the details (label above, value under it); the whole fact opens its explanation. */
function Fact({ label, value, children, onOpen }: { label: string; value: string; children: React.ReactNode; onOpen: (anchor: HTMLElement) => void }) {
  const t = useTranslations("VarianteFinale.reviews");
  return (
    <ButtonBase
      onClick={(event) => onOpen(event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={t("explainItem", { label, value })}
      sx={{
        m: -0.75,
        p: 0.75,
        minWidth: 0,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 0.5,
        textAlign: "left",
        fontFamily: "inherit",
        borderRadius: "8px",
        transition: "background-color 150ms ease",
        "&:hover": { bgcolor: tokens.bleu5 },
        "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 0 },
      }}
    >
      <Typography component="span" sx={{ fontSize: 12, lineHeight: 1.3, color: tokens.gris }}>{label}</Typography>
      {/* The icon stays level with the first line when the value wraps. */}
      <Box component="span" sx={{ display: "flex", alignItems: "flex-start", gap: iconGap, minWidth: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: tokens.bleuFonce, overflowWrap: "anywhere", "& > div": { mt: "1.5px" } }}>
        {children}
      </Box>
    </ButtonBase>
  );
}

/**
 * The details of a review, shown in its sheet: one flat column of sections split by thin rules (no boxes in boxes).
 * Opinion System surveys: Niveaux, Répartition des notes, then Informations. Imports: Informations only.
 */
function ReviewDetails({ review, onHelp }: { review: Review; onHelp: (group: HelpGroup, anchor: HTMLElement, focus?: string) => void }) {
  const t = useTranslations("Reviews.detail");
  const tr = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const td = useTranslations("VarianteFinale.definitions.label");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);
  const sourceName = survey ? ts("os_certified") : review.platform ? tp(review.platform) : ts(review.source);
  const controle = review.status === "controle";
  const reviewType = tr(controle ? "controle" : "nonControle");
  const questionnaire = survey && t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple");

  return (
    <>
      {survey && (
        <DetailSection title={tv("levels")} onHelp={(anchor) => onHelp("levels", anchor)}>
          {/* Two plain figures side by side, short labels under them. */}
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
            {[
              { key: "recommendation", label: t("recommendation"), long: t("recommendationLevel"), value: survey.recommendation, fg: tokens.bleuFonce },
              { key: "satisfaction", label: t("satisfaction"), long: t("satisfactionLevel"), value: survey.satisfaction, fg: "#1f7a6a" },
            ].map((level, index) => (
              <Box key={level.key} sx={index ? { borderLeft: `1px solid ${tokens.grisMoyen1}`, pl: 2 } : { pr: 2 }}>
                <ButtonBase
                  onClick={(event) => onHelp("levels", event.currentTarget, level.key)}
                  aria-haspopup="dialog"
                  aria-label={tv("explainItem", { label: level.long, value: `${level.value} %` })}
                  sx={{ m: -0.75, p: 0.75, flexDirection: "column", alignItems: "flex-start", textAlign: "left", fontFamily: "inherit", borderRadius: "8px", "&:hover": { bgcolor: tokens.bleu5 }, ...focusSx }}
                >
                  <Typography component="span" sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: level.fg }}>{level.value} %</Typography>
                  <Typography component="span" sx={{ fontSize: 12, lineHeight: 1.3, mt: 0.5, color: tokens.gris }}>{level.label}</Typography>
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </DetailSection>
      )}
      {survey && (
        <DetailSection title={t("breakdown")} onHelp={(anchor) => onHelp("breakdown", anchor)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {survey.scores.map((score) => (
              <Box key={score.label}>
                {/* The criterion and its score on one line, the bar under them. */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1.5, mb: 0.75 }}>
                  <Typography component="span" sx={{ fontSize: 13, lineHeight: 1.35, color: tokens.bleuFonce, opacity: 0.75 }}>{score.label}</Typography>
                  <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: tokens.bleuFonce, fontVariantNumeric: "tabular-nums" }}>{score.score}</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: "3px", bgcolor: tokens.bleu400 }} />
                </Box>
              </Box>
            ))}
          </Box>
        </DetailSection>
      )}
      <DetailSection title={tv("info")} onHelp={(anchor) => onHelp("details", anchor)}>
        {/* Two columns of facts, label above value, so nothing has to share a line. */}
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 2, rowGap: 2 }}>
          <Fact label={t("source")} value={sourceName} onOpen={(anchor) => onHelp("details", anchor, "source")}>
            {survey ? <OpinionSystemIcon size={16} /> : <SourceIcon review={review} size={16} />}
            {sourceName}
          </Fact>
          <Fact label={td("type")} value={reviewType} onOpen={(anchor) => onHelp("details", anchor, "type")}>
            <FigmaIcon name={controle ? "rv-controle" : "rv-non-controle"} size={16} />
            {reviewType}
          </Fact>
          {survey && questionnaire && (
            <Fact label={t("questionnaire")} value={questionnaire} onOpen={(anchor) => onHelp("details", anchor, "questionnaire")}>
              <SourceIcon review={review} size={16} />
              {questionnaire}
            </Fact>
          )}
          {person && (
            <Fact label={t("collaborator")} value={person.name} onOpen={(anchor) => onHelp("details", anchor, "collaborator")}>
              {person.name}
            </Fact>
          )}
          {/* Only a certified Opinion System questionnaire has an activité professionnelle (it is the questionnaire type). */}
          {review.source === "os_certified" && (
            <Fact label={t("activity")} value={ta(review.product)} onOpen={(anchor) => onHelp("details", anchor, "activity")}>
              {ta(review.product)}
            </Fact>
          )}
          <Fact label={t("number")} value={review.reviewNumber} onOpen={(anchor) => onHelp("details", anchor, "number")}>
            {review.reviewNumber}
          </Fact>
        </Box>
      </DetailSection>
    </>
  );
}

/** Public reply (not in the Figma yet): green rule, staff avatar, name · agency, date, text. */
function ReviewReplyBlock({ review, showFull = false }: { review: Review; showFull?: boolean }) {
  const t = useTranslations("Reviews.reply");
  const tv = useTranslations("VarianteFinale.reviews");
  const relative = useRelativeDate();
  const { team, agency } = useCertificate();
  const [open, setOpen] = useState(false);
  const reply = review.reply;
  if (!reply) return null;
  const person = team.find((member) => member.id === reply.collaboratorId);
  const canExpand = !showFull && reply.text.length > 160;

  return (
    <Box sx={{ pl: 1.5, py: 0.25, borderLeft: `3px solid ${tokens.vertOs}`, display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {person && <StaffAvatar person={person} size={28} />}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>{tv("replyFrom", { agency: agency.name })}</Typography>
          <Typography sx={{ fontSize: 12, lineHeight: 1.3, color: tokens.gris }}>{person && `${person.name} · `}{relative(review.daysAgo - reply.daysAfter)}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce, ...(canExpand && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>
        {reply.text}
      </Typography>
      {canExpand && (
        <ButtonBase onClick={() => setOpen(!open)} sx={{ alignSelf: "flex-start", minHeight: 32, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: tokens.bleu600, borderRadius: "6px", ...focusSx }}>
          {open ? t("readLess") : t("readMore")}
        </ButtonBase>
      )}
    </Box>
  );
}

const quietActionSx = {
  minHeight: 40,
  gap: iconGap,
  px: 1,
  borderRadius: "8px",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  color: tokens.bleuFonce,
  whiteSpace: "nowrap",
  flexShrink: 0,
  "&:hover": { bgcolor: tokens.grisClair1 },
  ...focusSx,
  "& svg": { fontSize: 18 },
} as const;

/** Utile (n) and Signaler, labelled; they never wrap. On very narrow cards Signaler keeps only its flag. */
function ReviewActions({ review, onReport, children }: { review: Review; onReport: (review: Review) => void; children?: React.ReactNode }) {
  const t = useTranslations("Reviews");
  const { voted, toggle } = useUsefulVote(review.id);
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: -1, minWidth: 0 }}>
      <ButtonBase onClick={toggle} aria-pressed={voted} aria-label={t("usefulAria", { count: formatCount(usefulCount) })} sx={{ ...quietActionSx, color: voted ? tokens.bleu600 : tokens.bleuFonce }}>
        {voted ? <ThumbUp /> : <ThumbUpOutlined />}
        {t("useful")}
        <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatCount(usefulCount)}</Box>
      </ButtonBase>
      <ButtonBase onClick={() => onReport(review)} aria-label={t("report")} sx={quietActionSx}>
        <FlagOutlined />
        <Box component="span" className="report-label">{t("report")}</Box>
      </ButtonBase>
      {children}
    </Box>
  );
}

/** In the list, each review floats on the page background as its own card, and lifts on hover where a mouse is used. */
const framedSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCardSoft,
  px: { xs: 2, md: 3 },
  pt: { xs: 2, md: 2.5 },
  pb: 1,
  transition: "box-shadow 200ms ease, transform 200ms ease",
  "@media (hover: hover)": {
    "&:hover": { boxShadow: "0px 10px 28px 0px rgba(4, 27, 68, 0.16)", transform: "translateY(-2px)" },
  },
} as const;
/** Inside the white Avis card: a thin light-blue outline, the shadow and lift only on hover. */
const outlinedSx = {
  ...framedSx,
  borderRadius: "16px",
  boxShadow: "none",
  border: "1px solid #d6e4f3",
  px: { xs: 2, md: 2.5 },
  transition: "box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease",
  "@media (hover: hover)": {
    "&:hover": { boxShadow: "0px 10px 28px 0px rgba(4, 27, 68, 0.16)", transform: "translateY(-2px)", borderColor: "transparent" },
  },
} as const;
/** Inside a panel (the staff profile), reviews stay a plain list split by rules. */
const plainSx = { py: 2.5, borderTop: `1px solid ${tokens.grisMoyen1}` } as const;

/** The content of a review’s details page: which review it is, then its details; each ⓘ opens Comprendre les avis on top. */
export function ReviewDetailsContent({ review }: { review: Review }) {
  const [help, setHelp] = useState<HelpRequest | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const openHelp = (group: HelpGroup, anchor: HTMLElement, focus?: string) => {
    setHelp({ group, anchor, focus });
    setHelpOpen(true);
  };
  return (
    <Box sx={{ p: 2, pb: 3 }}>
      {/* Which review this is: the reviewer, the stars and the chip. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <ReviewHead review={review} as="p" />
        <RatingLine review={review} />
        {/* The review itself, in full. */}
        {review.comment && <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: tokens.bleuFonce }}>{review.comment}</Typography>}
        {review.reply && <ReviewReplyBlock review={review} showFull />}
      </Box>
      <ReviewDetails review={review} onHelp={openHelp} />
      <DefinitionsSheet open={helpOpen} onClose={() => setHelpOpen(false)} initial={definitionFor(review, help)} review={review} view={review.status === "controle" ? "controle" : "global"} />
    </Box>
  );
}

/** Utile and Signaler pinned at the foot of a review’s details page. */
export function ReviewDetailsFooter({ review, onReport }: { review: Review; onReport: (review: Review) => void }) {
  return (
    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0, pb: "max(8px, env(safe-area-inset-bottom))" }}>
      <ReviewActions review={review} onReport={onReport} />
    </Box>
  );
}

/**
 * One review: the reviewer (full width), the stars with the Contrôlé chip, where it comes from, the text and #tags;
 * then Utile, Signaler and Détails. Détails opens the review’s details in a bottom sheet (phones) or a side sheet (desktop);
 * inside another panel (a team profile), `onOpenDetails` lets that panel show them as its second page, with a back arrow.
 */
export function ReviewCard({ review, onReport, framed = true, outlined = false, onOpenDetails, detailsBackLabel }: { review: Review; onReport: (review: Review) => void; framed?: boolean; outlined?: boolean; onOpenDetails?: (review: Review) => void; /** Opened from another panel: a back arrow instead of the close button. */ detailsBackLabel?: string }) {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tPlatform = useTranslations("Platforms");
  const ts = useTranslations("SourceNames");
  const [detailsOpen, setDetailsOpen] = useState(false);
  // The sheet is only built once Détails has been opened (phone sheets stay mounted after closing).
  const [detailsUsed, setDetailsUsed] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const long = (review.comment?.length ?? 0) > 220;
  // Under the stars: where the review comes from, and for Opinion System whether the questionnaire was internal or certified.
  const sourceLine = tv(`sourceLine.${review.source}`, { platform: review.platform ? tPlatform(review.platform) : ts(review.source) });
  const sourceAlt = review.platform ? t("sourceIcon.platform", { platform: tPlatform(review.platform) }) : t(`sourceIcon.${review.source}`);

  const openDetails = () => {
    if (onOpenDetails) return onOpenDetails(review);
    setDetailsUsed(true);
    setDetailsOpen(true);
  };
  // A tap anywhere on the card opens its details, except on its own buttons and links (Utile, Signaler, Lire la suite…),
  // when text is being selected, or from inside the sheets it opens (their clicks reach here through React).
  const onCardClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (!event.currentTarget.contains(target) || target.closest("button, a, input, [role=button]")) return;
    if (window.getSelection()?.toString()) return;
    openDetails();
  };

  return (
    <Box
      component="article"
      onClick={onCardClick}
      sx={{
        cursor: "pointer",
        ...(!framed ? plainSx : outlined ? outlinedSx : framedSx),
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        containerType: "inline-size",
        containerName: "review",
        "@container review (max-width: 259px)": { "& .report-label": { display: "none" } },
      }}
    >
      <ReviewHead review={review} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <RatingLine review={review} />
        <Box sx={{ display: "flex", alignItems: "center", gap: iconGap, minWidth: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: tokens.gris }}>
          <SourceIcon review={review} size={16} alt={sourceAlt} />
          <Box component="span" sx={{ minWidth: 0 }}>{sourceLine}</Box>
        </Box>
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: review.comment ? tokens.bleuFonce : tokens.gris,
            fontStyle: review.comment ? "normal" : "italic",
            ...(long && !readAll ? { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
          }}
        >
          {review.comment ?? t("noComment")}
        </Typography>
        {long && (
          <ButtonBase onClick={() => setReadAll(!readAll)} sx={{ minHeight: 32, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: tokens.bleu600, borderRadius: "6px", ...focusSx }}>
            {readAll ? tv("readLess") : t("readMore")}
          </ButtonBase>
        )}
      </Box>

      <Box component="ul" aria-label={tv("tagsLabel")} sx={{ listStyle: "none", m: 0, mt: -0.5, p: 0, display: "flex", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.5 }}>
        {[{ key: review.product, label: tp(review.product) }, ...review.criteria.map((criterion) => ({ key: criterion, label: tc(criterion) }))].map((tag) => (
          <Box component="li" key={tag.key} sx={{ fontSize: 13, fontWeight: 500, color: tokens.gris }}>
            #{tag.label}
          </Box>
        ))}
      </Box>

      {review.reply && <ReviewReplyBlock review={review} />}

      {/* Actions under a thin rule: Utile and Signaler on the left, Détails on the right. */}
      <Box sx={{ borderTop: `1px solid ${tokens.grisMoyen1}`, pt: 0.75, mt: 0.25 }}>
        <ReviewActions review={review} onReport={onReport}>
          <ButtonBase
            onClick={openDetails}
            aria-haspopup="dialog"
            aria-label={tv("openDetails", { name: review.authorName })}
            sx={{ ...quietActionSx, ml: "auto", gap: 0.25, pr: 0.5, color: tokens.bleu600, "&:hover": { bgcolor: tokens.bleu5 } }}
          >
            {t("details")}
            <ChevronRight sx={{ fontSize: "20px !important" }} />
          </ButtonBase>
        </ReviewActions>
      </Box>

      {detailsUsed && (
        <ResponsiveSheet
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title={tv("details")}
          closeLabel={tv("close")}
          onBack={detailsBackLabel ? () => setDetailsOpen(false) : undefined}
          backLabel={detailsBackLabel}
          hideClose={Boolean(detailsBackLabel)}
          footer={<ReviewDetailsFooter review={review} onReport={onReport} />}
        >
          <ReviewDetailsContent review={review} />
        </ResponsiveSheet>
      )}
    </Box>
  );
}
