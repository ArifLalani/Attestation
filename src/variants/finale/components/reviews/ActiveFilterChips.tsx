"use client";

import Box from "@mui/material/Box";
import { useTranslations } from "next-intl";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ActiveChip, StarLabel } from "@/variants/finale/components/ui/FilterChip";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import type { Product } from "@/data/types";
import type { ReviewFilters } from "@/lib/reviewFilters";

/** Shown as quick chips under the search (layout from option E). */
export const quickProducts: Product[] = ["vente", "achat", "location", "gestion_locative"];

/**
 * One removable chip per active filter, under the toolbar (Figma "Chips").
 * `hideQuick`: leave out the filters the quick chips already show (Contrôlés, Cette année, the four projects).
 */
export function ActiveFilterChips({ hideQuick = false }: { hideQuick?: boolean } = {}) {
  const t = useTranslations("Filters");
  const tr = useTranslations("Reviews");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { filters, setFilters, team } = useCertificate();

  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const chips: { key: string; label: React.ReactNode; text: string; remove: () => void; avatar?: React.ReactNode }[] = [];

  if (filters.type && !(hideQuick && filters.type === "controle")) {
    const text = t(filters.type === "controle" ? "chip.controle" : "chip.nonControle");
    chips.push({ key: "type", label: text, text, remove: () => update({ type: undefined }) });
  }
  if (filters.source) {
    const text = t(filters.source === "opinion_system" ? "sourceOs" : "sourceImported");
    chips.push({ key: "source", label: text, text, remove: () => update({ source: undefined }) });
  }
  if (filters.note) {
    const { stars, exact } = filters.note;
    const prefix = exact || stars === 5 ? `${stars} ` : `>${stars}`;
    chips.push({ key: "note", label: <StarLabel prefix={prefix} />, text: `${prefix}★`, remove: () => update({ note: undefined }) });
  }
  if (filters.period && !(hideQuick && filters.period === "year")) {
    const text = t(`periods.${filters.period}`);
    chips.push({ key: "period", label: text, text, remove: () => update({ period: undefined }) });
  }
  for (const product of filters.products.filter((item) => !hideQuick || !quickProducts.includes(item))) {
    const text = tp(product);
    chips.push({ key: `p-${product}`, label: text, text, remove: () => update({ products: filters.products.filter((p) => p !== product) }) });
  }
  for (const criterion of filters.criteria) {
    const text = tc(criterion);
    chips.push({ key: `c-${criterion}`, label: text, text, remove: () => update({ criteria: filters.criteria.filter((c) => c !== criterion) }) });
  }
  const person = team.find((member) => member.id === filters.collaboratorId);
  if (person) {
    chips.push({
      key: "collaborator",
      label: person.name,
      text: person.name,
      avatar: <StaffAvatar person={person} size={24} />,
      remove: () => update({ collaboratorId: undefined }),
    });
  }

  if (!chips.length) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {chips.map((chip) => (
        <ActiveChip key={chip.key} label={chip.label} avatar={chip.avatar} onRemove={chip.remove} removeLabel={tr("removeFilter", { label: chip.text })} />
      ))}
    </Box>
  );
}
