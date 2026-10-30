"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CollaboratorPicker } from "@/components/certificate/CollaboratorPicker";
import { CtaButton } from "@/components/ui/CtaButton";
import { ChoiceChip, StarLabel } from "@/components/ui/FilterChip";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import type { Criterion, Product } from "@/data/types";
import { countActiveFilters, emptyFilters, sameFilters, type Period, type ReviewFilters } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography component="legend" sx={{ p: 0, mb: 1, fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{children}</Box>
    </Box>
  );
}

/** Figma "Filters Sheet" (580:62862). Edits a draft; "Appliquer les filtres (n)" commits it. */
export function FiltersSheet() {
  const t = useTranslations("Filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { filters, setFilters, panel, setPanel, panelAnchor, team, scoreView } = useCertificate();
  const open = panel === "filters";
  const [draft, setDraft] = useState<ReviewFilters>(filters);
  const [wasOpen, setWasOpen] = useState(open);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collaboratorEl, setCollaboratorEl] = useState<HTMLButtonElement | null>(null);

  // Start from the applied filters each time the panel opens.
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
  const noteSelected = (stars: StarBucket) => draft.note?.stars === stars;
  const person = team.find((member) => member.id === draft.collaboratorId);

  return (
    <>
      <ResponsiveSheet
        open={open}
        onClose={close}
        anchorEl={panelAnchor}
        dropdownWidth={440}
        title={t("title")}
        closeLabel={t("close")}
        actions={
          <ButtonBase onClick={() => setDraft({ ...emptyFilters, query: filters.query })} sx={{ px: 3, gap: 0, borderRadius: "8px", fontSize: 16, fontWeight: 600, color: tokens.bleuFonce }}>
            <Box sx={{ p: 0.5, display: "flex" }}>
              <FigmaIcon name="reset" />
            </Box>
            {t("reset")}
          </ButtonBase>
        }
        footer={
          <Box sx={{ bgcolor: tokens.blanc, boxShadow: "0px -2px 6px rgba(0,0,0,0.08)", pt: 2.5, px: 2, pb: 2, flexShrink: 0 }}>
            <CtaButton
              disabled={!changed}
              onClick={() => {
                setFilters(draft);
                close();
              }}
            >
              {count ? t("applyCount", { count }) : t("apply")}
            </CtaButton>
          </Box>
        }
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Group title={t("type")}>
            <ChoiceChip selected={draft.type === "controle"} onClick={() => toggle("type", "controle")}>
              {t("typeControle")}
            </ChoiceChip>
            <ChoiceChip selected={draft.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>
              {t("typeNonControle")}
            </ChoiceChip>
          </Group>

          <Group title={t("source")}>
            <ChoiceChip selected={draft.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>
              {t("sourceOs")}
            </ChoiceChip>
            <ChoiceChip selected={draft.source === "imported"} onClick={() => toggle("source", "imported")}>
              {t("sourceImported")}
            </ChoiceChip>
          </Group>

          <Group title={t("note")}>
            {notes.map((stars) => (
              <ChoiceChip
                key={stars}
                selected={noteSelected(stars)}
                onClick={() => setDraft((current) => ({ ...current, note: noteSelected(stars) ? undefined : { stars, exact: false } }))}
              >
                <StarLabel prefix={stars === 5 ? "5" : `>${stars}`} />
              </ChoiceChip>
            ))}
          </Group>

          <Group title={t("period")}>
            {periods.map((period) => (
              <ChoiceChip key={period} selected={draft.period === period} onClick={() => toggle("period", period)}>
                {t(`periods.${period}`)}
              </ChoiceChip>
            ))}
          </Group>

          <Group title={t("product")}>
            {products.map((product) => (
              <ChoiceChip key={product} selected={draft.products.includes(product)} onClick={() => toggleIn("products", product)}>
                {tp(product)}
              </ChoiceChip>
            ))}
          </Group>

          <Group title={t("criterion")}>
            {criteria.map((criterion) => (
              <ChoiceChip key={criterion} selected={draft.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>
                {tc(criterion)}
              </ChoiceChip>
            ))}
          </Group>

          {/* Figma "Collaborateur" (1395:92356): lets a collaborator removed from the chips be chosen again. */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography component="label" htmlFor="filter-collaborator" sx={{ fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
              {t("collaborator")}
            </Typography>
            <ButtonBase
              id="filter-collaborator"
              ref={setCollaboratorEl}
              onClick={() => setPickerOpen(true)}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              sx={{
                justifyContent: "flex-start",
                gap: 1,
                px: 2,
                py: person ? 0.5 : 1.5,
                minHeight: 45,
                bgcolor: tokens.blanc,
                border: `1px solid ${tokens.grisMoyen1}`,
                borderRadius: "8px",
                textAlign: "left",
                "&:hover": { borderColor: tokens.bleu30 },
              }}
            >
              {person && <StaffAvatar person={person} />}
              <Typography component="span" sx={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                {person ? person.name : t("wholeTeam")}
              </Typography>
              <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} />
            </ButtonBase>
          </Box>
        </Box>
      </ResponsiveSheet>

      {/* Phones: a second sheet over the filters. Desktop: a dropdown under the field. */}
      <CollaboratorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={draft.collaboratorId}
        onSelect={(id) => setDraft((current) => ({ ...current, collaboratorId: id }))}
        view={scoreView}
        anchorEl={pickerOpen ? collaboratorEl : null}
      />
    </>
  );
}
