"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Check from "@mui/icons-material/Check";
import Search from "@mui/icons-material/Search";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { formatCount } from "@/lib/format";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { a } from "./theme";
import { ChoiceChipA, PersonAvatar, RatingPill, Sheet, TeamAvatarA, focusRing } from "./ui";

type StaffSort = "alpha" | "best" | "worst";

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();

const rowSx = (selected: boolean) =>
  ({
    width: "100%",
    justifyContent: "flex-start",
    gap: 1.5,
    px: 2,
    py: 1.25,
    minHeight: 60,
    textAlign: "left",
    borderRadius: "12px",
    bgcolor: selected ? a.blueTint : "transparent",
    "&:hover": { bgcolor: selected ? a.blueTint : a.band },
    ...focusRing,
  }) as const;

/** "Données affichées pour": search, sort, then the staff above the publication threshold. */
export function CollaboratorPickerA({
  open,
  onClose,
  selectedId,
  onSelect,
  view,
  anchorEl,
}: {
  open: boolean;
  onClose: () => void;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  view: ScoreView;
  anchorEl?: HTMLElement | null;
}) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const t = useTranslations("Collaborators");
  const ts = useTranslations("Sort");
  const tr = useTranslations("Reputation");
  const { team, reviews, agency } = useCertificate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StaffSort>("alpha");

  const people = useMemo(() => {
    const scored = team
      .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, view, person.id)) }))
      .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold));
    const byName = (x: (typeof scored)[number], y: (typeof scored)[number]) => x.person.name.localeCompare(y.person.name, "fr");
    if (sort === "alpha") scored.sort(byName);
    else scored.sort((x, y) => (sort === "best" ? 1 : -1) * ((y.summary.average ?? 0) - (x.summary.average ?? 0)) || byName(x, y));
    const needle = normalize(query.trim());
    return needle ? scored.filter(({ person }) => normalize(person.name).includes(needle)) : scored;
  }, [team, reviews, view, agency.publicThreshold, sort, query]);

  const choose = (id: string | undefined) => {
    onSelect(id);
    onClose();
  };

  const controls = (
    <Box sx={{ px: 2, pt: 2, pb: 1.5, display: "flex", flexDirection: "column", gap: 1.5, borderBottom: `1px solid ${a.line}`, flexShrink: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, minHeight: 48, borderRadius: "12px", border: `1px solid ${a.lineStrong}`, "&:focus-within": { borderColor: a.blue, boxShadow: `0 0 0 3px ${a.blueTint}` } }}>
        <Search sx={{ color: a.muted }} />
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          inputProps={{ "aria-label": t("searchLabel") }}
          sx={{ flex: 1, fontSize: 16, color: a.navy, "& input::placeholder": { color: a.muted, opacity: 1 } }}
        />
      </Box>
      <Box role="radiogroup" aria-label={t("sort")} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {(["alpha", "best", "worst"] as const).map((value) => (
          <ChoiceChipA key={value} role="radio" selected={sort === value} onClick={() => setSort(value)}>
            {ts(value)}
          </ChoiceChipA>
        ))}
      </Box>
    </Box>
  );

  const list = (
    <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, p: 1 }}>
      {!query && (
        <li>
          <ButtonBase role="option" aria-selected={!selectedId} onClick={() => choose(undefined)} sx={rowSx(!selectedId)}>
            <TeamAvatarA />
            <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 700, color: a.navy }}>{t("all")}</Typography>
            {!selectedId && <Check sx={{ color: a.blueText }} />}
          </ButtonBase>
        </li>
      )}
      {people.map(({ person, summary }) => {
        const selected = person.id === selectedId;
        return (
          <li key={person.id}>
            <ButtonBase role="option" aria-selected={selected} onClick={() => choose(person.id)} sx={rowSx(selected)}>
              <PersonAvatar person={person} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: a.navy, lineHeight: 1.3 }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 13, color: a.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.role}</Typography>
              </Box>
              {summary.average !== null && <RatingPill value={summary.average} count={tr("reviewCount", { count: formatCount(summary.count) })} />}
              {selected && <Check sx={{ color: a.blueText }} />}
            </ButtonBase>
          </li>
        );
      })}
      {query && !people.length && (
        <Typography component="li" sx={{ p: 2, color: a.muted, fontSize: 14 }}>
          {t("noResult", { query })}
        </Typography>
      )}
    </Box>
  );

  if (desktop && anchorEl) {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            "aria-label": t("title"),
            sx: { mt: 1, width: Math.max(380, anchorEl.offsetWidth), maxHeight: 480, display: "flex", flexDirection: "column", borderRadius: "16px", overflow: "hidden", border: `1px solid ${a.line}`, boxShadow: a.shadowFloat },
          },
        }}
      >
        {controls}
        <Box sx={{ overflowY: "auto", overscrollBehavior: "contain" }}>{list}</Box>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} header={controls}>
      {list}
    </Sheet>
  );
}
