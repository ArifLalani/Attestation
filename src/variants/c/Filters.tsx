"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import RestartAlt from "@mui/icons-material/RestartAlt";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import type { Criterion, Product } from "@/data/types";
import { countActiveFilters, emptyFilters, sameFilters, type Period, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { ChipC, Pill, Sheet } from "./ui";
import { focusRing, pc } from "./theme";

export const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
export const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];
export const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Typography component="legend" sx={{ p: 0, mb: 1.25, fontSize: 15, fontWeight: 700 }}>{title}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

/** All the review filters. Edits a draft; "Appliquer les filtres (n)" commits it. */
export function FiltersSheetC() {
  const t = useTranslations("Filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const tv = useTranslations("VarianteC");
  const { filters, setFilters, panel, setPanel } = useCertificate();
  const open = panel === "filters";
  const [draft, setDraft] = useState<ReviewFilters>(filters);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(filters);
  }

  const close = () => setPanel(null);
  const toggle = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) =>
    setDraft((current) => ({ ...current, [key]: JSON.stringify(current[key]) === JSON.stringify(value) ? undefined : value }));
  const toggleIn = <T extends Product | Criterion>(key: "products" | "criteria", value: T) =>
    setDraft((current) => {
      const list = current[key] as T[];
      return { ...current, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });
  const changed = !sameFilters(draft, filters);
  const count = countActiveFilters(draft);

  return (
    <>
      <Sheet
        open={open}
        onClose={close}
        title={t("title")}
        closeLabel={t("close")}
        width={560}
        actions={
          <Pill tone="text" onClick={() => setDraft({ ...emptyFilters, collaboratorId: filters.collaboratorId, query: filters.query })} startIcon={<RestartAlt />} disabled={!countActiveFilters(draft)} sx={{ "&.Mui-disabled": { bgcolor: "transparent" } }}>
            {t("reset")}
          </Pill>
        }
        footer={
          <Pill
            fullWidth
            disabled={!changed}
            onClick={() => {
              setFilters(draft);
              close();
            }}
          >
            {count ? t("applyCount", { count }) : t("apply")}
          </Pill>
        }
      >
        <Box sx={{ px: 3, pt: 1, pb: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Group title={t("type")}>
            <ChipC tone="emerald" selected={draft.type === "controle"} onClick={() => toggle("type", "controle")}>{t("typeControle")}</ChipC>
            <ChipC selected={draft.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{t("typeNonControle")}</ChipC>
          </Group>
          <Group title={t("source")}>
            <ChipC selected={draft.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChipC>
            <ChipC selected={draft.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChipC>
          </Group>
          <Group title={t("note")}>
            {notes.map((stars) => (
              <ChipC
                key={stars}
                selected={draft.note?.stars === stars}
                onClick={() => toggle("note", { stars, exact: false })}
                ariaLabel={tv(stars === 5 ? "noteExactAria" : "noteAtLeastAria", { stars })}
              >
                {stars === 5 ? "5" : `${stars}+`}
                <StarRounded sx={{ color: pc.star, ml: -0.5 }} />
              </ChipC>
            ))}
          </Group>
          <Group title={t("period")}>
            {periods.map((period) => (
              <ChipC key={period} selected={draft.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChipC>
            ))}
          </Group>
          <Group title={t("product")}>
            {products.map((product) => (
              <ChipC key={product} selected={draft.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChipC>
            ))}
          </Group>
          <Group title={t("criterion")}>
            {criteria.map((criterion) => (
              <ChipC key={criterion} selected={draft.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChipC>
            ))}
          </Group>
        </Box>
      </Sheet>

    </>
  );
}

/** "Trier par": a menu under the button on desktop, a sheet on phones. */
export function SortControl({ anchorEl, onClose }: { anchorEl: HTMLElement | null; onClose: () => void }) {
  const t = useTranslations("ReviewSort");
  const ts = useTranslations("Sort");
  const { reviewSort, setReviewSort, panel, setPanel } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const open = panel === "sort";
  const close = () => {
    setPanel(null);
    onClose();
  };
  const choose = (value: ReviewSort) => {
    setReviewSort(value);
    close();
  };

  if (desktop) {
    return (
      <Menu open={open && Boolean(anchorEl)} anchorEl={anchorEl} onClose={close} slotProps={{ paper: { sx: { width: 320, mt: 1 } }, list: { "aria-label": ts("title") } }}>
        {sorts.map((value) => (
          <MenuItem key={value} selected={value === reviewSort} onClick={() => choose(value)} sx={{ gap: 1.5, py: 1.25, alignItems: "flex-start", "&.Mui-selected": { bgcolor: pc.indigoSoft } }}>
            <Box sx={{ width: 20, pt: 0.25, color: pc.indigo }}>{value === reviewSort && <Check fontSize="small" />}</Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{t(value)}</Typography>
              <Typography sx={{ fontSize: 13, color: pc.muted, whiteSpace: "normal" }}>{t(`${value}Hint`)}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    );
  }

  return (
    <Sheet open={open} onClose={close} title={ts("title")} closeLabel={ts("close")}>
      <Box component="ul" role="listbox" aria-label={ts("title")} sx={{ listStyle: "none", m: 0, p: 0, pb: 2 }}>
        {sorts.map((value) => (
          <li key={value}>
            <ButtonBase role="option" aria-selected={value === reviewSort} onClick={() => choose(value)} sx={{ width: "100%", justifyContent: "flex-start", gap: 1.5, px: 3, py: 1.5, minHeight: 56, textAlign: "left", bgcolor: value === reviewSort ? pc.indigoSoft : "transparent" }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t(value)}</Typography>
                <Typography sx={{ fontSize: 13, color: pc.muted }}>{t(`${value}Hint`)}</Typography>
              </Box>
              {value === reviewSort && <Check sx={{ color: pc.indigo }} />}
            </ButtonBase>
          </li>
        ))}
      </Box>
    </Sheet>
  );
}

/** One removable tonal chip per active filter. */
export function ActiveFilters() {
  const t = useTranslations("Filters");
  const tr = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { filters, setFilters, team } = useCertificate();
  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const chips: { key: string; text: string; remove: () => void; avatar?: React.ReactNode; emerald?: boolean }[] = [];

  if (filters.type) chips.push({ key: "type", text: t(filters.type === "controle" ? "chip.controle" : "chip.nonControle"), remove: () => update({ type: undefined }), emerald: filters.type === "controle" });
  if (filters.source) chips.push({ key: "source", text: t(filters.source === "opinion_system" ? "sourceOs" : "sourceImported"), remove: () => update({ source: undefined }) });
  if (filters.note) {
    const { stars, exact } = filters.note;
    chips.push({ key: "note", text: exact || stars === 5 ? `${stars} ★` : `${stars}+ ★`, remove: () => update({ note: undefined }) });
  }
  if (filters.period) chips.push({ key: "period", text: t(`periods.${filters.period}`), remove: () => update({ period: undefined }) });
  for (const product of filters.products) chips.push({ key: `p-${product}`, text: tp(product), remove: () => update({ products: filters.products.filter((p) => p !== product) }) });
  for (const criterion of filters.criteria) chips.push({ key: `c-${criterion}`, text: tc(criterion), remove: () => update({ criteria: filters.criteria.filter((c) => c !== criterion) }) });
  const person = team.find((member) => member.id === filters.collaboratorId);
  if (person) chips.push({ key: "collaborator", text: person.name, avatar: <StaffAvatar person={person} size={24} />, remove: () => update({ collaboratorId: undefined }) });

  if (!chips.length) return null;
  return (
    <Box sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, py: 0.25 }}>
      {chips.map((chip) => (
        <ButtonBase
          key={chip.key}
          onClick={chip.remove}
          aria-label={tr("removeFilter", { label: chip.text })}
          sx={{ flexShrink: 0, height: 36, gap: 0.75, pl: chip.avatar ? 0.5 : 1.5, pr: 1, borderRadius: "10px", bgcolor: chip.emerald ? pc.emeraldTint : pc.indigoTonal, color: chip.emerald ? pc.emeraldText : pc.indigoDark, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", "&:hover": { filter: "brightness(0.97)" }, "&.Mui-focusVisible": focusRing }}
        >
          {chip.avatar}
          {chip.text}
          <Close sx={{ fontSize: 16 }} />
        </ButtonBase>
      ))}
    </Box>
  );
}
