import { describe, expect, it } from "vitest";
import { getAgency, mainAgencyId } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import { buildAnswer, detectIntent, normalize, quickQuestions, type AnswerContext } from "./assistant";

const agency = getAgency(mainAgencyId)!;
const { team, reviews } = getAgencyDataset(agency);
const context: AnswerContext = {
  agency,
  team,
  reviews,
  format: {
    score: (value) => value.toFixed(1),
    count: String,
    criterion: String,
    criterionPhrase: String,
    productPhrase: String,
    list: (items) => items.join(", "),
  },
};

describe("normalize", () => {
  it("drops accents, case and punctuation", () => {
    expect(normalize("Réactivité, l'équipe ?")).toBe("reactivite l equipe ");
  });
});

describe("detectIntent", () => {
  const intent = (question: string) => detectIntent(question, team);

  it("understands the main kinds of questions", () => {
    expect(intent("Quels sont les points faibles ?")).toEqual({ kind: "strengths" });
    expect(intent("Je veux vendre ma maison")).toEqual({ kind: "product", product: "vente" });
    expect(intent("Combien vaut mon appartement ? une estimation ?")).toEqual({ kind: "product", product: "estimation" });
    expect(intent("Sont-ils réactifs ?")).toEqual({ kind: "criterion", criterion: "reactivite" });
    expect(intent("Les honoraires sont-ils trop chers ?")).toEqual({ kind: "criterion", criterion: "honoraires" });
    expect(intent("Qui est le meilleur conseiller ?")).toEqual({ kind: "team" });
    expect(intent("Les avis sont-ils vérifiés ?")).toEqual({ kind: "verified" });
    expect(intent("Quels sont vos horaires ?")).toEqual({ kind: "contact" });
    expect(intent("Que pensent les clients ?")).toEqual({ kind: "summary" });
    expect(intent("Quelle est la capitale du Pérou")).toEqual({ kind: "fallback" });
  });

  it("recognises a staff member by name", () => {
    expect(intent("Que pensez-vous d'Emma Dubois ?")).toEqual({ kind: "person", id: "emma-dubois" });
    expect(intent("emma est-elle bien ?")).toEqual({ kind: "person", id: "emma-dubois" });
  });

  it("does not read 'chercher' as a price question", () => {
    expect(intent("Je cherche une bonne agence")).toEqual({ kind: "summary" });
  });
});

describe("buildAnswer", () => {
  it("answers every ready-made question", () => {
    for (const question of quickQuestions) {
      const blocks = buildAnswer(question.intent, context);
      expect(blocks.length).toBeGreaterThan(1);
    }
  });

  it("uses the same score as the page", () => {
    const [intro] = buildAnswer({ kind: "summary" }, context);
    const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
    expect(intro).toMatchObject({ type: "text", key: "summary.intro", values: { score: average.toFixed(1), count: String(reviews.length) } });
  });

  it("links to the matching reviews", () => {
    const blocks = buildAnswer({ kind: "product", product: "vente" }, context);
    expect(blocks.at(-1)).toMatchObject({ type: "action", target: { filters: { products: ["vente"] } } });
  });

  it("has a polite fallback", () => {
    expect(buildAnswer({ kind: "fallback" }, context)).toEqual([{ type: "text", key: "fallback" }]);
  });
});
