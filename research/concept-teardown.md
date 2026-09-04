# Concept Teardown

> **Source:** restructured from [../research-best-practices.md §1 and §4](../research-best-practices.md)
> (unchanged, kept in place as the full original research doc). Covers what the client-supplied
> concepts actually contain, and the one conflict between those concepts and the written spec
> that needed a decision before design could proceed. The raw files themselves remain at
> [../Concepts/](../Concepts/) — they were not moved or duplicated here.

---

## 1. What is in the Concepts folder

| File | What it is |
|---|---|
| `mob 8 1.pdf` | The most developed artifact — a **full mobile page** for the fictional "Martin Immo" |
| `web multi agence 2 1.pdf` | The same page on desktop, multi-agency, with a 4-column platform row |
| `JD Test.png` | A second desktop direction ("System Assurances") — closer to the written spec's block order |
| `Attestation.png` | A short mobile header-only concept — hero card, dual review counts, action row |

### Structure the mobile concept already establishes

1. Navy trust banner + "Inscrire mon entreprise"
2. Business identity — name, activity, city, member number
3. **Hero rating: 4.7/5, "1841 avis toutes sources confondues", "dont 312 avis contrôlés"**
4. Two entry links — "Lire les 312 avis contrôlés" / "Lire les 1529 avis non vérifiés"
5. Action row (Appeler · Contacter · Site web · Itinéraire) + yellow "Déposer un avis"
6. **"En résumé"** — an AI-generated summary with an explicit AI-generation disclosure, strong-points chips, last-review date
7. Two reputation cards — "Réputation source contrôlée" (4,9/5 · 94 %) and "Réputation sources non vérifiées" (4,4/5 · 6 sources)
8. Verified block — score, histogram, **NPS strip (300 promoteurs / 10 neutres / 2 détracteurs)**, sort, topic chips
9. Review cards — verified badge, service type, "Achat vérifié", topic hashtags, business response **with the named collaborator**, Utile / Signaler; expanding reveals **per-review sub-ratings**
10. Unverified block — platform cards (Google, Pages Jaunes, Trustpilot, SeLoger) + spontaneous review cards with "Non vérifié"
11. Team · Store locator **with opening hours** · Navy "Démarche qualité" with three certificate links · FAQ accordion · B2B banner

This structure is the source for the canonical fixture data in
[../fixtures/martin-immo.json](../fixtures/martin-immo.json).

### Things the concepts add that the written spec does not mention

Worth confirming these are in scope, because they carry real cost and real risk:

- **AI-generated summary** — needs an AI-disclosure line (present in the concept, good) and a policy on how often it regenerates.
- **NPS promoters/neutrals/detractors strip.**
- **Per-review sub-ratings** revealed on expand.
- **Named collaborator** attached to reviews and responses — a GDPR consideration for staff, not just customers.
- **Opening hours** per agency.
- **"Sources trouvées : 6"** — implies automated discovery of third-party profiles.
- **"Voir le certificat"** deep links per ISO standard.

---

## 4. ⚠ The one thing that needed a decision before design proceeded

**The concepts and the specification disagree about the hero rating.**

| Source | Hero rating |
|---|---|
| `mob 8 1.pdf`, `Attestation.png`, `web multi agence 2 1.pdf` | **4,7/5 — "toutes sources confondues"** (1 841 avis), with "dont 312 avis contrôlés" as subtext |
| Cahier des charges §5 + acceptance criterion #1 | *"The rating shown in the header and in the Trust Verdict block reflects **only verified reviews**"* |

These cannot both be true. The concept leads with a blended number computed mostly from
**unverified** reviews (1,529 of 1,841 — 83%), which:

- fails the spec's first acceptance criterion outright;
- is the exact "dilution" risk the xlsx scoping table was written to prevent;
- puts the page's most prominent number outside the certified process, weakening the legal
  position under Art. L121-4 if a visitor reads it as a verified figure;
- and gives away the only thing OS has that Trustpilot doesn't.

Note also that in the concept's own numbers the verified rating (**4,9**) is *higher* than
the blended one (**4,4**... reputation card figure, distinct from the 4.7 hero blend — see
the fixture file for how all three numbers relate). Leading with the blend makes the business
look **worse** while also being non-compliant. There is no upside.

**Recommendation:** verified rating is the hero; all-sources appears as a smaller,
explicitly-labeled secondary line. All five prototypes implement it this way. If the PO wants
the volume headline for commercial reasons, the compliant way to get it is to lead with
**volume as a separate stat** ("1 841 avis, dont 312 contrôlés") while the *rating* shown
remains the verified one.

This decision (adopted design-side, not yet PO-confirmed) is logged formally in
[../product/decisions.md](../product/decisions.md); the underlying tension is tracked as open
question 3 in [../product/open-questions.md](../product/open-questions.md).

**Secondary conflicts to confirm:**

- **Block order.** `mob 8` puts the platform row *inside* the unverified block near the
  bottom; `JD Test.png` puts it near the top, right under the header; the written spec
  references a missing §4.10. Pick one.
- **Verdict placement.** Early (mobile concept) vs. after reviews (`JD Test`). Recommend early.
- **§4.8 and §4.10 are missing from the spec** — see open question 1 in
  [../product/open-questions.md](../product/open-questions.md).
