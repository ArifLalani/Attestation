"use client";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CtaButton } from "@/variants/f/components/ui/CtaButton";
import { ResponsiveSheet } from "@/variants/f/components/ui/ResponsiveSheet";
import type { Review } from "@/data/types";
import { tokens } from "@/variants/f/theme";

const reasons = ["inappropriate", "fake", "personal", "offTopic", "other"] as const;

/** "Signaler" (not in the Figma): reason + optional details, then a confirmation. Nothing is sent. */
export function ReportSheet({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const t = useTranslations("Report");
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [forId, setForId] = useState<string | null>(null);

  if (review && review.id !== forId) {
    setForId(review.id);
    setReason("");
    setComment("");
    setSent(false);
  }

  return (
    <ResponsiveSheet
      open={Boolean(review)}
      onClose={onClose}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={
        <Box sx={{ p: 2, pt: 1, flexShrink: 0 }}>
          {sent ? (
            <CtaButton variant="secondary" icon={null} onClick={onClose}>
              {t("doneButton")}
            </CtaButton>
          ) : (
            <CtaButton disabled={!reason} onClick={() => setSent(true)}>
              {t("submit")}
            </CtaButton>
          )}
        </Box>
      }
    >
      {sent ? (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
          <CheckCircleRounded sx={{ fontSize: 56, color: tokens.vertOs }} />
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>{t("doneText")}</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>{t("intro")}</Typography>
          <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)} aria-label={t("title")}>
            {reasons.map((key) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: tokens.bleuFonce } }} />}
                label={t(`reasons.${key}`)}
                sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: tokens.bleuFonce } }}
              />
            ))}
          </RadioGroup>
          <TextField label={t("commentLabel")} value={comment} onChange={(event) => setComment(event.target.value)} multiline minRows={3} fullWidth size="small" />
        </Box>
      )}
    </ResponsiveSheet>
  );
}
