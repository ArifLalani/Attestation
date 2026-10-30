import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import { tokens } from "@/variants/f/theme";
import { FigmaIcon } from "./FigmaIcon";

/** Figma "Filter Chip" Default / Selected (803:82310): a choice in the filter panel. */
export function ChoiceChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <ButtonBase
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      sx={{
        p: "4px",
        borderRadius: "4px",
        bgcolor: selected ? tokens.bleuFonce : tokens.grisClair2,
        color: selected ? tokens.blanc : tokens.bleuFonce,
        fontSize: 14,
        fontWeight: selected ? 600 : 500,
        lineHeight: "normal",
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, color 150ms ease",
        "&:hover": { bgcolor: selected ? tokens.bleuFonce : tokens.grisMoyen1 },
      }}
    >
      <Box component="span" sx={{ p: "3px" }}>
        {children}
      </Box>
    </ButtonBase>
  );
}

/** Figma "Filter Chip" Out Filter / Collaborator: an active filter, tap to remove. */
export function ActiveChip({ label, onRemove, removeLabel, avatar }: { label: React.ReactNode; onRemove: () => void; removeLabel: string; avatar?: React.ReactNode }) {
  return (
    <ButtonBase
      onClick={onRemove}
      aria-label={removeLabel}
      sx={{
        height: 36,
        p: "6px",
        borderRadius: "4px",
        bgcolor: tokens.bleu5,
        border: `1px solid ${tokens.bleu30}`,
        color: tokens.bleu600,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "18px",
        letterSpacing: "0.16px",
        whiteSpace: "nowrap",
        "&:hover": { bgcolor: tokens.bleu10 },
      }}
    >
      {avatar}
      <Box component="span" sx={{ px: "3px" }}>
        {label}
      </Box>
      <FigmaIcon name="x-circle" />
    </ButtonBase>
  );
}

/** "5★" with the star in JAUNE 600, as in the Figma chips. */
export function StarLabel({ prefix }: { prefix: string }) {
  return (
    <>
      {prefix}
      <Box component="span" sx={{ color: tokens.jaune600 }}>
        ★
      </Box>
    </>
  );
}
