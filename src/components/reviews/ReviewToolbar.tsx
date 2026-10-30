"use client";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ReviewSearchField } from "@/components/reviews/ReviewSearchField";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { formatCount } from "@/lib/format";
import { applyFilters, countActiveFilters } from "@/lib/reviewFilters";
import { tokens } from "@/theme/theme";

/** Desktop only: the word next to the filter and sort icons. */
const desktopLabelSx = { display: { xs: "none", md: "inline" }, ml: 0.75, fontSize: 14, fontWeight: 500, lineHeight: "normal", color: tokens.bleuFonce } as const;

/** Count chip + filter (with badge) + sort. Figma "Filteres" → "Filters Row". Used in the card and in the pinned header. */
export function ReviewToolbar({ onCountClick }: { onCountClick?: () => void } = {}) {
  const t = useTranslations("Reviews");
  const { reviews, filters, openPanel, goToSection } = useCertificate();
  const count = useMemo(() => applyFilters(reviews, filters).length, [reviews, filters]);
  const active = countActiveFilters(filters);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
      <Box sx={{ flexShrink: 0 }}>
        <ButtonBase
          onClick={onCountClick ?? (() => goToSection("avis"))}
          aria-label={t("backToStart", { count: formatCount(count) })}
          sx={{
            display: "inline-flex",
            px: "10px",
            py: "2px",
            borderRadius: "4px",
            bgcolor: tokens.grisClair2,
            border: `1px solid ${tokens.grisMoyen1}`,
            "&:hover": { bgcolor: tokens.bleu10 },
            "&:focus-visible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
          }}
        >
          <Typography aria-live="polite" sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
            {t("count", { count: formatCount(count) })}
          </Typography>
        </ButtonBase>
      </Box>
      {/* Search between the count and the filter/sort icons, here and in the pinned header. */}
      <ReviewSearchField sx={[{ minHeight: 40, borderRadius: "8px", borderColor: tokens.grisMoyen1, bgcolor: tokens.grisClair1, color: tokens.gris, "&:focus-within": { borderColor: tokens.bleu400, bgcolor: tokens.blanc } }, { flex: 1, minWidth: 0 }]} />
      <IconButton
        onClick={(event) => openPanel("filters", event.currentTarget)}
        aria-label={active ? t("filtersActive", { count: active }) : t("filters")}
        sx={{ p: 0.5, borderRadius: "8px", bgcolor: tokens.blanc }}
      >
        <Badge
          badgeContent={active}
          sx={{
            "& .MuiBadge-badge": {
              position: "static",
              transform: "none",
              ml: 0,
              height: 20,
              minWidth: 20,
              px: "2.5px",
              borderRadius: "12.5px",
              bgcolor: tokens.errorMain,
              color: tokens.blanc,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Roboto, var(--font-poppins), sans-serif",
            },
          }}
        >
          <FigmaIcon name="funnel" />
        </Badge>
        <Box component="span" sx={desktopLabelSx}>{t("filters")}</Box>
      </IconButton>
      <IconButton onClick={(event) => openPanel("sort", event.currentTarget)} aria-label={t("sort")} sx={{ p: 0.5, borderRadius: "8px", bgcolor: tokens.blanc }}>
        <FigmaIcon name="sort-ascending" />
        <Box component="span" sx={desktopLabelSx}>{t("sortShort")}</Box>
      </IconButton>
    </Box>
  );
}
