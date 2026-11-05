/** The two versions on the Finale link: H as built, and H with the current prototype's hero. Same page under the hero. */
export const variants = [
  { id: "finale", label: "Version 1", name: "Version finale", href: (agencyId: string) => `/fr-fr/variantes/finale/${agencyId}` },
  { id: "finale-2", label: "Version 2", name: "Version finale, avec le hero du prototype actuel", href: (agencyId: string) => `/fr-fr/variantes/finale-2/${agencyId}` },
] as const;

export type VariantId = (typeof variants)[number]["id"];
