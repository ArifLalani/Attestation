"use client";

import IconButton from "@mui/material/IconButton";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useTranslations } from "next-intl";
import type { DefinitionKey } from "@/variants/finale/components/certificate/DefinitionsSheet";
import type { Review } from "@/data/types";
import { tokens } from "@/theme/theme";

export type HelpGroup = "levels" | "breakdown" | "details";
/** Which block to explain, the item to bring into view, and what was tapped (the desktop window opens under it). */
export interface HelpRequest {
  group: HelpGroup;
  focus?: string;
  anchor: HTMLElement;
}

/** The definition a block or a line of a review opens on, in the definitions sheet. */
export function definitionFor(review: Review, request: HelpRequest | null): DefinitionKey {
  if (!request) return "type";
  if (request.group === "levels") return "levels";
  if (request.group === "breakdown") return "breakdown";
  switch (request.focus) {
    case "source":
      return "source";
    case "questionnaire":
      return "questionnaire";
    case "collaborator":
      return "collaborator";
    case "activity":
      return "activity";
    case "number":
      return "number";
    default:
      return "type";
  }
}

/** The ⓘ of a block: one per block (levels, répartition, détails) instead of one per line. */
export function HelpButton({ title, onOpen }: { title: string; onOpen: (anchor: HTMLElement) => void }) {
  const t = useTranslations("VarianteFinale.reviews");
  return (
    <IconButton
      onClick={(event) => onOpen(event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={t("explain", { title })}
      sx={{ width: 32, height: 32, m: -0.75, color: tokens.bleu600, "&:hover": { bgcolor: tokens.bleu10 } }}
    >
      <InfoOutlined sx={{ fontSize: 20 }} />
    </IconButton>
  );
}
