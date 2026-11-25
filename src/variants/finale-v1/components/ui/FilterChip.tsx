import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import Check from "@mui/icons-material/Check";
import { tokens } from "@/theme/theme";
import { FigmaIcon } from "./FigmaIcon";

/**
 * A choice in the filters and the quick filters: white with a thin border, light blue with a check after the label once chosen
 * (the same blue as the removable chips).
 */
export function ChoiceChip({
  selected,
  onClick,
  radio,
  icon,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  /** One choice only (e.g. the sort). */
  radio?: boolean;
  /** Shown before the label. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ButtonBase
      role={radio ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        gap: 0.5,
        height: 36,
        px: 1.25,
        fontFamily: "inherit",
        borderRadius: "8px",
        border: `1px solid ${selected ? tokens.bleu30 : tokens.grisMoyen1}`,
        bgcolor: selected ? tokens.bleu10 : tokens.blanc,
        color: selected ? tokens.bleu600 : tokens.bleuFonce,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "normal",
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
        "&:hover": { bgcolor: selected ? tokens.bleu20 : tokens.grisClair1, borderColor: selected ? tokens.bleu30 : "#c9d7e0" },
        "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
      }}
    >
      {icon}
      <Box component="span">{children}</Box>
      {selected && <Check sx={{ fontSize: 18, mr: -0.25 }} />}
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
        borderRadius: "8px",
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
