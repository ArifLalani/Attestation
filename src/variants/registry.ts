/** The design options compared on branch design-variations. Same UX and data, different interface. */
export const variants = [
  { id: "original", label: "Actuel", name: "Prototype actuel", href: (agencyId: string) => `/fr-fr/certificate/${agencyId}` },
  { id: "a", label: "A", name: "A · Confiance", href: (agencyId: string) => `/fr-fr/variantes/a/${agencyId}` },
  { id: "b", label: "B", name: "B · Chaleureux", href: (agencyId: string) => `/fr-fr/variantes/b/${agencyId}` },
  { id: "c", label: "C", name: "C · Pratique", href: (agencyId: string) => `/fr-fr/variantes/c/${agencyId}` },
  { id: "d", label: "D", name: "D · La Boîte Immo", href: (agencyId: string) => `/fr-fr/variantes/d/${agencyId}` },
  { id: "e", label: "E", name: "E · Essentiel", href: (agencyId: string) => `/fr-fr/variantes/e/${agencyId}` },
  { id: "f", label: "F", name: "F · Classique", href: (agencyId: string) => `/fr-fr/variantes/f/${agencyId}` },
  { id: "f2", label: "F2", name: "F2 · Classique, mise en page B", href: (agencyId: string) => `/fr-fr/variantes/f2/${agencyId}` },
  { id: "finale", label: "Finale", name: "Version finale", href: (agencyId: string) => `/fr-fr/variantes/finale/${agencyId}` },
] as const;

export type VariantId = (typeof variants)[number]["id"];
