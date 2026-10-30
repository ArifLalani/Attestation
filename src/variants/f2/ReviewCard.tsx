"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ThumbUpAltRounded from "@mui/icons-material/ThumbUpAltRounded";
import ThumbUpOffAltRounded from "@mui/icons-material/ThumbUpOffAltRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { SourceIcon, useRelativeDate } from "@/components/reviews/ReviewCard";
import { useUsefulVote } from "@/components/reviews/useUsefulVotes";
import { womenFirstNames } from "@/data/content";
import type { Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { b } from "./theme";
import { focusSx, hashOf, PersonAvatar, Stars } from "./ui";

const pop = keyframes`
  0% { transform: scale(1) rotate(0); }
  35% { transform: scale(1.35) rotate(-12deg); }
  70% { transform: scale(0.92) rotate(4deg); }
  100% { transform: scale(1) rotate(0); }
`;
const rise = keyframes`
  from { transform: translateY(70%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const womenPhotos = [21, 33, 44, 47, 52, 63, 68, 75, 79, 90];
const menPhotos = [12, 22, 32, 41, 46, 52, 57, 64, 75, 85];

/** Google reviewers show a demo profile photo, as Google does; everyone else their initials. */
function Reviewer({ review, size = 48 }: { review: Review; size?: number }) {
  if (review.platform === "google") {
    const firstName = review.authorName.split(" ")[0];
    const woman = womenFirstNames.has(firstName);
    const photos = woman ? womenPhotos : menPhotos;
    const src = `/images/reviewers/${woman ? "w" : "m"}${photos[hashOf(review.id) % photos.length]}.jpg`;
    return (
      <Box sx={{ position: "relative", width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <Image src={src} alt="" fill sizes={`${size}px`} style={{ objectFit: "cover" }} />
      </Box>
    );
  }
  return <PersonAvatar person={{ name: review.authorName }} size={size} />;
}

export function StatusBadge({ status }: { status: Review["status"] }) {
  const t = useTranslations("Reviews");
  const controle = status === "controle";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderRadius: 999, bgcolor: controle ? b.sageTint : b.sand, color: controle ? b.sageText : b.muted, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
      {controle && <VerifiedRounded sx={{ fontSize: 14 }} />}
      {t(controle ? "controle" : "nonControle")}
    </Box>
  );
}

function Level({ label, value, tone }: { label: string; value: number; tone: "sage" | "gold" }) {
  const color = tone === "sage" ? b.sageText : "#1c64b4";
  return (
    <Box sx={{ flex: "1 1 0", minWidth: 0, p: 1.5, borderRadius: "16px", bgcolor: tone === "sage" ? b.sageTint : "#eaf3fd", color, textAlign: "center" }}>
      <Typography sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 26, lineHeight: 1.1 }}>{value}&nbsp;%</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{label}</Typography>
    </Box>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, py: 0.75, borderTop: `1px dashed ${b.line}`, "&:first-of-type": { borderTop: "none" } }}>
      <Typography component="dt" sx={{ fontSize: 14, color: b.muted }}>{label}</Typography>
      <Box component="dd" sx={{ m: 0, display: "flex", alignItems: "center", gap: 0.75, fontSize: 14, fontWeight: 600, textAlign: "right" }}>{children}</Box>
    </Box>
  );
}

/** Détails: Opinion System sources show the full survey; imports their source, activity and number only. */
function Details({ review }: { review: Review }) {
  const t = useTranslations("Reviews.detail");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
      {survey && (
        <>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Level label={t("recommendationLevel")} value={survey.recommendation} tone="sage" />
            <Level label={t("satisfactionLevel")} value={survey.satisfaction} tone="gold" />
          </Box>
          <Box>
            <Typography component="h4" sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{t("breakdown")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {survey.scores.map((score) => (
                <Box key={score.label}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, fontSize: 13, mb: 0.5 }}>
                    <Box component="span" sx={{ color: b.muted }}>{score.label}</Box>
                    <Box component="span" sx={{ fontWeight: 700 }}>{score.score}/10</Box>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: b.sand, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: 3, bgcolor: b.ink }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
      <Box component="dl" sx={{ m: 0, px: 1.5, py: 0.5, borderRadius: "16px", bgcolor: b.ivory }}>
        <Fact label={t("source")}>
          <SourceIcon review={survey ? { source: "os_certified" } : review} />
          {review.platform ? tp(review.platform) : ts(review.source)}
        </Fact>
        {survey && (
          <Fact label={t("questionnaire")}>
            {t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple")}
          </Fact>
        )}
        {person && <Fact label={t("collaborator")}>{person.name}</Fact>}
        <Fact label={t("activity")}>{ta(review.product)}</Fact>
        <Fact label={t("number")}>{review.reviewNumber}</Fact>
      </Box>
    </Box>
  );
}

function Reply({ review }: { review: Review }) {
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
    <Box sx={{ display: "flex", gap: 1.5, p: 1.5, borderRadius: "16px", bgcolor: b.ivory }}>
      <PersonAvatar person={person} size={32} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("from", { name: `${first} ${last?.[0] ?? ""}.` })}</Typography>
        <Typography sx={{ fontSize: 12, color: b.muted, mb: 0.5 }}>{agency.name} · {relative(review.daysAgo - reply.daysAfter)}</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, ...(long && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>{reply.text}</Typography>
        {long && (
          <ButtonBase onClick={() => setOpen(!open)} sx={{ mt: 0.5, fontSize: 13, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px", borderRadius: 0.5, ...focusSx }}>
            {open ? t("readLess") : t("readMore")}
          </ButtonBase>
        )}
      </Box>
    </Box>
  );
}

const actionSx = {
  gap: 0.75,
  minHeight: 40,
  px: 1.5,
  borderRadius: 999,
  fontFamily: b.sans,
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  transition: "background-color 150ms ease",
  ...focusSx,
} as const;

/** A review as a story card: who, when, the stars, their words, then the details on demand. */
export function ReviewCardB({ review, onReport, compact = false }: { review: Review; onReport: (review: Review) => void; compact?: boolean }) {
  const t = useTranslations("Reviews");
  const tb = useTranslations("VarianteB.reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const ts = useTranslations("SourceNames");
  const tpl = useTranslations("Platforms");
  const relative = useRelativeDate();
  const { voted, toggle } = useUsefulVote(review.id);
  const [expanded, setExpanded] = useState(false);
  const [bumped, setBumped] = useState(0);
  const detailsId = useId();
  const usefulCount = review.usefulCount + (voted ? 1 : 0);

  return (
    <Box
      component="article"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
        p: compact ? 2 : { xs: 2, sm: 2.5 },
        bgcolor: b.white,
        borderRadius: "24px",
        boxShadow: `inset 0 0 0 1px ${b.line}`,
        transition: "box-shadow 250ms ease, transform 250ms ease",
        "&:hover": { boxShadow: `inset 0 0 0 1px ${b.line}, ${b.shadowLift}`, transform: { md: "translateY(-2px)" } },
        "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Reviewer review={review} size={compact ? 40 : 48} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{review.authorName}</Typography>
          <Typography sx={{ fontSize: 14, color: b.muted, lineHeight: 1.3 }}>
            {relative(review.daysAgo)} · {tp(review.product)}
          </Typography>
        </Box>
        <StatusBadge status={review.status} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Stars value={review.rating} size={16} label={t("ratingAria", { score: formatScore(review.rating) })} />
        <Typography component="span" sx={{ fontSize: 14, fontWeight: 700 }}>{formatScore(review.rating)}</Typography>
        <Box component="span" aria-hidden sx={{ color: b.muted }}>·</Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, color: b.muted, "& img": { width: 16, height: 16 } }}>
          <SourceIcon review={review} />
          {review.platform ? tpl(review.platform) : ts(review.source)}
        </Box>
      </Box>

      <Typography
        sx={{
          fontSize: 16,
          lineHeight: 1.6,
          color: review.comment ? b.ink : b.muted,
          fontStyle: review.comment ? "normal" : "italic",
          ...(expanded ? {} : { display: "-webkit-box", WebkitLineClamp: compact ? 3 : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}
      >
        {review.comment ?? t("noComment")}
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {[tp(review.product), ...review.criteria.map((criterion) => tc(criterion))].map((label, index) => (
          <Box component="li" key={label} sx={{ px: 1.25, py: 0.5, borderRadius: 999, fontSize: 13, fontWeight: 600, bgcolor: index === 0 ? b.accentTint : b.ivory, color: index === 0 ? b.accentDark : b.ink }}>
            {label}
          </Box>
        ))}
      </Box>

      {review.reply && <Reply review={review} />}

      <Collapse in={expanded} unmountOnExit timeout={260}>
        <Box id={detailsId}>
          <Details review={review} />
        </Box>
      </Collapse>

      <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 0.5, pt: 0.5, mx: -0.75 }}>
        <ButtonBase
          onClick={() => {
            toggle();
            setBumped((value) => value + 1);
          }}
          aria-pressed={voted}
          aria-label={t("usefulAria", { count: formatCount(usefulCount) })}
          sx={{ ...actionSx, bgcolor: voted ? b.accentTint : "transparent", color: voted ? b.accentDark : b.ink, "&:hover": { bgcolor: voted ? b.accentTint : b.ivory } }}
        >
          <Box key={`icon-${bumped}`} sx={{ display: "flex", animation: bumped ? `${pop} 420ms ease` : "none", "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
            {voted ? <ThumbUpAltRounded sx={{ fontSize: 18 }} /> : <ThumbUpOffAltRounded sx={{ fontSize: 18 }} />}
          </Box>
          {expanded && t("useful")}
          <Box component="span" sx={{ display: "inline-flex", overflow: "hidden" }}>
            <Box key={usefulCount} component="span" sx={{ display: "inline-block", animation: bumped ? `${rise} 260ms ease` : "none", "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
              {formatCount(usefulCount)}
            </Box>
          </Box>
        </ButtonBase>
        <ButtonBase onClick={() => onReport(review)} aria-label={t("report")} sx={{ ...actionSx, color: b.muted, "&:hover": { bgcolor: b.ivory, color: b.ink } }}>
          <FlagOutlined sx={{ fontSize: 18 }} />
          {expanded && t("report")}
        </ButtonBase>
        <ButtonBase
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          sx={{ ...actionSx, ml: "auto", textDecoration: "underline", textUnderlineOffset: "3px", "&:hover": { bgcolor: b.ivory } }}
        >
          {tb(expanded ? "less" : "more")}
          <KeyboardArrowDownRounded sx={{ fontSize: 20, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
        </ButtonBase>
      </Box>
    </Box>
  );
}
