"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Check from "@mui/icons-material/Check";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { PickerField } from "@/variants/finale/components/ui/PickerField";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { opinionSystemLinks } from "@/data/opinionSystem";
import type { Product } from "@/data/types";
import { tokens } from "@/theme/theme";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DESCRIPTION_MAX = 80;

/** Countries offered in Pays, with the dialling code shown in the phone field. */
const countries = [
  { code: "FR", name: "France", dial: "+33" },
  { code: "BE", name: "Belgique", dial: "+32" },
  { code: "CH", name: "Suisse", dial: "+41" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "ES", name: "Espagne", dial: "+34" },
  { code: "IT", name: "Italie", dial: "+39" },
  { code: "DE", name: "Allemagne", dial: "+49" },
  { code: "GB", name: "Royaume-Uni", dial: "+44" },
] as const;
type CountryCode = (typeof countries)[number]["code"];

type Step = "conditions" | "form" | "sent";
/** The form, or one of its lists (desktop: a second page of the side sheet; phones: a second sheet). */
type List = "country" | "activity";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  country: "FR" as CountryCode | "",
  phone: "",
  product: "" as Product | "",
  description: "",
  robot: false,
};

/** A plain list of choices (Pays, Activité professionnelle): the chosen one tinted with a check, like the team list. */
function OptionList<T extends string>({ options, value, onChoose, label }: { options: { value: T; label: string; hint?: string }[]; value: string; onChoose: (value: T) => void; label: string }) {
  return (
    <Box component="ul" role="listbox" aria-label={label} sx={{ listStyle: "none", m: 0, py: 1, px: 0 }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <li key={option.value}>
            <ButtonBase
              role="option"
              aria-selected={selected}
              onClick={() => onChoose(option.value)}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                gap: 1.5,
                px: 2,
                py: 1,
                minHeight: 52,
                textAlign: "left",
                bgcolor: selected ? tokens.bleu10 : "transparent",
                "&:hover": { bgcolor: selected ? tokens.bleu10 : tokens.bleu5 },
                "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: -2 },
              }}
            >
              <Typography sx={{ flex: 1, fontSize: 16, fontWeight: selected ? 600 : 500, color: tokens.bleuFonce }}>{option.label}</Typography>
              {option.hint && <Typography sx={{ fontSize: 14, color: tokens.gris }}>{option.hint}</Typography>}
              {selected && <Check sx={{ color: tokens.bleuFonce }} />}
            </ButtonBase>
          </li>
        );
      })}
    </Box>
  );
}

/**
 * "Déposer un avis": today's "Recevoir un questionnaire" flow in the page's elements. Step 1, the two conditions
 * (Fermer / Continuer). Step 2, the e-mail used with the agency, then the details used to check the purchase if that
 * e-mail isn't found (name, pays, téléphone, activité professionnelle, description), the "robot" box and the data
 * notice (Fermer / Envoyer). Then a confirmation. Nothing is sent.
 */
export function ReviewRequestSheet() {
  const t = useTranslations("ReviewRequest");
  const ta = useTranslations("Activities");
  const { agency, panel, setPanel } = useCertificate();
  const open = panel === "reviewRequest";
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState<Step>("conditions");
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  // Pays and Activité professionnelle: desktop slides the side sheet to the list (like Filtres); phones open a second sheet.
  const [list, setList] = useState<List | null>(null);
  // The list last opened: keeps its title and rows while its sheet slides away.
  const [lastList, setLastList] = useState<List>("country");
  const countryRef = useRef<HTMLButtonElement>(null);
  const activityRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shownList = useRef<List | null>(list);
  const country = countries.find((item) => item.code === form.country);
  const set = (patch: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...patch }));

  // Back on the form, the focus returns to the field that opened the list.
  useEffect(() => {
    const previous = shownList.current;
    if (previous === list) return;
    shownList.current = list;
    if (!list && previous) (previous === "country" ? countryRef : activityRef).current?.focus({ preventScroll: true });
  }, [list]);

  // Each step starts at the top of the sheet.
  useEffect(() => {
    contentRef.current?.parentElement?.scrollTo({ top: 0 });
  }, [step]);

  // Each opening starts from the conditions; after a request was sent, with an empty form.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setList(null);
      setStep("conditions");
      setTouched(false);
      if (step === "sent") setForm(emptyForm);
    }
  }

  const errors = {
    email: !emailPattern.test(form.email.trim()),
    firstName: !form.firstName.trim(),
    lastName: !form.lastName.trim(),
    phone: form.phone.replace(/\D/g, "").length < 6,
    description: !form.description.trim(),
  };
  const valid = !Object.values(errors).some(Boolean) && form.country && form.product && form.robot;
  const close = () => setPanel(null);
  const send = () => {
    setTouched(true);
    if (valid) setStep("sent");
  };
  const errorText = (key: keyof typeof errors) => {
    if (!touched || !errors[key]) return undefined;
    if (key === "email" && form.email) return t("invalidEmail");
    if (key === "phone" && form.phone) return t("invalidPhone");
    return t("required");
  };
  const field = (key: "email" | "firstName" | "lastName" | "phone" | "description") => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => set({ [key]: event.target.value }),
    required: true,
    error: Boolean(errorText(key)),
    helperText: errorText(key),
    fullWidth: true,
    size: "small" as const,
  });

  const countryOptions = countries.map((item) => ({ value: item.code, label: item.name, hint: item.dial }));
  const activityOptions = products.map((product) => ({ value: product, label: ta(product) }));
  const countryList = (
    <OptionList options={countryOptions} value={form.country} label={t("countryTitle")} onChoose={(code) => { set({ country: code }); setList(null); }} />
  );
  const activityList = (
    <OptionList options={activityOptions} value={form.product} label={t("activityTitle")} onChoose={(product) => { set({ product }); setList(null); }} />
  );
  const openList = (which: List) => {
    setLastList(which);
    setList(which);
  };
  const activityMissing = touched && !form.product;

  const footerButtons = (primary: React.ReactNode) => (
    <Box sx={{ display: "flex", gap: 1.5, "& > *": { flex: 1 } }}>
      <CtaButton variant="secondary" icon={null} onClick={close}>
        {t("close")}
      </CtaButton>
      {primary}
    </Box>
  );

  const conditions = (
    <Box ref={contentRef} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>
        {t("conditionsTitle", { agency: agency.name })}
      </Typography>
      <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("conditionsLead")}</Typography>
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {(["condition1", "condition2"] as const).map((key, index) => (
          <Box component="li" key={key} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box aria-hidden sx={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${tokens.vertOs}`, bgcolor: tokens.successLight2, color: tokens.vertOs, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700 }}>
              {index + 1}
            </Box>
            <Typography sx={{ pt: "4px", fontSize: 14, lineHeight: 1.45, color: tokens.bleuFonce }}>{t(key)}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>
        {t.rich("conditionsEnd", {
          link: (chunks) => (
            <Link href={opinionSystemLinks.directory} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600, color: tokens.bleu600 }}>
              {chunks}
            </Link>
          ),
        })}
      </Typography>
    </Box>
  );

  const details = (
    <Box ref={contentRef} component="form" noValidate onSubmit={(event) => { event.preventDefault(); send(); }} sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: tokens.bleuFonce }}>
        {t("emailLead", { agency: agency.name })}
      </Typography>
      <TextField label={t("email")} type="email" autoComplete="email" inputMode="email" {...field("email")} />

      <Box sx={{ pt: 1, borderTop: `1px solid ${tokens.grisMoyen1}`, mt: 0.5 }}>
        <Typography component="h3" sx={{ pt: 1, fontSize: 16, fontWeight: 600, color: tokens.bleuFonce }}>{t("moreTitle")}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, lineHeight: 1.45, color: tokens.gris }}>{t("moreText")}</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <TextField label={t("firstName")} autoComplete="given-name" {...field("firstName")} />
        <TextField label={t("lastName")} autoComplete="family-name" {...field("lastName")} />
      </Box>
      <PickerField
        ref={countryRef}
        avatar={false}
        label={`${t("country")} *`}
        valueText={country?.name}
        emptyText={t("countryPlaceholder")}
        emptyMuted
        changeLabel={t("countryTitle")}
        onClick={() => openList("country")}
        expanded={desktop ? undefined : list === "country"}
      />
      <TextField
        label={t("phone")}
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        {...field("phone")}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce }}>{country?.dial ?? "+"}</Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t("phoneHelp")} enterTouchDelay={0} leaveTouchDelay={5000} arrow>
                  <IconButton edge="end" size="small" aria-label={t("phoneHelpLabel")} sx={{ color: tokens.gris }}>
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />
      <Box>
        <PickerField
          ref={activityRef}
          avatar={false}
          error={activityMissing}
          label={`${t("activity")} *`}
          valueText={form.product ? ta(form.product) : undefined}
          emptyText={t("activityPlaceholder")}
          emptyMuted
          changeLabel={t("activityTitle")}
          onClick={() => openList("activity")}
          expanded={desktop ? undefined : list === "activity"}
        />
        {activityMissing && <FormHelperText error sx={{ mx: "14px" }}>{t("required")}</FormHelperText>}
      </Box>
      <TextField
        label={t("description")}
        multiline
        minRows={3}
        {...field("description")}
        helperText={errorText("description") ?? `${form.description.length}/${DESCRIPTION_MAX}`}
        slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX }, formHelperText: { sx: { textAlign: errorText("description") ? "left" : "right" } } }}
      />

      {/* Stand-in for the reCAPTCHA box of the current form. */}
      <Box
        component="label"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          alignSelf: "flex-start",
          minWidth: 260,
          pl: 0.5,
          pr: 2,
          py: 1,
          borderRadius: "8px",
          border: `1px solid ${touched && !form.robot ? tokens.errorMain : tokens.grisMoyen1}`,
          bgcolor: tokens.grisClair1,
          cursor: "pointer",
        }}
      >
        <Checkbox checked={form.robot} onChange={(event) => set({ robot: event.target.checked })} sx={{ "&.Mui-checked": { color: tokens.vertOs } }} />
        <Typography sx={{ flex: 1, fontSize: 14, color: tokens.bleuFonce }}>{t("robot")}</Typography>
        <Typography component="span" sx={{ fontSize: 10, color: tokens.gris }}>reCAPTCHA</Typography>
      </Box>

      <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: tokens.gris }}>
        {t.rich("legal", {
          link: (chunks) => (
            <Link href={opinionSystemLinks.privacy} target="_blank" rel="noopener noreferrer" sx={{ color: tokens.bleu600 }}>
              {chunks}
            </Link>
          ),
        })}
      </Typography>
    </Box>
  );

  return (
    <ResponsiveSheet
      open={open}
      onClose={close}
      title={step === "sent" ? t("doneTitle") : t("title")}
      closeLabel={t("close")}
      subPage={{
        open: list !== null,
        title: lastList === "activity" ? t("activityTitle") : t("countryTitle"),
        backLabel: t("backToForm"),
        onBack: () => setList(null),
        children: lastList === "activity" ? activityList : countryList,
      }}
      footer={
        <Box sx={{ p: 2, pt: 1.5, flexShrink: 0, borderTop: `1px solid ${tokens.grisMoyen1}` }}>
          {step === "sent" ? (
            <CtaButton variant="secondary" icon={null} onClick={close}>
              {t("doneButton")}
            </CtaButton>
          ) : step === "conditions" ? (
            footerButtons(<CtaButton onClick={() => setStep("form")}>{t("continue")}</CtaButton>)
          ) : (
            footerButtons(<CtaButton onClick={send}>{t("send")}</CtaButton>)
          )}
        </Box>
      }
    >
      {step === "sent" ? (
        <Box ref={contentRef} sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
          <CheckCircleRounded sx={{ fontSize: 56, color: tokens.vertOs }} />
          <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>
            {t("doneText", { firstName: form.firstName.trim(), email: form.email.trim() })}
          </Typography>
        </Box>
      ) : step === "conditions" ? (
        conditions
      ) : (
        details
      )}
      {/* Phones: the lists in a second sheet over the form (desktop uses the second page above). */}
      {!desktop && (
        <ResponsiveSheet
          open={open && list !== null}
          onClose={() => setList(null)}
          title={lastList === "activity" ? t("activityTitle") : t("countryTitle")}
          closeLabel={t("close")}
        >
          {lastList === "activity" ? activityList : countryList}
        </ResponsiveSheet>
      )}
    </ResponsiveSheet>
  );
}
