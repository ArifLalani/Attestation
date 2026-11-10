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
import { HelpButton } from "./ReviewHelp";
import { DefinitionsSheet } from "@/variants/finale/components/certificate/DefinitionsSheet";
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

/**
 * Filters in the Actuel look (grey chips, Réinitialiser, a yellow button). Desktop: a side sheet from the right, over the page
 * (Trier par has its own). Phones: a bottom sheet. The choices are a draft: the page does not change until
 * "Afficher N avis" (the count on it is live); the X, Échap or a tap outside drop them.
 */
export function FiltersSheet() {
  const t = useTranslations("Filters");
  const tv = useTranslations("VarianteFinale.filters");
  const tp = useTranslations("Products");
  const tc = useTranslations("Criteria");
  const { reviews, filters, setFilters, panel, setPanel, team } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const open = panel === "filters";
  const [draft, setDraft] = useState(filters);
  const [wasOpen, setWasOpen] = useState(open);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Desktop: the team list is a second page of the side sheet, sliding in from the right ("← Collaborateur").
  const [page, setPage] = useState<"filters" | "team">("filters");
  const backRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);
  const shownPage = useRef(page);
  // The ⓘ open the definitions sheet over the filters; closing it comes back to them.
  const [help, setHelp] = useState<HelpKey | null>(null);
  const [lastHelp, setLastHelp] = useState<HelpKey>("type");

  // Each opening starts the draft from the filters in use.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(filters);
      setPage("filters");
    }
  }

  // Afficher applies the draft; closing any other way leaves the page as it was.
  const keep = () => {
    setFilters(draft);
    setPanel(null);
  };
  const cancel = () => setPanel(null);
  // The team scores in the picker follow the type chosen in the draft.
  const draftView = draft.type === "controle" ? ("controle" as const) : ("global" as const);

  // Focus follows the page: the back arrow on the team page, the Collaborateur field when coming back.
  useEffect(() => {
    if (shownPage.current === page) return;
    shownPage.current = page;
    // preventScroll: otherwise the browser scrolls the sliding track sideways to reach the button.
    (page === "team" ? backRef.current : fieldRef.current)?.focus({ preventScroll: true });
  }, [page]);

  const results = applyFilters(reviews, draft).length;
  const update = (patch: Partial<ReviewFilters>) => setDraft({ ...draft, ...patch });
  const toggle = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) =>
    update({ [key]: JSON.stringify(draft[key]) === JSON.stringify(value) ? undefined : value } as Partial<ReviewFilters>);
  const toggleIn = <T extends Product | Criterion>(key: "products" | "criteria", value: T) => {
    const list = draft[key] as T[];
    update({ [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] } as Partial<ReviewFilters>);
  };
  const noteSelected = (stars: StarBucket) => draft.note?.stars === stars && !draft.note.exact;
  const person = team.find((member) => member.id === draft.collaboratorId);
  const openHelp = (key: HelpKey) => () => {
    setHelp(key);
    setLastHelp(key);
  };
  const chooser = useCollaboratorChooser({
    selectedId: draft.collaboratorId,
    view: draftView,
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
          onClick={() => setDraft({ ...emptyFilters, query: draft.query })}
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
            <ChoiceChip selected={draft.type === "controle"} onClick={() => toggle("type", "controle")}>{tv("typeControle")}</ChoiceChip>
            <ChoiceChip selected={draft.type === "non_controle"} onClick={() => toggle("type", "non_controle")}>{tv("typeNonControle")}</ChoiceChip>
          </Group>
          <Group title={t("source")} onHelp={openHelp("source")}>
            <ChoiceChip selected={draft.source === "opinion_system"} onClick={() => toggle("source", "opinion_system")}>{t("sourceOs")}</ChoiceChip>
            <ChoiceChip selected={draft.source === "imported"} onClick={() => toggle("source", "imported")}>{t("sourceImported")}</ChoiceChip>
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
              <ChoiceChip key={period} selected={draft.period === period} onClick={() => toggle("period", period)}>{t(`periods.${period}`)}</ChoiceChip>
            ))}
          </Group>
          <Group title={t("product")} onHelp={openHelp("product")}>
            {products.map((product) => (
              <ChoiceChip key={product} selected={draft.products.includes(product)} onClick={() => toggleIn("products", product)}>{tp(product)}</ChoiceChip>
            ))}
          </Group>
          <Group title={t("criterion")} onHelp={openHelp("criterion")}>
            {criteria.map((criterion) => (
              <ChoiceChip key={criterion} selected={draft.criteria.includes(criterion)} onClick={() => toggleIn("criteria", criterion)}>{tc(criterion)}</ChoiceChip>
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
        // Over the page with a light backdrop.
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

      <DefinitionsSheet open={Boolean(help)} onClose={() => setHelp(null)} initial={help ?? lastHelp} view={draftView} />
      {/* Phones: a second sheet over the filters (desktop uses the second page above). */}
      <CollaboratorPicker
        open={pickerOpen && !desktop}
        onClose={() => setPickerOpen(false)}
        selectedId={draft.collaboratorId}
        onSelect={(id) => update({ collaboratorId: id })}
        view={draftView}
      />
    </>
  );
}
