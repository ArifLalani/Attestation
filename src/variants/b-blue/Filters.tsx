"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import CheckRounded from "@mui/icons-material/CheckRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import type { Criterion, Product } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, emptyFilters, type Period, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { b } from "./theme";
import { ChoicePill, focusSx, Hairline, Pill, Sheet, SheetFooter, TextLink } from "./ui";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];
export const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
      <Typography component="legend" sx={{ p: 0, mb: 1.5, fontFamily: b.serif, fontWeight: 600, fontSize: 20 }}>{title}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

/** Filters, Airbnb style: groups of pills, then "Tout effacer" and "Afficher N avis" (the live count). */
export function FiltersB() {
  const t = useTranslations("Filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tb = useTranslations("VarianteB.filters");
  const { reviews, filters, setFilters, panel, setPanel } = useCertificate();
  const open = panel === "filters";
  const [draft, setDraft] = useState<ReviewFilters>(filters);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const results = useMemo(() => applyFilters(reviews, draft).length, [reviews, draft]);
  const close = () => setPanel(null);
  const toggle = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: JSON.stringify(current[key]) === JSON.stringify(value) ? undefined : value }));
  const toggleIn = <T extends Product | Criterion>(key: "products" | "criteria", value: T) =>
    setDraft((current) => {
      const list = current[key] as T[];
      return { ...current, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });

  return (
    <>
      <Sheet
        open={open}
        onClose={close}
        title={t("title")}
        closeLabel={t("close")}
        width={640}
        tall
        footer={
          <SheetFooter>
            <TextLink onClick={() => setDraft({ ...emptyFilters, collaboratorId: filters.collaboratorId })}>{tb("clear")}</TextLink>
            <Pill
              variant="dark"
              onClick={() => {
                setFilters(draft);
                close();
              }}
            >
              {tb("show", { count: formatCount(results) })}
            </Pill>
          </SheetFooter>
        }
      >
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
          <Group title={t("type")}>
            <ChoicePill selected={draft.type === "controle"} onClick={() => toggle("type", "controle")}>{t("typeControle")}</ChoicePill>
            <ChoicePill selected={draft.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{t("typeNonControle")}</ChoicePill>
          </Group>
          <Hairline />
          <Group title={t("source")}>
            <ChoicePill selected={draft.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChoicePill>
            <ChoicePill selected={draft.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChoicePill>
          </Group>
          <Hairline />
          <Group title={t("note")}>
            {notes.map((stars) => {
              const selected = draft.note?.stars === stars;
              return (
                <ChoicePill key={stars} selected={selected} onClick={() => setDraft((current) => ({ ...current, note: selected ? undefined : { stars, exact: false } }))}>
                  {stars === 5 ? "5" : `${stars}+`}
                  <StarRounded sx={{ fontSize: 18 }} />
                </ChoicePill>
              );
            })}
          </Group>
          <Hairline />
          <Group title={t("period")}>
            {periods.map((period) => (
              <ChoicePill key={period} selected={draft.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChoicePill>
            ))}
          </Group>
          <Hairline />
          <Group title={t("product")}>
            {products.map((product) => (
              <ChoicePill key={product} selected={draft.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChoicePill>
            ))}
          </Group>
          <Hairline />
          <Group title={t("criterion")}>
            {criteria.map((criterion) => (
              <ChoicePill key={criterion} selected={draft.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChoicePill>
            ))}
          </Group>
        </Box>
      </Sheet>

    </>
  );
}

/** Trier par: one tap applies and closes. */
export function SortB() {
  const t = useTranslations("ReviewSort");
  const ts = useTranslations("Sort");
  const { panel, setPanel, reviewSort, setReviewSort } = useCertificate();
  return (
    <Sheet open={panel === "sort"} onClose={() => setPanel(null)} title={ts("title")} closeLabel={ts("close")} width={460}>
      <Box role="radiogroup" aria-label={ts("title")} sx={{ p: 1.5, pb: "calc(16px + env(safe-area-inset-bottom))" }}>
        {sorts.map((value) => {
          const selected = value === reviewSort;
          return (
            <ButtonBase
              key={value}
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setReviewSort(value);
                setPanel(null);
              }}
              sx={{ width: "100%", justifyContent: "flex-start", gap: 2, px: 1.5, py: 1.25, minHeight: 60, borderRadius: "16px", textAlign: "left", bgcolor: selected ? b.sand : "transparent", "&:hover": { bgcolor: selected ? b.sand : b.ivory }, ...focusSx }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: selected ? 700 : 500 }}>{t(value)}</Typography>
                <Typography sx={{ fontSize: 13, color: b.muted }}>{t(`${value}Hint`)}</Typography>
              </Box>
              {selected && <CheckRounded />}
            </ButtonBase>
          );
        })}
      </Box>
    </Sheet>
  );
}
