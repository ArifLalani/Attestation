"use client";

/**
 * Use cases (2026-11-26): the edge states of the certificate page, each one a demo client built from the La Boîte Immo data.
 * Open them at /fr-fr/variantes/finale/cas/<slug>. The default page (/finale/20871) is the « normal » case: real estate,
 * a logo, a photo, a team of 6, 5 agencies, 2 500 reviews.
 */

import { createContext, useContext, useMemo } from "react";
import { agencies as lbiAgencies, getAgency, mainAgencyId } from "@/data/agencies";
import { getAgencyDataset, type AgencyDataset } from "@/data/reviews";
import type { Agency, Collaborator, Criterion, Review } from "@/data/types";

// ---------------------------------------------------------------------------------------------------------------------
// Sectors: the words follow the client's trade (table agreed 2026-11-26).

export type SectorId = "immobilier" | "assurance" | "auto-ecole" | "services";

export interface SectorProfile {
  id: SectorId;
  /** « agence » or « établissement » (lower case, singular). */
  place: string;
  /** Plural. */
  places: string;
  /** « Notre agence » / « Notre établissement ». */
  ourPlace: string;
  /** « Nos agences » / « Nos établissements ». */
  ourPlaces: string;
  /** The tab in the header. */
  tab: string;
  /** Who writes the reviews: « clients », « assurés », « élèves », « intervenants ». */
  people: string;
  /** The team, as the trade calls it: « Négociateurs », « Conseillers », « Moniteurs », « Équipe ». */
  team: string;
  /** The hero's two lines over the photo. */
  kicker: string;
  tagline: string;
  /** One sector question per review criterion (Case 7: the best-rated criterion picks the question). */
  questions: Record<Criterion, string>;
}

const realEstateQuestions: Record<Criterion, string> = {
  accueil: "Comment est l’accueil en agence ?",
  conseil: "Les conseils sont-ils pertinents ?",
  competence: "L’équipe est-elle compétente ?",
  reactivite: "L’agence est-elle réactive ?",
  suivi: "Comment se passe le suivi du dossier ?",
  transparence: "L’agence est-elle transparente ?",
  honoraires: "Les honoraires sont-ils justifiés ?",
};

export const sectors: Record<SectorId, SectorProfile> = {
  immobilier: {
    id: "immobilier", place: "agence", places: "agences", ourPlace: "Notre agence", ourPlaces: "Nos agences", tab: "Agence",
    people: "clients", team: "Négociateurs",
    kicker: "Une équipe. De vraies expériences.", tagline: "Votre projet mérite d’être entre de bonnes mains.",
    questions: realEstateQuestions,
  },
  assurance: {
    id: "assurance", place: "agence", places: "agences", ourPlace: "Notre agence", ourPlaces: "Nos agences", tab: "Agence",
    people: "assurés", team: "Conseillers",
    kicker: "Des conseillers. De vrais avis d’assurés.", tagline: "Votre protection mérite d’être entre de bonnes mains.",
    questions: {
      accueil: "Comment est l’accueil en agence ?",
      conseil: "Les conseils sont-ils adaptés à mes besoins ?",
      competence: "Les conseillers sont-ils compétents ?",
      reactivite: "Comment sont gérés les sinistres ?",
      suivi: "Comment sont gérés les sinistres ?",
      transparence: "Les contrats sont-ils clairs ?",
      honoraires: "Bon rapport qualité/prix ?",
    },
  },
  "auto-ecole": {
    id: "auto-ecole", place: "établissement", places: "établissements", ourPlace: "Notre établissement", ourPlaces: "Nos établissements", tab: "Établissement",
    people: "élèves", team: "Moniteurs",
    kicker: "Des moniteurs. De vrais avis d’élèves.", tagline: "Votre permis mérite d’être entre de bonnes mains.",
    questions: {
      accueil: "Comment est l’accueil ?",
      conseil: "Les moniteurs sont-ils pédagogues ?",
      competence: "Les moniteurs sont-ils pédagogues ?",
      reactivite: "Les délais pour passer le permis ?",
      suivi: "Comment se passe le suivi de la formation ?",
      transparence: "Les tarifs sont-ils clairs ?",
      honoraires: "Rapport qualité/prix ?",
    },
  },
  services: {
    id: "services", place: "établissement", places: "établissements", ourPlace: "Notre établissement", ourPlaces: "Nos établissements", tab: "Établissement",
    people: "clients", team: "Équipe",
    kicker: "Une équipe. De vraies expériences.", tagline: "Votre quotidien mérite d’être entre de bonnes mains.",
    questions: {
      accueil: "Comment est l’accueil ?",
      conseil: "Les conseils sont-ils utiles ?",
      competence: "Les intervenants sont-ils compétents ?",
      reactivite: "L’entreprise est-elle réactive ?",
      suivi: "Comment se passe le suivi ?",
      transparence: "L’entreprise est-elle transparente ?",
      honoraires: "Bon rapport qualité/prix ?",
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------------
// Demo data helpers.

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * A smaller dataset cut from La Boîte Immo's: `count` reviews spread over the whole history, their ratings shifted so the
 * average lands on `average`. Reviews that point to someone outside `team` lose that link (and their reply).
 */
function derive(count: number, average: number, team: Collaborator[], salt = 0): AgencyDataset {
  const source = getAgencyDataset(getAgency(mainAgencyId)!).reviews;
  const step = source.length / Math.max(1, count);
  const picked: Review[] = [];
  for (let i = 0; i < count; i++) picked.push(source[Math.min(source.length - 1, Math.floor(i * step + (salt % Math.max(1, Math.floor(step)))))]);
  const ids = new Set(team.map((member) => member.id));
  let reviews = picked.map((review, index) => {
    const linked = review.collaboratorId && ids.has(review.collaboratorId) ? review.collaboratorId : undefined;
    const reply = review.reply && ids.has(review.reply.collaboratorId) ? review.reply : undefined;
    return { ...review, id: `${review.id}-c${salt}-${index}`, collaboratorId: linked, reply };
  });
  for (let pass = 0; pass < 12 && reviews.length; pass++) {
    const mean = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const delta = average - mean;
    if (Math.abs(delta) < 0.02) break;
    reviews = reviews.map((review) => ({ ...review, rating: Math.min(5, Math.max(0.5, round1(review.rating + delta))) }));
  }
  return { team, reviews };
}

const lbi = getAgency(mainAgencyId)!;
const lbiTeam = () => getAgencyDataset(lbi).team;

/** Six to fourteen more La Boîte Immo agencies around Toulon and Marseille, for Case 9 (more than 5 agencies). */
const extraPlaces: [string, string, number, number][] = [
  ["Sanary-sur-Mer", "4 Quai Wilson, 83110 Sanary-sur-Mer, France", 43.1192, 5.8013],
  ["Bandol", "18 All. Jean Moulin, 83150 Bandol, France", 43.1366, 5.7536],
  ["La Seyne-sur-Mer", "9 Pl. Martel Esprit, 83500 La Seyne-sur-Mer, France", 43.1009, 5.8786],
  ["Six-Fours-les-Plages", "51 Av. du Maréchal Juin, 83140 Six-Fours-les-Plages, France", 43.0937, 5.8395],
  ["Ollioules", "2 Pl. Jean Jaurès, 83190 Ollioules, France", 43.1395, 5.8473],
  ["La Valette-du-Var", "7 Av. Pablo Picasso, 83160 La Valette-du-Var, France", 43.1375, 5.9831],
  ["La Garde", "26 Rue Raspail, 83130 La Garde, France", 43.1246, 6.0109],
  ["Le Pradet", "3 Pl. du Général de Gaulle, 83220 Le Pradet, France", 43.1059, 6.0213],
  ["Bormes-les-Mimosas", "1 Pl. Saint-François, 83230 Bormes-les-Mimosas, France", 43.1508, 6.3418],
  ["Cogolin", "12 Rue Nationale, 83310 Cogolin, France", 43.2526, 6.5299],
  ["Sainte-Maxime", "5 Av. Charles de Gaulle, 83120 Sainte-Maxime, France", 43.3093, 6.6359],
  ["Brignoles", "14 Pl. Carami, 83170 Brignoles, France", 43.4058, 6.0616],
  ["Aubagne", "8 Cours Maréchal Foch, 13400 Aubagne, France", 43.2927, 5.5708],
  ["Marseille 8e", "120 Av. du Prado, 13008 Marseille, France", 43.2731, 5.3925],
];

function extraAgencies(): Agency[] {
  return extraPlaces.map(([city, address, lat, lng], index) => ({
    ...lbiAgencies[1 + (index % 4)],
    id: `cas9-${index + 1}`,
    city,
    address,
    geo: { lat, lng },
    phone: `+33 4 65 71 2${5 + Math.floor(index / 10)} ${String((index % 10) * 10).padStart(2, "0")}`,
    email: `${city.toLowerCase().normalize("NFD").replace(/[^a-z]+/g, "")}@lbi.fr`,
    sisterAgencyIds: [],
  }));
}

// ---------------------------------------------------------------------------------------------------------------------
// The cases.

export interface UseCase {
  slug: string;
  /** Case number and short title, for the index and the screenshots. */
  title: string;
  agency: Agency;
  dataset: AgencyDataset;
  sector: SectorId;
  /** Other agencies of the client that are not in the La Boîte Immo data. */
  extraAgencies?: Agency[];
  /** Case 7: the criterion the sector question comes from, when the demo should show a given one. */
  criterion?: Criterion;
  /** The review quoted in the hero without a photo, written for the sector (the demo reviews are about real estate). */
  quote?: { comment: string; authorName: string; productLabel: string; daysAgo: number };
}

const noPhotos = { coverPhoto: "", photos: [] as string[] };

export function buildCase(slug: string): UseCase | null {
  switch (slug) {
    case "1-sans-logo":
      return { slug, title: "Cas 1 · Client sans logo", sector: "immobilier", agency: { ...lbi, id: "cas1", logo: "" }, dataset: getAgencyDataset(lbi) };
    case "2-nom-long": {
      const team = lbiTeam().slice(0, 3).map((member, index) => ({ ...member, role: ["Responsable d’agence", "Chargée de relation intervenants", "Coordinatrice de prestations"][index] }));
      return {
        slug, title: "Cas 2 · Nom d’entreprise trop long", sector: "services",
        quote: { comment: "Une intervenante adorable et ponctuelle avec nos enfants. L’agence est très réactive quand on a besoin d’un changement.", authorName: "Camille Dumas", productLabel: "Garde d’enfants", daysAgo: 5 },
        agency: { ...lbi, ...noPhotos, id: "cas2", website: "https://www.opinionsystem.fr/fr-fr/certificate/c/139680", name: "BABYCHOU SERVICES - RELATIONS INTERVENANTS - Babychou Services Avignon", sector: "Services à domicile", city: "Avignon", address: "4 Rue de la République, 84000 Avignon, France", geo: { lat: 43.9476, lng: 4.8055 }, logo: "", sisterAgencyIds: [], memberSince: "septembre 2021" },
        dataset: derive(32, 4.6, team, 2),
      };
    }
    case "3-sans-avis":
      return {
        slug, title: "Cas 3 · Aucun avis client", sector: "immobilier",
        agency: { ...lbi, id: "cas3", website: "https://www.opinionsystem.fr/", name: "1894 L'Immobilier", sector: "Agence immobilière", city: "Marseille", address: "27 Rue Paradis, 13001 Marseille, France", geo: { lat: 43.2925, lng: 5.3781 }, logo: "", sisterAgencyIds: [], memberSince: "octobre 2023" },
        dataset: { team: [{ ...lbiTeam()[0], id: "philippe-campos", name: "Philippe Campos", role: "Directeur d’agence", email: "philippe.campos@1894immo.fr" }], reviews: [] },
      };
    case "4-assurance":
      return {
        slug, title: "Cas 4 · Client hors immobilier (assurance)", sector: "assurance", criterion: "suivi",
        quote: { comment: "Sinistre dégât des eaux réglé en trois semaines, avec un conseiller qui nous a rappelés à chaque étape. Très rassurant.", authorName: "Delphine Roux", productLabel: "Assurance habitation", daysAgo: 21 },
        agency: { ...lbi, ...noPhotos, id: "cas4a", website: "https://www.generali.fr/", name: "Assurance Generali – Segui et Paoli", sector: "Agence d’assurance", city: "Menton", address: "15 Av. Félix Faure, 06500 Menton, France", geo: { lat: 43.7753, lng: 7.4975 }, logo: "", sisterAgencyIds: [], memberSince: "juin 2020" },
        dataset: derive(67, 4.5, [], 4),
      };
    case "4-auto-ecole": {
      const second: Agency = { ...lbi, ...noPhotos, id: "cas4b-2", name: "Auto-école Dubard", sector: "Auto-école", city: "Saint-Pierre", address: "36 Rue Victor Le Vigoureux, 97410 Saint-Pierre, La Réunion", geo: { lat: -21.3393, lng: 55.4781 }, logo: "", sisterAgencyIds: [] };
      return {
        slug, title: "Cas 4 · Client hors immobilier (auto-école)", sector: "auto-ecole", criterion: "honoraires",
        quote: { comment: "Permis obtenu du premier coup ! Moniteurs patients et pédagogues, planning des leçons très souple.", authorName: "Lucas Morel", productLabel: "Permis B", daysAgo: 9 },
        agency: { ...lbi, ...noPhotos, id: "cas4b", website: "https://www.opinionsystem.fr/", name: "Auto-école Dubard", sector: "Auto-école", city: "Saint-Denis", address: "12 Rue Jean Chatel, 97400 Saint-Denis, La Réunion", geo: { lat: -20.8789, lng: 55.4481 }, logo: "", sisterAgencyIds: [second.id], memberSince: "février 2019" },
        dataset: derive(479, 4.8, [], 6),
        extraAgencies: [second],
      };
    }
    case "5-sans-equipe":
      return { slug, title: "Cas 5 · Pas d’équipe", sector: "immobilier", agency: { ...lbi, id: "cas5" }, dataset: { team: [], reviews: getAgencyDataset(lbi).reviews.map((review) => ({ ...review, collaboratorId: undefined, reply: undefined })) } };
    case "6-une-agence":
      return { slug, title: "Cas 6 · Pas d’autres agences", sector: "immobilier", agency: { ...lbi, id: "cas6", sisterAgencyIds: [] }, dataset: getAgencyDataset(lbi) };
    case "8-sans-photo":
      return { slug, title: "Cas 8 · Pas de photo", sector: "immobilier", agency: { ...lbi, ...noPhotos, id: "cas8" }, dataset: getAgencyDataset(lbi) };
    case "9-plus-de-5": {
      const more = extraAgencies();
      return { slug, title: "Cas 9 · Plus de 5 agences", sector: "immobilier", agency: { ...lbi, id: "cas9", sisterAgencyIds: [...lbi.sisterAgencyIds, ...more.map((item) => item.id)] }, dataset: getAgencyDataset(lbi), extraAgencies: more };
    }
    default:
      return null;
  }
}

export { caseSlugs } from "./caseSlugs";

// ---------------------------------------------------------------------------------------------------------------------
// Context: what the V2 components read. Without a case, the real-estate defaults and the normal data.

interface CaseState {
  useCase: UseCase | null;
  sector: SectorProfile;
  agencyById: (id: string) => Agency | undefined;
  datasetFor: (agency: Agency) => AgencyDataset;
}

const defaultState: CaseState = {
  useCase: null,
  sector: sectors.immobilier,
  agencyById: getAgency,
  datasetFor: getAgencyDataset,
};

const CaseContext = createContext<CaseState>(defaultState);

export function CaseProvider({ value, children }: { value: UseCase | null; children: React.ReactNode }) {
  const state = useMemo<CaseState>(() => {
    if (!value) return defaultState;
    const extras = new Map((value.extraAgencies ?? []).map((agency) => [agency.id, agency]));
    // The client's other agencies get their own small dataset (their pins and cards show a score).
    const extraData = new Map<string, AgencyDataset>();
    return {
      useCase: value,
      sector: sectors[value.sector],
      agencyById: (id) => (id === value.agency.id ? value.agency : extras.get(id) ?? getAgency(id)),
      datasetFor: (agency) => {
        if (agency.id === value.agency.id) return value.dataset;
        if (!extras.has(agency.id)) return getAgencyDataset(agency);
        if (!extraData.has(agency.id)) {
          const index = [...extras.keys()].indexOf(agency.id);
          extraData.set(agency.id, derive(40 + ((index * 37) % 160), 4.1 + ((index * 3) % 8) / 10, [], 10 + index));
        }
        return extraData.get(agency.id)!;
      },
    };
  }, [value]);
  return <CaseContext value={state}>{children}</CaseContext>;
}

export function useCaseData() {
  return useContext(CaseContext);
}

// ---------------------------------------------------------------------------------------------------------------------
// Case 7: the « Demandez à votre IA » questions. At most 3, in this order:
// 1. Summarise the reviews (with the sector's word), or, without reviews, what the Opinion System label guarantees.
// 2. A sector question, from the best-rated criterion.
// 3. Introduce the team (2 people or more), else the other agencies (2 or more), else hours and access.

export interface AiQuestion {
  key: string;
  label: string;
  prompt: (url: string) => string;
}

/** The criterion whose reviews have the best average (at least 3 reviews mention it). */
export function bestCriterion(reviews: Review[]): Criterion | null {
  const totals = new Map<Criterion, { sum: number; count: number }>();
  for (const review of reviews) {
    for (const criterion of review.criteria) {
      const entry = totals.get(criterion) ?? { sum: 0, count: 0 };
      entry.sum += review.rating;
      entry.count += 1;
      totals.set(criterion, entry);
    }
  }
  let best: Criterion | null = null;
  let bestAverage = -1;
  for (const [criterion, { sum, count }] of totals) {
    if (count < 3) continue;
    const average = sum / count;
    if (average > bestAverage) {
      best = criterion;
      bestAverage = average;
    }
  }
  return best;
}

export function useAiQuestions(agency: Agency, team: Collaborator[], reviews: Review[]): { questions: AiQuestion[]; reads: string } {
  const { sector, useCase } = useCaseData();
  return useMemo(() => {
    const where = `${agency.name} à ${agency.city}`;
    const questions: AiQuestion[] = [];
    if (reviews.length > 0) {
      questions.push({ key: "reviews", label: `Résumer les avis des ${sector.people}`, prompt: (url) => `Résume les avis des ${sector.people} de ${where} à partir de cette page : ${url}` });
      const criterion = useCase?.criterion ?? bestCriterion(reviews);
      if (criterion) {
        const question = sector.questions[criterion];
        questions.push({ key: "sector", label: question, prompt: (url) => `${question} Réponds au sujet de ${where}, d’après les avis de cette page : ${url}` });
      }
    } else {
      questions.push({ key: "label", label: "Que garantit le label Opinion System ?", prompt: (url) => `Que garantit le label Opinion System affiché par ${where} ? Réponds d’après cette page : ${url}` });
    }
    if (team.length >= 2) {
      questions.push({ key: "team", label: "Présenter l’équipe", prompt: (url) => `Présente-moi l’équipe de ${where} et ce que les ${sector.people} en disent, d’après cette page : ${url}` });
    } else if (agency.sisterAgencyIds.length >= 2) {
      questions.push({ key: "agencies", label: `Horaires et autres ${sector.places}`, prompt: (url) => `Quels sont les horaires de ${where} et ses autres ${sector.places} ? Réponds d’après cette page : ${url}` });
    } else {
      questions.push({ key: "access", label: "Horaires et accès", prompt: (url) => `Quels sont les horaires de ${where} et comment s’y rendre ? Réponds d’après cette page : ${url}` });
    }
    // What the AI reads on the page, for the card's text: « (avis, équipe, horaires) », without what the page doesn't have.
    const reads = [reviews.length > 0 && "avis", team.length > 0 && "équipe", "horaires"].filter(Boolean).join(", ");
    return { questions: questions.slice(0, 3), reads };
  }, [agency, team, reviews, sector, useCase]);
}

/** Initials for a company without a logo (Case 1): the first letters of the first two words that count. */
export function companyInitials(name: string) {
  // Words that start with a letter, without « L' », « de », « et »… (« 1894 L'Immobilier » → IM, « Auto-école Dubard » → AD).
  const words = name.replace(/\s[–-]\s/g, " ").split(/\s+/)
    .map((word) => word.replace(/^[ld]['’]/i, ""))
    .filter((word) => /^\p{L}/u.test(word) && !/^(la|le|les|de|des|du|et)$/i.test(word));
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}
