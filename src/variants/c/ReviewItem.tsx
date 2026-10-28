"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { SourceIcon, useRelativeDate } from "@/components/reviews/ReviewCard";
import { useUsefulVote } from "@/components/reviews/useUsefulVotes";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import { womenFirstNames } from "@/data/content";
import type { Review } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { Bar } from "./Reputation";
import { StatusBadge, Stars } from "./ui";
import { focusRing, pc } from "./theme";

const womenPhotos = [21, 33, 44, 47, 52, 63, 68, 75, 79, 90];
const menPhotos = [12, 22, 32, 41, 46, 52, 57, 64, 75, 85];
const initialColors = [
  { bg: "#e8e7fd", fg: "#4338ca" },
  { bg: "#e3f5ee", fg: "#0b7a59" },
  { bg: "#fdf0d5", fg: "#8a5a00" },
  { bg: "#fde7ef", fg: "#a8174f" },
  { bg: "#e0f1fb", fg: "#0b5f8a" },
];

function hashOf(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Google reviewers show a demo profile photo, as Google does; everyone else a coloured initial. */
function ReviewerAvatar({ review }: { review: Review }) {
  const firstName = review.authorName.split(" ")[0];
  const sx = { width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden" } as const;
  if (review.platform === "google") {
    const woman = womenFirstNames.has(firstName);
    const photos = woman ? womenPhotos : menPhotos;
    return (
      <Box sx={{ ...sx, position: "relative" }}>
        <Image src={`/images/reviewers/${woman ? "w" : "m"}${photos[hashOf(review.id) % photos.length]}.jpg`} alt="" fill sizes="44px" />
      </Box>
    );
  }
  const color = initialColors[hashOf(review.authorName) % initialColors.length];
  return (
    <Box aria-hidden sx={{ ...sx, display: "grid", placeItems: "center", bgcolor: color.bg, color: color.fg, fontSize: 18, fontWeight: 700 }}>
      {firstName[0]}
    </Box>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, py: 1, borderBottom: `1px solid ${pc.outline}`, "&:last-of-type": { borderBottom: 0 } }}>
      <Typography component="dt" sx={{ fontSize: 14, color: pc.muted }}>{label}</Typography>
      <Box component="dd" sx={{ m: 0, display: "flex", alignItems: "center", gap: 0.5, fontSize: 14, fontWeight: 600, textAlign: "right" }}>{children}</Box>
    </Box>
  );
}

/** Opinion System surveys: levels, criteria and facts. Imports: source, activity and number only. */
function Details({ review }: { review: Review }) {
  const t = useTranslations("Reviews.detail");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);

  return (
    <Box sx={{ mt: 1.5, p: { xs: 1.5, sm: 2 }, borderRadius: "20px", bgcolor: pc.surfaceDim, border: `1px solid ${pc.outline}`, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: survey ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" }, gap: { xs: 2, md: 3 } }}>
      {survey && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[
              { label: t("recommendationLevel"), value: survey.recommendation, bg: pc.indigoTonal, fg: pc.indigoDark },
              { label: t("satisfactionLevel"), value: survey.satisfaction, bg: pc.emeraldTint, fg: pc.emeraldText },
            ].map((level) => (
              <Box key={level.label} sx={{ flex: "1 1 0", p: 1.5, borderRadius: "16px", bgcolor: level.bg, color: level.fg }}>
                <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{level.value} %</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, mt: 0.5 }}>{level.label}</Typography>
              </Box>
            ))}
          </Box>
          <Box>
            <Typography component="h4" sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{t("breakdown")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {survey.scores.map((score) => (
                <Box key={score.label}>
                  <Typography sx={{ fontSize: 13, color: pc.muted, lineHeight: 1.3 }}>{score.label}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Bar value={score.score * 10} color={pc.indigo} height={6} />
                    <Typography component="span" sx={{ minWidth: 28, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{score.score}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
      <Box component="dl" sx={{ m: 0, minWidth: 0, alignSelf: "start", bgcolor: "#fff", borderRadius: "16px", border: `1px solid ${pc.outline}`, px: 1.5, py: 0.25 }}>
        <Fact label={t("source")}>
          <SourceIcon review={survey ? { source: "os_certified" } : review} />
          {review.platform ? tp(review.platform) : ts(review.source)}
        </Fact>
        {survey && (
          <Fact label={t("questionnaire")}>
            <SourceIcon review={review} />
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
  const tv = useTranslations("VarianteC");
  const relative = useRelativeDate();
  const { team, agency } = useCertificate();
  const [open, setOpen] = useState(false);
  const reply = review.reply!;
  const person = team.find((member) => member.id === reply.collaboratorId);
  if (!person) return null;
  const long = reply.text.length > 160;
  return (
    <Box sx={{ mt: 1.5, ml: { xs: 0, sm: 1 }, pl: 2, borderLeft: `2px solid ${pc.outlineStrong}`, display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StaffAvatar person={person} size={28} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{tv("replyFrom", { agency: agency.name })}</Typography>
          <Typography sx={{ fontSize: 12, color: pc.muted, lineHeight: 1.3 }}>{person.name} · {relative(review.daysAgo - reply.daysAfter)}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 14, lineHeight: 1.5, ...(long && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>{reply.text}</Typography>
      {long && (
        <ButtonBase onClick={() => setOpen(!open)} sx={{ alignSelf: "flex-start", minHeight: 32, fontSize: 13, fontWeight: 700, color: pc.indigoDark, borderRadius: "6px", "&.Mui-focusVisible": focusRing }}>
          {open ? t("readLess") : t("readMore")}
        </ButtonBase>
      )}
    </Box>
  );
}

const actionSx = {
  minHeight: 40,
  gap: 0.75,
  px: 1.5,
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&.Mui-focusVisible": focusRing,
  "& svg": { fontSize: 18 },
} as const;

/** One review as a list row: who, the verified badge, stars and date, text, tags, reply, then Utile / Détails / ⋮. */
export function ReviewItem({ review, onReport }: { review: Review; onReport: (review: Review) => void }) {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteC");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tPlatform = useTranslations("Platforms");
  const ts = useTranslations("SourceNames");
  const relative = useRelativeDate();
  const { voted, toggle } = useUsefulVote(review.id);
  const [expanded, setExpanded] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const detailsId = useId();
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  const long = (review.comment?.length ?? 0) > 220;
  const sourceName = review.platform ? tPlatform(review.platform) : ts(review.source);

  return (
    <Box component="article" sx={{ py: 2.5, borderTop: `1px solid ${pc.outline}` }}>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <ReviewerAvatar review={review} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.5 }}>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{review.authorName}</Typography>
            <StatusBadge controle={review.status === "controle"} label={t(review.status === "controle" ? "controle" : "nonControle")} />
          </Box>
          <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.25, color: pc.muted, fontSize: 13 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <Stars value={review.rating} size={15} label={t("ratingAria", { score: formatScore(review.rating) })} />
              <Box component="span" sx={{ fontWeight: 700, color: pc.ink, fontSize: 14 }}>{formatScore(review.rating)}</Box>
            </Box>
            <span aria-hidden>·</span>
            <span>{relative(review.daysAgo)}</span>
            <Box component="span" sx={{ flexBasis: "100%", height: 0 }} />
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, "& > div": { width: 18, height: 18 }, "& img": { width: 16, height: 16 } }}>
              <SourceIcon review={review} />
              {tv("via", { source: sourceName })}
            </Box>
          </Box>
        </Box>
        <IconButton
          aria-label={tv("moreActions", { name: review.authorName })}
          aria-haspopup="menu"
          aria-expanded={Boolean(menuEl)}
          onClick={(event) => setMenuEl(event.currentTarget)}
          sx={{ width: 44, height: 44, mr: -1, mt: -0.5, color: pc.muted }}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <Box sx={{ pl: { xs: 0, sm: "56px" }, mt: 1.25 }}>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.6,
            color: review.comment ? pc.ink : pc.muted,
            fontStyle: review.comment ? "normal" : "italic",
            ...(long && !readAll ? { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
          }}
        >
          {review.comment ?? t("noComment")}
        </Typography>
        {long && (
          <ButtonBase onClick={() => setReadAll(!readAll)} sx={{ minHeight: 32, fontSize: 14, fontWeight: 700, color: pc.indigoDark, borderRadius: "6px", "&.Mui-focusVisible": focusRing }}>
            {readAll ? tv("readLess") : t("readMore")}
          </ButtonBase>
        )}

        <Box component="ul" aria-label={tv("tagsLabel")} sx={{ listStyle: "none", m: 0, mt: 1.25, p: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {[{ key: review.product, label: tp(review.product), product: true }, ...review.criteria.map((criterion) => ({ key: criterion, label: tc(criterion), product: false }))].map((tag) => (
            <Box component="li" key={tag.key} sx={{ height: 28, px: 1.25, display: "inline-flex", alignItems: "center", borderRadius: "8px", fontSize: 13, fontWeight: 600, bgcolor: tag.product ? pc.indigoSoft : pc.surfaceDim, color: tag.product ? pc.indigoDark : pc.muted, border: `1px solid ${tag.product ? "transparent" : pc.outline}` }}>
              {tag.label}
            </Box>
          ))}
        </Box>

        {review.reply && <Reply review={review} />}

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1, ml: -0.5 }}>
          <ButtonBase
            onClick={toggle}
            aria-pressed={voted}
            aria-label={t("usefulAria", { count: formatCount(usefulCount) })}
            sx={{ ...actionSx, border: `1px solid ${voted ? "transparent" : pc.outlineStrong}`, bgcolor: voted ? pc.indigoTonal : "#fff", color: voted ? pc.indigoDark : pc.ink, transition: "background-color 150ms ease, transform 120ms ease", "&:active": { transform: "scale(0.95)" }, "&:hover": { bgcolor: voted ? pc.indigoTonal : pc.surfaceDim } }}
          >
            {voted ? <ThumbUp /> : <ThumbUpOutlined />}
            {expanded && t("useful")}
            {<Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{expanded ? `(${formatCount(usefulCount)})` : formatCount(usefulCount)}</Box>}
          </ButtonBase>
          <ButtonBase onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={detailsId} sx={{ ...actionSx, color: pc.indigoDark, "&:hover": { bgcolor: pc.indigoSoft } }}>
            {t(expanded ? "less" : "details")}
            <ExpandMore sx={{ transition: "transform 200ms ease", transform: expanded ? "rotate(180deg)" : "none" }} />
          </ButtonBase>
        </Box>

        <Collapse in={expanded} unmountOnExit timeout={250}>
          <Box id={detailsId}>
            <Details review={review} />
          </Box>
        </Collapse>
      </Box>

      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            setExpanded(!expanded);
          }}
          sx={{ minHeight: 48, fontSize: 15 }}
        >
          <ListItemIcon><InfoOutlined fontSize="small" /></ListItemIcon>
          {t(expanded ? "less" : "details")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onReport(review);
          }}
          sx={{ minHeight: 48, fontSize: 15, color: pc.red }}
        >
          <ListItemIcon sx={{ color: "inherit" }}><FlagOutlined fontSize="small" /></ListItemIcon>
          {t("report")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
