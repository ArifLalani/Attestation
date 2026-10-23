"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { FigmaIcon, type FigmaIconName } from "@/components/ui/FigmaIcon";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import type { Review, ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { tokens } from "@/theme/theme";
import { useUsefulVote } from "./useUsefulVotes";

export const sourceIcons: Record<ReviewSource, FigmaIconName> = {
  os_certified: "source-os-certified",
  os_simple: "source-os-simple",
  import_iso: "source-imported",
  google: "source-google",
};

/** Figma "Source Icon" (1376:92924): a 24 px slot. */
export function SourceIcon({ source, alt = "" }: { source: ReviewSource; alt?: string }) {
  return (
    <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <FigmaIcon name={sourceIcons[source]} alt={alt} />
    </Box>
  );
}

/** Figma "Type d'avis" (1376:90806). */
function TypeChip({ status }: { status: Review["status"] }) {
  const t = useTranslations("Reviews");
  const controle = status === "controle";
  return (
    <Box sx={{ display: "flex", alignItems: "center", p: "4px", borderRadius: "8px", bgcolor: controle ? tokens.successLight2 : tokens.bleu10 }}>
      {controle && <FigmaIcon name="certified-badge" />}
      <Typography component="span" sx={{ px: "4px", fontSize: 13, fontWeight: 500, lineHeight: "normal", color: controle ? tokens.vertOs : tokens.bleu600, whiteSpace: "nowrap" }}>
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

const actionSx = {
  gap: 0.5,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: "18px",
  letterSpacing: "0.16px",
  borderRadius: "4px",
  whiteSpace: "nowrap",
} as const;

/** Figma "RatingBar" Variant5: Recommandation (blue) and Satisfaction (gold). */
function PercentBox({ label, value, tone }: { label: string; value: number; tone: "blue" | "gold" }) {
  const blue = tone === "blue";
  return (
    <Box
      sx={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: blue ? "flex-start" : "center",
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: "4px",
        border: `1px solid ${blue ? tokens.bleu400 : "#bf872c"}`,
        bgcolor: blue ? tokens.bleu20 : "rgba(221, 170, 88, 0.2)",
        color: blue ? tokens.bleuFonce : "#bf872c",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, lineHeight: "normal" }}>
        {label}
      </Typography>
      <Typography component="span" sx={{ fontWeight: 600, lineHeight: "normal" }}>
        <Box component="span" sx={{ fontSize: 20 }}>{value}</Box>
        <Box component="span" sx={{ fontSize: 14 }}>%</Box>
      </Typography>
    </Box>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: 26, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography component="dt" sx={{ fontSize: 14, fontWeight: 500, lineHeight: "normal", color: tokens.gris, whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0, display: "flex", alignItems: "center", gap: 0.5, fontSize: 14, fontWeight: 500, lineHeight: "normal", color: tokens.bleuFonce, textAlign: "right" }}>
        {children}
      </Box>
    </Box>
  );
}

/** Expanded "Détails". Opinion System sources: full survey. Imports: source, activity and number only. */
function ReviewDetails({ review }: { review: Review }) {
  const t = useTranslations("Reviews.detail");
  const ts = useTranslations("SourceNames");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {survey && (
        <Box sx={{ display: "flex", gap: "10px" }}>
          <PercentBox label={t("recommendation")} value={survey.recommendation} tone="blue" />
          <PercentBox label={t("satisfaction")} value={survey.satisfaction} tone="gold" />
        </Box>
      )}
      <Box sx={{ bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, borderRadius: "12px", p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {survey && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography component="h4" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
              {t("breakdown")}
            </Typography>
            {survey.scores.map((score) => (
              <Box key={score.label}>
                <Typography sx={{ fontSize: 14, lineHeight: "16.5px", color: tokens.gris }}>{score.label}</Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: "3px", bgcolor: tokens.bleu400 }} />
                  </Box>
                  <Typography component="span" sx={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                    {score.score}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <DetailRow label={t("source")}>{ts(review.source)}</DetailRow>
          {survey && (
            <DetailRow label={t("questionnaire")}>
              <SourceIcon source={review.source} />
              {t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple")}
            </DetailRow>
          )}
          {person && <DetailRow label={t("collaborator")}>{person.name}</DetailRow>}
          <DetailRow label={t("activity")}>{ta(review.product)}</DetailRow>
          <DetailRow label={t("number")}>{review.reviewNumber}</DetailRow>
        </Box>
      </Box>
    </Box>
  );
}

/** Public reply (not in the Figma yet): green rule, staff avatar, name · agency, date, text. */
function ReviewReplyBlock({ review }: { review: Review }) {
  const t = useTranslations("Reviews.reply");
  const relative = useRelativeDate();
  const { team, agency } = useCertificate();
  const [open, setOpen] = useState(false);
  const reply = review.reply!;
  const person = team.find((member) => member.id === reply.collaboratorId);
  if (!person) return null;
  const [first, last] = person.name.split(" ");
  const long = reply.text.length > 140;

  return (
    <Box sx={{ borderLeft: `3px solid ${tokens.vertOs}`, bgcolor: tokens.grisClair1, borderRadius: "0 8px 8px 0", px: 1.5, py: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StaffAvatar person={person} size={28} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
            {t("from", { name: `${first} ${last?.[0] ?? ""}.` })}
          </Typography>
          <Typography sx={{ fontSize: 12, lineHeight: "normal", color: tokens.gris }}>
            {agency.name} · {relative(review.daysAgo - reply.daysAfter)}
          </Typography>
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.43,
          color: tokens.bleuFonce,
          ...(long && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
        }}
      >
        {reply.text}
      </Typography>
      {long && (
        <ButtonBase onClick={() => setOpen(!open)} sx={{ ...actionSx, alignSelf: "flex-start", color: tokens.bleu600, fontSize: 13 }}>
          {open ? t("readLess") : t("readMore")}
        </ButtonBase>
      )}
    </Box>
  );
}

/** Figma "Review Card" (781:57356): collapsed and expanded states. */
export function ReviewCard({ review, onReport }: { review: Review; onReport: (review: Review) => void }) {
  const t = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const relative = useRelativeDate();
  const [expanded, setExpanded] = useState(false);
  const { voted, toggle } = useUsefulVote(review.id);
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  const detailsId = `review-details-${review.id}`;

  const actions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <ButtonBase
        onClick={toggle}
        aria-pressed={voted}
        aria-label={t("usefulAria", { count: formatCount(usefulCount) })}
        sx={{ ...actionSx, color: tokens.bleu600, fontWeight: voted ? 700 : 500 }}
      >
        <FigmaIcon name="thumbs-up" />
        {expanded ? <>{t("useful")}{usefulCount > 0 && ` (${formatCount(usefulCount)})`}</> : formatCount(usefulCount)}
      </ButtonBase>
      <ButtonBase onClick={() => onReport(review)} aria-label={t("report")} sx={{ ...actionSx, color: tokens.error3, ml: 1 }}>
        <FigmaIcon name="flag" />
        {expanded && t("report")}
      </ButtonBase>
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        sx={{ ...actionSx, ml: "auto", color: tokens.bleu600 }}
      >
        {t(expanded ? "less" : "details")}
        <FigmaIcon name={expanded ? "expand-less-blue" : "expand-more-blue"} />
      </ButtonBase>
    </Box>
  );


  return (
    <Box
      component="article"
      sx={{
        borderTop: `1px solid ${tokens.grisMoyen1}`,
        p: 1.5,
        bgcolor: expanded ? tokens.bleu5 : tokens.blanc,
        transition: "background-color 200ms ease",
        display: "flex",
        flexDirection: "column",
        gap: expanded ? 2 : 0,
      }}
    >
      {/* Title information */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography component="h3" sx={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
            {review.authorName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TypeChip status={review.status} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SourceIcon source={review.source} alt={t(`sourceIcon.${review.source}`)} />
              <Typography component="span" sx={{ fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                {formatScore(review.rating)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Typography sx={{ flex: 1, fontSize: 14, lineHeight: "normal", color: tokens.gris }}>{relative(review.daysAgo)}</Typography>
          <Rating
            value={review.rating}
            precision={0.1}
            readOnly
            aria-label={t("ratingAria", { score: formatScore(review.rating) })}
            sx={{ fontSize: 20, "& .MuiRating-iconFilled": { color: tokens.jaune600 }, "& .MuiRating-iconEmpty": { color: tokens.grisMoyen1 } }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ py: expanded ? 0 : 1 }}>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.43,
            letterSpacing: "0.17px",
            color: review.comment ? tokens.bleuFonce : tokens.gris,
            fontStyle: review.comment ? "normal" : "italic",
            ...(expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
          }}
        >
          {review.comment ?? t("noComment")}
        </Typography>
      </Box>

      {/* Tags: product first, then criteria */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: expanded ? 0 : 1 }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[tp(review.product), ...review.criteria.map((criterion) => tc(criterion))].map((label) => (
            <Box component="li" key={label} sx={{ p: "4px", borderRadius: "8px", bgcolor: tokens.grisClair2 }}>
              <Typography component="span" sx={{ px: "6px", fontSize: 13, fontWeight: 500, lineHeight: "normal", color: tokens.gris }}>
                #{label}
              </Typography>
            </Box>
          ))}
        </Box>

        {review.reply && !expanded && <ReviewReplyBlock review={review} />}

        {!expanded && actions}
      </Box>

      <Collapse in={expanded} unmountOnExit timeout={250}>
        <Box id={detailsId} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ReviewDetails review={review} />
          {review.reply && <ReviewReplyBlock review={review} />}
        </Box>
      </Collapse>

      {expanded && actions}
    </Box>
  );
}
