"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";
import Search from "@mui/icons-material/Search";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { StaffAvatar, TeamAvatar } from "@/components/ui/StaffAvatar";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { ChipC, Sheet } from "./ui";
import { focusRing, pc } from "./theme";

type StaffSort = "alpha" | "best" | "worst";

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase();

/** Small rating pill: "4,6 ★". */
export function ScorePill({ value }: { value: number }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, height: 26, px: 1, borderRadius: 999, bgcolor: pc.surfaceDim, border: `1px solid ${pc.outline}`, fontSize: 13, fontWeight: 700, color: pc.ink, flexShrink: 0 }}>
      {formatScore(value)}
      <StarRounded sx={{ fontSize: 16, color: pc.star }} />
    </Box>
  );
}

/** Staff above the publication threshold, with search and sort. Picking one sets the score and the Collaborateur filter. */
export function CollaboratorPickerC({
  open,
  onClose,
  selectedId,
  onSelect,
  view,
}: {
  open: boolean;
  onClose: () => void;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  view: ScoreView;
}) {
  const t = useTranslations("Collaborators");
  const tv = useTranslations("VarianteC");
  const { team, reviews, agency } = useCertificate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StaffSort>("alpha");

  const people = useMemo(() => {
    const scored = team
      .map((person) => ({ person, summary: summarize(reviewsForScore(reviews, view, person.id)) }))
      .filter(({ summary }) => isPublic(summary.count, agency.publicThreshold));
    const byName = (a: (typeof scored)[number], b: (typeof scored)[number]) => a.person.name.localeCompare(b.person.name, "fr");
    if (sort === "alpha") scored.sort(byName);
    else scored.sort((a, b) => (sort === "best" ? 1 : -1) * ((b.summary.average ?? 0) - (a.summary.average ?? 0)) || byName(a, b));
    const needle = normalize(query.trim());
    return needle ? scored.filter(({ person }) => normalize(person.name).includes(needle)) : scored;
  }, [team, reviews, view, agency.publicThreshold, sort, query]);

  const choose = (id: string | undefined) => {
    onSelect(id);
    onClose();
  };

  const rowSx = (selected: boolean) => ({
    width: "100%",
    justifyContent: "flex-start",
    gap: 1.5,
    px: 3,
    py: 1.25,
    minHeight: 60,
    textAlign: "left" as const,
    bgcolor: selected ? pc.indigoSoft : "transparent",
    "&:hover": { bgcolor: selected ? pc.indigoSoft : pc.surfaceDim },
    "&.Mui-focusVisible": { outline: `2px solid ${pc.indigo}`, outlineOffset: -2 },
  });

  const header = (
    <Box sx={{ px: 2, pb: 1.5, display: "flex", flexDirection: "column", gap: 1.5, borderBottom: `1px solid ${pc.outline}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, height: 48, borderRadius: 999, bgcolor: pc.surfaceDim, border: `1px solid ${pc.outline}`, "&:focus-within": { borderColor: pc.indigo, bgcolor: "#fff" } }}>
        <Search sx={{ color: pc.muted }} />
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          inputProps={{ "aria-label": t("searchLabel") }}
          sx={{ flex: 1, fontSize: 16, color: pc.ink, "& input::placeholder": { color: pc.muted, opacity: 1 } }}
        />
      </Box>
      <Box role="group" aria-label={t("sort")} sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: -2, px: 2 }}>
        {(["alpha", "best", "worst"] as const).map((key) => (
          <ChipC key={key} selected={sort === key} onClick={() => setSort(key)}>
            {tv(`staffSort.${key}`)}
          </ChipC>
        ))}
      </Box>
    </Box>
  );

  return (
    <Sheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} header={header}>
      <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, py: 1, px: 0 }}>
        {!query && (
          <li>
            <ButtonBase role="option" aria-selected={!selectedId} onClick={() => choose(undefined)} sx={rowSx(!selectedId)}>
              <TeamAvatar size={40} />
              <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{t("all")}</Typography>
              {!selectedId && <Check sx={{ color: pc.indigo }} />}
            </ButtonBase>
          </li>
        )}
        {people.map(({ person, summary }) => {
          const selected = person.id === selectedId;
          return (
            <li key={person.id}>
              <ButtonBase role="option" aria-selected={selected} onClick={() => choose(person.id)} sx={rowSx(selected)}>
                <StaffAvatar person={person} size={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{person.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: pc.muted, lineHeight: 1.3 }}>
                    {person.role} · {tv("reviewsShort", { count: formatCount(summary.count) })}
                  </Typography>
                </Box>
                {summary.average !== null && <ScorePill value={summary.average} />}
                {selected && <Check sx={{ color: pc.indigo }} />}
              </ButtonBase>
            </li>
          );
        })}
        {query && !people.length && (
          <Typography component="li" sx={{ px: 3, py: 3, color: pc.muted, fontSize: 15 }}>
            {t("noResult", { query })}
          </Typography>
        )}
      </Box>
    </Sheet>
  );
}

/** Outlined field "Données affichées pour" with the avatar of the selection. */
export function CollaboratorField({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("Reputation");
  const { team, scoreCollaboratorId } = useCertificate();
  const person = team.find((member) => member.id === scoreCollaboratorId);
  return (
    <ButtonBase
      onClick={onOpen}
      aria-haspopup="listbox"
      aria-label={`${t("scoreFor")} : ${person?.name ?? t("wholeTeam")}. ${t("changeCollaborator")}`}
      sx={{
        position: "relative",
        width: "100%",
        justifyContent: "flex-start",
        gap: 1.5,
        pl: 1.25,
        pr: 1.5,
        pt: 1.25,
        pb: 1,
        minHeight: 60,
        borderRadius: "16px",
        border: `1px solid ${pc.outlineStrong}`,
        bgcolor: "#fff",
        textAlign: "left",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": { borderColor: pc.indigo, bgcolor: pc.indigoSoft },
        "&.Mui-focusVisible": focusRing,
      }}
    >
      <Typography component="span" sx={{ position: "absolute", top: -9, left: 12, px: 0.5, bgcolor: "#fff", fontSize: 12, fontWeight: 600, color: pc.muted, lineHeight: "16px", borderRadius: "4px" }}>
        {t("scoreFor")}
      </Typography>
      {person ? <StaffAvatar person={person} size={36} /> : <TeamAvatar size={36} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person?.name ?? t("wholeTeam")}</Typography>
        {person && <Typography sx={{ fontSize: 13, color: pc.muted, lineHeight: 1.3 }}>{person.role}</Typography>}
      </Box>
      <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: 24, height: 24, fill: pc.muted, flexShrink: 0 }}>
        <path d="M7 10l5 5 5-5z" />
      </Box>
    </ButtonBase>
  );
}
