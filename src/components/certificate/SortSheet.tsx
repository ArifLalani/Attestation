"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { tokens } from "@/theme/theme";

export interface SortOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

/** "Trier par" sheet (design sent by the user): one row per option, the current one highlighted with a check. */
export function SortSheet<T extends string>({
  open,
  onClose,
  options,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useTranslations("Sort");
  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")}>
      <Box component="ul" role="listbox" aria-label={t("title")} sx={{ listStyle: "none", m: 0, p: 0, pb: 2 }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <li key={option.value}>
              <ButtonBase
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: 1,
                  px: 2,
                  pt: 1.5,
                  pb: "13px",
                  textAlign: "left",
                  borderBottom: `1px solid ${tokens.grisMoyen1}`,
                  bgcolor: selected ? tokens.bleu10 : tokens.blanc,
                  "&:hover": { bgcolor: selected ? tokens.bleu10 : tokens.bleu5 },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: "16px", color: tokens.bleuFonce }}>{option.label}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: "14px", color: tokens.gris, mt: 0.5 }}>{option.hint}</Typography>
                </Box>
                {selected && (
                  <Box sx={{ p: 0.5 }}>
                    <FigmaIcon name="check" />
                  </Box>
                )}
              </ButtonBase>
            </li>
          );
        })}
      </Box>
    </ResponsiveSheet>
  );
}
