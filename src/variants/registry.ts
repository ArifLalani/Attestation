/** The design options compared on branch design-variations. Same UX and data, different interface. */
export const variants = [
  { id: "original", label: "Actuel", name: "Prototype actuel", href: (agencyId: string) => `/fr-fr/certificate/${agencyId}` },
  { id: "a", label: "A", name: "A · Confiance", href: (agencyId: string) => `/fr-fr/variantes/a/${agencyId}` },
  { id: "b", label: "B", name: "B · Chaleureux", href: (agencyId: string) => `/fr-fr/variantes/b/${agencyId}` },
  { id: "c", label: "C", name: "C · Pratique", href: (agencyId: string) => `/fr-fr/variantes/c/${agencyId}` },
] as const;

export type VariantId = (typeof variants)[number]["id"];
