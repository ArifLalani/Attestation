"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import type { ReviewSource } from "@/data/types";
import { formatCount } from "@/lib/format";
import type { ScoreView } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "./CertificateContext";

const globalSources: ReviewSource[] = ["os_certified", "import_iso", "os_simple", "import_other"];
const controleSources: ReviewSource[] = ["os_certified", "import_iso"];

/** "En savoir plus" (not in the Figma): explains the score of the active tab. */
export function LearnMoreSheet({ open, onClose, view }: { open: boolean; onClose: () => void; view: ScoreView }) {
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
  const total = sources.reduce((sum, source) => sum + (counts[source] ?? 0), 0);
  const steps = t.raw("controlSteps") as string[];

  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t(controle ? "titleControle" : "titleGlobal")} closeLabel={t("close")}>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5, color: tokens.bleuFonce }}>
        <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{t(controle ? "introControle" : "introGlobal")}</Typography>

        <Box>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>{t("sourcesTitle")}</Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {sources.map((source) => {
              const count = counts[source] ?? 0;
              const verified = source === "os_certified" || source === "import_iso";
              return (
                <Box component="li" key={source}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{ts(source)}</Typography>
                      {source === "import_other" && platforms.length > 0 && (
                        <Typography sx={{ fontSize: 12, color: tokens.gris }}>{platforms.map((platform) => tp(platform)).join(", ")}</Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t("count", { count: formatCount(count) })}</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${total ? (count / total) * 100 : 0}%`, bgcolor: verified ? tokens.vertOs : tokens.bleu400, borderRadius: "3px" }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {controle && (
          <Box>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>{t("controlTitle")}</Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1, "& li": { fontSize: 14, lineHeight: 1.5 } }}>
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </ResponsiveSheet>
  );
}
