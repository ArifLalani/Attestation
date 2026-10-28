"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Close from "@mui/icons-material/Close";
import Groups from "@mui/icons-material/Groups";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import type { Collaborator, WeekHours } from "@/data/types";
import { formatScore } from "@/lib/format";
import { useNow, usePrefersReducedMotion } from "@/lib/hooks";
import { frenchTime, openingStatus } from "@/lib/hours";
import { a } from "./theme";

export const containerSx = { width: "100%", maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } } as const;

export const cardSx = { bgcolor: a.white, border: `1px solid ${a.line}`, borderRadius: `${a.radius}px` } as const;

export const focusRing = { "&.Mui-focusVisible, &:focus-visible": { outline: `3px solid ${a.blue}`, outlineOffset: 2 } } as const;

const STAR = "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/**
 * Trustpilot-style rating: five square tiles with a white star, filled to the decimal.
 * The fill grows tile after tile when the value changes.
 */
export function StarTiles({ value, size = 20, color = a.star, label }: { value: number; size?: number; color?: string; label?: string }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);
  const gap = Math.max(2, Math.round(size * 0.12));
  return (
    <Box role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} sx={{ display: "inline-flex", gap: `${gap}px`, flexShrink: 0 }}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, shown - index));
        return (
          <Box key={index} sx={{ position: "relative", width: size, height: size, borderRadius: `${Math.max(2, size * 0.16)}px`, bgcolor: a.tileEmpty, overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                width: `${fill * 100}%`,
                bgcolor: color,
                transition: reduced ? "none" : `width 380ms ${a.ease} ${index * 70}ms, background-color 250ms ease`,
              }}
            />
            <Box component="svg" viewBox="0 0 24 24" sx={{ position: "absolute", inset: "14%", width: "72%", height: "72%", fill: a.white }}>
              <path d={STAR} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** Small yellow star, for inline ratings ("4,8 ★"). */
export function Star({ size = 16, color = a.star }: { size?: number; color?: string }) {
  return (
    <Box component="svg" aria-hidden viewBox="0 0 24 24" sx={{ width: size, height: size, fill: color, flexShrink: 0 }}>
      <path d={STAR} />
    </Box>
  );
}

export function RatingPill({ value, count }: { value: number; count?: string }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, height: 26, borderRadius: 999, bgcolor: a.band, border: `1px solid ${a.line}`, fontSize: 13, fontWeight: 700, color: a.navy, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
      <Star size={14} />
      {formatScore(value)}
      {count && <Box component="span" sx={{ fontWeight: 500, color: a.muted }}>· {count}</Box>}
    </Box>
  );
}

/** Section heading: small teal eyebrow, then a strong title. */
export function SectionTitle({ eyebrow, title, id, align = "left", sub }: { eyebrow: string; title: string; id?: string; align?: "left" | "center"; sub?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, textAlign: align, alignItems: align === "center" ? "center" : "flex-start" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 0, textTransform: "none", color: a.tealText }}>{eyebrow}</Typography>
      <Typography id={id} component="h2" sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em", color: a.navy, textWrap: "balance" }}>
        {title}
      </Typography>
      {sub && <Typography sx={{ fontSize: 16, color: a.muted, maxWidth: 620, lineHeight: 1.55 }}>{sub}</Typography>}
    </Box>
  );
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function PersonAvatar({ person, size = 40 }: { person: Pick<Collaborator, "name" | "photo">; size?: number }) {
  return (
    <Avatar sx={{ width: size, height: size, fontSize: size * 0.36, fontWeight: 700, bgcolor: a.blueTint, color: a.navy, flexShrink: 0 }}>
      {person.photo ? <Image src={person.photo} alt="" fill sizes={`${size * 2}px`} style={{ objectFit: "cover" }} /> : initials(person.name)}
    </Avatar>
  );
}

export function TeamAvatarA({ size = 40 }: { size?: number }) {
  return (
    <Avatar aria-hidden sx={{ width: size, height: size, bgcolor: a.navy, color: a.white, flexShrink: 0 }}>
      <Groups sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}

/** Filter / choice chip: outlined pill, navy when selected. */
export function ChoiceChipA({ selected, onClick, children, role = "checkbox" }: { selected: boolean; onClick: () => void; children: React.ReactNode; role?: "checkbox" | "radio" }) {
  return (
    <ButtonBase
      role={role}
      aria-checked={selected}
      onClick={onClick}
      sx={{
        minHeight: 40,
        px: 2,
        gap: 0.75,
        borderRadius: 999,
        border: `1px solid ${selected ? a.navy : a.lineStrong}`,
        bgcolor: selected ? a.navy : a.white,
        color: selected ? a.white : a.navy,
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
        "&:hover": { borderColor: a.navy },
        ...focusRing,
      }}
    >
      {children}
    </ButtonBase>
  );
}

export function useRelativeDate() {
  const t = useTranslations("Reviews.date");
  return (daysAgo: number) => {
    if (daysAgo <= 0) return t("today");
    if (daysAgo === 1) return t("yesterday");
    if (daysAgo < 7) return t("days", { n: daysAgo });
    if (daysAgo < 30) return t("weeks", { n: Math.floor(daysAgo / 7) });
    if (daysAgo < 365) return t("months", { n: Math.floor(daysAgo / 30) });
    return t("years", { n: Math.floor(daysAgo / 365) });
  };
}

/** Live "Ouvert · Ferme à 19 h", computed in the browser (Paris time). */
export function OpenStatusA({ hours, size = 14 }: { hours: WeekHours; size?: number }) {
  const t = useTranslations("Hours");
  const now = useNow();
  const status = now ? openingStatus(hours, now) : null;
  const label = !status
    ? " "
    : status.open
      ? t("openUntil", { time: frenchTime(status.closesAt) })
      : status.opensAt === null
        ? t("closed")
        : status.opensDay === null
          ? t("closedOpensToday", { time: frenchTime(status.opensAt) })
          : t("closedOpensOn", { day: t(`days.${status.opensDay}`), time: frenchTime(status.opensAt) });
  const open = status?.open ?? true;
  return (
    <Box role="status" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, visibility: status ? "visible" : "hidden", fontSize: size, fontWeight: 700, color: open ? a.tealText : a.danger, whiteSpace: "nowrap" }}>
      <Box sx={{ position: "relative", width: 8, height: 8, borderRadius: "50%", bgcolor: open ? a.teal : a.danger, flexShrink: 0, ...(open && { "&::after": { content: '""', position: "absolute", inset: -4, borderRadius: "50%", bgcolor: a.teal, opacity: 0.25 } }) }} />
      {label}
    </Box>
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  closeLabel: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Desktop: a dropdown under this element instead of a centred window. */
  anchorEl?: HTMLElement | null;
  width?: number;
  maxWidth?: "xs" | "sm" | "md";
}

/** Panels of option A: a bottom sheet on phones, a dropdown (with an anchor) or a centred window from 900 px. */
export function Sheet({ open, onClose, title, closeLabel, actions, header, footer, children, anchorEl, width = 420, maxWidth = "sm" }: SheetProps) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const dropdown = desktop && Boolean(anchorEl);
  const dropdownMaxHeight = dropdown && open && anchorEl ? `calc(100vh - ${Math.round(anchorEl.getBoundingClientRect().bottom) + 24}px)` : undefined;

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: dropdownMaxHeight ?? (desktop ? "min(84vh, 780px)" : "92dvh"), bgcolor: a.white, color: a.navy }}>
      {!desktop && (
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: a.lineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: { xs: 2.5, md: 3 }, pr: 1.5, py: 1.25, minHeight: 64, borderBottom: `1px solid ${a.line}`, flexShrink: 0 }}>
        <Typography id={titleId} component="h2" sx={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {title}
        </Typography>
        {actions}
        <IconButton onClick={onClose} aria-label={closeLabel} sx={{ width: 44, height: 44, color: a.navy, bgcolor: a.band, "&:hover": { bgcolor: a.line } }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      {header}
      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1 }}>{children}</Box>
      {footer}
    </Box>
  );

  if (dropdown) {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { role: "dialog", "aria-labelledby": titleId, sx: { mt: 1, width, maxWidth: "calc(100vw - 32px)", borderRadius: "16px", overflow: "hidden", border: `1px solid ${a.line}`, boxShadow: a.shadowFloat } } }}
      >
        {body}
      </Popover>
    );
  }

  if (desktop) {
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth={maxWidth} slotProps={{ paper: { sx: { borderRadius: "20px", overflow: "hidden", boxShadow: a.shadowFloat } }, backdrop: { sx: { bgcolor: "rgba(4,27,68,0.35)", backdropFilter: "blur(2px)" } } }}>
        {body}
      </Dialog>
    );
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(4,27,68,0.35)" } },
        paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxWidth: 640, mx: "auto" } },
      }}
    >
      {body}
    </SwipeableDrawer>
  );
}

/** Pinned bottom of a panel (e.g. "Appliquer les filtres"). */
export function SheetFooter({ children }: { children: React.ReactNode }) {
  return <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 1.5, pb: "calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${a.line}`, bgcolor: a.white, flexShrink: 0, display: "flex", gap: 1.5 }}>{children}</Box>;
}

/** Yellow call to action, navy text. */
export const primarySx = {
  bgcolor: a.yellow,
  color: a.navy,
  "&:hover": { bgcolor: a.yellowHover },
  "&.Mui-disabled": { bgcolor: a.band, color: a.muted },
} as const;

/** Outlined secondary action. */
export const outlineSx = {
  bgcolor: a.white,
  color: a.navy,
  border: `1px solid ${a.lineStrong}`,
  "&:hover": { bgcolor: a.band, borderColor: a.navy },
} as const;
