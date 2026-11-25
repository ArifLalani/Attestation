"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { Collaborator } from "@/data/types";
import { tokens } from "@/theme/theme";
import { FigmaIcon } from "./FigmaIcon";
import { StaffAvatar, TeamAvatar } from "./StaffAvatar";

/**
 * The dropdown field of the page (Réputation's "Données affichées pour", Déposer un avis's conseiller and pays):
 * a round avatar, a small grey label above the value, and a chevron (or the "change" arrows once a person is chosen).
 * It only opens the list; the caller decides how (a side-sheet page or a bottom sheet).
 */
export function PickerField({
  label,
  person,
  valueText,
  leading,
  avatar = true,
  error = false,
  emptyText,
  emptyMuted = false,
  changeLabel,
  onClick,
  expanded,
  id,
  ref,
}: {
  label: string;
  person?: Pick<Collaborator, "name" | "photo">;
  /** The chosen value when it is not a person (e.g. a country). */
  valueText?: string;
  /** Replaces the avatar (e.g. the country code in a circle). */
  leading?: React.ReactNode;
  /** false: no avatar, the label and value start at the left edge (Pays, Activité professionnelle). */
  avatar?: boolean;
  /** Red border and label (a required choice left empty). */
  error?: boolean;
  /** Shown when nobody is chosen ("Toute l'équipe", "Choisir un conseiller"). */
  emptyText: string;
  /** Grey value and avatar when nobody is chosen (a placeholder rather than a choice). */
  emptyMuted?: boolean;
  /** Alternative text of the arrows shown once someone is chosen. */
  changeLabel: string;
  onClick: () => void;
  /** Whether the list is open, for screen readers (leave out when the list replaces the content). */
  expanded?: boolean;
  id?: string;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const value = person?.name ?? valueText ?? emptyText;
  const muted = !person && !valueText && emptyMuted;
  return (
    <ButtonBase
      id={id}
      ref={ref}
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={expanded}
      aria-label={`${label} : ${value}`}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        gap: 1.5,
        pl: avatar ? 1 : 2,
        pr: 2,
        minHeight: 56,
        bgcolor: tokens.grisClair1,
        border: `1px solid ${error ? tokens.errorMain : tokens.grisMoyen1}`,
        borderRadius: "12px",
        textAlign: "left",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": { borderColor: tokens.bleu30, bgcolor: tokens.blanc },
        "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: 2 },
      }}
    >
      {avatar && (leading ?? (person ? <StaffAvatar person={person} size={40} /> : <TeamAvatar size={40} color={muted ? tokens.gris : tokens.bleuFonce} />))}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: error ? tokens.errorMain : tokens.gris, lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography component="span" sx={{ display: "block", fontSize: 16, fontWeight: muted ? 500 : 600, color: muted ? tokens.gris : tokens.bleuFonce, lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Box>
      <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} alt={person ? changeLabel : ""} />
    </ButtonBase>
  );
}
