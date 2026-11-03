"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CollaboratorPicker } from "@/variants/finale/components/certificate/CollaboratorPicker";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { HelpButton } from "./ReviewHelp";
import type { Criterion, Product } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, emptyFilters, type Period, type ReviewFilters, type ReviewSort } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";

/** Width of the desktop side sheet; the page moves left by as much while it is open. */
export const SIDE_SHEET_WIDTH = 420;

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];
const sorts: ReviewSort[] = ["recent", "oldest", "best", "worst", "useful", "verified"];

type HelpKey = "sort" | "type" | "source" | "note" | "period" | "product" | "criterion" | "collaborator";

const line = "#dce7f5";
const lineStrong = "#c0d5ed";
const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** True from 900 px: the filters and the sort open together in a side sheet. */
export function useSideSheet() {
  const { panel } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  return desktop && (panel === "filters" || panel === "sort");
}

/** A choice (layout from option G): an outlined pill, navy when selected. */
function ChoicePill({ selected, onClick, radio, children }: { selected: boolean; onClick: () => void; radio?: boolean; children: React.ReactNode }) {
  return (
    <ButtonBase
      role={radio ? "radio" : "checkbox"}
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

/** A section: its title with an ⓘ beside it, then its choices. */
function Group({ title, onHelp, radio, labelFor, children }: { title: string; onHelp: (anchor: HTMLElement) => void; radio?: boolean; labelFor?: string; children: React.ReactNode }) {
  const titleId = useId();
  return (
    <Box role={labelFor ? undefined : radio ? "radiogroup" : "group"} aria-labelledby={labelFor ? undefined : titleId}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography id={titleId} component={labelFor ? "label" : "h3"} htmlFor={labelFor} sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>
          {title}
        </Typography>
        <HelpButton title={title} onOpen={onHelp} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

const Hairline = () => <Box component="hr" sx={{ m: 0, border: 0, borderTop: `1px solid ${line}` }} />;

/** What a section means: a window under its ⓘ on desktop, a bottom sheet on phones (like the review details). */
function FilterHelp({ help, onClose }: { help: { key: HelpKey; anchor: HTMLElement } | null; onClose: () => void }) {
  const t = useTranslations("VarianteFinale.filters");
  const tr = useTranslations("VarianteFinale.reviews");
  const content = help ? (t.raw(`help.${help.key}`) as { title: string; items: { label: string; text: string }[] }) : null;
  return (
    <ResponsiveSheet open={Boolean(help)} onClose={onClose} title={content?.title ?? ""} closeLabel={tr("close")} anchorEl={help?.anchor} dropdownWidth={360} dropdownAlign="left">
      <Box component="dl" sx={{ m: 0, px: 1, py: 1 }}>
        {content?.items.map((item) => (
          <Box key={item.label} sx={{ px: 1, py: 1.25 }}>
            <Typography component="dt" sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce }}>{item.label}</Typography>
            <Typography component="dd" sx={{ m: 0, mt: 0.25, fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce, opacity: 0.85 }}>{item.text}</Typography>
          </Box>
        ))}
      </Box>
    </ResponsiveSheet>
  );
}

/**
 * Filters (layout from option G). Desktop: a side sheet from the right with Trier par first, the page moving left beside it.
 * Phones: a bottom sheet. Every choice shows at once in the list as a preview; "Afficher N avis" keeps it, the X undoes it.
 */
export function FiltersSheet() {
  const t = useTranslations("Filters");
  const tv = useTranslations("VarianteFinale.filters");
  const tsort = useTranslations("VarianteFinale.reviews.sortShort");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { reviews, filters, setFilters, reviewSort, setReviewSort, panel, setPanel, team, scoreView } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const open = panel === "filters" || (desktop && panel === "sort");
  const [saved, setSaved] = useState({ filters, reviewSort });
  const [wasOpen, setWasOpen] = useState(open);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [help, setHelp] = useState<{ key: HelpKey; anchor: HTMLElement } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Remember the choices from before the sheet opened, so the X can bring them back.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSaved({ filters, reviewSort });
  }

  const keep = () => setPanel(null);
  const cancel = () => {
    setFilters(saved.filters);
    setReviewSort(saved.reviewSort);
    setPanel(null);
  };
  const cancelRef = useRef(cancel);
  useEffect(() => {
    cancelRef.current = cancel;
  });

  // Desktop sheet: focus goes to the close button, Échap closes (undoing), and focus returns to the button that opened it.
  useEffect(() => {
    if (!open || !desktop) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector(".MuiPopover-root, .MuiDialog-root")) cancelRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, desktop]);

  const results = applyFilters(reviews, filters).length;
  const update = (patch: Partial<ReviewFilters>) => setFilters({ ...filters, ...patch });
  const toggle = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) =>
    update({ [key]: JSON.stringify(filters[key]) === JSON.stringify(value) ? undefined : value } as Partial<ReviewFilters>);
  const toggleIn = <T extends Product | Criterion>(key: "products" | "criteria", value: T) => {
    const list = filters[key] as T[];
    update({ [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] } as Partial<ReviewFilters>);
  };
  const noteSelected = (stars: StarBucket) => filters.note?.stars === stars && !filters.note.exact;
  const person = team.find((member) => member.id === filters.collaboratorId);
  const openHelp = (key: HelpKey) => (anchor: HTMLElement) => setHelp({ key, anchor });

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: desktop ? "100%" : "auto", maxHeight: desktop ? "none" : "92dvh", bgcolor: tokens.blanc, color: tokens.bleuFonce }}>
      {!desktop && (
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: lineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr) 48px", alignItems: "center", gap: 1, px: 1.5, py: 1, minHeight: 60, borderBottom: `1px solid ${line}`, flexShrink: 0 }}>
        <IconButton ref={closeRef} onClick={cancel} aria-label={t("close")} sx={{ width: 44, height: 44, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}>
          <CloseRounded />
        </IconButton>
        <Typography id={titleId} component="h2" sx={{ textAlign: "center", fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
          {t("title")}
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>
        <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Desktop: the sort lives in the same sheet, first. Phones keep their own Trier par sheet. */}
          {desktop && (
            <>
              <Group title={tv("sortTitle")} onHelp={openHelp("sort")} radio>
                {sorts.map((sort) => (
                  <ChoicePill key={sort} radio selected={reviewSort === sort} onClick={() => setReviewSort(sort)}>{tsort(sort)}</ChoicePill>
                ))}
              </Group>
              <Hairline />
            </>
          )}
          <Group title={t("type")} onHelp={openHelp("type")}>
            <ChoicePill selected={filters.type === "controle"} onClick={() => toggle("type", "controle")}>{t("typeControle")}</ChoicePill>
            <ChoicePill selected={filters.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{t("typeNonControle")}</ChoicePill>
          </Group>
          <Hairline />
          <Group title={t("source")} onHelp={openHelp("source")}>
            <ChoicePill selected={filters.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChoicePill>
            <ChoicePill selected={filters.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChoicePill>
          </Group>
          <Hairline />
          <Group title={t("note")} onHelp={openHelp("note")}>
            {notes.map((stars) => (
              <ChoicePill key={stars} selected={noteSelected(stars)} onClick={() => update({ note: noteSelected(stars) ? undefined : { stars, exact: false } })}>
                {stars === 5 ? "5" : `${stars}+`}
                <StarRounded sx={{ fontSize: 18 }} />
              </ChoicePill>
            ))}
          </Group>
          <Hairline />
          <Group title={t("period")} onHelp={openHelp("period")}>
            {periods.map((period) => (
              <ChoicePill key={period} selected={filters.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChoicePill>
            ))}
          </Group>
          <Hairline />
          <Group title={t("product")} onHelp={openHelp("product")}>
            {products.map((product) => (
              <ChoicePill key={product} selected={filters.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChoicePill>
            ))}
          </Group>
          <Hairline />
          <Group title={t("criterion")} onHelp={openHelp("criterion")}>
            {criteria.map((criterion) => (
              <ChoicePill key={criterion} selected={filters.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChoicePill>
            ))}
          </Group>
          <Hairline />
          {/* Collaborateur: opens the team picker over the filters. */}
          <Group title={t("collaborator")} onHelp={openHelp("collaborator")} labelFor="filter-collaborator">
            <ButtonBase
              id="filter-collaborator"
              onClick={() => setPickerOpen(true)}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              sx={{
                width: "100%",
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
          </Group>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2.5, py: 1.75, pb: "calc(14px + env(safe-area-inset-bottom))", borderTop: `1px solid ${line}`, flexShrink: 0 }}>
        <ButtonBase
          onClick={() => setFilters({ ...emptyFilters, query: filters.query })}
          sx={{ minHeight: 44, px: 0.5, borderRadius: "4px", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, textDecoration: "underline", textUnderlineOffset: "3px", "&:hover": { textDecorationThickness: "2px" }, ...focusSx }}
        >
          {tv("clear")}
        </ButtonBase>
        <ButtonBase
          onClick={keep}
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
        // No dark overlay: the page stays visible (moved left) and updates with every choice. Mounted only while open.
        <Slide in={open} direction="left" mountOnEnter unmountOnExit>
          <Paper
            role="dialog"
            aria-labelledby={titleId}
            square
            elevation={0}
            sx={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: SIDE_SHEET_WIDTH,
              maxWidth: "100vw",
              zIndex: (theme) => theme.zIndex.drawer,
              borderLeft: `1px solid ${line}`,
              boxShadow: "-12px 0 40px rgba(4, 27, 68, 0.12)",
              overflow: "hidden",
            }}
          >
            {body}
          </Paper>
        </Slide>
      ) : (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={cancel}
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

      <FilterHelp help={help} onClose={() => setHelp(null)} />
      {/* Phones: a second sheet over the filters. Desktop: a window over the filters. */}
      <CollaboratorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={filters.collaboratorId}
        onSelect={(id) => update({ collaboratorId: id })}
        view={scoreView}
      />
    </>
  );
}
