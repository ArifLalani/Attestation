import type { Agency, Collaborator, Criterion, Product, Review } from "@/data/types";
import type { ReviewFilters } from "./reviewFilters";
import { isPublic, summarize } from "./scoring";

// "Demander à l'IA" is simulated: answers are built from the agency's own reviews, so they always match the page.

export type Intent =
  | { kind: "summary" }
  | { kind: "strengths" }
  | { kind: "product"; product: Product }
  | { kind: "team" }
  | { kind: "person"; id: string }
  | { kind: "criterion"; criterion: Criterion }
  | { kind: "verified" }
  | { kind: "contact" }
  | { kind: "recent" }
  | { kind: "fallback" };

/** The four ready-made questions, in display order. */
export const quickQuestions = [
  { key: "summary", intent: { kind: "summary" } },
  { key: "strengths", intent: { kind: "strengths" } },
  { key: "sell", intent: { kind: "product", product: "vente" } },
  { key: "team", intent: { kind: "team" } },
] as const satisfies readonly { key: string; intent: Intent }[];

export type QuickQuestionKey = (typeof quickQuestions)[number]["key"];

type Values = Record<string, string | number>;
/** A line of an answer: a message key under "Assistant.answers" and its values. */
export interface AnswerLine {
  key: string;
  values?: Values;
}
export type AnswerTarget = { filters: Partial<ReviewFilters> } | { section: "agences" } | { panel: "contact" };
export type AnswerBlock =
  | ({ type: "text" } & AnswerLine)
  | { type: "bullets"; items: AnswerLine[] }
  | ({ type: "action"; target: AnswerTarget } & AnswerLine);

/** Words are matched without accents or case. */
export const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ");

const has = (text: string, words: string[]) => words.some((word) => text.includes(word));

const criterionWords: [Criterion, string[]][] = [
  ["honoraires", ["honoraire", "prix", "frais", "tarif", " cher ", " chere ", " chers ", "commission", "cout"]],
  ["reactivite", ["reacti", "rapide", "rapidite", "delai", "repond", "disponib", "joignable"]],
  ["accueil", ["accueil", "sympa", "aimable", "gentil", "chaleureu"]],
  ["conseil", ["conseil ", "conseils"]],
  ["competence", ["competen", "professionnel", "serieux", "expert"]],
  ["suivi", ["suivi"]],
  ["transparence", ["transparen", "honnete", "honnetete"]],
];

const productWords: [Product, string[]][] = [
  ["estimation", ["estim", "evaluer", "evaluation", "combien vaut", "valeur de"]],
  ["vente", ["vendre", "vente", "vendeur", "mandat"]],
  ["achat", ["achet", "achat", "acquereur", "acquerir"]],
  ["gestion_locative", ["gestion", "gerer", "bailleur", "loyer"]],
  ["location", ["louer", "location", "locataire", "bail"]],
  ["syndic", ["syndic", "copro"]],
];

export function detectIntent(question: string, team: Collaborator[]): Intent {
  const text = ` ${normalize(question)} `;

  // A staff member by full name, or by a first or last name only one person has.
  const parts = team.map((person) => normalize(person.name).split(" "));
  for (const [index, person] of team.entries()) {
    const [first, ...rest] = parts[index];
    const last = rest.join(" ");
    const unique = (name: string, at: number) => parts.filter((other) => other[at] === name).length === 1;
    if (text.includes(` ${first} ${last}`) || (unique(first, 0) && text.includes(` ${first} `)) || (last.length > 3 && text.includes(` ${last} `))) {
      return { kind: "person", id: person.id };
    }
  }

  if (has(text, ["horaire", "ouvert", "telephone", "appeler", "joindre", "contacter", "adresse", " ou est", " ou se trouve", "rendez vous", " rdv", "mail"])) return { kind: "contact" };
  if (has(text, ["controle", "verifie", "fiable", "faux", "authentique", "certifi", "afnor", " iso", "confiance", "vrais avis"])) return { kind: "verified" };
  if (has(text, ["point fort", "points forts", "point faible", "points faibles", "positif", "negatif", "defaut", "avantage", "inconvenient", "critique", "reproche", "plainte", "probleme", "mauvais"])) return { kind: "strengths" };
  for (const [criterion, words] of criterionWords) if (has(text, words)) return { kind: "criterion", criterion };
  for (const [product, words] of productWords) if (has(text, words)) return { kind: "product", product };
  if (has(text, ["equipe", "conseiller", "agent", "negociat", "collaborat", "personnel", " qui "])) return { kind: "team" };
  if (has(text, ["recent", "dernier", "derniere", "evolution", "tendance", "ce mois", "cette annee", "en ce moment"])) return { kind: "recent" };
  if (has(text, ["resum", "avis", "pense", "general", "note", "score", "recommand", "bonne agence", "synthese", "en bref", "client"])) return { kind: "summary" };
  return { kind: "fallback" };
}

// --- Facts -----------------------------------------------------------------------------------------

const positive = (review: Review) => review.rating >= 4;
const negative = (review: Review) => review.rating < 3;
const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

/** Criteria most cited in a set of reviews, with the share of those reviews citing each. */
function topCriteria(reviews: Review[], limit: number, exclude: Criterion[] = []) {
  const counts = new Map<Criterion, number>();
  for (const review of reviews) for (const criterion of review.criteria) counts.set(criterion, (counts.get(criterion) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([criterion]) => !exclude.includes(criterion))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([criterion, count]) => ({ criterion, share: percent(count, reviews.length) }));
}

/** Staff ranked by average, among those with enough reviews to be shown publicly. */
function rankStaff(reviews: Review[], team: Collaborator[], threshold: number) {
  return team
    .map((person) => ({ person, ...summarize(reviews.filter((review) => review.collaboratorId === person.id)) }))
    .filter((entry) => entry.average !== null && isPublic(entry.count, threshold))
    .sort((a, b) => b.average! - a.average! || b.count - a.count);
}

export interface AnswerContext {
  agency: Agency;
  team: Collaborator[];
  reviews: Review[];
  /** Formatting and labels come from the page, so numbers and words match it exactly. */
  format: {
    score: (value: number) => string;
    count: (value: number) => string;
    criterion: (criterion: Criterion) => string;
    criterionPhrase: (criterion: Criterion) => string;
    productPhrase: (product: Product) => string;
    list: (items: string[]) => string;
  };
}

export function buildAnswer(intent: Intent, { agency, team, reviews, format }: AnswerContext): AnswerBlock[] {
  const name = `${agency.name} · ${agency.city}`;
  const all = summarize(reviews);
  if (!all.average) return [{ type: "text", key: "noReviews", values: { name } }];

  const text = (key: string, values?: Values): AnswerBlock => ({ type: "text", key, values });
  const action = (key: string, target: AnswerTarget, values?: Values): AnswerBlock => ({ type: "action", key, target, values });
  const staffLine = (entry: ReturnType<typeof rankStaff>[number]): AnswerLine => ({
    key: "staffLine",
    values: { name: entry.person.name, role: entry.person.role, score: format.score(entry.average!), count: format.count(entry.count) },
  });

  switch (intent.kind) {
    case "summary": {
      const controle = summarize(reviews.filter((review) => review.status === "controle"));
      const strengths = topCriteria(reviews.filter(positive), 3).map((entry) => format.criterionPhrase(entry.criterion));
      const year = summarize(reviews.filter((review) => review.daysAgo < 365));
      const before = summarize(reviews.filter((review) => review.daysAgo >= 365 && review.daysAgo < 730));
      const delta = year.average !== null && before.average !== null ? year.average - before.average : 0;
      return [
        text("summary.intro", { name, score: format.score(all.average), count: format.count(all.count), positive: percent(reviews.filter(positive).length, all.count) }),
        ...(controle.average ? [text("summary.controle", { score: format.score(controle.average), count: format.count(controle.count) })] : []),
        text("summary.strengths", { list: format.list(strengths) }),
        ...(year.average ? [text(`summary.trend.${delta > 0.05 ? "up" : delta < -0.05 ? "down" : "stable"}`, { score: format.score(year.average), count: format.count(year.count) })] : []),
        action("actions.recentYear", { filters: { period: "year" } }),
      ];
    }
    case "strengths": {
      const negatives = reviews.filter(negative);
      const strengths = topCriteria(reviews.filter(positive), 3);
      // A criterion is either a strength or a weakness, never both.
      const weaknesses = topCriteria(negatives, 2, strengths.map((entry) => entry.criterion));
      const answered = negatives.filter((review) => review.reply).length;
      return [
        text("strengths.good"),
        { type: "bullets", items: strengths.map((entry) => ({ key: "criterionPositive", values: { criterion: format.criterion(entry.criterion), share: entry.share } })) },
        ...(weaknesses.length
          ? [
              text("strengths.bad"),
              { type: "bullets", items: weaknesses.map((entry) => ({ key: "criterionNegative", values: { criterion: format.criterion(entry.criterion), share: entry.share } })) } as AnswerBlock,
              text("strengths.rare", { share: percent(negatives.length, all.count), replied: percent(answered, negatives.length) }),
              action("actions.criterion", { filters: { criteria: [weaknesses[0].criterion] } }, { criterion: format.criterionPhrase(weaknesses[0].criterion) }),
            ]
          : []),
      ];
    }
    case "product": {
      const subset = reviews.filter((review) => review.product === intent.product);
      const summary = summarize(subset);
      const product = format.productPhrase(intent.product);
      if (!summary.average || !isPublic(summary.count, agency.publicThreshold)) return [text("product.none", { name, product })];
      const best = rankStaff(subset, team, agency.publicThreshold).slice(0, 2);
      const verdict = summary.average >= 4.3 ? "great" : summary.average >= 3.8 ? "good" : "mixed";
      return [
        text("product.intro", { name, product, score: format.score(summary.average), count: format.count(summary.count), positive: percent(subset.filter(positive).length, summary.count) }),
        text(`product.verdict.${verdict}`, { product }),
        ...(best.length ? [text("product.best", { product }), { type: "bullets", items: best.map(staffLine) } as AnswerBlock] : []),
        action("actions.product", { filters: { products: [intent.product] } }, { product }),
      ];
    }
    case "team": {
      const ranked = rankStaff(reviews, team, agency.publicThreshold);
      const praised = topCriteria(reviews.filter((review) => review.collaboratorId && positive(review)), 2).map((entry) => format.criterionPhrase(entry.criterion));
      return [
        text("team.intro", { count: team.length }),
        { type: "bullets", items: ranked.slice(0, 3).map(staffLine) },
        text("team.praised", { list: format.list(praised) }),
        action("actions.team", { section: "agences" }),
      ];
    }
    case "person": {
      const person = team.find((member) => member.id === intent.id)!;
      const subset = reviews.filter((review) => review.collaboratorId === person.id);
      const summary = summarize(subset);
      if (!summary.average || !isPublic(summary.count, agency.publicThreshold)) return [text("person.none", { name: person.name })];
      const cited = topCriteria(subset.filter(positive), 2).map((entry) => format.criterionPhrase(entry.criterion));
      return [
        text("person.intro", { name: person.name, role: person.role, score: format.score(summary.average), count: format.count(summary.count) }),
        text("person.cited", { list: format.list(cited) }),
        action("actions.person", { filters: { collaboratorId: person.id } }, { name: person.name }),
      ];
    }
    case "criterion": {
      const subset = reviews.filter((review) => review.criteria.includes(intent.criterion));
      const { average } = summarize(subset);
      const criterion = format.criterionPhrase(intent.criterion);
      if (average === null) return [text("criterion.none", { criterion })];
      return [
        text("criterion.intro", { criterion, count: format.count(subset.length), score: format.score(average) }),
        text(`criterion.verdict.${average >= 4.2 ? "strength" : average >= 3.5 ? "mixed" : "weakness"}`, { criterion }),
        action("actions.criterion", { filters: { criteria: [intent.criterion] } }, { criterion }),
      ];
    }
    case "verified": {
      const controle = summarize(reviews.filter((review) => review.status === "controle"));
      return [
        text("verified.what"),
        ...(controle.average
          ? [text("verified.agency", { name, count: format.count(controle.count), score: format.score(controle.average), others: format.count(all.count - controle.count) })]
          : []),
        action("actions.verified", { filters: { type: "controle" } }),
      ];
    }
    case "contact":
      return [text("contact.intro", { name, address: agency.address, phone: agency.phone }), action("actions.contact", { panel: "contact" })];
    case "recent": {
      const month = summarize(reviews.filter((review) => review.daysAgo < 30));
      const year = summarize(reviews.filter((review) => review.daysAgo < 365));
      return [
        ...(month.average ? [text("recent.month", { count: format.count(month.count), score: format.score(month.average) })] : [text("recent.noMonth")]),
        ...(year.average ? [text("recent.year", { count: format.count(year.count), score: format.score(year.average), all: format.score(all.average) })] : []),
        action("actions.recentMonth", { filters: { period: "month" } }),
      ];
    }
    case "fallback":
      return [text("fallback")];
  }
}
