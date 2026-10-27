"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";
import Person from "@mui/icons-material/Person";
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

/** One speech-bubble review in the illustration: avatar, stars, check and placeholder lines. */
function MiniReview({ stars, large = false }: { stars: number; large?: boolean }) {
  const avatar = large ? 40 : 28;
  return (
    <Box
      sx={{
        position: "relative",
        width: large ? 186 : 132,
        mt: large ? 0 : 3,
        p: large ? "12px 12px 14px" : "8px 10px 10px",
        display: "flex",
        gap: 1,
        bgcolor: tokens.blanc,
        borderRadius: "8px",
        boxShadow: "0px 2px 8px 0px rgba(4, 27, 68, 0.10)",
        // Bubble tail, bottom left.
        "&::after": { content: '""', position: "absolute", left: 12, bottom: -8, width: 10, height: 8, bgcolor: tokens.blanc, clipPath: "polygon(0 0, 100% 0, 0 100%)" },
      }}
    >
      <Box sx={{ width: avatar, height: avatar, flexShrink: 0, borderRadius: "50%", bgcolor: tokens.bleuFonce, display: "grid", placeItems: "center", overflow: "hidden" }}>
        <Person sx={{ fontSize: avatar * 0.8, color: tokens.bleu400, mt: `${avatar * 0.2}px` }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: large ? 1 : 0.75 }}>
        <Box sx={{ fontSize: large ? 20 : 12, lineHeight: 1, letterSpacing: large ? "1px" : 0 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Box key={star} component="span" sx={{ color: star <= stars ? tokens.rating : tokens.grisMoyen1 }}>★</Box>
          ))}
        </Box>
        {(large ? ["100%", "80%", "50%"] : ["100%", "60%"]).map((width) => (
          <Box key={width} sx={{ width, height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1 }} />
        ))}
      </Box>
      <Box sx={{ position: "absolute", top: large ? 8 : 6, right: large ? 8 : 6, width: large ? 16 : 12, height: large ? 16 : 12, borderRadius: "50%", bgcolor: tokens.vertOs, display: "grid", placeItems: "center" }}>
        <Check sx={{ fontSize: large ? 12 : 9, color: tokens.blanc }} />
      </Box>
    </Box>
  );
}

/** Figma "image 7" (1502:30349), drawn in code: three reviews, each checked. */
function ReviewsIllustration() {
  return (
    <Box aria-hidden sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 1.25, py: 2.5, zoom: { xs: 0.8, sm: 1 } }}>
      <MiniReview stars={4} />
      <MiniReview stars={5} large />
      <MiniReview stars={3} />
    </Box>
  );
}

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
        <ReviewsIllustration />
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
            <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {steps.map((step, index) => (
                <Box component="li" key={step} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box aria-hidden sx={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", bgcolor: tokens.vertOs, color: tokens.blanc, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
                    {index + 1}
                  </Box>
                  <Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>{step}</Typography>
                </Box>
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
