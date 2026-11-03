"use client";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useId } from "react";
import { tokens } from "@/theme/theme";
import { FigmaIcon } from "./FigmaIcon";

interface ResponsiveSheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  closeLabel: string;
  /** Extra controls in the title bar, left of the close button (e.g. Réinitialiser). */
  actions?: React.ReactNode;
  /** Pinned under the title bar (e.g. a search field). */
  header?: React.ReactNode;
  /** Pinned at the bottom (e.g. Appliquer les filtres). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Desktop: open as a dropdown under this element instead of a centred window. */
  anchorEl?: HTMLElement | null;
  /** Width of the centred desktop window, when narrower than the default 600 px. */
  dialogWidth?: number;
  /** Width of the desktop dropdown. */
  dropdownWidth?: number;
  /** Which edge of `anchorEl` the dropdown lines up with (right by default). */
  dropdownAlign?: "left" | "right";
  /** Desktop: a full-height sheet sliding in from the right, over the page with a light backdrop. */
  side?: boolean;
}

/**
 * Figma "Bottom Sheet": a swipeable bottom sheet on phones and tablets in portrait.
 * From 900 px: a dropdown under `anchorEl` when given, otherwise a centred modal.
 */
export function ResponsiveSheet({ open, onClose, title, closeLabel, actions, header, footer, children, anchorEl, dropdownWidth = 420, dropdownAlign = "right", dialogWidth, side = false }: ResponsiveSheetProps) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const sideSheet = desktop && side;
  const dropdown = desktop && !side && Boolean(anchorEl);
  // A dropdown may use the space between its button and the bottom of the window.
  const dropdownMaxHeight = dropdown && open && anchorEl ? `max(440px, calc(100vh - ${Math.round(anchorEl.getBoundingClientRect().bottom) + 24}px))` : undefined;

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: sideSheet ? "100%" : undefined, maxHeight: sideSheet ? "none" : (dropdownMaxHeight ?? (desktop ? "min(80vh, 760px)" : "92dvh")), bgcolor: tokens.blanc }}>
      {!desktop && (
        <Box sx={{ bgcolor: tokens.grisClair1, py: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 60, height: 5, borderRadius: 2.5, bgcolor: tokens.grisMoyen1 }} />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.grisMoyen1}`,
          flexShrink: 0,
        }}
      >
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: dropdown ? 17 : 20, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
          {title}
        </Typography>
        {actions}
        <IconButton onClick={onClose} aria-label={closeLabel} sx={{ p: 1.5, m: -1.5, ml: 0 }}>
          <FigmaIcon name="close" />
        </IconButton>
      </Box>
      {header}
      <Box sx={{ overflowY: "auto", overscrollBehavior: "contain", flex: 1 }}>{children}</Box>
      {footer}
    </Box>
  );

  if (sideSheet) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.18)" } },
          paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: dialogWidth ?? 440, maxWidth: "100vw", boxShadow: "-12px 0 40px rgba(4, 27, 68, 0.16)", overflow: "hidden" } },
        }}
      >
        {body}
      </Drawer>
    );
  }

  if (dropdown) {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: dropdownAlign }}
        transformOrigin={{ vertical: "top", horizontal: dropdownAlign }}
        slotProps={{ paper: { role: "dialog", "aria-labelledby": titleId, sx: { mt: 1, width: dropdownWidth, maxWidth: "calc(100vw - 32px)", borderRadius: "12px", overflow: "hidden" } } }}
      >
        {body}
      </Popover>
    );
  }

  if (desktop) {
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "20px", overflow: "hidden", ...(dialogWidth && { maxWidth: dialogWidth }) } } }}>
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
      aria-labelledby={titleId}
      slotProps={{ paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden", maxWidth: 640, mx: "auto" } } }}
    >
      {body}
    </SwipeableDrawer>
  );
}
