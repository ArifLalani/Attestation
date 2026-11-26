import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { companyInitials } from "@/variants/finale/cases";

/**
 * Case 1 (2026-11-26): a client without a logo gets its initials on a navy → teal tile, the size and corners of the logo it
 * replaces, so the layout never moves. Decorative: the company name is always written next to it.
 */
export function LogoInitials({ name, fontSize, sx }: { name: string; fontSize: number | Record<string, number>; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={[
        {
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #0a2a5e 0%, #041b44 55%, #0d5c5a 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          userSelect: "none",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {companyInitials(name)}
    </Box>
  );
}
