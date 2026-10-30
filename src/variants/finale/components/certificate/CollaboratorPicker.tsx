"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { RatingChip } from "@/variants/finale/components/ui/RatingChip";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { StaffAvatar, TeamAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { formatCount } from "@/lib/format";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";

type StaffSort = "alpha" | "best" | "worst";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const rowSx = (selected: boolean) => ({
  width: "100%",
  justifyContent: "flex-start",
  gap: 1.5,
  px: 2,
  py: 1.25,
  minHeight: 60,
  textAlign: "left" as const,
  bgcolor: selected ? tokens.bleu10 : "transparent",
  "&:hover": { bgcolor: selected ? tokens.bleu10 : tokens.bleu5 },
  "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: -2 },
});

/** Sort choice as a chip (layout from option C): navy when chosen, with a check. */
function SortChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        gap: 0.5,
        height: 36,
        px: 1.5,
        borderRadius: "8px",
        bgcolor: selected ? tokens.bleuFonce : tokens.grisClair2,
        border: `1px solid ${selected ? tokens.bleuFonce : tokens.grisMoyen1}`,
        color: selected ? tokens.blanc : tokens.bleuFonce,
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: selected ? 600 : 500,
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, color 150ms ease",
        "&:hover": { bgcolor: selected ? tokens.bleuFonce : tokens.grisMoyen1 },
        "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: 2 },
      }}
    >
      {selected && <Check sx={{ fontSize: 18 }} />}
      {children}
    </ButtonBase>
  );
}

/**
 * Staff above the publication threshold, with a search field and the sort as chips (layout from option C).
 * A window on desktop, a bottom sheet on phones.
 */
export function CollaboratorPicker({
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
  const tp = useTranslations("VarianteFinale.picker");
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

  const header = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          height: 48,
          borderRadius: "999px",
          bgcolor: tokens.grisClair1,
          border: `1px solid ${tokens.grisMoyen1}`,
          transition: "border-color 150ms ease, background-color 150ms ease",
          "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc },
        }}
      >
        <FigmaIcon name="search" />
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          inputProps={{ "aria-label": t("searchLabel") }}
          sx={{
            flex: 1,
            fontSize: 16,
            color: tokens.bleuFonce,
            "& input::placeholder": { color: tokens.gris, opacity: 1 },
          }}
        />
      </Box>
      <Box role="radiogroup" aria-label={t("sort")} sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: -2, px: 2 }}>
        {(["alpha", "best", "worst"] as const).map((key) => (
          <SortChip key={key} selected={sort === key} onClick={() => setSort(key)}>
            {tp(`sort.${key}`)}
          </SortChip>
        ))}
      </Box>
    </Box>
  );

  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} header={header} dialogWidth={480}>
      <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, py: 1, px: 0 }}>
        {!query && (
          <li>
            <ButtonBase role="option" aria-selected={!selectedId} onClick={() => choose(undefined)} sx={rowSx(!selectedId)}>
              <TeamAvatar size={40} color={tokens.bleuFonce} />
              <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: tokens.bleuFonce }}>{t("all")}</Typography>
              {!selectedId && <Check sx={{ color: tokens.bleuFonce }} />}
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
                  <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>{person.name}</Typography>
                  <Typography sx={{ fontSize: 13, lineHeight: 1.3, color: tokens.gris }}>
                    {tp("detail", { role: person.role, count: formatCount(summary.count) })}
                  </Typography>
                </Box>
                {summary.average !== null && <RatingChip value={summary.average} />}
                {selected && <Check sx={{ color: tokens.bleuFonce }} />}
              </ButtonBase>
            </li>
          );
        })}
        {query && !people.length && (
          <Typography component="li" sx={{ px: 2, py: 3, color: tokens.gris, fontSize: 14 }}>
            {t("noResult", { query })}
          </Typography>
        )}
      </Box>
    </ResponsiveSheet>
  );
}
