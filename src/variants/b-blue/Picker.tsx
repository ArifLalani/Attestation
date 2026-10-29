"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import CheckRounded from "@mui/icons-material/CheckRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { b } from "./theme";
import { ChoicePill, focusSx, PersonAvatar, Sheet, TeamAvatarB } from "./ui";

type StaffSort = "alpha" | "best" | "worst";

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const rowSx = (selected: boolean) => ({
  width: "100%",
  justifyContent: "flex-start",
  gap: 1.5,
  px: 2.5,
  py: 1.25,
  minHeight: 64,
  textAlign: "left" as const,
  bgcolor: selected ? b.sand : "transparent",
  "&:hover": { bgcolor: selected ? b.sand : b.ivory },
  ...focusSx,
});

/** Staff above the publication threshold, with search and three sorts. Used by Réputation and the filters. */
export function PickerB({ open, onClose, selectedId, onSelect, view }: { open: boolean; onClose: () => void; selectedId?: string; onSelect: (id: string | undefined) => void; view: ScoreView }) {
  const t = useTranslations("Collaborators");
  const ts = useTranslations("Sort");
  const tb = useTranslations("VarianteB.picker");
  const { team, reviews, agency } = useCertificate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StaffSort>("alpha");

  const people = useMemo(() => {
    const scored = team
      .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, view, person.id)) }))
      .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold));
    const byName = (a: (typeof scored)[number], c: (typeof scored)[number]) => a.person.name.localeCompare(c.person.name, "fr");
    if (sort === "alpha") scored.sort(byName);
    else scored.sort((a, c) => (sort === "best" ? 1 : -1) * ((c.summary.average ?? 0) - (a.summary.average ?? 0)) || byName(a, c));
    const needle = normalize(query.trim());
    return needle ? scored.filter(({ person }) => normalize(person.name).includes(needle)) : scored;
  }, [team, reviews, view, agency.publicThreshold, sort, query]);

  const choose = (id: string | undefined) => {
    onSelect(id);
    onClose();
  };

  const header = (
    <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: "flex", flexDirection: "column", gap: 1.5, borderBottom: `1px solid ${b.line}`, flexShrink: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, minHeight: 52, borderRadius: 999, boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, "&:focus-within": { boxShadow: `inset 0 0 0 2px ${b.ink}` } }}>
        <SearchRounded sx={{ color: b.muted }} />
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          inputProps={{ "aria-label": t("searchLabel") }}
          sx={{ flex: 1, fontSize: 16, fontFamily: b.sans, "& input::placeholder": { color: b.muted, opacity: 1 } }}
        />
      </Box>
      <Box role="radiogroup" aria-label={t("sort")} sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: -2.5, px: 2.5 }}>
        {(["alpha", "best", "worst"] as const).map((value) => (
          <ChoicePill key={value} role="radio" selected={sort === value} onClick={() => setSort(value)}>
            {ts(value)}
          </ChoicePill>
        ))}
      </Box>
    </Box>
  );

  return (
    <Sheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} header={header} width={520}>
      <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, p: 0, py: 1 }}>
        {!query && (
          <li>
            <ButtonBase role="option" aria-selected={!selectedId} onClick={() => choose(undefined)} sx={rowSx(!selectedId)}>
              <TeamAvatarB size={44} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t("all")}</Typography>
                <Typography sx={{ fontSize: 14, color: b.muted }}>{tb("allHint", { count: team.length })}</Typography>
              </Box>
              {!selectedId && <CheckRounded />}
            </ButtonBase>
          </li>
        )}
        {people.map(({ person, summary }) => {
          const selected = person.id === selectedId;
          return (
            <li key={person.id}>
              <ButtonBase role="option" aria-selected={selected} onClick={() => choose(person.id)} sx={rowSx(selected)}>
                <PersonAvatar person={person} size={44} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{person.name}</Typography>
                  <Typography sx={{ fontSize: 14, color: b.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.role}</Typography>
                </Box>
                {summary.average !== null && (
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25, fontWeight: 700, fontSize: 15 }}>
                      <StarRounded sx={{ fontSize: 16 }} />
                      {formatScore(summary.average)}
                    </Box>
                    <Typography sx={{ fontSize: 12, color: b.muted }}>{tb("count", { count: formatCount(summary.count) })}</Typography>
                  </Box>
                )}
                {selected && <CheckRounded />}
              </ButtonBase>
            </li>
          );
        })}
        {query && !people.length && (
          <Typography component="li" sx={{ px: 2.5, py: 3, color: b.muted, fontSize: 15 }}>
            {t("noResult", { query })}
          </Typography>
        )}
      </Box>
    </Sheet>
  );
}
