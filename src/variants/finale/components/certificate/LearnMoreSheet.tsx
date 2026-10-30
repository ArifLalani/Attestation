"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import type { ReviewSource } from "@/data/types";
import { formatCount } from "@/lib/format";
import type { ScoreView } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";

const globalSources: ReviewSource[] = ["os_certified", "import_iso", "os_simple", "import_other"];
const controleSources: ReviewSource[] = ["os_certified", "import_iso"];

/**
 * "En savoir plus" content: explains the score of the active tab.
 * `inline` = Figma "En savoir plus — contenu" (1491:38099), the grey band inside the Réputation card on desktop.
 */
export function LearnMoreContent({ view, inline = false }: { view: ScoreView; inline?: boolean }) {
  const t = useTranslations("LearnMore");
  const ts = useTranslations("Sources");
  const tp = useTranslations("Platforms");
  const { reviews } = useCertificate();
  const controle = view === "controle";

  const counts = useMemo(() => {
    const result: Partial<Record<ReviewSource, number>> = {};
    for (const review of reviews) result[review.source] = (result[review.source] ?? 0) + 1;
    return result;
  }, [reviews]);

  // Platforms behind the non-ISO imports, most reviews first.
  const platforms = useMemo(() => {
    const byPlatform = new Map<string, number>();
    for (const review of reviews) if (review.platform) byPlatform.set(review.platform, (byPlatform.get(review.platform) ?? 0) + 1);
    return [...byPlatform.entries()].sort((a, b) => b[1] - a[1]).map(([platform]) => platform);
  }, [reviews]);

  const sources = controle ? controleSources : globalSources;
  const largest = Math.max(1, ...sources.map((source) => counts[source] ?? 0));
  const steps = t.raw("controlSteps") as string[];

  return (
    <Box
      sx={{
        p: 2,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: inline ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" },
        columnGap: 4,
        rowGap: 2.5,
        bgcolor: inline ? tokens.grisClair1 : "transparent",
        borderRadius: inline ? "0 0 20px 20px" : 0,
        color: tokens.bleuFonce,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        {inline && <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{t(controle ? "titleControle" : "titleGlobal")}</Typography>}
        <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{t(controle ? "introControle" : "introGlobal")}</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{t("sourcesTitle")}</Typography>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {sources.map((source) => {
            const count = counts[source] ?? 0;
            const verified = source === "os_certified" || source === "import_iso";
            return (
              <Box component="li" key={source}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{ts(source)}</Typography>
                    {source === "import_other" && platforms.length > 0 && (
                      <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: tokens.gris, mt: "2px" }}>{platforms.map((platform) => tp(platform)).join(", ")}</Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, whiteSpace: "nowrap" }}>{t("count", { count: formatCount(count) })}</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: "3px", bgcolor: tokens.grisClair1, overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${(count / largest) * 100}%`, bgcolor: verified ? tokens.vertOs : tokens.bleu400, borderRadius: "3px" }} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {controle && (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{t("controlTitle")}</Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1, "& li": { fontSize: 14, lineHeight: 1.5 }, "& li::marker": { fontWeight: 700 } }}>
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/** Phones: the same explanation in a bottom sheet. */
export function LearnMoreSheet({ open, onClose, view }: { open: boolean; onClose: () => void; view: ScoreView }) {
  const t = useTranslations("LearnMore");
  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t(view === "controle" ? "titleControle" : "titleGlobal")} closeLabel={t("close")}>
      <LearnMoreContent view={view} />
    </ResponsiveSheet>
  );
}
