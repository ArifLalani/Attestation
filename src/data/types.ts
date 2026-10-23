export type ReviewStatus = "controle" | "non_controle";

/** Where a review comes from. Drives the badge, the source icon and which details exist. */
export type ReviewSource = "os_certified" | "os_simple" | "import_iso" | "google";

export type Product =
  | "vente"
  | "achat"
  | "location"
  | "gestion_locative"
  | "syndic"
  | "estimation";

export type Criterion =
  | "accueil"
  | "conseil"
  | "competence"
  | "reactivite"
  | "suivi"
  | "transparence"
  | "honoraires";

export interface CriterionScore {
  label: string;
  /** Out of 10. */
  score: number;
}

/** Only reviews collected through an Opinion System survey have this. */
export interface SurveyDetails {
  questionnaire: "controle" | "simple";
  /** Percent, 0–100. */
  recommendation: number;
  satisfaction: number;
  scores: CriterionScore[];
}

export interface Review {
  id: string;
  status: ReviewStatus;
  source: ReviewSource;
  /** 0–5, one decimal. */
  rating: number;
  /** Days before "now". 0 = today. Relative so the demo never looks stale. */
  daysAgo: number;
  authorName: string;
  comment?: string;
  product: Product;
  criteria: Criterion[];
  /** Staff member who sent the survey. Opinion System sources only. */
  collaboratorId?: string;
  usefulCount: number;
  reviewNumber: string;
  survey?: SurveyDetails;
  /** Public reply from the agency (written in the members area, a later phase). */
  reply?: ReviewReply;
}

export interface ReviewReply {
  collaboratorId: string;
  /** Days after the review. */
  daysAfter: number;
  text: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  email: string;
  /** Missing = initials avatar. */
  photo?: string;
  socials: { instagram?: string; facebook?: string; linkedin?: string };
}

/** Opening intervals per weekday, Monday first. Times are "HH:MM", Europe/Paris. */
export type WeekHours = [string, string][][];

export interface Agency {
  id: string;
  name: string;
  sector: string;
  address: string;
  city: string;
  geo: { lat: number; lng: number };
  phone: string;
  email: string;
  website: string;
  whatsapp?: string;
  hours: WeekHours;
  coverPhoto: string;
  logo: string;
  /** Month the agency started collecting verified reviews, e.g. "mars 2022". */
  memberSince: string;
  /** Minimum reviews before a score (agency or staff) is shown publicly. */
  publicThreshold: number;
  sisterAgencyIds: string[];
}
