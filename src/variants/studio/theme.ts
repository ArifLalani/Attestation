// Shared interaction components for options D and E. Each page supplies its visual tokens.
export const a = {
  navy: "var(--studio-navy, #041b44)",
  navySoft: "var(--studio-navySoft, #1b3263)",
  blue: "var(--studio-blue, #2c95ff)",
  /** Blue for text and links on white (AA). */
  blueText: "var(--studio-blueText, #1c64b4)",
  blueTint: "var(--studio-blueTint, #eaf4ff)",
  teal: "var(--studio-teal, #43b6a3)",
  /** Teal for text on white (AA). */
  tealText: "var(--studio-tealText, #1f7d6e)",
  tealTint: "var(--studio-tealTint, #e8f6f3)",
  yellow: "var(--studio-yellow, #ffd500)",
  yellowHover: "var(--studio-yellowHover, #f7c600)",
  star: "var(--studio-star, #ffb400)",
  /** Muted text (AA on white and on the band). */
  muted: "var(--studio-muted, #55667c)",
  line: "var(--studio-line, #e3eaf0)",
  lineStrong: "var(--studio-lineStrong, #cfdae4)",
  band: "var(--studio-band, #f5f8fb)",
  white: "var(--studio-white, #ffffff)",
  danger: "var(--studio-danger, #c2410c)",
  tileEmpty: "var(--studio-tileEmpty, #dde5ec)",
  radius: 12,
  /** Pinned section bar; the review toolbar sticks right under it. */
  barHeight: 56,
  shadowFloat: "0 12px 32px -8px rgba(4, 27, 68, 0.18), 0 2px 6px rgba(4, 27, 68, 0.06)",
  shadowSoft: "0 1px 2px rgba(4, 27, 68, 0.06)",
  ease: "cubic-bezier(0.2, 0, 0, 1)",
} as const;


export const viewColor = { global: a.blue, controle: a.teal } as const;
export const viewText = { global: a.blueText, controle: a.tealText } as const;
