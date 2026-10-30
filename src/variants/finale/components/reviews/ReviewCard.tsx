"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
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

const sourceIcons: Record<ReviewSource, FigmaIconName> = {
  os_certified: "source-os-certified",
  os_simple: "source-os-simple",
  import_iso: "source-imported",
  import_other: "source-imported",
};

/** Figma "Source Icon" (1376:92924): a 24 px slot. */
export function SourceIcon({ review, alt = "" }: { review: Pick<Review, "source" | "platform">; alt?: string }) {
  // The Figma has a Google variant; other non-ISO platforms use the generic "Importé" icon.
  const icon = review.platform === "google" ? "source-google" : sourceIcons[review.source];
  return (
    <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <FigmaIcon name={icon} alt={alt} />
    </Box>
  );
}

const womenPhotos = [21, 33, 44, 47, 52, 63, 68, 75, 79, 90];
const menPhotos = [12, 22, 32, 41, 46, 52, 57, 64, 75, 85];

function hashOf(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Figma "<Avatar>" (1502:30351): first-name initial. Google reviewers show a demo profile photo, as Google does. */
function ReviewerAvatar({ review }: { review: Review }) {
  const firstName = review.authorName.split(" ")[0];
  const sx = { width: 40, height: 40, borderRadius: "50%", flexShrink: 0, overflow: "hidden" } as const;
  if (review.platform === "google") {
    const woman = womenFirstNames.has(firstName);
    const photos = woman ? womenPhotos : menPhotos;
    const src = `/images/reviewers/${woman ? "w" : "m"}${photos[hashOf(review.id) % photos.length]}.jpg`;
    return (
      <Box sx={{ ...sx, position: "relative" }}>
        <Image src={src} alt="" fill sizes="40px" />
      </Box>
    );
  }
  return (
    <Box aria-hidden sx={{ ...sx, display: "grid", placeItems: "center", bgcolor: "#ede7f6", color: "#4527a0", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
      {firstName[0]}
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
  const tp = useTranslations("Platforms");
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
          <DetailRow label={t("source")}>{review.platform ? tp(review.platform) : ts(review.source)}</DetailRow>
          {survey && (
            <DetailRow label={t("questionnaire")}>
              <SourceIcon review={review} />
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

/** Figma "RatingBar" in the desktop review card (1478:36211): big percentage over its label. */
function LevelBox({ label, value, tone }: { label: string; value: number; tone: "blue" | "gold" }) {
  const blue = tone === "blue";
  return (
    <Box
      sx={{
        flex: "1 1 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1.5,
        borderRadius: "12px",
        border: `1px solid ${tokens.grisMoyen1}`,
        bgcolor: blue ? "rgba(44, 149, 255, 0.2)" : "#efeade",
        color: blue ? tokens.bleuFonce : "#bf872c",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.5 }}>{value}%</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.5, maxWidth: 130 }}>{label}</Typography>
    </Box>
  );
}

const columnDividerSx = { width: "1px", flexShrink: 0, bgcolor: tokens.grisMoyen1 } as const;

/**
 * Desktop "Détails" (Figma 1478:36205): "Répartition des notes" over three columns: the two levels, the scores and the facts.
 * Imports have no survey: their facts are listed one under the other, in the left half.
 */
function DesktopReviewDetails({ review }: { review: Review }) {
  const t = useTranslations("Reviews.detail");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);

  const facts = (
    <>
      <DetailRow label={t("source")}>
        {/* Opinion System surveys show the Opinion System mark, as in the Figma; imports show their own icon. */}
        <SourceIcon review={survey ? { source: "os_certified" } : review} />
        {review.platform ? tp(review.platform) : ts(review.source)}
      </DetailRow>
      {survey && (
        <DetailRow label={t("questionnaire")}>
          <SourceIcon review={review} />
          {t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple")}
        </DetailRow>
      )}
      {person && <DetailRow label={t("collaborator")}>{person.name}</DetailRow>}
      <DetailRow label={t("activity")}>{ta(review.product)}</DetailRow>
      <DetailRow label={t("number")}>{review.reviewNumber}</DetailRow>
    </>
  );

  if (!survey) {
    return (
      <Box component="dl" sx={{ m: 0, width: "50%", display: "flex", flexDirection: "column", gap: 1 }}>
        {facts}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography component="h4" sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: tokens.bleuFonce }}>
        {t("breakdown")}
      </Typography>
      <Box sx={{ display: "flex", gap: 2.5 }}>
        <Box sx={{ width: 182, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <LevelBox label={t("recommendationLevel")} value={survey.recommendation} tone="blue" />
          <LevelBox label={t("satisfactionLevel")} value={survey.satisfaction} tone="gold" />
        </Box>
        <Box sx={columnDividerSx} />
        <Box sx={{ flex: "442 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          {survey.scores.map((score) => (
            <Box key={score.label}>
              <Typography sx={{ fontSize: 14, lineHeight: "17px", color: tokens.gris }}>{score.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, minHeight: 21 }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: "3px", bgcolor: tokens.bleu400 }} />
                </Box>
                <Typography component="span" sx={{ minWidth: 16, textAlign: "right", fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                  {score.score}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={columnDividerSx} />
        <Box component="dl" sx={{ flex: "362 1 0", minWidth: 0, m: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {facts}
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
  const tpCard = useTranslations("Platforms");
  const relative = useRelativeDate();
  const [expanded, setExpanded] = useState(false);
  // True when the card closed itself off-screen: skip the collapse animation so the scroll can be corrected at once.
  const [closedOffscreen, setClosedOffscreen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const { voted, toggle } = useUsefulVote(review.id);
  // Desktop: the open details use three columns. They only render after a tap, so this never runs on the server.
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });

  // Once an open review has scrolled entirely above the pinned header, close it, and keep what the reader sees in place.
  useEffect(() => {
    if (!expanded) return;
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
  }, [expanded]);
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  const detailsId = `review-details-${review.id}`;
  const labelSx = { display: { xs: expanded ? "inline" : "none", md: "inline" } } as const;
  const phoneOnlySx = { display: { md: "none" } } as const;

  const actions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <ButtonBase
        onClick={toggle}
        aria-pressed={voted}
        aria-label={t("usefulAria", { count: formatCount(usefulCount) })}
        sx={{ ...actionSx, color: tokens.bleu600, fontWeight: voted ? 700 : 500 }}
      >
        <FigmaIcon name="thumbs-up" />
        {/* Phones: "8" when closed, "Utile (8)" when open. Desktop: always "Utile 8". Done in CSS so the server HTML matches. */}
        <Box component="span" sx={labelSx}>{t("useful")}</Box>
        {usefulCount > 0 ? (
          <Box component="span">
            {expanded && <Box component="span" sx={phoneOnlySx}>(</Box>}
            {formatCount(usefulCount)}
            {expanded && <Box component="span" sx={phoneOnlySx}>)</Box>}
          </Box>
        ) : (
          !expanded && <Box component="span" sx={phoneOnlySx}>0</Box>
        )}
      </ButtonBase>
      <ButtonBase onClick={() => onReport(review)} aria-label={t("report")} sx={{ ...actionSx, color: tokens.error3, ml: { xs: 1, md: 1.25 } }}>
        <FigmaIcon name="flag" />
        <Box component="span" sx={labelSx}>{t("report")}</Box>
      </ButtonBase>
      <ButtonBase
        onClick={() => {
          setClosedOffscreen(false);
          setExpanded(!expanded);
        }}
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
      ref={cardRef}
      sx={{
        borderTop: `1px solid ${tokens.grisMoyen1}`,
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        bgcolor: expanded ? tokens.bleu5 : tokens.blanc,
        transition: "background-color 200ms ease",
        display: "flex",
        flexDirection: "column",
        gap: expanded ? 2 : 0,
      }}
    >
      {/* Title information: avatar and name, then the date under the name. */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2 } }}>
            <ReviewerAvatar review={review} />
            <Typography component="h3" sx={{ minWidth: 0, fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
              {review.authorName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TypeChip status={review.status} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SourceIcon review={review} alt={review.platform ? t("sourceIcon.platform", { platform: tpCard(review.platform) }) : t(`sourceIcon.${review.source}`)} />
              <Typography component="span" sx={{ fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                {formatScore(review.rating)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Typography sx={{ flex: 1, pl: { xs: "52px", md: "56px" }, fontSize: 14, lineHeight: "normal", color: tokens.gris }}>{relative(review.daysAgo)}</Typography>
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

      {!closedOffscreen && (
        <Collapse in={expanded} unmountOnExit timeout={250}>
          <Box id={detailsId} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {desktop ? <DesktopReviewDetails review={review} /> : <ReviewDetails review={review} />}
            {review.reply && <ReviewReplyBlock review={review} />}
          </Box>
        </Collapse>
      )}

      {expanded && actions}
    </Box>
  );
}
