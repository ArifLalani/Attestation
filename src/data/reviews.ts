import { closings, firstNames, lastInitials, middles, moodCriteria, moodOf, openings, questionnaireCriteria, replies } from "./content";
import { createRng, seedFrom, type Rng } from "./rng";
import { lbiTeam, type TeamMemberSeed } from "./team";
import type { Agency, Collaborator, Product, Review, ReviewSource } from "./types";
import { mainAgencyId } from "./agencies";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const oneDecimal = (value: number) => Math.round(value * 10) / 10;

/** Skewed toward 5 like real review sites: most ratings sit near 5, a long tail goes down to 0. */
function drawRating(rng: Rng, mean: number) {
  const spread = Math.max(0.32, 5 - clamp(mean, 0, 5));
  const raw = 5 + Math.log(1 - rng.next()) * spread;
  // Very unhappy customers still give something (live page: 0,4 … 1,4), not a pile of exact zeros.
  return oneDecimal(raw < 0.5 ? 0.3 + rng.next() * 1.1 : Math.min(5, raw));
}

const sisterNames = [
  "Marine Lefèvre", "Julien Garnier", "Élise Chevalier", "Bastien Faure", "Margaux Blanc", "Hugo Perrin",
  "Anaïs Colin", "Théo Masson", "Lina Mercier", "Quentin Rolland", "Lou Barbier", "Victor Gauthier",
  "Rose Lemoine", "Adrien Brun", "Inès Picard", "Simon Caron", "Mila Roche", "Enzo Renaud",
  "Agathe Marchand", "Tom Dumont", "Nina Lambert", "Gaspard Roger", "Lola Fabre", "Baptiste Meyer",
];
const sisterRoles: [string, Product[]][] = [
  ["Directrice d'agence", ["vente", "estimation"]],
  ["Négociateur immobilier", ["vente", "achat"]],
  ["Gestionnaire locative", ["gestion_locative", "location"]],
  ["Chargé de location", ["location"]],
  ["Gestionnaire de copropriété", ["syndic"]],
  ["Négociatrice immobilière", ["achat", "vente"]],
];

const slug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, "-");

function teamSeeds(agency: Agency): TeamMemberSeed[] {
  if (agency.id === mainAgencyId) return lbiTeam;
  const index = Number(agency.id) - Number(mainAgencyId) - 1;
  return sisterNames.slice(index * 6, index * 6 + 6).map((name, i) => {
    const rng = createRng(seedFrom(`${agency.id}-${name}`));
    const id = slug(name);
    return {
      id,
      name,
      role: sisterRoles[i][0],
      email: `${id.replace("-", ".")}@lbi.fr`,
      socials: { linkedin: "https://www.linkedin.com" },
      targetScore: oneDecimal(3.4 + rng.next() * 1.5),
      products: sisterRoles[i][1],
    };
  });
}

/** How many reviews of each source an agency has. The main agency matches the Figma totals (2 500 / 800). */
function sourceCounts(agency: Agency): Record<ReviewSource, number> {
  if (agency.id === mainAgencyId) return { os_certified: 720, import_iso: 80, os_simple: 900, google: 800 };
  const rng = createRng(seedFrom(`counts-${agency.id}`));
  const scale = 0.12 + rng.next() * 0.25;
  return {
    os_certified: Math.round(720 * scale),
    import_iso: Math.round(80 * scale),
    os_simple: Math.round(900 * scale),
    google: Math.round(800 * scale),
  };
}

const allProducts: Product[] = ["vente", "achat", "location", "gestion_locative", "syndic", "estimation"];
const productWeights = [5, 3, 3, 4, 2, 2];

function writeComment(rng: Rng, rating: number, product: Product): string | undefined {
  if (rng.chance(0.14)) return undefined;
  const mood = moodOf(rating);
  const parts = [rng.pick(openings[mood]), rng.pick(middles[mood][product])];
  if (rng.chance(0.45)) {
    const other = rng.pick(middles[mood][product]);
    if (!parts.includes(other)) parts.push(other);
  }
  const closing = rng.pick(closings[mood]);
  if (closing) parts.push(closing);
  return parts.join(" ");
}

function survey(rng: Rng, rating: number, product: Product, questionnaire: "controle" | "simple") {
  const percent = (offset: number) => Math.round(clamp(rating * 20 + offset + (rng.next() - 0.6) * 10, 0, 100));
  return {
    questionnaire,
    recommendation: percent(2),
    satisfaction: percent(0),
    scores: questionnaireCriteria[product].map((label) => ({
      label,
      score: Math.round(clamp(rating * 2 + (rng.next() - 0.55) * 2.4, 0, 10)),
    })),
  };
}

/** The agency manager answers reviews that aren't linked to a staff member. */
const managerOf = (seeds: TeamMemberSeed[]) => seeds.find((seed) => seed.role.startsWith("Direct")) ?? seeds[0];

export interface AgencyDataset {
  team: Collaborator[];
  reviews: Review[];
}

const cache = new Map<string, AgencyDataset>();

/** Deterministic demo data for one agency: same output on every render, server and client. */
export function getAgencyDataset(agency: Agency): AgencyDataset {
  const cached = cache.get(agency.id);
  if (cached) return cached;

  const rng = createRng(seedFrom(`reviews-${agency.id}`));
  const seeds = teamSeeds(agency);
  const staffWeights = seeds.map(() => 0.6 + rng.next());
  const counts = sourceCounts(agency);
  const reviews: Review[] = [];

  const push = (source: ReviewSource) => {
    const fromOs = source === "os_certified" || source === "os_simple";
    const staff = fromOs ? rng.weighted(seeds, staffWeights) : undefined;
    const product = staff ? rng.pick(staff.products) : rng.weighted(allProducts, productWeights);

    // Verified surveys score higher than internal ones; each person's mix lands near their target score.
    const mean =
      source === "os_certified" ? (staff!.targetScore + 0.85)
      : source === "os_simple" ? (staff!.targetScore - 0.3)
      : source === "import_iso" ? 4.85
      : 4.6;
    const rating = drawRating(rng, mean);
    const mood = moodOf(rating);
    const id = `${agency.id}-${reviews.length + 1}`;

    const daysAgo = Math.min(1300, Math.floor(-Math.log(1 - rng.next()) * 260));
    const firstName = rng.pick(firstNames);
    const review: Review = {
      id,
      status: source === "os_certified" || source === "import_iso" ? "controle" : "non_controle",
      source,
      rating,
      daysAgo,
      authorName: `${firstName} ${rng.pick(lastInitials)}.`,
      comment: writeComment(rng, rating, product),
      product,
      criteria: rng.sample(moodCriteria[mood], rng.int(1, 3)),
      collaboratorId: staff?.id,
      usefulCount: rng.chance(0.3) ? 0 : rng.int(1, 48),
      reviewNumber: String(100000000000 + Math.floor(rng.next() * 899999999999)),
      survey: fromOs ? survey(rng, rating, product, source === "os_certified" ? "controle" : "simple") : undefined,
    };

    // Agencies answer unhappy customers more often. Imported reviews are answered by the agency manager.
    const replyChance = mood === "negative" ? 0.6 : mood === "neutral" ? 0.25 : 0.08;
    if (rng.chance(replyChance)) {
      review.reply = {
        collaboratorId: (staff ?? managerOf(seeds)).id,
        daysAfter: Math.min(daysAgo, rng.int(0, 4)),
        text: rng.pick(replies[mood]).replace("{name}", firstName),
      };
    }
    reviews.push(review);
  };

  (Object.keys(counts) as ReviewSource[]).forEach((source) => {
    for (let i = 0; i < counts[source]; i++) push(source);
  });

  reviews.sort((a, b) => a.daysAgo - b.daysAgo || a.id.localeCompare(b.id));

  const team: Collaborator[] = seeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    role: seed.role,
    email: seed.email,
    photo: seed.photo,
    socials: seed.socials,
  }));

  const dataset = { team, reviews };
  cache.set(agency.id, dataset);
  return dataset;
}
