import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

/**
 * A side panel on the left (Material « left_panel_open / left_panel_close »), drawn on the same 24 grid and 2 px strokes as the
 * outlined MUI icons used everywhere else: a rounded box, the panel's edge, and a chevron that says what a tap will do
 * (› opens the panel, ‹ closes it).
 */
export function PanelIcon({ open, ...props }: SvgIconProps & { open: boolean }) {
  return (
    <SvgIcon {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
        <path d="M9 4v16" />
        <path d={open ? "M15.5 9.5 13 12l2.5 2.5" : "M13 9.5l2.5 2.5-2.5 2.5"} />
      </g>
    </SvgIcon>
  );
}
