"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import Close from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import RestartAlt from "@mui/icons-material/RestartAlt";
import SortRounded from "@mui/icons-material/SortRounded";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import Verified from "@mui/icons-material/Verified";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { useUsefulVote } from "@/components/reviews/useUsefulVotes";
import { womenFirstNames } from "@/data/content";
import type { Criterion, Product, Review, ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { applyFilters, countActiveFilters, sameFilters, sortReviews, type Period, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { a } from "./theme";
import { ChoiceChipA, PersonAvatar, Sheet, SheetFooter, Star, StarTiles, cardSx, focusRing, outlineSx, primarySx, useRelativeDate } from "./ui";

const PAGE_SIZE = 3;
const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];
const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];
const quickProducts: Product[] = ["vente", "achat", "location", "gestion_locative"];

const sourceIcons: Record<ReviewSource, string> = {
  os_certified: "/figma/source-os-certified.svg",
  os_simple: "/figma/source-os-simple.svg",
  import_iso: "/figma/source-imported.svg",
  import_other: "/figma/source-imported.svg",
};

function hashOf(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

const avatarTints = [
  ["#eaf4ff", "#1c64b4"],
  ["#e8f6f3", "#1f7d6e"],
  ["#fff4d6", "#8a5a00"],
  ["#f1ecff", "#5b3fb0"],
  ["#ffece6", "#b2401c"],
] as const;
const womenPhotos = [21, 33, 44, 47, 52, 63, 68, 75, 79, 90];
const menPhotos = [12, 22, 32, 41, 46, 52, 57, 64, 75, 85];

/** Initial on a soft tint; Google reviewers show a demo profile photo, as Google does. */
function ReviewerAvatar({ review }: { review: Review }) {
  const firstName = review.authorName.split(" ")[0];
  const hash = hashOf(review.id);
  const sx = { width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden" } as const;
  if (review.platform === "google") {
    const woman = womenFirstNames.has(firstName);
    const photos = woman ? womenPhotos : menPhotos;
    return (
      <Box sx={{ ...sx, position: "relative" }}>
        <Image src={`/images/reviewers/${woman ? "w" : "m"}${photos[hash % photos.length]}.jpg`} alt="" fill sizes="44px" />
      </Box>
    );
  }
  const [bg, fg] = avatarTints[hash % avatarTints.length];
  return (
    <Box aria-hidden sx={{ ...sx, display: "grid", placeItems: "center", bgcolor: bg, color: fg, fontSize: 17, fontWeight: 800 }}>
      {firstName[0]}
    </Box>
  );
}

export function StatusBadge({ status }: { status: Review["status"] }) {
  const t = useTranslations("Reviews");
  const controle = status === "controle";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, height: 28, px: 1.25, borderRadius: 999, flexShrink: 0, bgcolor: controle ? a.tealTint : a.band, color: controle ? a.tealText : a.muted, border: `1px solid ${controle ? "transparent" : a.line}`, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
      {controle && <Verified sx={{ fontSize: 16 }} />}
      {t(controle ? "controle" : "nonControle")}
    </Box>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: `1px dashed ${a.line}`, "&:last-of-type": { borderBottom: 0 } }}>
      <Box component="dt" sx={{ fontSize: 13, color: a.muted, fontWeight: 600 }}>{label}</Box>
      <Box component="dd" sx={{ m: 0, fontSize: 13, fontWeight: 700, textAlign: "right", display: "flex", alignItems: "center", gap: 0.5 }}>{children}</Box>
    </Box>
  );
}

/** Détails by source: Opinion System surveys show levels and scores; imports only their facts. */
function ReviewDetails({ review }: { review: Review }) {
  const t = useTranslations("Reviews.detail");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const person = team.find((member) => member.id === review.collaboratorId);
  const facts = (
    <Box component="dl" sx={{ m: 0, minWidth: 0 }}>
      <Fact label={t("source")}>{review.platform ? tp(review.platform) : ts(review.source)}</Fact>
      {survey && <Fact label={t("questionnaire")}>{t(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple")}</Fact>}
      {person && <Fact label={t("collaborator")}>{person.name}</Fact>}
      <Fact label={t("activity")}>{ta(review.product)}</Fact>
      <Fact label={t("number")}>{review.reviewNumber}</Fact>
    </Box>
  );
  if (!survey) return <Box sx={{ p: 2, bgcolor: a.band, borderRadius: "12px", maxWidth: 420 }}>{facts}</Box>;
  return (
    <Box sx={{ p: 2, bgcolor: a.band, borderRadius: "12px", display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "160px minmax(0,1fr) minmax(0,1fr)" }, gap: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: 1 }}>
        {[
          { label: t("recommendationLevel"), value: survey.recommendation, bg: a.blueTint, fg: a.blueText },
          { label: t("satisfactionLevel"), value: survey.satisfaction, bg: "#fff4d6", fg: "#8a5a00" },
        ].map((level) => (
          <Box key={level.label} sx={{ flex: 1, p: 1.5, borderRadius: "10px", bgcolor: level.bg, color: level.fg }}>
            <Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{level.value} %</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>{level.label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h4" sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>{t("breakdown")}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {survey.scores.map((score) => (
            <Box key={score.label}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, fontSize: 13 }}>
                <Box component="span" sx={{ color: a.muted, fontWeight: 600 }}>{score.label}</Box>
                <Box component="span" sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{score.score}/10</Box>
              </Box>
              <Box sx={{ mt: 0.5, height: 6, borderRadius: 3, bgcolor: a.white, overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: `${score.score * 10}%`, borderRadius: 3, bgcolor: a.blue }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      {facts}
    </Box>
  );
}

function ReplyBlock({ review }: { review: Review }) {
  const t = useTranslations("Reviews.reply");
  const relative = useRelativeDate();
  const { team, agency } = useCertificate();
  const [open, setOpen] = useState(false);
  const reply = review.reply!;
  const person = team.find((member) => member.id === reply.collaboratorId);
  if (!person) return null;
  const [first, last] = person.name.split(" ");
  const long = reply.text.length > 160;
  return (
    <Box sx={{ ml: { md: 7 }, p: 1.75, borderRadius: "12px", bgcolor: a.band, borderLeft: `3px solid ${a.teal}`, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PersonAvatar person={person} size={28} />
        <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{t("from", { name: `${first} ${last?.[0] ?? ""}.` })}</Typography>
        <Typography sx={{ fontSize: 12, color: a.muted }}>· {agency.name} · {relative(review.daysAgo - reply.daysAfter)}</Typography>
      </Box>
      <Typography sx={{ fontSize: 14, lineHeight: 1.6, ...(long && !open ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>{reply.text}</Typography>
      {long && (
        <Link component="button" onClick={() => setOpen(!open)} sx={{ alignSelf: "flex-start", fontSize: 13, fontWeight: 700, color: a.blueText, ...focusRing }}>
          {open ? t("readLess") : t("readMore")}
        </Link>
      )}
    </Box>
  );
}

const quietActionSx = {
  minHeight: 40,
  px: 1.25,
  gap: 0.75,
  borderRadius: "10px",
  fontSize: 14,
  fontWeight: 700,
  color: a.muted,
  "&:hover": { bgcolor: a.band, color: a.navy },
  ...focusRing,
} as const;

/** Trustpilot-style card: who, the stars, the text first; tags and actions stay quiet. */
export function ReviewCardA({ review, onReport, flat = false }: { review: Review; onReport: (review: Review) => void; flat?: boolean }) {
  const t = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const ts = useTranslations("SourceNames");
  const tpl = useTranslations("Platforms");
  const relative = useRelativeDate();
  const [expanded, setExpanded] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const { voted, toggle } = useUsefulVote(review.id);
  const usefulCount = review.usefulCount + (voted ? 1 : 0);
  const long = (review.comment?.length ?? 0) > 220;
  const detailsId = `a-details-${review.id}`;
  const sourceLabel = review.platform ? tpl(review.platform) : ts(review.source);
  const sourceAlt = review.platform ? t("sourceIcon.platform", { platform: tpl(review.platform) }) : t(`sourceIcon.${review.source}`);
  const icon = review.platform === "google" ? "/figma/source-google.svg" : sourceIcons[review.source];

  return (
    <Box
      component="article"
      sx={{
        ...(flat ? { borderBottom: `1px solid ${a.line}`, py: 2.5 } : { ...cardSx, p: { xs: 2, sm: 3 } }),
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
        transition: "border-color 150ms ease, box-shadow 200ms ease",
        ...(!flat && { "&:hover": { borderColor: a.lineStrong, boxShadow: "0 6px 18px -12px rgba(4,27,68,0.25)" } }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ReviewerAvatar review={review} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{review.authorName}</Typography>
          <Typography sx={{ fontSize: 13, color: a.muted, fontWeight: 500 }}>
            {tp(review.product)} · {relative(review.daysAgo)}
          </Typography>
        </Box>
        <StatusBadge status={review.status} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
        <StarTiles value={review.rating} size={22} label={t("ratingAria", { score: formatScore(review.rating) })} />
        <Typography component="span" sx={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{formatScore(review.rating)}</Typography>
        <Box component="span" aria-hidden sx={{ color: a.lineStrong }}>|</Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, color: a.muted, fontWeight: 600 }}>
          <Image src={icon} alt={sourceAlt} width={18} height={18} unoptimized />
          {sourceLabel}
        </Box>
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: 1.65,
            color: review.comment ? a.navy : a.muted,
            fontStyle: review.comment ? "normal" : "italic",
            ...(long && !readMore && !expanded ? { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
          }}
        >
          {review.comment ?? t("noComment")}
        </Typography>
        {long && !expanded && (
          <Link component="button" onClick={() => setReadMore(!readMore)} sx={{ mt: 0.5, fontSize: 14, fontWeight: 700, color: a.blueText, ...focusRing }}>
            {readMore ? t("less") : t("readMore")}
          </Link>
        )}
      </Box>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.5 }}>
        {[tp(review.product), ...review.criteria.map((criterion) => tc(criterion))].map((label) => (
          <Box component="li" key={label} sx={{ fontSize: 13, fontWeight: 600, color: a.muted }}>
            #{label}
          </Box>
        ))}
      </Box>

      {review.reply && <ReplyBlock review={review} />}

      <Collapse in={expanded} unmountOnExit timeout={250}>
        <Box id={detailsId}>
          <ReviewDetails review={review} />
        </Box>
      </Collapse>

      <Box sx={{ borderTop: `1px solid ${a.line}`, pt: 1.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: -1.25 }}>
          <ButtonBase onClick={toggle} aria-pressed={voted} aria-label={t("usefulAria", { count: formatCount(usefulCount) })} sx={{ ...quietActionSx, color: voted ? a.blueText : a.muted }}>
            {voted ? <ThumbUp sx={{ fontSize: 18 }} /> : <ThumbUpOutlined sx={{ fontSize: 18 }} />}
            {expanded && t("useful")}
            {<Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatCount(usefulCount)}</Box>}
          </ButtonBase>
          <ButtonBase onClick={() => onReport(review)} aria-label={t("report")} sx={quietActionSx}>
            <FlagOutlined sx={{ fontSize: 18 }} />
            {expanded && t("report")}
          </ButtonBase>
          <ButtonBase onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={detailsId} sx={{ ...quietActionSx, ml: "auto", color: a.blueText }}>
            {t(expanded ? "less" : "details")}
            <ExpandMore sx={{ fontSize: 20, transform: expanded ? "rotate(180deg)" : "none", transition: `transform 200ms ${a.ease}` }} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}

function StarLabelA({ prefix }: { prefix: string }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {prefix}
      <Star size={15} />
    </Box>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Typography component="legend" sx={{ p: 0, mb: 1.25, fontSize: 15, fontWeight: 800 }}>{title}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

/** Edits a draft; "Appliquer les filtres (n)" commits it. */
function FiltersPanel() {
  const t = useTranslations("Filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { filters, setFilters, panel, setPanel, panelAnchor } = useCertificate();
  const open = panel === "filters";
  const [draft, setDraft] = useState<ReviewFilters>(filters);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const close = () => setPanel(null);
  const toggle = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: JSON.stringify(current[key]) === JSON.stringify(value) ? undefined : value }));
  const toggleIn = <T extends Product | Criterion>(key: "products" | "criteria", value: T) =>
    setDraft((current) => {
      const list = current[key] as T[];
      return { ...current, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });
  const count = countActiveFilters(draft);

  return (
    <>
      <Sheet
        open={open}
        onClose={close}
        anchorEl={panelAnchor}
        width={460}
        title={t("title")}
        closeLabel={t("close")}
        footer={
          <SheetFooter>
            <Button onClick={() => setDraft({ ...emptyFilters, collaboratorId: filters.collaboratorId })} startIcon={<RestartAlt />} sx={{ ...outlineSx, flex: "0 0 auto" }}>
              {t("reset")}
            </Button>
            <Button disabled={sameFilters(draft, filters)} onClick={() => { setFilters(draft); close(); }} sx={{ ...primarySx, flex: 1 }}>
              {count ? t("applyCount", { count }) : t("apply")}
            </Button>
          </SheetFooter>
        }
      >
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
          <Group title={t("type")}>
            <ChoiceChipA selected={draft.type === "controle"} onClick={() => toggle("type", "controle")}><Verified sx={{ fontSize: 16 }} />{t("typeControle")}</ChoiceChipA>
            <ChoiceChipA selected={draft.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{t("typeNonControle")}</ChoiceChipA>
          </Group>
          <Group title={t("source")}>
            <ChoiceChipA selected={draft.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChoiceChipA>
            <ChoiceChipA selected={draft.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChoiceChipA>
          </Group>
          <Group title={t("note")}>
            {notes.map((stars) => {
              const selected = draft.note?.stars === stars;
              return (
                <ChoiceChipA key={stars} selected={selected} onClick={() => setDraft((current) => ({ ...current, note: selected ? undefined : { stars, exact: false } }))}>
                  <StarLabelA prefix={stars === 5 ? "5" : `>${stars}`} />
                </ChoiceChipA>
              );
            })}
          </Group>
          <Group title={t("period")}>
            {periods.map((period) => (
              <ChoiceChipA key={period} selected={draft.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChoiceChipA>
            ))}
          </Group>
          <Group title={t("product")}>
            {products.map((product) => (
              <ChoiceChipA key={product} selected={draft.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChoiceChipA>
            ))}
          </Group>
          <Group title={t("criterion")}>
            {criteria.map((criterion) => (
              <ChoiceChipA key={criterion} selected={draft.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChoiceChipA>
            ))}
          </Group>
        </Box>
      </Sheet>

    </>
  );
}

/** "Trier par": a menu under the button on desktop, a sheet on phones. */
function SortControl() {
  const t = useTranslations("Reviews");
  const ts = useTranslations("ReviewSort");
  const tsheet = useTranslations("Sort");
  const { reviewSort, setReviewSort } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const choose = (value: ReviewSort) => {
    setReviewSort(value);
    setAnchor(null);
  };
  return (
    <>
      <Button onClick={(event) => setAnchor(event.currentTarget)} aria-label={t("sort")} aria-haspopup="true" startIcon={<SortRounded />} sx={{ ...outlineSx, minHeight: 44, px: { xs: 1.5, sm: 2 } }}>
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{ts(reviewSort)}</Box>
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{t("sortShort")}</Box>
      </Button>
      {desktop ? (
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 300, borderRadius: "14px", border: `1px solid ${a.line}`, boxShadow: a.shadowFloat } } }}
        >
          {sorts.map((value) => (
            <MenuItem key={value} selected={value === reviewSort} onClick={() => choose(value)} sx={{ display: "block", py: 1.25, "&.Mui-selected": { bgcolor: a.blueTint } }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{ts(value)}</Typography>
              <Typography sx={{ fontSize: 13, color: a.muted }}>{ts(`${value}Hint`)}</Typography>
            </MenuItem>
          ))}
        </Menu>
      ) : (
        <Sheet open={Boolean(anchor)} onClose={() => setAnchor(null)} title={tsheet("title")} closeLabel={tsheet("close")}>
          <RadioGroup value={reviewSort} onChange={(event) => choose(event.target.value as ReviewSort)} sx={{ px: 1.5, py: 1 }}>
            {sorts.map((value) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio sx={{ "&.Mui-checked": { color: a.navy } }} />}
                label={
                  <Box sx={{ py: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{ts(value)}</Typography>
                    <Typography sx={{ fontSize: 13, color: a.muted }}>{ts(`${value}Hint`)}</Typography>
                  </Box>
                }
                sx={{ m: 0, borderBottom: `1px solid ${a.line}`, "&:last-of-type": { borderBottom: 0 } }}
              />
            ))}
          </RadioGroup>
        </Sheet>
      )}
    </>
  );
}

/** One row of chips: quick filters that toggle at once, then the other active filters (removable). */
function FilterChipRow() {
  const t = useTranslations("Filters");
  const tr = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tv = useTranslations("VarianteA");
  const { filters, setFilters, team } = useCertificate();
  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const toggleProduct = (product: Product) =>
    update({ products: filters.products.includes(product) ? filters.products.filter((item) => item !== product) : [...filters.products, product] });

  const removable: { key: string; label: React.ReactNode; text: string; remove: () => void }[] = [];
  if (filters.type === "non_controle") removable.push({ key: "type", label: t("chip.nonControle"), text: t("chip.nonControle"), remove: () => update({ type: undefined }) });
  if (filters.source) {
    const text = t(filters.source === "opinion_system" ? "sourceOs" : "sourceImported");
    removable.push({ key: "source", label: text, text, remove: () => update({ source: undefined }) });
  }
  if (filters.note) {
    const { stars, exact } = filters.note;
    const prefix = exact || stars === 5 ? `${stars}` : `>${stars}`;
    removable.push({ key: "note", label: <StarLabelA prefix={prefix} />, text: `${prefix} ★`, remove: () => update({ note: undefined }) });
  }
  if (filters.period && filters.period !== "year") {
    const text = t(`periods.${filters.period}`);
    removable.push({ key: "period", label: text, text, remove: () => update({ period: undefined }) });
  }
  for (const product of filters.products.filter((item) => !quickProducts.includes(item))) {
    removable.push({ key: `p-${product}`, label: tp(product), text: tp(product), remove: () => toggleProduct(product) });
  }
  for (const criterion of filters.criteria) {
    removable.push({ key: `c-${criterion}`, label: tc(criterion), text: tc(criterion), remove: () => update({ criteria: filters.criteria.filter((item) => item !== criterion) }) });
  }
  const person = team.find((member) => member.id === filters.collaboratorId);
  if (person) removable.push({ key: "collaborator", label: person.name, text: person.name, remove: () => update({ collaboratorId: undefined }) });
  const any = countActiveFilters(filters) > 0;

  return (
    <Box aria-label={tv("reviews.quickFilters")} role="group" sx={{ display: "flex", gap: 1, overflowX: { xs: "auto", md: "visible" }, flexWrap: { xs: "nowrap", md: "wrap" }, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, pb: { xs: 0.5, md: 0 }, scrollbarWidth: "none", "& > *": { flexShrink: 0 } }}>
      {removable.map((chip) => (
        <ButtonBase
          key={chip.key}
          onClick={chip.remove}
          aria-label={tr("removeFilter", { label: chip.text })}
          sx={{ minHeight: 40, pl: 1.75, pr: 1.25, gap: 0.75, borderRadius: 999, bgcolor: a.navy, color: a.white, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", "&:hover": { bgcolor: a.navySoft }, ...focusRing }}
        >
          {chip.key === "collaborator" && person && <PersonAvatar person={person} size={24} />}
          {chip.label}
          <Close sx={{ fontSize: 16 }} />
        </ButtonBase>
      ))}
      <ChoiceChipA selected={filters.type === "controle"} onClick={() => update({ type: filters.type === "controle" ? undefined : "controle" })}>
        <Verified sx={{ fontSize: 16, color: filters.type === "controle" ? a.white : a.tealText }} />
        {t("chip.controle")}
      </ChoiceChipA>
      <ChoiceChipA selected={filters.period === "year"} onClick={() => update({ period: filters.period === "year" ? undefined : "year" })}>{t("periods.year")}</ChoiceChipA>
      {quickProducts.map((product) => (
        <ChoiceChipA key={product} selected={filters.products.includes(product)} onClick={() => toggleProduct(product)}>{tp(product)}</ChoiceChipA>
      ))}
      {any && (
        <ButtonBase onClick={() => setFilters(emptyFilters)} sx={{ minHeight: 40, px: 1.5, borderRadius: 999, fontSize: 14, fontWeight: 700, color: a.blueText, textDecoration: "underline", textUnderlineOffset: "3px", ...focusRing }}>
          {tr("clearFilters")}
        </ButtonBase>
      )}
    </Box>
  );
}

export function ReportPanel({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const t = useTranslations("Report");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [forId, setForId] = useState<string | null>(null);
  if (review && review.id !== forId) {
    setForId(review.id);
    setReason("");
    setComment("");
    setSent(false);
  }
  const reasons = ["inappropriate", "fake", "personal", "offTopic", "other"] as const;
  return (
    <Sheet
      open={Boolean(review)}
      onClose={onClose}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={
        <SheetFooter>
          {sent ? (
            <Button onClick={onClose} sx={{ ...outlineSx, flex: 1 }}>{t("doneButton")}</Button>
          ) : (
            <Button disabled={!reason} onClick={() => setSent(true)} sx={{ ...primarySx, flex: 1 }}>{t("submit")}</Button>
          )}
        </SheetFooter>
      }
    >
      {sent ? (
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
          <CheckCircleRounded sx={{ fontSize: 64, color: a.teal }} />
          <Typography sx={{ fontSize: 15, lineHeight: 1.6 }}>{t("doneText")}</Typography>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: a.muted }}>{t("intro")}</Typography>
          <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)} aria-label={t("title")} sx={{ gap: 1 }}>
            {reasons.map((key) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio sx={{ "&.Mui-checked": { color: a.navy } }} />}
                label={t(`reasons.${key}`)}
                sx={{ m: 0, pr: 1.5, minHeight: 48, borderRadius: "12px", border: `1px solid ${reason === key ? a.navy : a.line}`, "& .MuiFormControlLabel-label": { fontSize: 15, fontWeight: 600 } }}
              />
            ))}
          </RadioGroup>
          <TextField label={t("commentLabel")} value={comment} onChange={(event) => setComment(event.target.value)} multiline minRows={3} fullWidth />
        </Box>
      )}
    </Sheet>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Déposer un avis": the visitor asks for an Opinion System survey by e-mail. Nothing is sent. */
export function ReviewRequestPanel() {
  const t = useTranslations("ReviewRequest");
  const tp = useTranslations("Products");
  const { agency, team, panel, setPanel } = useCertificate();
  const open = panel === "reviewRequest";
  const blank = { firstName: "", lastName: "", email: "", product: "" as Product | "", collaboratorId: "", consent: false };
  const [form, setForm] = useState(blank);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && sent) {
      setSent(false);
      setTouched(false);
      setForm(blank);
    }
  }
  const errors = { firstName: !form.firstName.trim(), lastName: !form.lastName.trim(), email: !emailPattern.test(form.email.trim()) };
  const valid = !errors.firstName && !errors.lastName && !errors.email && form.product && form.consent;
  const close = () => setPanel(null);
  const field = (key: "firstName" | "lastName" | "email") => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value }),
    error: touched && errors[key],
    helperText: touched && errors[key] ? t(key === "email" && form.email ? "invalidEmail" : "required") : undefined,
    fullWidth: true,
  });

  return (
    <Sheet
      open={open}
      onClose={close}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={
        <SheetFooter>
          {sent ? (
            <Button onClick={close} sx={{ ...outlineSx, flex: 1 }}>{t("doneButton")}</Button>
          ) : (
            <Button onClick={() => { setTouched(true); if (valid) setSent(true); }} startIcon={<RateReviewOutlined />} sx={{ ...primarySx, flex: 1 }}>{t("submit")}</Button>
          )}
        </SheetFooter>
      }
    >
      {sent ? (
        <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
          <CheckCircleRounded sx={{ fontSize: 64, color: a.teal }} />
          <Typography sx={{ fontSize: 15, lineHeight: 1.6 }}>{t("doneText", { firstName: form.firstName.trim(), email: form.email.trim() })}</Typography>
        </Box>
      ) : (
        <Box component="form" noValidate onSubmit={(event) => event.preventDefault()} sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2.25 }}>
          <Box sx={{ display: "flex", gap: 1.5, p: 1.75, borderRadius: "12px", bgcolor: a.tealTint }}>
            <Verified sx={{ color: a.tealText }} />
            <Typography sx={{ fontSize: 14, lineHeight: 1.55 }}>{t("intro")}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField label={t("firstName")} autoComplete="given-name" {...field("firstName")} />
            <TextField label={t("lastName")} autoComplete="family-name" {...field("lastName")} />
          </Box>
          <TextField label={t("email")} type="email" autoComplete="email" inputMode="email" {...field("email")} />
          <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" sx={{ p: 0, mb: 1.25, fontSize: 15, fontWeight: 800, color: touched && !form.product ? "error.main" : a.navy }}>{t("product", { agency: agency.name })}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {products.map((product) => (
                <ChoiceChipA key={product} role="radio" selected={form.product === product} onClick={() => setForm({ ...form, product })}>{tp(product)}</ChoiceChipA>
              ))}
            </Box>
          </Box>
          <TextField select label={t("collaborator")} value={form.collaboratorId} onChange={(event) => setForm({ ...form, collaboratorId: event.target.value })} fullWidth>
            <MenuItem value="">—</MenuItem>
            {team.map((person) => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} sx={{ "&.Mui-checked": { color: a.navy } }} />}
            label={t("consent")}
            sx={{ alignItems: "flex-start", m: 0, "& .MuiFormControlLabel-label": { fontSize: 14, pt: 1.1, color: touched && !form.consent ? "error.main" : a.navy } }}
          />
        </Box>
      )}
    </Sheet>
  );
}

/** Avis: toolbar pinned under the section bar, chips, the cards, "Afficher plus" and "Déposer un avis". */
export function ReviewsSection() {
  const t = useTranslations("Reviews");
  const tv = useTranslations("VarianteA");
  const { reviews, filters, setFilters, reviewSort, openPanel, setPanel } = useCertificate();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reporting, setReporting] = useState<Review | null>(null);
  const [listKey, setListKey] = useState({ filters, reviewSort });
  if (listKey.filters !== filters || listKey.reviewSort !== reviewSort) {
    setListKey({ filters, reviewSort });
    setVisible(PAGE_SIZE);
  }
  const list = useMemo(() => sortReviews(applyFilters(reviews, filters), reviewSort), [reviews, filters, reviewSort]);
  const active = countActiveFilters(filters);

  return (
    <Box component="section" aria-labelledby="a-reviews-title" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: a.tealText, mb: 0.5 }}>{t("eyebrow")}</Typography>
          <Typography id="a-reviews-title" component="h2" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{t("heading")}</Typography>
        </Box>
        <Button onClick={() => setPanel("reviewRequest")} startIcon={<RateReviewOutlined />} sx={{ ...outlineSx, display: { xs: "none", sm: "inline-flex" } }}>
          {t("leaveReview")}
        </Button>
      </Box>

      <Box
        sx={{
          position: "sticky",
          top: a.barHeight,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          mx: { xs: -2, sm: -1 },
          px: { xs: 2, sm: 1 },
          py: 1,
          bgcolor: "rgba(255,255,255,0.94)",
          backdropFilter: "saturate(180%) blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          {t("count", { count: formatCount(list.length) })}
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1, fontSize: 14, fontWeight: 600, color: a.muted }}>
            {tv("reviews.ofTotal", { total: formatCount(reviews.length) })}
          </Box>
        </Typography>
        <Badge badgeContent={active} invisible={!active} overlap="rectangular" sx={{ "& .MuiBadge-badge": { bgcolor: a.yellow, color: a.navy, fontWeight: 800, border: `2px solid ${a.white}`, minWidth: 22, height: 22, borderRadius: 11 } }}>
          <Button onClick={(event) => openPanel("filters", event.currentTarget)} aria-label={active ? t("filtersActive", { count: active }) : t("filters")} startIcon={<TuneRounded />} sx={{ ...outlineSx, minHeight: 44, px: { xs: 1.5, sm: 2 } }}>
            {t("filters")}
          </Button>
        </Badge>
        <SortControl />
      </Box>

      <FilterChipRow />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {list.slice(0, visible).map((review) => (
          <ReviewCardA key={review.id} review={review} onReport={setReporting} />
        ))}
        {!list.length && (
          <Box sx={{ ...cardSx, borderStyle: "dashed", p: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{t("empty")}</Typography>
            <Button onClick={() => setFilters(emptyFilters)} sx={outlineSx}>{t("clearFilters")}</Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", gap: 1.5, pt: 1 }}>
        {visible < list.length && (
          <Button onClick={() => setVisible((count) => count + PAGE_SIZE)} endIcon={<ExpandMore />} sx={{ ...outlineSx, minWidth: { sm: 240 } }}>
            {t("showMore")}
          </Button>
        )}
        <Button onClick={() => setPanel("reviewRequest")} startIcon={<RateReviewOutlined />} sx={{ ...primarySx, minWidth: { sm: 240 } }}>
          {t("leaveReview")}
        </Button>
      </Box>

      <FiltersPanel />
      <ReportPanel review={reporting} onClose={() => setReporting(null)} />
    </Box>
  );
}
