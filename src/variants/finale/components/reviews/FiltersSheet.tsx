"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CollaboratorPicker, useCollaboratorChooser } from "@/variants/finale/components/certificate/CollaboratorPicker";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { ChoiceChip, StarLabel } from "@/variants/finale/components/ui/FilterChip";
import { StaffAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { HelpButton } from "./ReviewHelp";
import type { Criterion, Product } from "@/data/types";
import { formatCount } from "@/lib/format";
import { applyFilters, emptyFilters, type Period, type ReviewFilters } from "@/lib/reviewFilters";
import type { StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";

/** Width of the desktop side sheet. */
const SIDE_SHEET_WIDTH = 440;

const products: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const criteria: Criterion[] = ["accueil", "conseil", "competence", "reactivite", "suivi", "transparence", "honoraires"];
const periods: Period[] = ["today", "week", "month", "year"];
const notes: StarBucket[] = [5, 4, 3, 2, 1];

// Only Type, Source, Produit and Critère have an ⓘ: Collaborateur, Note and Période speak for themselves.
type HelpKey = "type" | "source" | "product" | "criterion";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** A section (Actuel look): a 16 px title, with an ⓘ beside it when the section needs explaining, then the small chips. */
function Group({ title, onHelp, radio, labelFor, children }: { title: string; onHelp?: (anchor: HTMLElement) => void; radio?: boolean; labelFor?: string; children: React.ReactNode }) {
  const titleId = useId();
  return (
    <Box role={labelFor ? undefined : radio ? "radiogroup" : "group"} aria-labelledby={labelFor ? undefined : titleId}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
        <Typography id={titleId} component={labelFor ? "label" : "h3"} htmlFor={labelFor} sx={{ fontSize: 16, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
          {title}
        </Typography>
        {onHelp && <HelpButton title={title} onOpen={onHelp} />}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{children}</Box>
    </Box>
  );
}

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
 * Filters in the Actuel look (grey chips, Réinitialiser, a yellow button). Desktop: a side sheet from the right, over the page
 * (Trier par has its own). Phones: a bottom sheet. Every choice shows at once in the list as a preview;
 * "Afficher N avis" keeps it, the X undoes it.
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
  const [saved, setSaved] = useState(filters);
  const [wasOpen, setWasOpen] = useState(open);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Desktop: the team list is a second page of the side sheet, sliding in from the right ("← Collaborateur").
  const [page, setPage] = useState<"filters" | "team">("filters");
  const backRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);
  const shownPage = useRef(page);
  const [help, setHelp] = useState<{ key: HelpKey; anchor: HTMLElement } | null>(null);

  // Remember the choices from before the sheet opened, so the X can bring them back.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSaved(filters);
      setPage("filters");
    }
  }

  const keep = () => setPanel(null);
  const cancel = () => {
    setFilters(saved);
    setPanel(null);
  };

  // Focus follows the page: the back arrow on the team page, the Collaborateur field when coming back.
  useEffect(() => {
    if (shownPage.current === page) return;
    shownPage.current = page;
    // preventScroll: otherwise the browser scrolls the sliding track sideways to reach the button.
    (page === "team" ? backRef.current : fieldRef.current)?.focus({ preventScroll: true });
  }, [page]);

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
  const chooser = useCollaboratorChooser({
    selectedId: filters.collaboratorId,
    view: scoreView,
    onChoose: (id) => {
      update({ collaboratorId: id });
      setPage("filters");
    },
  });

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: desktop ? "100%" : "auto", maxHeight: desktop ? "none" : "92dvh", bgcolor: tokens.blanc, color: tokens.bleuFonce }}>
      {!desktop && (
        <Box sx={{ bgcolor: tokens.grisClair1, py: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 60, height: 5, borderRadius: 2.5, bgcolor: tokens.grisMoyen1 }} />
        </Box>
      )}
      {/* Title bar (Actuel): Filtres, Réinitialiser, then the X. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0 }}>
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 20, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
          {t("title")}
        </Typography>
        <ButtonBase
          onClick={() => setFilters({ ...emptyFilters, query: filters.query })}
          sx={{ px: 1.5, minHeight: 36, borderRadius: "8px", fontSize: 16, fontWeight: 600, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}
        >
          <Box sx={{ p: 0.5, display: "flex" }}>
            <FigmaIcon name="reset" />
          </Box>
          {t("reset")}
        </ButtonBase>
        <IconButton onClick={cancel} aria-label={t("close")} sx={{ p: 1.5, m: -1, ...focusSx }}>
          <FigmaIcon name="close" />
        </IconButton>
      </Box>

      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Collaborateur first: opens the team picker over the filters. */}
          <Group title={t("collaborator")} labelFor="filter-collaborator">
            <ButtonBase
              id="filter-collaborator"
              ref={fieldRef}
              onClick={() => (desktop ? setPage("team") : setPickerOpen(true))}
              aria-haspopup={desktop ? undefined : "listbox"}
              aria-expanded={desktop ? undefined : pickerOpen}
              sx={{
                width: "100%",
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
                ...focusSx,
              }}
            >
              {person && <StaffAvatar person={person} />}
              <Typography component="span" sx={{ flex: 1, fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                {person ? person.name : t("wholeTeam")}
              </Typography>
              <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} />
            </ButtonBase>
          </Group>
          <Group title={t("type")} onHelp={openHelp("type")}>
            <ChoiceChip selected={filters.type === "controle"} onClick={() => toggle("type", "controle")}>{tv("typeControle")}</ChoiceChip>
            <ChoiceChip selected={filters.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{tv("typeNonControle")}</ChoiceChip>
          </Group>
          <Group title={t("source")} onHelp={openHelp("source")}>
            <ChoiceChip selected={filters.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChoiceChip>
            <ChoiceChip selected={filters.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChoiceChip>
          </Group>
          <Group title={t("note")}>
            {notes.map((stars) => (
              <ChoiceChip key={stars} selected={noteSelected(stars)} onClick={() => update({ note: noteSelected(stars) ? undefined : { stars, exact: false } })}>
                <StarLabel prefix={stars === 5 ? "5" : `${stars}+`} />
              </ChoiceChip>
            ))}
          </Group>
          <Group title={t("period")}>
            {periods.map((period) => (
              <ChoiceChip key={period} selected={filters.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChoiceChip>
            ))}
          </Group>
          <Group title={t("product")} onHelp={openHelp("product")}>
            {products.map((product) => (
              <ChoiceChip key={product} selected={filters.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChoiceChip>
            ))}
          </Group>
          <Group title={t("criterion")} onHelp={openHelp("criterion")}>
            {criteria.map((criterion) => (
              <ChoiceChip key={criterion} selected={filters.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChoiceChip>
            ))}
          </Group>
        </Box>
      </Box>

      {/* Footer (Actuel): the yellow button, with the live count; it keeps the choices. */}
      <Box sx={{ bgcolor: tokens.blanc, boxShadow: "0px -2px 6px rgba(0,0,0,0.08)", pt: 2.5, px: 2, pb: "calc(16px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
        <CtaButton onClick={keep}>{tv("show", { count: formatCount(results) })}</CtaButton>
      </Box>
    </Box>
  );

  // Desktop second page: back arrow and title, then the same search, sort chips and list as the team picker elsewhere.
  const teamPage = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: tokens.blanc, color: tokens.bleuFonce }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 1.5, minHeight: 61, borderBottom: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0 }}>
        <IconButton ref={backRef} onClick={() => setPage("filters")} aria-label={tv("backToFilters")} sx={{ color: tokens.bleuFonce, ...focusSx }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, lineHeight: "normal" }}>
          {t("collaborator")}
        </Typography>
      </Box>
      {chooser.header}
      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>{chooser.list}</Box>
    </Box>
  );

  return (
    <>
      {desktop ? (
        // Over the page with a light backdrop, so the list behind stays readable as it updates.
        <Drawer
          anchor="right"
          open={open}
          // Échap on the team page goes back to the filters; otherwise it closes (undoing), like the X and the backdrop.
          onClose={(_event, reason) => (reason === "escapeKeyDown" && page === "team" ? setPage("filters") : cancel())}
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.18)" } },
            paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: SIDE_SHEET_WIDTH, maxWidth: "100vw", boxShadow: "-12px 0 40px rgba(4, 27, 68, 0.16)", overflow: "hidden" } },
          }}
        >
          <Box sx={{ height: "100%", overflow: "hidden" }}>
            <Box sx={{ display: "flex", width: "200%", height: "100%", transform: page === "team" ? "translateX(-50%)" : "none", transition: "transform 260ms cubic-bezier(0.2, 0, 0, 1)" }}>
              <Box inert={page !== "filters"} sx={{ flex: "0 0 50%", minWidth: 0, height: "100%" }}>{body}</Box>
              <Box inert={page !== "team"} sx={{ flex: "0 0 50%", minWidth: 0, height: "100%" }}>{teamPage}</Box>
            </Box>
          </Box>
        </Drawer>
      ) : (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={cancel}
          onOpen={() => {}}
          disableSwipeToOpen
          slotProps={{
            paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden", maxWidth: 640, mx: "auto" } },
          }}
        >
          {body}
        </SwipeableDrawer>
      )}

      <FilterHelp help={help} onClose={() => setHelp(null)} />
      {/* Phones: a second sheet over the filters (desktop uses the second page above). */}
      <CollaboratorPicker
        open={pickerOpen && !desktop}
        onClose={() => setPickerOpen(false)}
        selectedId={filters.collaboratorId}
        onSelect={(id) => update({ collaboratorId: id })}
        view={scoreView}
      />
    </>
  );
}
