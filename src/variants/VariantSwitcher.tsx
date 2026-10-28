"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import { variants, type VariantId } from "./registry";

/**
 * Demo-only switch between the current prototype and the design options, kept on the same agency.
 * Neutral styling on purpose, so it doesn't look like part of any option. Can be folded to a dot.
 */
export function VariantSwitcher({ current, agencyId }: { current: VariantId; agencyId: string }) {
  const [open, setOpen] = useState(true);
  return (
    <Box
      component="nav"
      aria-label="Options de design"
      sx={{
        position: "fixed",
        left: 12,
        bottom: { xs: 96, md: 12 },
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        p: 0.5,
        borderRadius: 999,
        bgcolor: "rgba(17, 17, 17, 0.88)",
        color: "#fff",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Replier le sélecteur d'options" : "Afficher le sélecteur d'options"}
        sx={{ width: 28, height: 28, borderRadius: 999, fontSize: 14, color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
      >
        {open ? "‹" : "◐"}
      </ButtonBase>
      {open &&
        variants.map((variant) => {
          const selected = variant.id === current;
          return (
            <Box
              key={variant.id}
              component="a"
              href={variant.href(agencyId)}
              aria-current={selected ? "page" : undefined}
              title={variant.name}
              sx={{
                px: 1.25,
                height: 28,
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                fontWeight: 600,
                textDecoration: "none",
                color: selected ? "#111" : "inherit",
                bgcolor: selected ? "#fff" : "transparent",
                "&:hover": { bgcolor: selected ? "#fff" : "rgba(255,255,255,0.12)" },
                "&:focus-visible": { outline: "2px solid #fff", outlineOffset: 2 },
              }}
            >
              {variant.label}
            </Box>
          );
        })}
    </Box>
  );
}
