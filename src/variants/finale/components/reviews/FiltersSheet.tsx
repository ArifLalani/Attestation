"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CollaboratorPicker } from "@/variants/finale/components/certificate/CollaboratorPicker";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import type { Criterion, Product } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, emptyFilters, type Period, type ReviewFilters } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];

const line = "#dce7f5";
const lineStrong = "#c0d5ed";
const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** A choice (layout from option G): an outlined pill, navy when selected. */
function ChoicePill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <ButtonBase
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      sx={{
        minHeight: 44,
        px: 2,
        gap: 0.5,
        borderRadius: 999,
        fontFamily: "inherit",
        fontSize: 15,
        fontWeight: selected ? 600 : 500,
        color: selected ? tokens.blanc : tokens.bleuFonce,
        bgcolor: selected ? tokens.bleuFonce : tokens.blanc,
        boxShadow: `inset 0 0 0 1px ${selected ? tokens.bleuFonce : lineStrong}`,
        transition: "background-color 150ms ease, box-shadow 150ms ease",
        "&:hover": { boxShadow: `inset 0 0 0 ${selected ? 1 : 2}px ${tokens.bleuFonce}` },
        ...focusSx,
      }}
    >
      {children}
    </ButtonBase>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
      <Typography component="legend" sx={{ p: 0, mb: 1.5, fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

const Hairline = () => <Box component="hr" sx={{ m: 0, border: 0, borderTop: `1px solid ${line}` }} />;

/**
 * Filters (layout from option G): a centred window on desktop, a bottom sheet on phones; close on the left,
 * groups of pills split by rules, then "Tout effacer" and "Afficher N avis" with the live count. Edits a draft until applied.
 */
export function FiltersSheet() {
  const t = useTranslations("Filters");
  const tv = useTranslations("VarianteFinale.filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { reviews, filters, setFilters, panel, setPanel, team, scoreView } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const open = panel === "filters";
  const [draft, setDraft] = useState<ReviewFilters>(filters);
  const [wasOpen, setWasOpen] = useState(open);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Start from the applied filters each time the panel opens.
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
  const noteSelected = (stars: StarBucket) => draft.note?.stars === stars;
  const person = team.find((member) => member.id === draft.collaboratorId);

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: desktop ? "min(86vh, 820px)" : "auto", maxHeight: desktop ? "min(86vh, 820px)" : "92dvh", bgcolor: tokens.blanc, color: tokens.bleuFonce }}>
      {!desktop && (
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: lineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr) 48px", alignItems: "center", gap: 1, px: 1.5, py: 1, minHeight: 60, borderBottom: `1px solid ${line}`, flexShrink: 0 }}>
        <IconButton onClick={close} aria-label={t("close")} sx={{ width: 44, height: 44, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}>
          <CloseRounded />
        </IconButton>
        <Typography id={titleId} component="h2" sx={{ textAlign: "center", fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
          {t("title")}
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>
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
            {notes.map((stars) => (
              <ChoicePill key={stars} selected={noteSelected(stars)} onClick={() => setDraft((current) => ({ ...current, note: noteSelected(stars) ? undefined : { stars, exact: false } }))}>
                {stars === 5 ? "5" : `${stars}+`}
                <StarRounded sx={{ fontSize: 18 }} />
              </ChoicePill>
            ))}
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
          <Hairline />
          {/* Collaborateur: opens the team picker over the filters. */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography component="label" htmlFor="filter-collaborator" sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>
              {t("collaborator")}
            </Typography>
            <ButtonBase
              id="filter-collaborator"
              onClick={() => setPickerOpen(true)}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              sx={{
                justifyContent: "flex-start",
                gap: 1.25,
                pl: person ? 0.75 : 2,
                pr: 1.5,
                minHeight: 52,
                borderRadius: 999,
                boxShadow: `inset 0 0 0 1px ${lineStrong}`,
                textAlign: "left",
                "&:hover": { boxShadow: `inset 0 0 0 2px ${tokens.bleuFonce}` },
                ...focusSx,
              }}
            >
              {person && <StaffAvatar person={person} />}
              <Typography component="span" sx={{ flex: 1, fontSize: 15, fontWeight: 600, color: tokens.bleuFonce }}>
                {person ? person.name : t("wholeTeam")}
              </Typography>
              <ChevronRightRounded sx={{ color: tokens.bleuFonce }} />
            </ButtonBase>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2.5, py: 1.75, pb: "calc(14px + env(safe-area-inset-bottom))", borderTop: `1px solid ${line}`, flexShrink: 0 }}>
        <ButtonBase
          onClick={() => setDraft({ ...emptyFilters, query: filters.query })}
          sx={{ minHeight: 44, px: 0.5, borderRadius: "4px", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, textDecoration: "underline", textUnderlineOffset: "3px", "&:hover": { textDecorationThickness: "2px" }, ...focusSx }}
        >
          {tv("clear")}
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setFilters(draft);
            close();
          }}
          sx={{ minHeight: 48, px: 3, borderRadius: 999, fontFamily: "inherit", fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", bgcolor: tokens.bleuFonce, color: tokens.blanc, "&:hover": { bgcolor: "#000" }, ...focusSx }}
        >
          {tv("show", { count: formatCount(results) })}
        </ButtonBase>
      </Box>
    </Box>
  );

  return (
    <>
      {desktop ? (
        <Dialog
          open={open}
          onClose={close}
          aria-labelledby={titleId}
          maxWidth={false}
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.45)" } },
            paper: { sx: { width: 640, maxWidth: "calc(100vw - 48px)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } },
          }}
        >
          {body}
        </Dialog>
      ) : (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={close}
          onOpen={() => {}}
          disableSwipeToOpen
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.45)" } },
            paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxWidth: 720, mx: "auto" } },
          }}
        >
          {body}
        </SwipeableDrawer>
      )}

      {/* Phones: a second sheet over the filters. Desktop: a window over the filters. */}
      <CollaboratorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={draft.collaboratorId}
        onSelect={(id) => setDraft((current) => ({ ...current, collaboratorId: id }))}
        view={scoreView}
      />
    </>
  );
}
