"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CtaButton } from "@/components/ui/CtaButton";
import { ChoiceChip } from "@/components/ui/FilterChip";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import type { Product } from "@/data/types";
import { tokens } from "@/theme/theme";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Déposer un avis" (not in the Figma): like today's "Recevoir un questionnaire", the visitor asks for
 * an Opinion System survey by e-mail, so the review that follows is verified. Nothing is sent.
 */
export function ReviewRequestSheet() {
  const t = useTranslations("ReviewRequest");
  const tp = useTranslations("Products");
  const { agency, team, panel, setPanel } = useCertificate();
  const open = panel === "reviewRequest";
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", product: "" as Product | "", collaboratorId: "", consent: false });
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && sent) {
      setSent(false);
      setTouched(false);
      setForm({ firstName: "", lastName: "", email: "", product: "", collaboratorId: "", consent: false });
    }
  }

  const errors = {
    firstName: !form.firstName.trim(),
    lastName: !form.lastName.trim(),
    email: !emailPattern.test(form.email.trim()),
  };
  const valid = !errors.firstName && !errors.lastName && !errors.email && form.product && form.consent;
  const close = () => setPanel(null);
  const field = (key: "firstName" | "lastName" | "email") => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value }),
    error: touched && errors[key],
    helperText: touched && errors[key] ? t(key === "email" && form.email ? "invalidEmail" : "required") : undefined,
    fullWidth: true,
    size: "small" as const,
  });

  return (
    <ResponsiveSheet
      open={open}
      onClose={close}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={
        <Box sx={{ p: 2, pt: 1, flexShrink: 0 }}>
          {sent ? (
            <CtaButton variant="secondary" icon={null} onClick={close}>
              {t("doneButton")}
            </CtaButton>
          ) : (
            <CtaButton
              onClick={() => {
                setTouched(true);
                if (valid) setSent(true);
              }}
            >
              {t("submit")}
            </CtaButton>
          )}
        </Box>
      }
    >
      {sent ? (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
          <CheckCircleRounded sx={{ fontSize: 56, color: tokens.vertOs }} />
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>
            {t("doneText", { firstName: form.firstName.trim(), email: form.email.trim() })}
          </Typography>
        </Box>
      ) : (
        <Box component="form" noValidate onSubmit={(event) => event.preventDefault()} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>{t("intro")}</Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField label={t("firstName")} autoComplete="given-name" {...field("firstName")} />
            <TextField label={t("lastName")} autoComplete="family-name" {...field("lastName")} />
          </Box>
          <TextField label={t("email")} type="email" autoComplete="email" inputMode="email" {...field("email")} />
          <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" sx={{ p: 0, mb: 1, fontSize: 14, fontWeight: 600, color: touched && !form.product ? "error.main" : tokens.bleuFonce }}>
              {t("product", { agency: agency.name })}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {products.map((product) => (
                <ChoiceChip key={product} selected={form.product === product} onClick={() => setForm({ ...form, product })}>
                  {tp(product)}
                </ChoiceChip>
              ))}
            </Box>
          </Box>
          <TextField select label={t("collaborator")} value={form.collaboratorId} onChange={(event) => setForm({ ...form, collaboratorId: event.target.value })} fullWidth size="small">
            <MenuItem value="">—</MenuItem>
            {team.map((person) => (
              <MenuItem key={person.id} value={person.id}>
                {person.name}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} sx={{ "&.Mui-checked": { color: tokens.bleuFonce } }} />}
            label={t("consent")}
            sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: 13, pt: 1.1, color: touched && !form.consent ? "error.main" : tokens.bleuFonce } }}
          />
        </Box>
      )}
    </ResponsiveSheet>
  );
}
