import type { Collaborator, Product } from "./types";

export interface TeamMemberSeed extends Collaborator {
  /** Score the demo data aims for (values from the Figma staff picker). */
  targetScore: number;
  /** Products this person mostly handles, used to assign their reviews. */
  products: Product[];
}

const social = { linkedin: "https://www.linkedin.com", instagram: "https://www.instagram.com", facebook: "https://www.facebook.com" };

const member = (
  slug: string,
  name: string,
  role: string,
  targetScore: number,
  products: Product[],
  photoExt: "jpg" | "png" = "jpg",
): TeamMemberSeed => ({
  id: slug,
  name,
  role,
  email: `${slug.replace("-", ".")}@lbi.fr`,
  photo: `/images/team/${slug}.${photoExt}`,
  socials: social,
  targetScore,
  products,
});

/** La Boîte Immo Hyères — the 20 people from the Figma staff picker, alphabetical. */
export const lbiTeam: TeamMemberSeed[] = [
  member("adam-vincent", "Adam Vincent", "Négociateur immobilier", 3.5, ["vente", "achat"], "png"),
  member("alice-robert", "Alice Robert", "Gestionnaire locative", 4.7, ["gestion_locative", "location"]),
  member("arthur-leroy", "Arthur Leroy", "Conseiller en transaction", 4.5, ["vente", "estimation"], "png"),
  member("chloe-petit", "Chloé Petit", "Chargée de location", 4.6, ["location", "gestion_locative"]),
  member("clara-girard", "Clara Girard", "Assistante de copropriété", 3.2, ["syndic"]),
  member("emma-dubois", "Emma Dubois", "Négociatrice immobilière", 4.9, ["vente", "achat", "estimation"]),
  member("gabriel-richard", "Gabriel Richard", "Gestionnaire de copropriété", 4.1, ["syndic"]),
  member("hugo-laurent", "Hugo Laurent", "Négociateur immobilier", 3.9, ["achat", "vente"]),
  member("ines-durand", "Inès Durand", "Gestionnaire locative", 4.4, ["gestion_locative"]),
  member("jade-roux", "Jade Roux", "Chargée de location", 4.0, ["location"]),
  member("juliette-martin", "Juliette Martin", "Directrice d'agence", 4.8, ["vente", "estimation", "gestion_locative"]),
  member("louis-michel", "Louis Michel", "Expert en estimation", 4.3, ["estimation", "vente"]),
  member("louise-thomas", "Louise Thomas", "Assistante commerciale", 3.8, ["location", "achat"]),
  member("lucas-bernard", "Lucas Bernard", "Négociateur immobilier", 4.2, ["vente", "achat"]),
  member("nathan-david", "Nathan David", "Gestionnaire de copropriété", 3.7, ["syndic"], "png"),
  member("noah-andre", "Noah André", "Chargé de location", 3.1, ["location"], "png"),
  member("paul-fournier", "Paul Fournier", "Gestionnaire locatif", 3.3, ["gestion_locative"], "png"),
  member("raphael-simon", "Raphaël Simon", "Responsable transaction", 5.0, ["vente", "achat"]),
  member("sarah-morel", "Sarah Morel", "Responsable syndic", 3.4, ["syndic"]),
  member("zoe-bertrand", "Zoé Bertrand", "Négociatrice immobilière", 3.6, ["achat", "vente"]),
];
