"use client";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { tokens } from "@/theme/theme";
import { sectionIds, type SectionId } from "./CertificateContext";

export const pageColumnSx = { width: "100%", maxWidth: 640, mx: "auto" } as const;

/** Figma "Top Header": trust banner + section tabs, pinned to the top (Sticky variant once scrolled). */
export function AppHeader({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <Box sx={{ background: "linear-gradient(to right, #001c4e, #11141a)", boxShadow: tokens.elevation3 }}>
        <Box sx={{ ...pageColumnSx, display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <FigmaIcon name="os-icon-logo" />
          <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: tokens.blanc, lineHeight: "normal" }}>
            {t("brand")}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: tokens.vertOs, letterSpacing: "0.8px", lineHeight: "normal", whiteSpace: "nowrap" }}>
            {t("badge")}
          </Typography>
        </Box>
      </Box>
      <Box
        component="nav"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.96)",
          boxShadow: scrolled ? "0px 4px 12px 0px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 200ms ease",
          backdropFilter: "saturate(180%) blur(8px)",
        }}
      >
        <Tabs
          value={active}
          onChange={(_, id: SectionId) => onSelect(id)}
          variant="fullWidth"
          aria-label={t("tabsLabel")}
          sx={{
            ...pageColumnSx,
            px: 2,
            minHeight: 48,
            "& .MuiTabs-indicator": { height: 3, bgcolor: tokens.vertOs },
          }}
        >
          {sectionIds.map((id) => (
            <Tab
              key={id}
              value={id}
              label={t(`tabs.${id}`)}
              disableRipple
              sx={{
                minWidth: 0,
                minHeight: 48,
                px: 2,
                py: 1.5,
                fontSize: 14,
                lineHeight: "normal",
                fontWeight: 400,
                color: tokens.bleuFonce,
                "&.Mui-selected": { color: tokens.bleuFonce, fontWeight: 600 },
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
