"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTranslations } from "next-intl";
import { useCertificate } from "@/components/certificate/CertificateContext";

/**
 * Search box of the Avis section, shared by the prototype and every design option: it sets `filters.query`,
 * so the count, the list and the empty state follow like any other filter. Each option passes its own look in `sx`
 * (the box) and `inputSx` (the text).
 */
export function ReviewSearchField({ sx, inputSx }: { sx?: SxProps<Theme>; inputSx?: SxProps<Theme> }) {
  const t = useTranslations("Reviews");
  const { filters, setFilters } = useCertificate();
  const value = filters.query ?? "";
  const setQuery = (query: string) => setFilters({ ...filters, query: query || undefined });

  return (
    <Box
      role="search"
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 44,
          pl: 1.5,
          pr: 0.5,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.secondary",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:focus-within": { borderColor: "text.primary" },
          "& > svg": { fontSize: 20, flexShrink: 0 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <SearchRounded aria-hidden />
      <InputBase
        type="search"
        value={value}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            setQuery("");
          }
        }}
        placeholder={t("searchPlaceholder")}
        inputProps={{ "aria-label": t("search"), enterKeyHint: "search" }}
        sx={[
          {
            flex: 1,
            minWidth: 0,
            fontSize: 16,
            color: "text.primary",
            // The browser's own clear cross is replaced by ours.
            "& input::-webkit-search-cancel-button": { display: "none" },
            "& input::placeholder": { opacity: 1, color: "text.secondary" },
          },
          ...(Array.isArray(inputSx) ? inputSx : [inputSx]),
        ]}
      />
      {value && (
        <IconButton size="small" onClick={() => setQuery("")} aria-label={t("searchClear")} sx={{ color: "inherit" }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
