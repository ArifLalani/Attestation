"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";

export function BluePreviewSwitcher({ agencyId }: { agencyId: string }) {
  const [open, setOpen] = useState(true);
  return (
    <Box component="nav" aria-label="Comparaison de l’option B" sx={{ position: "fixed", left: 12, bottom: { xs: 96, md: 12 }, zIndex: 2000, display: "flex", alignItems: "center", gap: 0.5, p: 0.5, borderRadius: 999, bgcolor: "rgba(4,27,68,.94)", color: "#fff", boxShadow: "0 4px 16px rgba(4,27,68,.2)", fontFamily: "var(--font-poppins), sans-serif", fontSize: 12, maxWidth: "calc(100vw - 24px)" }}>
      <ButtonBase onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Replier le comparateur" : "Afficher le comparateur"} sx={{ width: 28, height: 32, borderRadius: 999 }}>{open ? "‹" : "B"}</ButtonBase>
      {open && <>
        <Box component="a" href={`https://attestation1-seven.vercel.app/fr-fr/variantes/b/${agencyId}`} sx={{ color: "inherit", textDecoration: "none", px: 1.5, py: 0.75, borderRadius: 999, "&:hover": { bgcolor: "rgba(255,255,255,.12)" } }}>B original</Box>
        <Box component="span" aria-current="page" sx={{ bgcolor: "#fff", color: "#041b44", px: 1.5, py: 0.75, borderRadius: 999, fontWeight: 600 }}>B bleu</Box>
      </>}
    </Box>
  );
}
