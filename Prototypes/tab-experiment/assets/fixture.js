/* ==========================================================================
   Opinion System — Tab-Experiment (2026-08-28)
   --------------------------------------------------------------------------
   ONE shared fixture, loaded identically by all five variants (control,
   response-visible, response-detail, fixed-filters, configurable-filters)
   so the comparison is controlled: same business, same ratings, same
   histogram, same review content, same legal copy. Only render.js's
   per-variant CONFIG (see each *.html file's own <script>) changes.

   Provenance:
   - business / ratings.verified / ratings.unverified / ratings.allSources /
     certification: ../../fixtures/martin-immo.json (canonical project
     fixture — verified.rating is 4.9/312 per the 2026-08-28 decision;
     ../../fixtures/martin-immo.json's verified.histogram field is the
     single source for the star distribution below, kept in sync by hand).
   - histogram: DEMO/PROTOTYPE DATA ONLY. Derived to resolve the audit
     finding that the Figma wireframe's own histogram (240/52/14/4/2)
     mathematically implies ~4.7, not the canonical 4.9. This distribution
     totals exactly 312 and averages to 4.894 (rounds to 4,9/5). Do not
     present these individual counts as real production numbers.
   - nps: unchanged from ../A-7/shared-data.js (300/10/2, already summed to
     312, independent of the star histogram).
   - Individual review authors/text/topics: NOT in the canonical fixture
     (which only holds aggregates) — authored for this experiment, reusing
     the "first name + last initial" convention (business-context.md §6)
     and the topic set actually used in the Figma wireframe's chips
     (Accueil / Conseil / Réactivité / Tarifs / Habitation), minus the
     mismatched insurance-vertical chips (Auto/Santé/Emprunteur) the audit
     flagged as belonging to a different business than "Martin Immo."
     Control keeps those mismatched chips faithfully (see each HTML file's
     CONFIG) precisely so that mismatch is visible and comparable.
   - platforms: deliberately holds NO per-platform ratings/content. Q3
     (2026-08-28) requires the Plateformes tab to be a reserved/coming-soon
     state for V1 — "do not fabricate imported platform reviews or imply
     full integration already exists." Only a source count is shown.
   ========================================================================== */

window.OS_FIXTURE = {
  business: {
    name: "Martin Immo",
    industry: "Agence immobilière · Vente & location",
    city: "Lanton, FR",
    memberNumber: "n° 001256"
  },

  ratings: {
    verified: {
      rating: 4.9,
      count: 312,
      recommend: 94,
      histogram: [
        { stars: 5, n: 290 },
        { stars: 4, n: 15 },
        { stars: 3, n: 4 },
        { stars: 2, n: 2 },
        { stars: 1, n: 1 }
      ],
      nps: { promoters: 300, neutrals: 10, detractors: 2 },
      mostRecentReviewDate: "25 août 2026"
    },
    /* Q2 (2026-08-28): unverified rating/count represent Category 2 ONLY.
       No "sources" figure here — that belongs exclusively to platforms. */
    unverified: {
      rating: 4.4,
      count: 1529
    },
    /* Shown ONLY inside the Trust Verdict 4-stat grid, small and labeled —
       never in the header dashboard, never blended with either rating
       above (§6 "strict rating separation"). */
    allSources: {
      rating: 4.7,
      count: 1841,
      label: "toutes sources confondues"
    }
  },

  /* Q3 (2026-08-28): reserved/coming-soon for V1. sourceCount is the only
     figure shown — no fabricated per-platform ratings or review content. */
  platforms: {
    sourceCount: 6,
    note: "Google, Pages Jaunes, Trustpilot et 3 autres profils identifiés — l'import de ces avis n'est pas encore disponible."
  },

  certification: {
    standards: [
      { code: "NF Service 522 / ISO 20488", scope: "Collecte, modération et publication des avis en ligne" },
      { code: "ISO 20252", scope: "Rigueur en tant qu'organisme d'études de marché" },
      { code: "ISO 9001", scope: "Management de la qualité interne d'Opinion System" }
    ]
  },

  verdict: {
    title: "La fiabilité de Martin Immo",
    lastUpdated: "2 juillet 2026",
    text: "Martin Immo est une agence immobilière basée à Lanton. Sa réputation repose sur 312 avis contrôlés par Opinion System, tiers de confiance indépendant certifié NF ISO 20488 : l'identité et l'achat réel de chaque client sont vérifiés, et ces avis ne peuvent être ni modifiés ni supprimés par l'entreprise. Verdict : entreprise fiable."
  },

  /* Filter-chip taxonomies. "legacyMixed" reproduces the Figma wireframe's
     actual 8-chip row (real-estate topics + 3 mismatched insurance-vertical
     chips) faithfully — see Control's CONFIG. "cleanTopics" is the fixed,
     single-vertical set Variant 4 uses. "vertical" configs power Variant 5's
     configurable-taxonomy demo. */
  filterTaxonomies: {
    legacyMixed: ["Accueil", "Conseil", "Réactivité", "Tarifs", "Habitation", "Auto", "Santé", "Emprunteur"],
    cleanTopics: ["Accueil", "Conseil", "Réactivité", "Tarifs", "Habitation"],
    verticals: {
      immobilier: {
        label: "Martin Immo — Agence immobilière",
        topics: ["Accueil", "Conseil", "Réactivité", "Tarifs", "Habitation"]
      },
      assurance: {
        label: "Démo — Assurances Martin (secteur assurance)",
        topics: ["Accueil", "Conseil", "Réactivité", "Auto", "Santé", "Emprunteur"]
      }
    }
  },

  legal: {
    sortDisclosure: "Les avis sont affichés par défaut du plus récent au plus ancien, sans sélection arbitraire ni masquage.",
    considerationDisclosure: "Aucune contrepartie (cadeau, réduction, promotion) n'est versée en échange d'un avis, contrôlé ou non.",
    retentionDisclosure: "Durée de conservation des avis : 24 mois à compter de leur publication.",
    verificationDisclosure: "Chaque avis contrôlé est rattaché à un client identifié dont l'achat réel a été vérifié par Opinion System avant publication. Un avis peut être signalé comme suspect à tout moment ; l'auteur est informé en cas de rejet.",
    unverifiedExplainer: "Avis spontanés, sans vérification d'identité — affichés à titre informatif, hors du contrôle d'Opinion System. Ils ne comptent pas dans la note de 4,9/5."
  },

  reviews: {
    verified: [
      {
        id: "v1",
        author: "Sophie M.",
        initial: "S",
        rating: 4.5,
        dateLabel: "il y a 3 jours",
        service: "Vente de propriété",
        topics: ["Habitation", "Conseil", "Accueil"],
        body: "Une expérience fantastique du début à la fin ! L'équipe était professionnelle, réactive et a vraiment compris ce que je voulais atteindre. Le suivi après la signature a aussi été très rassurant, on sentait que le dossier restait suivi même une fois la vente conclue.",
        truncatable: true,
        helpful: 24,
        response: { author: "Martine Pedro", body: "Merci beaucoup Sophie pour votre confiance, ce fut un plaisir de vous accompagner !" },
        detail: {
          satisfaction: 95, recommend: 92,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 10, npsCategory: "Promoteur",
          subRatings: [
            { label: "Accueil", value: 5.0 },
            { label: "Qualité du conseil", value: 4.5 },
            { label: "Réactivité", value: 5.0 },
            { label: "Rapport qualité prix", value: 4.6 },
            { label: "Aide au suivi", value: 4.4 }
          ]
        }
      },
      {
        id: "v2",
        author: "Marc D.",
        initial: "M",
        rating: 5,
        dateLabel: "il y a 6 jours",
        service: "Location d'appartement",
        topics: ["Réactivité", "Conseil"],
        body: "Recherche d'appartement menée tambour battant : visites organisées en 48h, dossier locataire validé rapidement, et une équipe toujours joignable pour répondre à mes questions, même en soirée. Je recommande sans hésiter pour une location dans le secteur.",
        truncatable: true,
        helpful: 18,
        response: { author: "Julien K.", body: "Merci Marc, ravi que la recherche se soit passée aussi vite !" },
        detail: {
          satisfaction: 98, recommend: 96,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 10, npsCategory: "Promoteur",
          subRatings: [
            { label: "Accueil", value: 5.0 },
            { label: "Qualité du conseil", value: 5.0 },
            { label: "Réactivité", value: 5.0 },
            { label: "Rapport qualité prix", value: 4.8 },
            { label: "Aide au suivi", value: 4.9 }
          ]
        }
      },
      {
        id: "v3",
        author: "Julie P.",
        initial: "J",
        rating: 4,
        dateLabel: "il y a 1 semaine",
        service: "Achat de maison",
        topics: ["Tarifs"],
        body: "Bon rapport qualité-prix sur les honoraires par rapport à d'autres agences consultées. Le processus a pris un peu plus de temps que prévu mais dans l'ensemble je suis satisfaite.",
        truncatable: false,
        helpful: 6,
        response: null,
        detail: {
          satisfaction: 80, recommend: 78,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 8, npsCategory: "Neutre",
          subRatings: [
            { label: "Accueil", value: 4.2 },
            { label: "Qualité du conseil", value: 4.0 },
            { label: "Réactivité", value: 3.6 },
            { label: "Rapport qualité prix", value: 4.5 },
            { label: "Aide au suivi", value: 3.9 }
          ]
        }
      },
      {
        id: "v4",
        author: "Thomas R.",
        initial: "T",
        rating: 5,
        dateLabel: "il y a 2 semaines",
        service: "Vente de terrain",
        topics: ["Accueil", "Habitation"],
        body: "Accueil chaleureux dès le premier rendez-vous, explications claires sur les diagnostics et les démarches d'urbanisme liées au terrain. Vente conclue dans de très bonnes conditions, je n'ai rien à redire sur l'accompagnement.",
        truncatable: true,
        helpful: 31,
        response: null,
        detail: {
          satisfaction: 96, recommend: 95,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 10, npsCategory: "Promoteur",
          subRatings: [
            { label: "Accueil", value: 5.0 },
            { label: "Qualité du conseil", value: 4.8 },
            { label: "Réactivité", value: 4.7 },
            { label: "Rapport qualité prix", value: 4.6 },
            { label: "Aide au suivi", value: 4.8 }
          ]
        }
      },
      {
        id: "v5",
        author: "Camille B.",
        initial: "C",
        rating: 3,
        dateLabel: "il y a 3 semaines",
        service: "Location de maison",
        topics: ["Tarifs", "Réactivité"],
        body: "Les honoraires m'ont semblé élevés par rapport au marché local, et j'ai attendu plus d'une semaine pour avoir un retour sur un point du bail. L'agence a fini par corriger le problème mais le délai était trop long à mon goût.",
        truncatable: true,
        helpful: 9,
        response: { author: "Martine Pedro", body: "Merci pour ce retour Camille, nous avons revu notre délai de traitement sur ce type de demande suite à votre message." },
        detail: {
          satisfaction: 58, recommend: 52,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 5, npsCategory: "Détracteur",
          subRatings: [
            { label: "Accueil", value: 3.8 },
            { label: "Qualité du conseil", value: 3.5 },
            { label: "Réactivité", value: 2.4 },
            { label: "Rapport qualité prix", value: 2.8 },
            { label: "Aide au suivi", value: 3.2 }
          ]
        }
      },
      {
        id: "v6",
        author: "Nicolas F.",
        initial: "N",
        rating: 5,
        dateLabel: "il y a 1 mois",
        service: "Conseil en investissement locatif",
        topics: ["Conseil"],
        body: "Conseils très pertinents pour mon premier investissement locatif.",
        truncatable: false,
        helpful: 4,
        response: null,
        detail: {
          satisfaction: 94, recommend: 90,
          questionnaireType: "Contrôlé", collaborator: null,
          nps: 9, npsCategory: "Promoteur",
          subRatings: [
            { label: "Accueil", value: 4.7 },
            { label: "Qualité du conseil", value: 5.0 },
            { label: "Réactivité", value: 4.5 },
            { label: "Rapport qualité prix", value: 4.6 },
            { label: "Aide au suivi", value: 4.4 }
          ]
        }
      }
    ],

    /* Per components.md's Review Card table: topic tags, business response,
       helpful counter and sub-ratings are "not specified — [INFERRED] omit
       until confirmed" for unverified reviews. Only the fields the spec
       actually requires (author, date, rating, text, mandatory badge,
       report affordance) are modeled here. */
    unverified: [
      {
        id: "u1",
        author: "Émilie R.",
        initial: "É",
        rating: 4,
        dateLabel: "il y a 4 jours",
        body: "Bon accueil en agence, on m'a bien orientée. Je mets 4 étoiles car j'ai attendu un peu au téléphone avant d'avoir quelqu'un.",
        truncatable: false
      },
      {
        id: "u2",
        author: "Karim L.",
        initial: "K",
        rating: 3,
        dateLabel: "il y a 1 semaine",
        body: "Correct sans plus, délais de traitement un peu longs sur mon dossier de location.",
        truncatable: false
      },
      {
        id: "u3",
        author: "Anonyme",
        initial: "A",
        rating: 2,
        dateLabel: "il y a 2 semaines",
        body: "Peu de retour après ma première visite, j'ai dû relancer plusieurs fois pour avoir des nouvelles de mon dossier.",
        truncatable: false
      }
    ]
  }
};
