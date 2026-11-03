"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { ChoiceChip } from "@/variants/finale/components/ui/FilterChip";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { tokens } from "@/theme/theme";

export interface SortGroup<T extends string> {
  title: string;
  options: { value: T; label: string }[];
}

/** One theme of the sort (Date, Note, Autres): a 16 px title and its chips, laid out like a filters section. */
function Group<T extends string>({ group, value, onPick }: { group: SortGroup<T>; value: T; onPick: (value: T) => void }) {
  const titleId = useId();
  return (
    <Box role="group" aria-labelledby={titleId}>
      <Typography id={titleId} component="h3" sx={{ mb: 1, fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
        {group.title}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {group.options.map((option) => (
          <ChoiceChip key={option.value} radio selected={option.value === value} onClick={() => onPick(option.value)}>
            {option.label}
          </ChoiceChip>
        ))}
      </Box>
    </Box>
  );
}

/**
 * "Trier par", drawn like the filters: the choices as chips under 16 px theme titles, the current one light blue with a check.
 * One tap sorts the page and closes the sheet.
 */
export function SortSheet<T extends string>({
  open,
  onClose,
  groups,
  value,
  onChange,
  anchorEl,
  side,
}: {
  open: boolean;
  onClose: () => void;
  groups: SortGroup<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Desktop: show as a dropdown under this button. */
  anchorEl?: HTMLElement | null;
  /** Desktop: a side sheet from the right instead of a dropdown. */
  side?: boolean;
}) {
  const t = useTranslations("Sort");
  const pick = (next: T) => {
    onChange(next);
    onClose();
  };
  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} anchorEl={anchorEl} dropdownWidth={360} side={side}>
      <Box role="radiogroup" aria-label={t("title")} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {groups.map((group) => (
          <Group key={group.title} group={group} value={value} onPick={pick} />
        ))}
      </Box>
    </ResponsiveSheet>
  );
}
