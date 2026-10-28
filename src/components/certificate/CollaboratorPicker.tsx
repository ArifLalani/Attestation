"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { RatingChip } from "@/components/ui/RatingChip";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { StaffAvatar, TeamAvatar } from "@/components/ui/StaffAvatar";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "./CertificateContext";
import { SortSheet } from "./SortSheet";

type StaffSort = "alpha" | "best" | "worst";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const rowSx = (selected: boolean) => ({
  width: "100%",
  justifyContent: "flex-start",
  gap: 1,
  px: 2,
  pt: 1.5,
  pb: "13px",
  textAlign: "left" as const,
  borderBottom: `1px solid ${tokens.grisMoyen1}`,
  bgcolor: selected ? tokens.bleu10 : tokens.blanc,
  "&:hover": { bgcolor: selected ? tokens.bleu10 : tokens.bleu5 },
});

/**
 * Figma "Collaborator select" (726:15618). Lists staff above the publication threshold.
 * Phones: bottom sheet. Desktop with an anchor: a dropdown right under the selector.
 */
export function CollaboratorPicker({
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
  const dropdown = desktop && Boolean(anchorEl);
  // A field low in the window (e.g. inside the Filtres dropdown) opens the list upwards instead of covering the field.
  const rect = dropdown && open && anchorEl ? anchorEl.getBoundingClientRect() : null;
  const spaceBelow = rect ? window.innerHeight - rect.bottom - 24 : 460;
  const spaceAbove = rect ? rect.top - 24 : 0;
  const upward = spaceBelow < 300 && spaceAbove > spaceBelow;
  const placement = { upward, maxHeight: Math.min(460, upward ? spaceAbove : Math.max(spaceBelow, 300)) };
  const t = useTranslations("Collaborators");
  const ts = useTranslations("Sort");
  const { team, reviews, agency } = useCertificate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<StaffSort>("alpha");
  const [sortOpen, setSortOpen] = useState(false);

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

  const search = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: tokens.grisClair2, flexShrink: 0 }}>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, bgcolor: tokens.blanc, borderRadius: "10px" }}>
        <Box sx={{ p: 0.5 }}>
          <FigmaIcon name="search" />
        </Box>
        <InputBase
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          inputProps={{ "aria-label": t("searchLabel") }}
          sx={{
            flex: 1,
            fontSize: 16,
            color: tokens.bleuFonce,
            "& input": { p: 0, height: "auto", lineHeight: "normal" },
            "& input::placeholder": { color: tokens.gris, opacity: 1 },
          }}
        />
      </Box>
      <IconButton aria-label={t("sort")} onClick={() => setSortOpen(true)} sx={{ p: 0, borderRadius: "8px" }}>
        <FigmaIcon name="sort-ascending" />
      </IconButton>
    </Box>
  );

  const list = (
    <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {!query && (
        <li>
          <ButtonBase role="option" aria-selected={!selectedId} onClick={() => choose(undefined)} sx={rowSx(!selectedId)}>
            <TeamAvatar />
            <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 500, lineHeight: "16px", color: tokens.bleuFonce }}>{t("all")}</Typography>
            {!selectedId && (
              <Box sx={{ width: 24, height: 24, p: 0.5 }}>
                <FigmaIcon name="check" />
              </Box>
            )}
          </ButtonBase>
        </li>
      )}
      {people.map(({ person, summary }) => {
        const selected = person.id === selectedId;
        return (
          <li key={person.id}>
            <ButtonBase role="option" aria-selected={selected} onClick={() => choose(person.id)} sx={rowSx(selected)}>
              <StaffAvatar person={person} />
              <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: "16px", color: tokens.bleuFonce }}>{person.name}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: "14px", color: tokens.gris, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {person.email}
                </Typography>
              </Box>
              {summary.average !== null && <RatingChip value={summary.average} />}
            </ButtonBase>
          </li>
        );
      })}
      {query && !people.length && (
        <Typography component="li" sx={{ p: 2, color: tokens.gris, fontSize: 14 }}>
          {t("noResult", { query })}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      {dropdown ? (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: placement.upward ? "top" : "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: placement.upward ? "bottom" : "top", horizontal: "left" }}
          slotProps={{
            paper: {
              "aria-label": t("title"),
              sx: { mt: placement.upward ? -1 : 1, width: anchorEl?.offsetWidth, maxHeight: placement.maxHeight, display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" },
            },
          }}
        >
          {search}
          <Box sx={{ overflowY: "auto", overscrollBehavior: "contain" }}>{list}</Box>
        </Popover>
      ) : (
        <ResponsiveSheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} header={search}>
          {list}
        </ResponsiveSheet>
      )}

      <SortSheet<StaffSort>
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        value={sort}
        onChange={setSort}
        options={[
          { value: "alpha", label: ts("alpha"), hint: ts("alphaHint") },
          { value: "best", label: ts("best"), hint: ts("bestHint") },
          { value: "worst", label: ts("worst"), hint: ts("worstHint") },
        ]}
      />
    </>
  );
}
