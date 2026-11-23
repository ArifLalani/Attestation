/**
 * The OS App background (Figma OS-App, node 3809:6320): navy with blue glows at the top and a green shine lower right.
 * Used wherever the certificate fills an area with dark blue (never for text).
 */

/** Portrait areas (phones' business card, tall cards): the Figma layers as drawn on the 430 × 932 frame. */
export const appGradientTall = [
  // Green shine, lower right.
  "radial-gradient(84% 31% at 122.6% 64.9%, rgba(0, 212, 146, 0.5) 0%, rgba(0, 212, 146, 0) 100%)",
  // Darker towards the bottom, navy everywhere else (60 % over the glows, as in Figma).
  "radial-gradient(188% 30% at 53.9% 99.9%, rgba(0, 0, 0, 0.6) 20%, rgba(1, 7, 17, 0.6) 40%, rgba(2, 14, 34, 0.6) 60%, rgba(4, 27, 68, 0.6) 100%)",
  // Blue glows: left edge and top right.
  "radial-gradient(84% 28% at -2.1% 36.4%, rgba(44, 149, 255, 0.3) 0%, rgba(44, 149, 255, 0) 100%)",
  "radial-gradient(79% 35% at 105.1% -2.3%, rgba(44, 149, 255, 0.6) 0%, rgba(44, 149, 255, 0) 100%)",
  "#041b44",
].join(", ");

/** Wide areas (header, desktop cards, the floating pill, small selected chips): the same layers laid out for a landscape box. */
export const appGradientWide = [
  "radial-gradient(42% 150% at 94% 135%, rgba(0, 212, 146, 0.5) 0%, rgba(0, 212, 146, 0) 100%)",
  "linear-gradient(180deg, rgba(4, 27, 68, 0) 35%, rgba(0, 0, 0, 0.28) 100%)",
  "radial-gradient(55% 200% at -5% -10%, rgba(44, 149, 255, 0.22) 0%, rgba(44, 149, 255, 0) 100%)",
  "radial-gradient(38% 190% at 100% -45%, rgba(44, 149, 255, 0.4) 0%, rgba(44, 149, 255, 0) 100%)",
  "#041b44",
].join(", ");
