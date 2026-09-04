/* ==========================================================================
   Shared Martin Immo fixture data for the A-7 UX exploration prototypes.
   --------------------------------------------------------------------------
   Loaded identically by concept-1-trust-hub.html, concept-2-scorecard.html
   and concept-5-qa-lead.html so the three concepts are a genuine A/B/C IA
   test: same business, same numbers, same review content, same design
   tokens (../assets/os-mui.css) — only the information architecture and
   interaction model differ.

   Provenance: aggregate figures (ratings, counts, NPS, topics, certification)
   come from ../../fixtures/martin-immo.json, which traces each number back
   to research/concept-teardown.md. Individual review text, the business
   identity strip (city/member number), platform-card figures, agency list,
   and FAQ copy are NOT in that fixture (it only holds aggregates) — those
   are reused verbatim from Prototypes/variant-3-dual-ledger.html, the
   existing prototype closest to the written spec, so nothing here is newly
   invented for this exploration. See Prototypes/A-7/index.html for the
   compromise this implies.
   ========================================================================== */

window.MARTIN_IMMO = {
  business: {
    name: "Martin Immo",
    industry: "Agence immobilière · Vente & location",
    city: "Lanton, FR",
    memberNumber: "n° 001256"
  },

  verified: {
    rating: 4.9,
    count: 312,
    recommend: 94,
    histogram: [
      { stars: 5, pct: 77, n: 240 },
      { stars: 4, pct: 17, n: 52 },
      { stars: 3, pct: 5,  n: 14 },
      { stars: 2, pct: 2,  n: 4 },
      { stars: 1, pct: 1,  n: 2 }
    ],
    nps: { promoters: 300, neutrals: 10, detractors: 2 }
  },

  unverified: {
    rating: 4.4,
    count: 1529,
    sources: 6
  },

  allSources: {
    rating: 4.7,
    count: 1841,
    label: "toutes sources confondues"
  },

  topics: ["Accueil", "Conseil", "Tarifs", "Réactivité"],

  certification: {
    standards: [
      { code: "NF Service 522 / ISO 20488", scope: "Collecte, modération et publication des avis en ligne" },
      { code: "ISO 20252", scope: "Rigueur en tant qu'organisme d'études de marché" },
      { code: "ISO 9001", scope: "Management de la qualité interne d'Opinion System" }
    ],
    confidenceIndex: "95 %",
    marginOfError: "5 %",
    neutralityNote: "Une entreprise adhérente ne peut pas supprimer un avis conforme, positif ou négatif — c'est l'obligation de neutralité qui fait la valeur du contrôle."
  },

  trustBadges: [
    "Avis vérifiés & infalsifiables",
    "Triple certification AFNOR",
    "94 % recommandent"
  ],

  verdict: {
    text: "Martin Immo repose sur 312 avis contrôlés par Opinion System, tiers de confiance certifié NF ISO 20488. Verdict : entreprise fiable.",
    lastUpdated: "2 juillet 2026"
  },

  reviews: {
    verified: [
      {
        author: "Sophie M.",
        rating: 4.7,
        service: "Vente habitation",
        purchaseNote: "Achat vérifié",
        timeAgo: "il y a 3 jours",
        body: "Accompagnement vraiment au top. La conseillère a pris le temps de tout m'expliquer, aucune mauvaise surprise sur le contrat.",
        tags: ["Habitation", "Conseil"],
        response: { author: "Martine Pedro", body: "Merci beaucoup Sophie pour votre confiance !" },
        helpful: 24
      }
    ],
    unverified: [
      {
        author: "Émilie R.",
        rating: 4,
        timeAgo: "il y a 4 jours",
        body: "Bon accueil en agence, on m'a bien orientée. Je mets 4 car j'ai attendu un peu au téléphone."
      },
      {
        author: "Anonyme",
        rating: 3,
        timeAgo: "il y a 1 semaine",
        body: "Correct sans plus. Délais de traitement un peu longs."
      }
    ]
  },

  platforms: [
    { name: "Google",       initials: "G",  color: "#4285F4", textColor: "#fff",    rating: 4.5, count: 526 },
    { name: "Pages Jaunes", initials: "PJ", color: "#FFD500", textColor: "#041B44", rating: 4.4, count: 214 },
    { name: "Trustpilot",   initials: "★",  color: "#00B67A", textColor: "#fff",    rating: 4.5, count: 389 },
    { name: "SeLoger",      initials: "SL", color: "#E4032E", textColor: "#fff",    rating: 4.6, count: 429 }
  ],

  legal: {
    consideration: "Aucune contrepartie (cadeau, réduction) n'est versée en échange d'un avis.",
    sortMethod: "Tri par défaut : du plus récent au plus ancien, sans manipulation.",
    retention: "Durée de conservation : 24 mois.",
    reportLinkText: "Procédures de vérification, de modération et de signalement"
  },

  faq: [
    {
      q: "Martin Immo est-elle fiable ?",
      a: "Oui — 312 avis contrôlés, 4,9/5, 94 % de recommandation, vérifiés par Opinion System (NF ISO 20488)."
    },
    {
      q: "Les avis peuvent-ils être truqués ?",
      a: "Pas les avis contrôlés. Les autres sont explicitement signalés « non vérifié »."
    }
  ]
};
