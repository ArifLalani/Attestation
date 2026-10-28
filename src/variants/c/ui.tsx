"use client";

import Box from "@mui/material/Box";
import Button, { type ButtonProps } from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { SxProps, Theme } from "@mui/material/styles";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import StarRounded from "@mui/icons-material/StarRounded";
import { useId } from "react";
import { focusRing, pc } from "./theme";

/** Phones: bottom sheet with a handle. From 900 px: a centred dialog. Same header and footer in both. */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  actions,
  header,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  closeLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  /** Fixed content under the title (a search field…), outside the scrolling area. */
  header?: React.ReactNode;
  width?: number;
}) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, maxHeight: "100%", bgcolor: pc.surface, color: pc.ink }}>
      {!desktop && (
        <Box sx={{ pt: 1.25, pb: 0.5, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: pc.outlineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 3, pr: 1.5, pt: desktop ? 2.5 : 1, pb: 1.5, flexShrink: 0 }}>
        <Typography id={titleId} component="h2" sx={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {actions}
        <IconButton onClick={onClose} aria-label={closeLabel} sx={{ width: 44, height: 44, color: pc.muted, "&:hover": { bgcolor: pc.surfaceDim } }}>
          <Close />
        </IconButton>
      </Box>
      {header && <Box sx={{ flexShrink: 0 }}>{header}</Box>}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>{children}</Box>
      {footer && (
        <Box sx={{ flexShrink: 0, px: 2, pt: 1.5, pb: desktop ? 2 : "calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${pc.outline}` }}>{footer}</Box>
      )}
    </Box>
  );

  if (desktop) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby={titleId}
        slotProps={{
          backdrop: { sx: { bgcolor: pc.scrim } },
          paper: { sx: { width, maxWidth: "calc(100vw - 48px)", maxHeight: "calc(100vh - 64px)", m: 3, borderRadius: "28px", overflow: "hidden", boxShadow: "0 24px 60px rgba(27,31,42,0.22)" } },
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
        backdrop: { sx: { bgcolor: pc.scrim } },
        paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { maxHeight: "92dvh", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", maxWidth: 640, mx: "auto" } },
      }}
    >
      {body}
    </SwipeableDrawer>
  );
}

/** Five stars with partial fill (4,3 = four full, one 30 %). */
export function Stars({ value, size = 16, label, color = pc.star }: { value: number; size?: number; label?: string; color?: string }) {
  return (
    <Box
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      sx={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <Box key={index} sx={{ position: "relative", width: size, height: size, mr: index < 4 ? `${Math.round(size * 0.04)}px` : 0 }}>
            <StarRounded sx={{ position: "absolute", inset: 0, width: size, height: size, color: pc.starEmpty, transform: "scale(1.18)" }} />
            <Box sx={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
              <StarRounded sx={{ width: size, height: size, color, transform: "scale(1.18)" }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

type Tone = "indigo" | "emerald";

const toneColors = (tone: Tone) =>
  tone === "emerald" ? { bg: pc.emeraldTint, fg: pc.emeraldText } : { bg: pc.indigoTonal, fg: pc.indigoDark };

/** Material 3 filter chip: outlined, tonal with a check once selected. 40 px tall, 44 px hit area. */
export function ChipC({
  selected = false,
  onClick,
  children,
  icon,
  tone = "indigo",
  ariaLabel,
  sx,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}) {
  const colors = toneColors(tone);
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      sx={[
        {
          position: "relative",
          flexShrink: 0,
          height: 40,
          gap: 0.75,
          pl: selected || icon ? 1.25 : 2,
          pr: 2,
          borderRadius: "12px",
          border: `1px solid ${selected ? "transparent" : pc.outlineStrong}`,
          bgcolor: selected ? colors.bg : pc.surface,
          color: selected ? colors.fg : pc.ink,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          transition: "background-color 150ms ease, border-color 150ms ease",
          "&:hover": { bgcolor: selected ? colors.bg : pc.surfaceDim },
          "&.Mui-focusVisible": focusRing,
          "&::after": { content: '""', position: "absolute", inset: "-2px 0" },
          "& svg": { fontSize: 18 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {selected ? <Check /> : icon}
      {children}
    </ButtonBase>
  );
}

type PillVariant = "filled" | "tonal" | "outlined" | "text";

const pillSx: Record<PillVariant, SxProps<Theme>> = {
  filled: { bgcolor: pc.indigo, color: "#fff", "&:hover": { bgcolor: pc.indigoDark } },
  tonal: { bgcolor: pc.indigoTonal, color: pc.indigoDark, "&:hover": { bgcolor: "#dcdafb" } },
  outlined: { border: `1px solid ${pc.outlineStrong}`, color: pc.indigoDark, bgcolor: pc.surface, "&:hover": { bgcolor: pc.indigoSoft, borderColor: pc.outlineStrong } },
  text: { color: pc.indigoDark, px: 1.5, "&:hover": { bgcolor: pc.indigoSoft } },
};

/** Pill button, 44 px tall. */
export function Pill({ tone = "filled", sx, ...props }: Omit<ButtonProps, "variant"> & { tone?: PillVariant; target?: string; rel?: string }) {
  return (
    <Button
      disableElevation
      {...props}
      sx={[
        { minHeight: 44, px: 2.5, borderRadius: 999, fontSize: 15, fontWeight: 600, gap: 0.5, whiteSpace: "nowrap", "&.Mui-disabled": { bgcolor: pc.outline, color: pc.muted } },
        pillSx[tone],
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

/** White section surface with its title row. */
export function SectionCard({
  id,
  titleId,
  title,
  subtitle,
  action,
  children,
  sx,
}: {
  id?: string;
  titleId: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={titleId}
      sx={[
        { bgcolor: pc.surface, borderRadius: "24px", border: `1px solid ${pc.outline}`, p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} component="h2" sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            {title}
          </Typography>
          {subtitle && <Typography sx={{ mt: 0.5, fontSize: 15, lineHeight: 1.45, color: pc.muted }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

/** Round tonal icon button with its label underneath (Google Business "Itinéraire / Appeler / Partager"). */
export function ActionCircle({
  icon,
  label,
  onClick,
  href,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  primary?: boolean;
}) {
  const link = href ? { component: "a" as const, href, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <ButtonBase
      {...link}
      onClick={onClick}
      sx={{
        flex: "1 1 0",
        minWidth: 0,
        maxWidth: 88,
        flexDirection: "column",
        gap: 0.75,
        py: 0.5,
        borderRadius: "16px",
        color: pc.ink,
        "&.Mui-focusVisible": focusRing,
        "&:hover .vc-circle": { bgcolor: primary ? pc.indigoDark : "#dcdafb" },
        "&:active .vc-circle": { transform: "scale(0.94)" },
      }}
    >
      <Box
        className="vc-circle"
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: primary ? pc.indigo : pc.indigoTonal,
          color: primary ? "#fff" : pc.indigoDark,
          transition: "background-color 150ms ease, transform 120ms ease",
          "& svg": { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Typography component="span" sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 600, lineHeight: 1.2, textAlign: "center", color: pc.indigoDark }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

/** "Avis contrôlé" / "Non contrôlé" pill. */
export function StatusBadge({ controle, label }: { controle: boolean; label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 24,
        px: 1,
        borderRadius: 999,
        bgcolor: controle ? pc.emeraldTint : pc.surfaceDim,
        color: controle ? pc.emeraldText : pc.muted,
        border: controle ? "none" : `1px solid ${pc.outline}`,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {controle && (
        <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: 14, height: 14, fill: "currentColor" }}>
          <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
        </Box>
      )}
      {label}
    </Box>
  );
}
