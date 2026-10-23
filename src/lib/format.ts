// French number formatting. Intl uses a narrow no-break space (U+202F) for thousands, which Poppins
// draws almost invisibly ("1489"); the Figma shows a regular space ("1 810"), so we swap it.
const integer = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const visibleSpaces = (text: string) => text.replace(/ /g, " ");

/** 2500 → "2 500" */
export const formatCount = (value: number) => visibleSpaces(integer.format(value));

/** 4.28 → "4,3" */
export const formatScore = (value: number) => visibleSpaces(oneDecimal.format(Math.round(value * 10) / 10));
