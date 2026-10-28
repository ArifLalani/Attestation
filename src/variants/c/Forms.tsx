"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import X from "@mui/icons-material/X";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import type { Product, Review } from "@/data/types";
import { products } from "./Filters";
import { ChipC, Pill, Sheet } from "./ui";
import { pc } from "./theme";

function Done({ text }: { text: string }) {
  return (
    <Box sx={{ px: 3, py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: pc.emeraldTint, display: "grid", placeItems: "center" }}>
        <CheckCircleRounded sx={{ fontSize: 44, color: pc.emeraldText }} />
      </Box>
      <Typography sx={{ fontSize: 15, lineHeight: 1.55, maxWidth: 400 }}>{text}</Typography>
    </Box>
  );
}

/** "Signaler": a reason and optional details, then a confirmation. Nothing is sent. */
export function ReportSheetC({ review, onClose }: { review: Review | null; onClose: () => void }) {
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
  const reasons = ["inappropriate", "fake", "personal", "offTopic", "other"] as const;
  return (
    <Sheet
      open={Boolean(review)}
      onClose={onClose}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={sent ? <Pill tone="tonal" fullWidth onClick={onClose}>{t("doneButton")}</Pill> : <Pill fullWidth disabled={!reason} onClick={() => setSent(true)}>{t("submit")}</Pill>}
    >
      {sent ? (
        <Done text={t("doneText")} />
      ) : (
        <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: pc.muted }}>{t("intro")}</Typography>
          <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)} aria-label={t("title")} sx={{ gap: 0.5 }}>
            {reasons.map((key) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio />}
                label={t(`reasons.${key}`)}
                sx={{ m: 0, pr: 1.5, minHeight: 48, borderRadius: "14px", border: `1px solid ${reason === key ? pc.indigo : pc.outline}`, bgcolor: reason === key ? pc.indigoSoft : "#fff", "& .MuiFormControlLabel-label": { fontSize: 15 } }}
              />
            ))}
          </RadioGroup>
          <TextField label={t("commentLabel")} value={comment} onChange={(event) => setComment(event.target.value)} multiline minRows={3} fullWidth />
        </Box>
      )}
    </Sheet>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Déposer un avis": the visitor asks for an Opinion System survey by e-mail, so the review that follows is verified. */
export function ReviewRequestSheetC() {
  const t = useTranslations("ReviewRequest");
  const tp = useTranslations("Products");
  const { agency, team, panel, setPanel } = useCertificate();
  const open = panel === "reviewRequest";
  const empty = { firstName: "", lastName: "", email: "", product: "" as Product | "", collaboratorId: "", consent: false };
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && sent) {
      setSent(false);
      setTouched(false);
      setForm(empty);
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
  });

  return (
    <Sheet
      open={open}
      onClose={close}
      title={sent ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      footer={
        sent ? (
          <Pill tone="tonal" fullWidth onClick={close}>{t("doneButton")}</Pill>
        ) : (
          <Pill
            fullWidth
            onClick={() => {
              setTouched(true);
              if (valid) setSent(true);
            }}
          >
            {t("submit")}
          </Pill>
        )
      }
    >
      {sent ? (
        <Done text={t("doneText", { firstName: form.firstName.trim(), email: form.email.trim() })} />
      ) : (
        <Box component="form" noValidate onSubmit={(event) => event.preventDefault()} sx={{ px: 3, pb: 3, pt: 0.5, display: "flex", flexDirection: "column", gap: 2.25 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: pc.muted }}>{t("intro")}</Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField label={t("firstName")} autoComplete="given-name" {...field("firstName")} />
            <TextField label={t("lastName")} autoComplete="family-name" {...field("lastName")} />
          </Box>
          <TextField label={t("email")} type="email" autoComplete="email" inputMode="email" {...field("email")} />
          <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" sx={{ p: 0, mb: 1.25, fontSize: 15, fontWeight: 700, color: touched && !form.product ? pc.red : pc.ink }}>{t("product", { agency: agency.name })}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {products.map((product) => (
                <ChipC key={product} selected={form.product === product} onClick={() => setForm({ ...form, product })}>{tp(product)}</ChipC>
              ))}
            </Box>
          </Box>
          <TextField select label={t("collaborator")} value={form.collaboratorId} onChange={(event) => setForm({ ...form, collaboratorId: event.target.value })} fullWidth>
            <MenuItem value="">—</MenuItem>
            {team.map((person) => <MenuItem key={person.id} value={person.id}>{person.name}</MenuItem>)}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} />}
            label={t("consent")}
            sx={{ alignItems: "flex-start", m: 0, "& .MuiFormControlLabel-label": { fontSize: 14, pt: 1.1, color: touched && !form.consent ? pc.red : pc.ink } }}
          />
        </Box>
      )}
    </Sheet>
  );
}

function ContactRow({ icon, label, detail, href, ariaLabel, onDone }: { icon: React.ReactNode; label: string; detail: string; href: string; ariaLabel?: string; onDone: () => void }) {
  const external = href.startsWith("http");
  return (
    <li>
      <ButtonBase
        component="a"
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        onClick={onDone}
        sx={{ width: "100%", justifyContent: "flex-start", gap: 2, px: 3, py: 1.25, minHeight: 64, textAlign: "left", "&:hover": { bgcolor: pc.surfaceDim }, "&.Mui-focusVisible": { outline: `2px solid ${pc.indigo}`, outlineOffset: -2 } }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: pc.indigoTonal, color: pc.indigoDark, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{label}</Typography>
          <Typography sx={{ fontSize: 14, color: pc.muted, overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</Typography>
        </Box>
        <ChevronRight sx={{ color: pc.muted }} />
      </ButtonBase>
    </li>
  );
}

const networks = [
  { key: "linkedin", icon: <LinkedIn /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "instagram", icon: <Instagram /> },
  { key: "x", icon: <X /> },
] as const;

/** Contacter: phone, e-mail, WhatsApp, then the company's social pages. */
export function ContactSheetC() {
  const t = useTranslations("Contact");
  const { agency, panel, setPanel } = useCertificate();
  const close = () => setPanel(null);
  return (
    <Sheet open={panel === "contact"} onClose={close} title={t("title", { name: agency.name })} closeLabel={t("close")}>
      <Box sx={{ pb: 2 }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          <ContactRow icon={<PhoneOutlined />} label={t("call")} detail={agency.phone} href={`tel:${agency.phone.replace(/\s/g, "")}`} onDone={close} />
          <ContactRow icon={<EmailOutlined />} label={t("email")} detail={agency.email} href={`mailto:${agency.email}`} onDone={close} />
          {agency.whatsapp && <ContactRow icon={<WhatsApp />} label={t("whatsapp")} detail={agency.phone} href={`https://wa.me/${agency.whatsapp.replace(/\D/g, "")}`} onDone={close} />}
        </Box>
        <Typography component="h3" sx={{ px: 3, pt: 2, pb: 1.25, fontSize: 13, fontWeight: 700, color: pc.muted }}>{t("socialsTitle")}</Typography>
        <Box component="ul" sx={{ listStyle: "none", m: 0, px: 3, py: 0, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {networks.map(({ key, icon }) => {
            const href = agency.socials[key];
            return href ? (
              <li key={key}>
                <ButtonBase
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("newTab", { label: t(key), name: agency.name })}
                  onClick={close}
                  sx={{ flexDirection: "column", gap: 0.75, width: 72, py: 0.5, borderRadius: "16px", "&:hover .vc-social": { bgcolor: "#dcdafb" }, "&.Mui-focusVisible": { outline: `2px solid ${pc.indigo}`, outlineOffset: 2 } }}
                >
                  <Box className="vc-social" sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: pc.indigoTonal, color: pc.indigoDark, display: "grid", placeItems: "center", transition: "background-color 150ms ease" }}>{icon}</Box>
                  <Typography component="span" sx={{ fontSize: 13, fontWeight: 600 }}>{t(key)}</Typography>
                </ButtonBase>
              </li>
            ) : null;
          })}
        </Box>
      </Box>
    </Sheet>
  );
}
