"use client";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
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
}

/**
 * Figma "Bottom Sheet": a swipeable bottom sheet on phones and tablets in portrait,
 * a centred modal from 900 px.
 */
export function ResponsiveSheet({ open, onClose, title, closeLabel, actions, header, footer, children }: ResponsiveSheetProps) {
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", maxHeight: desktop ? "min(80vh, 760px)" : "92dvh", bgcolor: tokens.blanc }}>
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
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 20, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
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

  if (desktop) {
    return (
      <Dialog open={open} onClose={onClose} aria-labelledby={titleId} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "20px", overflow: "hidden" } } }}>
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
