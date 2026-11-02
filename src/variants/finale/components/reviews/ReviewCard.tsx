"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { FigmaIcon, type FigmaIconName } from "@/variants/finale/components/ui/FigmaIcon";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { womenFirstNames } from "@/data/content";
import type { Review, ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { tokens } from "@/theme/theme";
import { useUsefulVote } from "@/components/reviews/useUsefulVotes";
import { HelpButton, ReviewHelpSheet, type HelpGroup, type HelpRequest } from "./ReviewHelp";

const sourceIcons: Record<ReviewSource, FigmaIconName> = {
  os_certified: "source-os-certified",
  os_simple: "source-os-simple",
  import_iso: "source-imported",
  import_other: "source-imported",
};

/** Figma "Source Icon" (1376:92924): a 24 px slot. */
export function SourceIcon({ review, alt = "", size = 24 }: { review: Pick<Review, "source" | "platform">; alt?: string; size?: number }) {
  // The Figma has a Google variant; other non-ISO platforms use the generic "Importé" icon.
  const icon = review.platform === "google" ? "source-google" : sourceIcons[review.source];
  return (
    <Box sx={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& img": { maxWidth: size, maxHeight: size } }}>
      <FigmaIcon name={icon} alt={alt} />
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
    <Box aria-hidden sx={{ ...sx, display: "grid", placeItems: "center", bgcolor: color.bg, color: color.fg, fontSize: 18, fontWeight: 600 }}>
      {firstName[0]}
    </Box>
  );
}

/** Figma "Type d'avis" (1376:90806). */
function TypeChip({ status }: { status: Review["status"] }) {
  const t = useTranslations("Reviews");
  const controle = status === "controle";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", p: "2px 4px", borderRadius: "8px", bgcolor: controle ? tokens.successLight2 : tokens.bleu10 }}>
      {controle && <FigmaIcon name="certified-badge" />}
      <Typography component="span" sx={{ px: "4px", fontSize: 12, fontWeight: 500, lineHeight: "18px", color: controle ? tokens.vertOs : tokens.bleu600, whiteSpace: "nowrap" }}>
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

/** Title of a block in the details, with its ⓘ on the right. */
function BlockTitle({ title, onHelp }: { title: string; onHelp: (anchor: HTMLElement) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1, minHeight: 24 }}>
      <Typography component="h4" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>{title}</Typography>
      <HelpButton title={title} onOpen={onHelp} />
    </Box>
  );
}

/** One line of the details: the whole line opens its explanation. */
function FactRow({ label, value, children, onOpen }: { label: string; value: string; children: React.ReactNode; onOpen: (anchor: HTMLElement) => void }) {
  const t = useTranslations("VarianteFinale.reviews");
  return (
    <Box component="li">
      <ButtonBase
        onClick={(event) => onOpen(event.currentTarget)}
        aria-haspopup="dialog"
        aria-label={t("explainItem", { label, value })}
        sx={{
          width: "100%",
          minHeight: 44,
          px: 1.5,
          py: 1,
          gap: 2,
          justifyContent: "space-between",
          fontFamily: "inherit",
          textAlign: "left",
          borderRadius: "8px",
          transition: "background-color 150ms ease",
          "&:hover": { bgcolor: tokens.bleu5 },
          ...focusSx,
          "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: -2 },
        }}
      >
        <Typography component="span" sx={{ fontSize: 14, color: tokens.gris, lineHeight: 1.3 }}>{label}</Typography>
        <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, textAlign: "right" }}>
          {children}
        </Box>
      </ButtonBase>
    </Box>
  );
}

/** Opinion System surveys: levels, scores and facts in two columns on desktop. Imports: source, activity and number only. */
function ReviewDetails({ review, onHelp }: { review: Review; onHelp: (group: HelpGroup, anchor: HTMLElement, focus?: string) => void }) {
  const t = useTranslations("Reviews.detail");
  const tv = useTranslations("VarianteFinale.reviews");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);
  const sourceName = survey ? ts("os_certified") : review.platform ? tp(review.platform) : ts(review.source);
  const questionnaire = survey && t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple");

  return (
    <Box
      sx={{
        mt: 1.5,
        p: { xs: 1.5, sm: 2 },
        borderRadius: "20px",
        bgcolor: tokens.grisClair1,
        border: `1px solid ${tokens.grisMoyen1}`,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: survey ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" },
        gap: { xs: 2.5, md: 3 },
      }}
    >
      {survey && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
          <Box>
            <BlockTitle title={tv("levels")} onHelp={(anchor) => onHelp("levels", anchor)} />
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                { key: "recommendation", label: t("recommendationLevel"), value: survey.recommendation, bg: tokens.bleu10, fg: tokens.bleuFonce },
                { key: "satisfaction", label: t("satisfactionLevel"), value: survey.satisfaction, bg: tokens.successLight2, fg: "#1f7a6a" },
              ].map((level) => (
                <ButtonBase
                  key={level.key}
                  onClick={(event) => onHelp("levels", event.currentTarget, level.key)}
                  aria-haspopup="dialog"
                  aria-label={tv("explainItem", { label: level.label, value: `${level.value} %` })}
                  sx={{
                    flex: "1 1 0",
                    minWidth: 0,
                    p: 1.5,
                    borderRadius: "16px",
                    bgcolor: level.bg,
                    color: level.fg,
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "box-shadow 150ms ease",
                    "&:hover": { boxShadow: `inset 0 0 0 1px ${tokens.bleu20}` },
                    ...focusSx,
                  }}
                >
                  <Typography component="span" sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{level.value} %</Typography>
                  <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, mt: 0.5 }}>{level.label}</Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
          <Box>
            <BlockTitle title={t("breakdown")} onHelp={(anchor) => onHelp("breakdown", anchor)} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {survey.scores.map((score) => (
                <Box key={score.label}>
                  <Typography sx={{ fontSize: 13, color: tokens.gris, lineHeight: 1.3 }}>{score.label}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ flex: 1, height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: "3px", bgcolor: tokens.bleu400 }} />
                    </Box>
                    <Typography component="span" sx={{ minWidth: 24, textAlign: "right", fontSize: 14, fontWeight: 700, color: tokens.bleuFonce }}>{score.score}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
      <Box sx={{ minWidth: 0, alignSelf: "start" }}>
        <BlockTitle title={tv("details")} onHelp={(anchor) => onHelp("details", anchor)} />
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0.5, bgcolor: tokens.blanc, borderRadius: "16px", border: `1px solid ${tokens.grisMoyen1}`, "& > li + li": { borderTop: `1px solid ${tokens.grisMoyen1}` } }}>
          <FactRow label={t("source")} value={sourceName} onOpen={(anchor) => onHelp("details", anchor, "source")}>
            <SourceIcon review={survey ? { source: "os_certified" } : review} size={20} />
            {sourceName}
          </FactRow>
          {survey && questionnaire && (
            <FactRow label={t("questionnaire")} value={questionnaire} onOpen={(anchor) => onHelp("details", anchor, "questionnaire")}>
              <SourceIcon review={review} size={20} />
              {questionnaire}
            </FactRow>
          )}
          {person && (
            <FactRow label={t("collaborator")} value={person.name} onOpen={(anchor) => onHelp("details", anchor, "collaborator")}>
              {person.name}
            </FactRow>
          )}
          <FactRow label={t("activity")} value={ta(review.product)} onOpen={(anchor) => onHelp("details", anchor, "activity")}>
            {ta(review.product)}
          </FactRow>
          <FactRow label={t("number")} value={review.reviewNumber} onOpen={(anchor) => onHelp("details", anchor, "number")}>
            {review.reviewNumber}
          </FactRow>
        </Box>
      </Box>
    </Box>
  );
}

/** Public reply (not in the Figma yet): green rule, staff avatar, name · agency, date, text. */
function ReviewReplyBlock({ review }: { review: Review }) {
  const t = useTranslations("Reviews.reply");
  const tv = useTranslations("VarianteFinale.reviews");
  const relative = useRelativeDate();
  const { team, agency } = useCertificate();
  const [open, setOpen] = useState(false);
  const reply = review.reply!;
  const person = team.find((member) => member.id === reply.collaboratorId);
  if (!person) return null;
  const long = reply.text.length > 160;

  return (
    <Box sx={{ mt: 1.5, pl: 1.5, py: 0.25, borderLeft: `3px solid ${tokens.vertOs}`, display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StaffAvatar person={person} size={28} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>{tv("replyFrom", { agency: agency.name })}</Typography>
          <Typography sx={{ fontSize: 12, lineHeight: 1.3, color: tokens.gris }}>{person.name} · {relative(review.daysAgo - reply.daysAfter)}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce, ...(long && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>
        {reply.text}
      </Typography>
      {long && (
        <ButtonBase onClick={() => setOpen(!open)} sx={{ alignSelf: "flex-start", minHeight: 32, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: tokens.bleu600, borderRadius: "6px", ...focusSx }}>
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
  borderRadius: "999px",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  ...focusSx,
  "& svg": { fontSize: 18 },
} as const;

/**
 * One review as a list row (layout from option C): who, the badge, stars and date, the source, the text, tags, the reply,
 * then Utile / Détails / ⋮. Each block of the details has an ⓘ, and each line opens its own explanation.
 */
export function ReviewCard({ review, onReport }: { review: Review; onReport: (review: Review) => void }) {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteFinale.reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tPlatform = useTranslations("Platforms");
  const ts = useTranslations("SourceNames");
  const relative = useRelativeDate();
  const { voted, toggle } = useUsefulVote(review.id);
  const [expanded, setExpanded] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [help, setHelp] = useState<HelpRequest | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // True when the card closed itself off-screen: skip the collapse animation so the scroll can be corrected at once.
  const [closedOffscreen, setClosedOffscreen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const detailsId = `review-details-${review.id}`;
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  const long = (review.comment?.length ?? 0) > 220;
  const sourceName = review.platform ? tPlatform(review.platform) : ts(review.source);

  // Once an open review has scrolled entirely above the pinned header, close it, and keep what the reader sees in place.
  useEffect(() => {
    if (!expanded || helpOpen) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const card = cardRef.current;
      if (!card) return;
      const headerHeight =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--certificate-header-height")) || tokens.headerHeight;
      const before = card.getBoundingClientRect();
      if (before.bottom > headerHeight) return;
      flushSync(() => {
        setClosedOffscreen(true);
        setExpanded(false);
      });
      const shrink = before.height - card.getBoundingClientRect().height;
      if (shrink > 0) window.scrollBy({ top: -shrink, behavior: "instant" });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [expanded, helpOpen]);

  const toggleDetails = () => {
    setClosedOffscreen(false);
    setExpanded(!expanded);
  };
  const openHelp = (group: HelpGroup, anchor: HTMLElement, focus?: string) => {
    setHelp({ group, anchor, focus });
    setHelpOpen(true);
  };

  return (
    <Box component="article" ref={cardRef} sx={{ py: 2.5, borderTop: `1px solid ${tokens.grisMoyen1}` }}>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <ReviewerAvatar review={review} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.5 }}>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>{review.authorName}</Typography>
            <TypeChip status={review.status} />
          </Box>
          <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.25, color: tokens.gris, fontSize: 13 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
              <Rating
                value={review.rating}
                precision={0.1}
                readOnly
                aria-label={t("ratingAria", { score: formatScore(review.rating) })}
                sx={{ fontSize: 16, "& .MuiRating-iconFilled": { color: tokens.jaune600 }, "& .MuiRating-iconEmpty": { color: tokens.grisMoyen1 } }}
              />
              <Box component="span" sx={{ fontWeight: 600, color: tokens.bleuFonce, fontSize: 14 }}>{formatScore(review.rating)}</Box>
            </Box>
            <span aria-hidden>·</span>
            <span>{relative(review.daysAgo)}</span>
            <Box component="span" sx={{ flexBasis: "100%", height: 0 }} />
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
              <SourceIcon review={review} size={16} />
              {tv("via", { source: sourceName })}
            </Box>
          </Box>
        </Box>
        <IconButton
          aria-label={tv("moreActions", { name: review.authorName })}
          aria-haspopup="menu"
          aria-expanded={Boolean(menuEl)}
          onClick={(event) => setMenuEl(event.currentTarget)}
          sx={{ width: 44, height: 44, mr: -1, mt: -0.5, color: tokens.gris }}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <Box sx={{ pl: { xs: 0, sm: "56px" }, mt: 1.25 }}>
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

        <Box component="ul" aria-label={tv("tagsLabel")} sx={{ listStyle: "none", m: 0, mt: 1.25, p: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {[{ key: review.product, label: tp(review.product), product: true }, ...review.criteria.map((criterion) => ({ key: criterion, label: tc(criterion), product: false }))].map((tag) => (
            <Box
              component="li"
              key={tag.key}
              sx={{
                height: 28,
                px: 1.25,
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "8px",
                fontSize: 13,
                fontWeight: 500,
                bgcolor: tag.product ? tokens.bleu10 : tokens.grisClair2,
                color: tag.product ? tokens.bleu600 : tokens.gris,
                border: `1px solid ${tag.product ? "transparent" : tokens.grisMoyen1}`,
              }}
            >
              {tag.label}
            </Box>
          ))}
        </Box>

        {review.reply && <ReviewReplyBlock review={review} />}

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1, ml: -0.5 }}>
          <ButtonBase
            onClick={toggle}
            aria-pressed={voted}
            aria-label={t("usefulAria", { count: formatCount(usefulCount) })}
            sx={{
              ...actionSx,
              border: `1px solid ${voted ? "transparent" : tokens.grisMoyen1}`,
              bgcolor: voted ? tokens.bleu10 : tokens.blanc,
              color: voted ? tokens.bleu600 : tokens.bleuFonce,
              transition: "background-color 150ms ease, transform 120ms ease",
              "&:active": { transform: "scale(0.95)" },
              "&:hover": { bgcolor: voted ? tokens.bleu10 : tokens.grisClair1 },
            }}
          >
            {voted ? <ThumbUp /> : <ThumbUpOutlined />}
            {expanded && t("useful")}
            <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{expanded ? `(${formatCount(usefulCount)})` : formatCount(usefulCount)}</Box>
          </ButtonBase>
          <ButtonBase onClick={toggleDetails} aria-expanded={expanded} aria-controls={detailsId} sx={{ ...actionSx, color: tokens.bleu600, "&:hover": { bgcolor: tokens.bleu5 } }}>
            {t(expanded ? "less" : "details")}
            <ExpandMore sx={{ transition: "transform 200ms ease", transform: expanded ? "rotate(180deg)" : "none" }} />
          </ButtonBase>
        </Box>

        {!closedOffscreen && (
          <Collapse in={expanded} unmountOnExit timeout={250}>
            <Box id={detailsId}>
              <ReviewDetails review={review} onHelp={openHelp} />
            </Box>
          </Collapse>
        )}
      </Box>

      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            toggleDetails();
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
          sx={{ minHeight: 48, fontSize: 15, color: tokens.error3 }}
        >
          <ListItemIcon sx={{ color: "inherit" }}><FlagOutlined fontSize="small" /></ListItemIcon>
          {t("report")}
        </MenuItem>
      </Menu>

      <ReviewHelpSheet review={review} request={help} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </Box>
  );
}
