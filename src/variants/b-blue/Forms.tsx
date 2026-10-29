"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckRounded from "@mui/icons-material/CheckRounded";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import type { Product, Review } from "@/data/types";
import { b } from "./theme";
import { ChoicePill, focusSx, Pill, Sheet, SheetFooter } from "./ui";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const reasons = ["inappropriate", "fake", "personal", "offTopic", "other"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Done({ text }: { text: string }) {
  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: b.sageTint, color: b.sage, display: "grid", placeItems: "center", animation: "b-in 420ms cubic-bezier(0.2, 0, 0, 1)", "@keyframes b-in": { from: { transform: "scale(0.6)", opacity: 0 }, to: { transform: "none", opacity: 1 } }, "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
        <CheckRounded sx={{ fontSize: 40 }} />
      </Box>
      <Typography sx={{ fontSize: 16, lineHeight: 1.6, maxWidth: 380 }}>{text}</Typography>
    </Box>
  );
}

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "14px" }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: b.ink } } as const;

/** Signaler: a reason (one tap), optional details, then a confirmation. Nothing is sent. */
export function ReportSheetB({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const t = useTranslations("Report");
  const [reason, setReason] = useState("");
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
    <Sheet
      open={Boolean(review)}
      onClose={onClose}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      width={520}
      footer={
        <SheetFooter>
          {sent ? (
            <Pill variant="dark" fullWidth onClick={onClose}>{t("doneButton")}</Pill>
          ) : (
            <Pill variant="dark" fullWidth disabled={!reason} onClick={() => setSent(true)}>{t("submit")}</Pill>
          )}
        </SheetFooter>
      }
    >
      {sent ? (
        <Done text={t("doneText")} />
      ) : (
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: b.muted }}>{t("intro")}</Typography>
          <Box role="radiogroup" aria-label={t("title")} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {reasons.map((key) => {
              const selected = reason === key;
              return (
                <ButtonBase
                  key={key}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(key)}
                  sx={{ justifyContent: "space-between", gap: 2, minHeight: 52, px: 2, borderRadius: "16px", textAlign: "left", fontSize: 15, fontWeight: selected ? 700 : 500, boxShadow: `inset 0 0 0 ${selected ? 2 : 1}px ${selected ? b.ink : b.lineStrong}`, ...focusSx }}
                >
                  {t(`reasons.${key}`)}
                  <Box sx={{ width: 22, height: 22, borderRadius: "50%", boxShadow: `inset 0 0 0 ${selected ? 7 : 2}px ${selected ? b.ink : b.lineStrong}`, transition: "box-shadow 150ms ease", flexShrink: 0 }} />
                </ButtonBase>
              );
            })}
          </Box>
          <TextField label={t("commentLabel")} value={comment} onChange={(event) => setComment(event.target.value)} multiline minRows={3} fullWidth sx={fieldSx} />
        </Box>
      )}
    </Sheet>
  );
}

/** Déposer un avis: the visitor asks for an Opinion System survey by e-mail, so the review is verified. Nothing is sent. */
export function ReviewRequestB() {
  const t = useTranslations("ReviewRequest");
  const tp = useTranslations("Products");
  const { agency, team, panel, setPanel } = useCertificate();
  const open = panel === "reviewRequest";
  const blank = { firstName: "", lastName: "", email: "", product: "" as Product | "", collaboratorId: "", consent: false };
  const [form, setForm] = useState(blank);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && sent) {
      setSent(false);
      setTouched(false);
      setForm(blank);
    }
  }

  const errors = { firstName: !form.firstName.trim(), lastName: !form.lastName.trim(), email: !emailPattern.test(form.email.trim()) };
  const valid = !errors.firstName && !errors.lastName && !errors.email && form.product && form.consent;
  const close = () => setPanel(null);
  const field = (key: "firstName" | "lastName" | "email") => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value }),
    error: touched && errors[key],
    helperText: touched && errors[key] ? t(key === "email" && form.email ? "invalidEmail" : "required") : undefined,
    fullWidth: true,
    sx: fieldSx,
  });

  return (
    <Sheet
      open={open}
      onClose={close}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      width={560}
      footer={
        <SheetFooter>
          {sent ? (
            <Pill variant="dark" fullWidth onClick={close}>{t("doneButton")}</Pill>
          ) : (
            <Pill
              variant="primary"
              fullWidth
              onClick={() => {
                setTouched(true);
                if (valid) setSent(true);
              }}
            >
              {t("submit")}
            </Pill>
          )}
        </SheetFooter>
      }
    >
      {sent ? (
        <Done text={t("doneText", { firstName: form.firstName.trim(), email: form.email.trim() })} />
      ) : (
        <Box component="form" noValidate onSubmit={(event) => event.preventDefault()} sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: b.muted }}>{t("intro")}</Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField label={t("firstName")} autoComplete="given-name" {...field("firstName")} />
            <TextField label={t("lastName")} autoComplete="family-name" {...field("lastName")} />
          </Box>
          <TextField label={t("email")} type="email" autoComplete="email" inputMode="email" {...field("email")} />
          <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" sx={{ p: 0, mb: 1.25, fontSize: 15, fontWeight: 700, color: touched && !form.product ? "error.main" : b.ink }}>
              {t("product", { agency: agency.name })}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {products.map((product) => (
                <ChoicePill key={product} role="radio" selected={form.product === product} onClick={() => setForm({ ...form, product })}>{tp(product)}</ChoicePill>
              ))}
            </Box>
          </Box>
          <TextField select label={t("collaborator")} value={form.collaboratorId} onChange={(event) => setForm({ ...form, collaboratorId: event.target.value })} fullWidth sx={fieldSx}>
            <MenuItem value="">—</MenuItem>
            {team.map((person) => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} sx={{ "&.Mui-checked": { color: b.ink } }} />}
            label={t("consent")}
            sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: 14, pt: 1.1, color: touched && !form.consent ? "error.main" : b.ink } }}
          />
        </Box>
      )}
    </Sheet>
  );
}
