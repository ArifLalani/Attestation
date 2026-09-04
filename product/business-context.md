# Business Context — Opinion System

> **Source:** restructured from [../opinion-system.md](../opinion-system.md) (unchanged,
> kept in place as the full original research). This file carries everything from that
> document **except** the visual identity section (§6), which now lives in
> [../design-system/principles.md](../design-system/principles.md) and
> [../design-system/tokens.css](../design-system/tokens.css) — palette and type belong with
> the design system, not the business narrative.
>
> Compiled 2026-08-25 from opinionsystem.fr (FR + EN-CA locales), the live certificate page
> `/certificate/129`, computed styles pulled from the live DOM, and third-party market
> coverage.

---

## 1. What the company is

**Opinion System (OS)** is a French **independent survey institute** — not an open review
site. It collects, verifies ("contrôle"), and syndicates customer reviews on behalf of
member businesses. Founded **2010**; first member registered **July 2011**.

| Fact | Value |
|---|---|
| Legal / parent entity | **Success Market** (OS's own certificate, member #00129, is filed under "SUCCESS MARKET") |
| HQ | 9 Route du Temple – Blagon, 33138 Lanton, France |
| Contact | contact@opinionsystem.fr · +33 5 33 52 06 54 |
| Scale | ~12,000 professionals ("Rejoignez les 12 000 professionnels") |
| Positioning (FR) | "N°1 DES AVIS CONTRÔLÉS POUR LES PROFESSIONNELS DU SERVICE" |
| Positioning (EN) | "#1 IN VERIFIED CUSTOMER REVIEWS FOR SERVICE AND REAL-ESTATE PROFESSIONALS" |
| Adjacent product | **Huwin** (launched July 2024, ~2,000 users; real estate → insurance) |
| Footer note | "Cofinancé par l'Union européenne" |

### The business model is two-sided

- **Paying side (B2B):** member businesses ("adhérents") buy the collection + certification
  service. Publicly reported pricing is roughly **~€1,000 setup + ~€100/month**, with a
  ~30% FNAIM discount. Revenue depends on renewal, so the *perceived value of the
  certificate page to the member* is a commercial asset, not just a UX artifact.
- **Free side (B2C):** consumers read certificate pages and use "Trouver un pro" (find a
  professional). This audience is why the page must be indexable and citable.

**Implication for the redesign:** this page is simultaneously a **consumer trust document**,
a **member's marketing asset**, and an **acquisition surface** (the "List My Business" CTA).
All three audiences land on the same URL.

---

## 2. The moat: triple certification

The single most important thing about the brand. Everything visual should serve it.

| Standard | Scope |
|---|---|
| **NF Service 522 / NF ISO 20488** (AFNOR Certification) | Collection, moderation and publication of online consumer reviews |
| **ISO 20252** | Rigor as a market / opinion research organization |
| **ISO 9001** | Internal quality management of OS's own organization |

OS claims to be the **only review manager in Europe holding all three**. The certification
imposes a **neutrality obligation** — a member cannot delete a compliant review, positive
or negative. That constraint *is* the product.

The live page also carries a methodological claim worth preserving: quota-sampling method,
**95% confidence index, 5% margin of error**, and compliance with the AFNOR "control and
follow members" process.

**Strategic risk this creates:** the value of the badge is inversely proportional to how
many things wear it. Adding unverified and third-party reviews to the same page is exactly
the dilution risk both source documents are built around.

---

## 3. Target audiences

### 3.1 Verticals served (member businesses)

- **Real estate** — the historical core and still dominant (>10,000 real-estate
  professionals; the live review feed is full of agency names: Laforêt, ERA, Immo de France,
  Immo Angels…). FNAIM partnership.
- **Insurance / brokerage** — the active expansion vertical.
- **Personal / home-care services** ("services à la personne") — ~7% of revenue.
- **Driving schools** — ~5%.
- Broadly: *professionals of service*, where a **high-consideration, infrequent, local,
  relationship-driven purchase** makes reputation decisive.

Note the spec's example Schema.org type is `InsuranceAgency` and the mockup uses "agency"
language throughout — but the template must generalize across all of these verticals. See
open question 6 in [open-questions.md](open-questions.md).

### 3.2 The three audiences who hit this page

1. **The consumer / prospect.** Mid-funnel, comparing two or three local providers, often
   arriving from Google or from a badge on the member's own site. Wants to know: is this
   business any good, and can I trust these numbers? Low patience, likely on mobile,
   doesn't know what "ISO 20488" means and shouldn't have to.
2. **The member business.** Vanity plus utility — checks their own page, shares the link,
   downloads the certificate PDF, responds to reviews. Wants to look credible and to see
   their verified rating dominate.
3. **The machine.** Google's crawler and AI answer engines (AI Overviews, ChatGPT,
   Perplexity). The spec explicitly designs the "Trust Verdict" block to be quoted verbatim.
   This is a first-class audience, not an afterthought.

These three audiences are the basis for the personas used in
[user-stories.md](user-stories.md).

---

## 4. Competitive landscape

| Player | Model | How OS differs |
|---|---|---|
| **Google Reviews** | Fully open, anyone can post | Enormous reach, zero verification |
| **Trustpilot** | Open deposit; no proof of purchase required | Brand recognition and traffic, but exposed to fake reviews |
| **Avis Vérifiés (Skeepers)** | Certified, proof-of-purchase, strong SEO syndication | Closest direct competitor; e-commerce weighted vs. OS's local-service weighting |
| **Plus que pro** | Certified reviews, local trades / artisans | Similar "controlled review" pitch, different verticals |

OS's wedge is **certified process + local service verticals + telephone survey collection**
("TÉLÉ-ENQUÊTE" / "TELE-SURVEY" appears as a collection-channel tag on individual reviews).

There is also **critical press** — adieucourtier.com runs a multi-part series questioning
whether OS genuinely honors NF Z74-501 / NF522. Another reason the redesigned page must make
its verification claims precise, sourced and legally defensible rather than merely loud.

> A UX-pattern-level comparison (how Trustpilot, Google, and Avis Vérifiés actually *solve*
> the verified/unverified display problem, not just how they position commercially) lives in
> [../research/competitive-landscape.md](../research/competitive-landscape.md).

---

## 5. Current page teardown (`/certificate/129`)

Structure of the page being replaced:

1. Top bar: locale switcher, "N°1 DES AVIS CONTRÔLÉS", **REGISTER MY COMPANY** button.
2. Three tab anchors: **COMPANY / STATISTICS / REVIEWS**.
3. Business identity card: logo, "ENTREPRISE ADHÉRENTE N° 00129", large rating (4,5),
   star-bucket breakdown, and the exclusion disclaimer — *"Rating calculated from 6005
   reviews verified by Opinion System. Customer reviews from external sources are
   excluded."* The separation rule already exists in copy today.
4. Attestation sentence and membership date, **WRITE A REVIEW** (yellow) CTA, NAP block,
   opening hours.
5. **STATISTICS:** 90% SATISFACTION / 92% RECOMMENDATION donut knobs, sub-criterion scores
   out of 10 (Onboarding & follow-up, Simplicity, Customer relationship, Visibility of
   reviews, Benefit/cost ratio), plus the AFNOR quota-sampling methodology note.
6. **REVIEWS:** star-bucket filter chips, collaborator filter, "more criteria", result
   count, sort control ("Sort by Response date"), then the list. Each card carries business
   name + member-since date, rating, month/year, **VERIFIED REVIEW** badge, collection-source
   tag, author first name + last initial, body, company response, SHOW MORE.
7. "SHOW MORE REVIEWS" pagination.
8. ABOUT block (certification boilerplate) + moderation policy link.
9. B2B conversion banner + footer.

### Honest assessment of the current UI

- **Dated Material Design 1 shell** (`mdc-*` classes, 2px button radius, MDC layout grid,
  knob widgets). It reads as an admin tool, not a trust document.
- **Two competing type systems** — Poppins on the marketing chrome, Roboto in the app body —
  applied inconsistently. `Roboto-Light` at 14px is the most common body style: thin and
  low-contrast.
- **Weak hierarchy.** Rating, certification and review list all compete; the certification
  proof is buried in a wall of legal prose at the bottom.
- **Localization is incomplete.** The EN-CA build leaks untranslated French ("adhérente
  depuis le…", French review bodies) and the sub-criterion scores render as "0,5" instead of
  "9,2" — a decimal/locale parsing bug. Worth flagging to the team separately.
- **Missing everything the new spec needs:** no structured data story, no topic tagging, no
  helpfulness signal, no report affordance, no verified/unverified separation UI.

---

## 6. Voice & terminology

- FR uses **"avis contrôlé"** (controlled/checked review); the EN locale renders it as
  **"VERIFIED REVIEW"**. The spec documents use *verified* / *unverified*. **Standardize on
  verified / unverified in the EN build**, and *contrôlé / non contrôlé* in FR. (See open
  question 7.)
- Tone is institutional and evidentiary — attestation language ("Opinion System attests
  that…"), dates, member numbers, standard numbers. The redesign should modernize the *form*
  without softening this into generic startup marketing voice. The stiffness is credibility.
- Reviews display as **first name + last initial** (Aline L., Mireille B.) — a data
  minimization convention that must carry over.

---

## Sources

- [Opinion System — homepage](https://www.opinionsystem.fr/)
- [Certificate page #129 — FR](https://www.opinionsystem.fr/fr-fr/certificate/129) · [EN-CA](https://www.opinionsystem.fr/en-ca/certificate/129)
- [Opinion System — services à la personne](https://www.opinionsystem.fr/services-a-la-personne/)
- [Le Journal des Entreprises — Opinion System veut doper la réputation numérique des assureurs](https://www.lejournaldesentreprises.com/article/opinion-system-veut-doper-la-reputation-numerique-des-assureurs-2113390)
- [Avis Vérifiés — Comparatif des plateformes d'avis clients 2026](https://fr.avis-verifies.com/blog/les-10-meilleures-plateformes-davis-clients-en-france-comparatif-complet-2026/)
- [Avis Vérifiés — Quel cadre légal pour les avis clients en ligne](https://fr.avis-verifies.com/blog/quel-cadre-legal-pour-les-avis-clients-en-ligne/)
- [ADIEUcourtier — critical series on OS / NF522](https://adieucourtier.com/certification-afnor-opinion-system-respecte-il-vraiment-la-norme-nf-z74-501-episode-1/)
- [Trustpilot — OPINION SYSTEM](https://www.trustpilot.com/review/www.opinionsystem.fr)
