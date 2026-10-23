import type { Criterion, Product } from "./types";

// Demo review content (French, as written by customers). UI labels live in messages/fr.json.

export const firstNames = [
  "Lucas", "Camille", "Nathalie", "Julien", "Sophie", "Thomas", "Isabelle", "Nicolas", "Céline", "Antoine",
  "Marion", "Pierre", "Aurélie", "Olivier", "Élodie", "Stéphane", "Laure", "Mathieu", "Sandrine", "Guillaume",
  "Claire", "François", "Valérie", "Romain", "Delphine", "Benoît", "Anne", "Sébastien", "Hélène", "Vincent",
  "Manon", "Jérôme", "Pauline", "Christophe", "Émilie", "Philippe", "Charlotte", "Laurent", "Agnès", "Maxime",
  "Sylvie", "David", "Mélanie", "Patrick", "Lucie", "Alexandre", "Caroline", "Michel", "Juliette", "Yannick",
  "Brigitte", "Kevin", "Morgane", "Gilles", "Océane", "Bernard", "Léa", "Damien", "Chantal", "Florian",
];

export const lastInitials = "ABCDEFGHJLMNPRSTV".split("");

/** Criteria of each product's questionnaire, scored out of 10 in Détails. */
export const questionnaireCriteria: Record<Product, string[]> = {
  vente: [
    "Prise en charge générale",
    "Compétence/efficacité",
    "Rapidité de vente",
    "Clarté/précision des comptes rendus",
    "Rapport honoraires/service",
  ],
  achat: [
    "Prise en charge générale",
    "Compréhension du besoin",
    "Pertinence des biens proposés",
    "Accompagnement jusqu'à l'acte",
    "Rapport honoraires/service",
  ],
  location: [
    "Prise en charge générale",
    "Qualité des visites",
    "Rapidité du dossier",
    "Clarté du bail et de l'état des lieux",
    "Disponibilité",
  ],
  gestion_locative: [
    "Prise en charge générale",
    "Compétence/efficacité",
    "Rapidité de location",
    "Clarté/précisions rapports",
    "Rapport honoraires/service",
  ],
  syndic: [
    "Prise en charge générale",
    "Suivi de la copropriété",
    "Réactivité",
    "Clarté des comptes",
    "Rapport honoraires/service",
  ],
  estimation: [
    "Prise en charge générale",
    "Connaissance du marché",
    "Justesse de l'estimation",
    "Clarté du rapport",
    "Délai de réalisation",
  ],
};

type Mood = "positive" | "neutral" | "negative";

export const openings: Record<Mood, string[]> = {
  positive: [
    "Une expérience fantastique du début à la fin !",
    "Un accompagnement parfait du début à la fin.",
    "Agence sérieuse et vraiment à l'écoute.",
    "Un grand merci à toute l'équipe.",
    "Rien à redire, tout s'est très bien passé.",
    "Professionnalisme et bonne humeur au rendez-vous.",
    "Excellent suivi de notre projet.",
    "Une équipe réactive et disponible.",
  ],
  neutral: [
    "Expérience correcte dans l'ensemble.",
    "Service satisfaisant, sans plus.",
    "Bon accueil, mais quelques points à améliorer.",
    "Prestation conforme à ce qui était annoncé.",
  ],
  negative: [
    "Le suivi de mon dossier a été décevant.",
    "Très difficile de joindre l'agence.",
    "Expérience décevante.",
    "Je m'attendais à beaucoup mieux.",
  ],
};

export const middles: Record<Mood, Record<Product, string[]>> = {
  positive: {
    vente: [
      "Notre maison a été vendue en moins de deux mois, au prix estimé.",
      "Les visites étaient bien préparées et les retours systématiques.",
      "Le compromis a été signé rapidement, sans mauvaise surprise.",
    ],
    achat: [
      "Ils ont trouvé l'appartement qui correspondait exactement à notre recherche.",
      "Très bon accompagnement jusqu'à la signature chez le notaire.",
      "Les biens proposés étaient pertinents dès la première semaine.",
    ],
    location: [
      "Dossier accepté en quelques jours, état des lieux clair et précis.",
      "Visites flexibles, même le samedi matin.",
      "Le bail m'a été expliqué point par point.",
    ],
    gestion_locative: [
      "Le loyer est versé à date fixe et les comptes rendus sont clairs.",
      "Mon appartement a été reloué en moins de trois semaines.",
      "Les petits travaux sont gérés sans que j'aie à m'en occuper.",
    ],
    syndic: [
      "Les assemblées générales sont bien préparées.",
      "Les travaux de la toiture ont été suivis de près.",
      "Les comptes de la copropriété sont enfin lisibles.",
    ],
    estimation: [
      "L'estimation était argumentée, avec des ventes comparables du quartier.",
      "Rendez-vous rapide et rapport détaillé reçu le lendemain.",
      "Le prix proposé était réaliste et nous a aidés à décider.",
    ],
  },
  neutral: {
    vente: ["La vente a pris un peu plus de temps que prévu.", "Peu de visites le premier mois."],
    achat: ["Quelques biens ne correspondaient pas à nos critères.", "Il a fallu relancer pour obtenir les diagnostics."],
    location: ["Le dossier a été long à constituer.", "L'état des lieux aurait pu être plus détaillé."],
    gestion_locative: ["Les comptes rendus arrivent parfois en retard.", "Les réponses par e-mail prennent quelques jours."],
    syndic: ["Les travaux votés avancent lentement.", "Il faut souvent relancer pour les petites demandes."],
    estimation: ["L'estimation m'a semblé un peu haute.", "Le rapport est arrivé avec une semaine de retard."],
  },
  negative: {
    vente: ["Trop peu de visites organisées en trois mois.", "Aucun retour après les visites."],
    achat: ["Les biens proposés ne correspondaient pas du tout à nos critères.", "Le dossier de financement a été mal suivi."],
    location: ["L'état des lieux de sortie a été bâclé.", "Ma caution a mis des mois à être rendue."],
    gestion_locative: ["Le versement des loyers a pris du retard plusieurs mois.", "Un dégât des eaux est resté sans suite pendant des semaines."],
    syndic: ["Les travaux votés il y a un an n'ont toujours pas commencé.", "Les charges ont augmenté sans explication."],
    estimation: ["L'estimation était bien au-dessus du prix du marché.", "Rendez-vous annulé deux fois."],
  },
};

export const closings: Record<Mood, string[]> = {
  positive: ["Je recommande vivement.", "Merci encore !", "Nous referons appel à eux sans hésiter.", "Bravo et merci."],
  neutral: ["Peut mieux faire sur le suivi.", "Correct, mais sans plus.", ""],
  negative: ["Je ne recommande pas.", "Dommage, l'accueil était pourtant agréable.", "Vraiment décevant."],
};

/** Criteria tags that fit each mood. */
export const moodCriteria: Record<Mood, Criterion[]> = {
  positive: ["conseil", "accueil", "competence", "reactivite", "suivi", "transparence"],
  neutral: ["suivi", "reactivite", "transparence", "honoraires", "conseil"],
  negative: ["reactivite", "suivi", "honoraires", "transparence"],
};

/** Public replies from the agency, by mood of the review. {name} = the customer's first name. */
export const replies: Record<Mood, string[]> = {
  positive: [
    "Merci beaucoup {name} pour ce retour ! Toute l'équipe est ravie d'avoir pu vous accompagner dans votre projet.",
    "Un grand merci {name}, c'était un plaisir de travailler avec vous. À très bientôt à l'agence !",
    "Merci {name} pour votre confiance et pour ce message qui fait plaisir à toute l'équipe.",
  ],
  neutral: [
    "Merci {name} pour votre retour. Nous prenons note de vos remarques sur le suivi et en avons parlé en équipe pour nous améliorer.",
    "Bonjour {name}, merci pour cet avis. N'hésitez pas à nous contacter directement si un point reste à éclaircir.",
  ],
  negative: [
    "Bonjour {name}, nous sommes sincèrement désolés de cette expérience. Je vous invite à me contacter directement à l'agence afin que nous trouvions ensemble une solution.",
    "Bonjour {name}, merci d'avoir pris le temps de nous écrire. Votre dossier a pris du retard et nous le regrettons. Nous avons revu notre organisation pour que cela ne se reproduise pas, et je reste disponible pour en parler de vive voix.",
    "Bonjour {name}, nous comprenons votre déception. Un membre de l'équipe va vous recontacter cette semaine pour faire le point sur votre dossier.",
  ],
};

export const moodOf =(rating: number): Mood => (rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative");
