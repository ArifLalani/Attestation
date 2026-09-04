/* ==========================================================================
   Opinion System — Figma-Profile exploration (2026-08-28)
   --------------------------------------------------------------------------
   ONE shared fixture for the full page, loaded identically by Control and
   all five variants. Content is transcribed from node 140:1426 ("Attestation
   1") in the connected Figma file oFEG69fZBUK2wh0esta2Ov, inspected via
   get_metadata + get_design_context this session and the prior audit
   session. Aggregate ratings reconciled to the canonical project fixture
   (../../../fixtures/martin-immo.json) per the 2026-08-28 decision (4.9/5
   on 312, not the Figma file's own internal 4.7 — see product/decisions.md
   and the Figma-audit conversation).

   CONTENT INCONSISTENCIES FOUND IN THE SOURCE FIGMA, RESOLVED HERE:
   - The business is called "Martin Immo" in the Business Header and FAQ
     body text, "Maison & Patrimoine Immobilier" in the Identity block's
     name field, and "System Assurances" / "Assurances Martin" in the
     Quality Approach headline and FAQ heading. Standardized to "Martin
     Immo" everywhere (matches the canonical project fixture and the FAQ
     body copy, which is the majority usage in the source file).
   - Store locator agency cities (Lanton / Villeurbanne / Écully) mix two
     unrelated regions (Gironde vs. Rhône) — kept AS-IS for Control fidelity
     per the instruction to preserve the Figma's actual content; not fixed.
   - No Certificate CTA (spec block 4.12) exists anywhere in the Figma
     frame. Authored fresh below (`certificate`), flagged — see the
     accompanying report for why it's included despite having no Figma
     source.
   - Only one of the four FAQ answers is visible in the Figma (the others
     are collapsed with no answer text exposed in the file). That one
     answer is transcribed verbatim; the other three are authored to make
     the accordion functional, flagged individually below.
   - The Non-Contrôlés and Plateformes tab panels have NO built content in
     the Figma file (only the tab headers with counts exist) — review and
     platform content below is authored, following the same
     gray/dashed/badge conventions already established and used in
     Prototypes/tab-experiment/.
   ========================================================================== */

window.OS_FIXTURE = {
  business: {
    name: "Martin Immo",
    logoInitials: "MI",
    category: "Agence immobilière",
    activity: "Vente & Locations",
    city: "Lanton, FR",
    memberNumber: "n° 00258",
    bioShort: "Découvrez une agence immobilière reconnue pour son sérieux, son accompagnement attentif et sa capacité à guider ses clients avec clarté...",
    bioFull: "Découvrez une agence immobilière reconnue pour son sérieux, son accompagnement attentif et sa capacité à guider ses clients avec clarté à chaque étape de leur projet — de la première visite jusqu'à la signature, et bien au-delà."
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
      mostRecentReviewDate: "25 août 2026"
    },
    unverified: { rating: 4.4, count: 1529 },
    allSources: { rating: 4.7, count: 1841, label: "toutes sources confondues" }
  },

  platforms: {
    sourceCount: 6,
    note: "Google, Pages Jaunes, Trustpilot et 3 autres profils identifiés — l'import de ces avis n'est pas encore disponible."
  },

  trustBanner: {
    kicker: "RÉPUTATION VÉRIFIÉE",
    subtitle: "Avis de Martin Immo contrôlés par Opinion System",
    subscribeLabel: "S'inscrire"
  },

  verdict: {
    title: "La fiabilité de Martin Immo",
    lastUpdated: "2 juillet 2026",
    text: "Martin Immo est une agence immobilière basée à Lanton. Sa réputation repose sur 312 avis contrôlés par Opinion System, tiers de confiance indépendant certifié NF ISO 20488 : l'identité et l'achat réel de chaque client sont vérifiés, et ces avis ne peuvent être ni modifiés ni supprimés par l'entreprise. Verdict : entreprise fiable."
  },

  /* Quality Approach — Figma node 274:5704 "Banner_Container", transcribed
     verbatim except the business name (see note above). */
  qualityApproach: {
    badge: "DÉMARCHE QUALITÉ",
    headline: "Martin Immo a choisi Opinion System pour des avis fiables.",
    headlineHighlight: "Opinion System",
    description: "Une démarche qualité rigoureuse encadrée par les trois normes ISO majeures pour vous garantir des avis clients authentiques, infalsifiables et scientifiquement représentatifs.",
    items: [
      { code: "ISO 20488", title: "Avis en ligne de consommateurs", desc: "Garantit la sincérité, la transparence et le contrôle des avis publiés." },
      { code: "ISO 20252", title: "Études de marché et d'opinion", desc: "Assure la rigueur méthodologique et la représentativité statistique." },
      { code: "ISO 9001", title: "Management de la qualité", desc: "Valide l'amélioration continue et la satisfaction client." }
    ]
  },

  filterTaxonomy: ["Accueil", "Conseil", "Réactivité", "Tarifs", "Habitation", "Auto", "Santé", "Emprunteur"],

  legal: {
    sortDisclosure: "Les avis sont affichés par défaut du plus récent au plus ancien, sans sélection arbitraire ni masquage.",
    considerationDisclosure: "Aucune contrepartie (cadeau, réduction, promotion) n'est versée en échange d'un avis, contrôlé ou non.",
    retentionDisclosure: "Durée de conservation des avis : 24 mois à compter de leur publication.",
    verificationDisclosure: "Chaque avis contrôlé est rattaché à un client identifié dont l'achat réel a été vérifié par Opinion System avant publication. Un avis peut être signalé comme suspect à tout moment ; l'auteur est informé en cas de rejet.",
    unverifiedExplainer: "Avis spontanés, sans vérification d'identité — affichés à titre informatif, hors du contrôle d'Opinion System. Ils ne comptent pas dans la note de 4,9/5."
  },

  reviews: {
    verified: [
      {
        id: "v1", author: "Sophie M.", initial: "S", rating: 4.5, dateLabel: "il y a 3 jours",
        service: "Vente de propriété", topics: ["Habitation", "Conseil", "Accueil"],
        body: "Une expérience fantastique du début à la fin ! L'équipe était professionnelle, réactive et a vraiment compris ce que je voulais atteindre. Le suivi après la signature a aussi été très rassurant, on sentait que le dossier restait suivi même une fois la vente conclue.",
        truncatable: true, helpful: 24,
        response: { author: "Martine Pedro", body: "Merci beaucoup Sophie pour votre confiance, ce fut un plaisir de vous accompagner !" },
        detail: { satisfaction: 95, recommend: 92, questionnaireType: "Contrôlé", nps: 10, npsCategory: "Promoteur",
          subRatings: [{ label: "Accueil", value: 5.0 }, { label: "Qualité du conseil", value: 4.5 }, { label: "Réactivité", value: 5.0 }, { label: "Rapport qualité prix", value: 4.6 }, { label: "Aide au suivi", value: 4.4 }] },
        highlight: "recent"
      },
      {
        id: "v2", author: "Marc D.", initial: "M", rating: 5, dateLabel: "il y a 6 jours",
        service: "Location d'appartement", topics: ["Réactivité", "Conseil"],
        body: "Recherche d'appartement menée tambour battant : visites organisées en 48h, dossier locataire validé rapidement, et une équipe toujours joignable pour répondre à mes questions, même en soirée. Je recommande sans hésiter pour une location dans le secteur.",
        truncatable: true, helpful: 18,
        response: { author: "Julien K.", body: "Merci Marc, ravi que la recherche se soit passée aussi vite !" },
        detail: { satisfaction: 98, recommend: 96, questionnaireType: "Contrôlé", nps: 10, npsCategory: "Promoteur",
          subRatings: [{ label: "Accueil", value: 5.0 }, { label: "Qualité du conseil", value: 5.0 }, { label: "Réactivité", value: 5.0 }, { label: "Rapport qualité prix", value: 4.8 }, { label: "Aide au suivi", value: 4.9 }] },
        highlight: "top"
      },
      {
        id: "v3", author: "Julie P.", initial: "J", rating: 4, dateLabel: "il y a 1 semaine",
        service: "Achat de maison", topics: ["Tarifs"],
        body: "Bon rapport qualité-prix sur les honoraires par rapport à d'autres agences consultées. Le processus a pris un peu plus de temps que prévu mais dans l'ensemble je suis satisfaite.",
        truncatable: false, helpful: 6, response: null,
        detail: { satisfaction: 80, recommend: 78, questionnaireType: "Contrôlé", nps: 8, npsCategory: "Neutre",
          subRatings: [{ label: "Accueil", value: 4.2 }, { label: "Qualité du conseil", value: 4.0 }, { label: "Réactivité", value: 3.6 }, { label: "Rapport qualité prix", value: 4.5 }, { label: "Aide au suivi", value: 3.9 }] }
      },
      {
        id: "v4", author: "Thomas R.", initial: "T", rating: 5, dateLabel: "il y a 2 semaines",
        service: "Vente de terrain", topics: ["Accueil", "Habitation"],
        body: "Accueil chaleureux dès le premier rendez-vous, explications claires sur les diagnostics et les démarches d'urbanisme liées au terrain. Vente conclue dans de très bonnes conditions, je n'ai rien à redire sur l'accompagnement.",
        truncatable: true, helpful: 31, response: null,
        detail: { satisfaction: 96, recommend: 95, questionnaireType: "Contrôlé", nps: 10, npsCategory: "Promoteur",
          subRatings: [{ label: "Accueil", value: 5.0 }, { label: "Qualité du conseil", value: 4.8 }, { label: "Réactivité", value: 4.7 }, { label: "Rapport qualité prix", value: 4.6 }, { label: "Aide au suivi", value: 4.8 }] },
        highlight: "helpful"
      },
      {
        id: "v5", author: "Camille B.", initial: "C", rating: 3, dateLabel: "il y a 3 semaines",
        service: "Location de maison", topics: ["Tarifs", "Réactivité"],
        body: "Les honoraires m'ont semblé élevés par rapport au marché local, et j'ai attendu plus d'une semaine pour avoir un retour sur un point du bail. L'agence a fini par corriger le problème mais le délai était trop long à mon goût.",
        truncatable: true, helpful: 9,
        response: { author: "Martine Pedro", body: "Merci pour ce retour Camille, nous avons revu notre délai de traitement sur ce type de demande suite à votre message." },
        detail: { satisfaction: 58, recommend: 52, questionnaireType: "Contrôlé", nps: 5, npsCategory: "Détracteur",
          subRatings: [{ label: "Accueil", value: 3.8 }, { label: "Qualité du conseil", value: 3.5 }, { label: "Réactivité", value: 2.4 }, { label: "Rapport qualité prix", value: 2.8 }, { label: "Aide au suivi", value: 3.2 }] }
      },
      {
        id: "v6", author: "Nicolas F.", initial: "N", rating: 5, dateLabel: "il y a 1 mois",
        service: "Conseil en investissement locatif", topics: ["Conseil"],
        body: "Conseils très pertinents pour mon premier investissement locatif.",
        truncatable: false, helpful: 4, response: null,
        detail: { satisfaction: 94, recommend: 90, questionnaireType: "Contrôlé", nps: 9, npsCategory: "Promoteur",
          subRatings: [{ label: "Accueil", value: 4.7 }, { label: "Qualité du conseil", value: 5.0 }, { label: "Réactivité", value: 4.5 }, { label: "Rapport qualité prix", value: 4.6 }, { label: "Aide au suivi", value: 4.4 }] }
      }
    ],
    unverified: [
      { id: "u1", author: "Émilie R.", initial: "É", rating: 4, dateLabel: "il y a 4 jours", body: "Bon accueil en agence, on m'a bien orientée. Je mets 4 étoiles car j'ai attendu un peu au téléphone avant d'avoir quelqu'un." },
      { id: "u2", author: "Karim L.", initial: "K", rating: 3, dateLabel: "il y a 1 semaine", body: "Correct sans plus, délais de traitement un peu longs sur mon dossier de location." },
      { id: "u3", author: "Anonyme", initial: "A", rating: 2, dateLabel: "il y a 2 semaines", body: "Peu de retour après ma première visite, j'ai dû relancer plusieurs fois pour avoir des nouvelles de mon dossier." }
    ]
  },

  /* Store locator — Figma node 274:5766, transcribed verbatim (city mismatch
     kept, see note above). */
  locations: {
    groupCount: 3,
    groupVerifiedTotal: 312,
    agencies: [
      { id: "a1", name: "Martin Immo — Lanton", isCurrent: true, address: "42 cours Vitton, 69006 Lyon", rating: 4.7, count: 1872, phone: "04 78 24 00 00", openLabel: "Ouvert — 19:00",
        hours: [["Lundi","09:00 - 19:00"],["Mardi","09:00 - 19:00"],["Mercredi","09:00 - 19:00"],["Jeudi","09:00 - 19:00"],["Vendredi","09:00 - 19:00"],["Samedi","09:00 - 19:00"],["Dimanche","Fermé"]] },
      { id: "a2", name: "Martin Immo — Villeurbanne", isCurrent: false, address: "18 av. Henri Barbusse, 69100 Villeurbanne", rating: 4.8, count: 1480, phone: "04 78 24 00 24", openLabel: "Ouvert — 19:00" },
      { id: "a3", name: "Martin Immo — Écully", isCurrent: false, address: "5 place de la Libération, 69130 Écully", rating: 4.8, count: 192, phone: "04 78 24 00 10", openLabel: "Ouvert — 19:00" }
    ]
  },

  team: [
    { id: "t1", name: "Claire Fontaine", role: "Directrice d'agence" },
    { id: "t2", name: "Marc Dubois", role: "Conseiller immobilier" },
    { id: "t3", name: "Marie Laurent", role: "Conseillère immobilier" }
  ],

  /* No Figma source — authored to satisfy requirements.md §5 block 4.12
     (V1 in-scope). Flagged in the accompanying report. */
  certificate: {
    title: "Attestation de réputation vérifiée",
    body: "Téléchargez le certificat officiel Opinion System pour Martin Immo, ou le certificat consolidé du groupe.",
    ctaSingle: "Télécharger le certificat (PDF)",
    ctaGroup: "Certificat du groupe"
  },

  /* FAQ — Figma node 292:5896. Only the 3rd answer is visible in the
     source file (transcribed verbatim, marked below); the other three are
     authored to make the accordion functional. */
  faq: [
    { q: "Martin Immo est-elle une entreprise fiable ?", a: "Oui — sa réputation repose sur 312 avis contrôlés par Opinion System, avec une note de 4,9/5 et 94 % de clients qui recommandent l'agence.", source: "authored" },
    { q: "Les avis de Martin Immo peuvent-ils être truqués ?", a: "Non, pas les avis contrôlés : chaque avis est rattaché à un client identifié dont l'achat a été vérifié, et ni Martin Immo ni Opinion System ne peuvent modifier son contenu. Les avis non contrôlés restent, eux, hors du contrôle d'Opinion System — c'est pourquoi ils portent un badge « Non vérifié ».", source: "authored" },
    { q: "Qui contrôle les avis de Martin Immo ?", a: "Opinion System, organisme de sondage indépendant. C'est le seul acteur en Europe à disposer d'une triple-certification AFNOR pour des avis clients : ISO 20252 (organisme de sondage) et ISO 9001 (organisation interne).", source: "figma-verbatim", defaultOpen: true },
    { q: "Martin Immo répond-elle aux avis clients ?", a: "Oui, l'agence répond publiquement aux avis contrôlés — la réponse est toujours affichée séparément, sans jamais modifier le texte original du client.", source: "authored" }
  ],

  listMyBusiness: {
    kicker: "Vous êtes une entreprise ?",
    title: "Affichez une e-réputation vérifiée et incontestable.",
    body: "Rejoignez les entreprises qui collectent des avis contrôlés par le seul organisme triplement certifié AFNOR en Europe.",
    cta: "Inscrire mon entreprise"
  },

  footer: {
    contactLabel: "Pour toutes demandes d'informations",
    email: "contact@opinionsystem.fr",
    phone: "+33 5 33 02 05 54",
    columns: [
      { title: "Opinion System", items: ["Notre histoire", "L'importance des avis", "Nos certifications", "Nos équipes"] },
      { title: "Solutions", items: ["Votre réputation", "Trouver un pro", "Mon espace", "Candidature spontanée"] },
      { title: "Ressources", items: ["Actualités", "Devenir adhérent", "Contact", "Notre FAQ"] }
    ],
    legalLinks: "Mentions Légales | Conditions d'utilisation | Politique de confidentialité | Sitemap",
    copyright: "© 2026 Opinion System",
    euBadge: "Cofinancé par l'Union européenne"
  }
};
