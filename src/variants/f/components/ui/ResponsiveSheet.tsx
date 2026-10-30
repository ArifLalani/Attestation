"use client";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useId } from "react";
import { poppins, tokens } from "@/variants/f/theme";
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
  /** Width of the desktop dropdown. */
  dropdownWidth?: number;
}

/**
 * Figma "Bottom Sheet": a swipeable bottom sheet on phones and tablets in portrait.
 * From 900 px: a dropdown under `anchorEl` when given, otherwise a centred modal.
 */
export function ResponsiveSheet({ open, onClose, title, closeLabel, actions, header, footer, children, anchorEl, dropdownWidth = 420 }: ResponsiveSheetProps) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const dropdown = desktop && Boolean(anchorEl);
  // A dropdown may use the space between its button and the bottom of the window.
  const dropdownMaxHeight = dropdown && open && anchorEl ? `calc(100vh - ${Math.round(anchorEl.getBoundingClientRect().bottom) + 24}px)` : undefined;

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: dropdownMaxHeight ?? (desktop ? "min(80vh, 760px)" : "92dvh"), bgcolor: tokens.blanc }}>
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
          borderTop: desktop ? `3px solid ${tokens.marine}` : "none",
          borderBottom: `1px solid ${tokens.grisMoyen1}`,
          flexShrink: 0,
        }}
      >
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontFamily: poppins, fontSize: 20, fontWeight: 400, lineHeight: "normal", color: tokens.marine }}>
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

  if (dropdown) {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { role: "dialog", "aria-labelledby": titleId, sx: { mt: 1, width: dropdownWidth, maxWidth: "calc(100vw - 32px)", borderRadius: "4px", overflow: "hidden" } } }}
      >
        {body}
      </Popover>
    );
  }

  if (desktop) {
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "4px", overflow: "hidden" } } }}>
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
      slotProps={{ paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: "hidden", maxWidth: 640, mx: "auto" } } }}
    >
      {body}
    </SwipeableDrawer>
  );
}
