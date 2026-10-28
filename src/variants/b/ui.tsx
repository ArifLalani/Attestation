"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { SxProps, Theme } from "@mui/material/styles";
import CloseRounded from "@mui/icons-material/CloseRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import Image from "next/image";
import { useId } from "react";
import type { Collaborator } from "@/data/types";
import { b } from "./theme";

export const focusSx = { "&.Mui-focusVisible, &:focus-visible": { outline: "none", boxShadow: b.focus } } as const;

/** Header height, kept in a CSS variable so sticky elements and scroll targets line up under it. */
export const HEADER_VAR = "var(--b-header-height, 64px)";

type PillVariant = "primary" | "dark" | "outline" | "soft" | "sage";

const pillStyles: Record<PillVariant, object> = {
  primary: { background: b.gradient, color: b.white, "&:hover": { filter: "brightness(0.95)" } },
  dark: { bgcolor: b.ink, color: b.white, "&:hover": { bgcolor: "#000" } },
  outline: { bgcolor: b.white, color: b.ink, boxShadow: `inset 0 0 0 1px ${b.ink}`, "&:hover": { bgcolor: b.sand } },
  soft: { bgcolor: b.sand, color: b.ink, "&:hover": { bgcolor: b.sandDeep } },
  sage: { bgcolor: b.sageTint, color: b.sageText, "&:hover": { bgcolor: "#dcebe2" } },
};

/** Buttons: 48 px pills (40 px when `small`). With `href` they render as links. */
export function Pill({
  variant = "outline",
  small = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  sx,
  ...props
}: {
  variant?: PillVariant;
  small?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: "dialog" | "menu" | "listbox" | boolean;
}) {
  return (
    <ButtonBase
      {...(props.href ? { LinkComponent: "a" } : {})}
      {...props}
      sx={[
        {
          gap: 1,
          minHeight: small ? 40 : 48,
          px: small ? 2 : 3,
          width: fullWidth ? "100%" : "auto",
          borderRadius: 999,
          fontFamily: b.sans,
          fontSize: small ? 14 : 16,
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          transition: "background-color 150ms ease, filter 150ms ease, transform 150ms ease",
          "&:active": { transform: "scale(0.98)" },
          "&.Mui-disabled": { opacity: 0.45 },
          "& svg": { fontSize: small ? 18 : 20 },
          ...pillStyles[variant],
          ...focusSx,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {startIcon}
      {children}
      {endIcon}
    </ButtonBase>
  );
}

/** Stars in ink, like Airbnb, with partial fill for decimals. */
export function Stars({ value, size = 16, color = b.ink, label }: { value: number; size?: number; color?: string; label?: string }) {
  return (
    <Box role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} sx={{ display: "inline-flex", lineHeight: 0, flexShrink: 0 }}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <Box key={index} sx={{ position: "relative", width: size, height: size }}>
            <StarRounded sx={{ position: "absolute", inset: 0, fontSize: size, color: b.lineStrong }} />
            <Box sx={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
              <StarRounded sx={{ fontSize: size, color }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** Section title: soft serif, optional line under it. */
export function SectionTitle({ id, children, subtitle, size = "lg" }: { id?: string; children: React.ReactNode; subtitle?: React.ReactNode; size?: "lg" | "md" }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Typography
        id={id}
        component="h2"
        sx={{ fontFamily: b.serif, fontVariationSettings: '"SOFT" 100', fontWeight: 600, fontSize: size === "lg" ? { xs: 26, md: 30 } : { xs: 22, md: 24 }, lineHeight: 1.15, letterSpacing: "-0.01em", color: b.ink }}
      >
        {children}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: 15, lineHeight: 1.5, color: b.muted }}>{subtitle}</Typography>}
    </Box>
  );
}

export function Hairline({ sx }: { sx?: SxProps<Theme> }) {
  return <Box component="hr" sx={[{ m: 0, border: 0, borderTop: `1px solid ${b.line}` }, ...(Array.isArray(sx) ? sx : [sx])]} />;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const warmTones = ["#f6dfd3", "#e4eddc", "#f3e6c8", "#dfe7ef", "#efdbe4", "#e6e0f2"];

export function hashOf(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Round portrait, or initials on a warm pastel picked from the name. */
export function PersonAvatar({ person, size = 40, ring = false }: { person: Pick<Collaborator, "name" | "photo">; size?: number; ring?: boolean }) {
  return (
    <Avatar
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        fontSize: size * 0.36,
        fontWeight: 600,
        bgcolor: warmTones[hashOf(person.name) % warmTones.length],
        color: b.ink,
        boxShadow: ring ? `0 0 0 3px ${b.white}, 0 4px 14px rgba(0,0,0,0.12)` : "none",
      }}
    >
      {person.photo ? <Image src={person.photo} alt="" fill sizes={`${size * 2}px`} style={{ objectFit: "cover" }} /> : initials(person.name)}
    </Avatar>
  );
}

export function TeamAvatarB({ size = 40 }: { size?: number }) {
  return (
    <Avatar aria-hidden sx={{ width: size, height: size, bgcolor: b.ink, color: b.white, flexShrink: 0 }}>
      <GroupsRounded sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}

/** Choice in the filter panels: an outlined pill, ink when selected. */
export function ChoicePill({ selected, onClick, children, role = "checkbox" }: { selected: boolean; onClick: () => void; children: React.ReactNode; role?: "checkbox" | "radio" }) {
  return (
    <ButtonBase
      role={role}
      aria-checked={selected}
      onClick={onClick}
      sx={{
        minHeight: 44,
        px: 2,
        gap: 0.5,
        borderRadius: 999,
        fontSize: 15,
        fontWeight: selected ? 600 : 500,
        color: selected ? b.white : b.ink,
        bgcolor: selected ? b.ink : b.white,
        boxShadow: `inset 0 0 0 1px ${selected ? b.ink : b.lineStrong}`,
        transition: "background-color 150ms ease, box-shadow 150ms ease",
        "&:hover": { boxShadow: `inset 0 0 0 ${selected ? 1 : 2}px ${b.ink}` },
        ...focusSx,
      }}
    >
      {children}
    </ButtonBase>
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  closeLabel: string;
  /** Right of the title (e.g. a reset link). */
  actions?: React.ReactNode;
  /** Pinned under the title (e.g. a search field). */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  /** Desktop: a tall window (filters, chat). */
  tall?: boolean;
}

/** Panels: a rounded bottom sheet on phones, a centred window from 900 px. Close on the left, like Airbnb. */
export function Sheet({ open, onClose, title, closeLabel, actions, header, footer, children, width = 560, tall = false }: SheetProps) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: desktop ? "min(86vh, 820px)" : "92dvh", height: desktop && tall ? "min(86vh, 820px)" : "auto", bgcolor: b.white, fontFamily: b.sans, color: b.ink }}>
      {!desktop && (
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: b.lineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr) auto", alignItems: "center", gap: 1, px: 1.5, py: 1, minHeight: 60, borderBottom: `1px solid ${b.line}`, flexShrink: 0 }}>
        <IconButton onClick={onClose} aria-label={closeLabel} sx={{ width: 44, height: 44, color: b.ink, "&:hover": { bgcolor: b.sand }, ...focusSx }}>
          <CloseRounded />
        </IconButton>
        <Typography id={titleId} component="h2" sx={{ textAlign: "center", fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Box sx={{ minWidth: 48, display: "flex", justifyContent: "flex-end" }}>{actions}</Box>
      </Box>
      {header}
      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1, minHeight: 0 }}>{children}</Box>
      {footer}
    </Box>
  );

  if (desktop) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby={titleId}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(34, 24, 10, 0.45)" } },
          paper: { sx: { width, maxWidth: "calc(100vw - 48px)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" } },
        }}
      >
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
        backdrop: { sx: { bgcolor: "rgba(34, 24, 10, 0.45)" } },
        paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxWidth: 720, mx: "auto" } },
      }}
    >
      {body}
    </SwipeableDrawer>
  );
}

/** Sheet footer: secondary link on the left, main button on the right (Airbnb filter footer). */
export function SheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2.5, py: 1.75, pb: "calc(14px + env(safe-area-inset-bottom))", borderTop: `1px solid ${b.line}`, bgcolor: b.white, flexShrink: 0 }}>
      {children}
    </Box>
  );
}

/** Underlined text button (Airbnb "Tout effacer", "Afficher plus"). */
export function TextLink({ children, onClick, href, target, rel, sx, ...props }: { children: React.ReactNode; onClick?: () => void; href?: string; target?: string; rel?: string; sx?: SxProps<Theme>; "aria-label"?: string; "aria-expanded"?: boolean; "aria-controls"?: string; "aria-haspopup"?: "dialog" | "menu" | "listbox"; disabled?: boolean }) {
  return (
    <ButtonBase
      {...(href ? { LinkComponent: "a", href, target, rel } : {})}
      onClick={onClick}
      {...props}
      sx={[
        {
          gap: 0.5,
          minHeight: 44,
          px: 0.5,
          borderRadius: 1,
          fontFamily: b.sans,
          fontSize: 15,
          fontWeight: 600,
          color: b.ink,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          "&:hover": { color: "#000", textDecorationThickness: "2px" },
          "&.Mui-disabled": { opacity: 0.4 },
          ...focusSx,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </ButtonBase>
  );
}
