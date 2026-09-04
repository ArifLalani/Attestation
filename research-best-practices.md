# Research & Best Practices — Public Review Page (Mobile)

> Written 2026-08-25, before design. Covers: (1) what the supplied concepts actually
> contain, (2) how comparable pages solve the same problems, (3) concrete
> recommendations, (4) the one compliance conflict that needs a decision.
>
> Companion docs: [CLAUDE.md](CLAUDE.md) · [design.md](design.md) · [opinion-system.md](opinion-system.md)
> Prototypes: [Prototypes/index.html](Prototypes/index.html)

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

## 2. How comparable pages solve this

### The verified/unverified problem is not new

**Trustpilot** runs the closest analogue. It splits reviews into *organic* (anyone, unlabeled) and *invited* (business-solicited), with reviews collected through Trustpilot's own automated invitation flow labeled **"Verified"**. The instructive part: Trustpilot puts the label **on the individual review**, and still computes **one blended TrustScore**. That blending is precisely what OS's spec forbids — and it is why Trustpilot is persistently accused of being gameable. **OS's separation rule is a genuine competitive advantage; the design should treat it as a feature, not a compliance tax.**

**Google Business Profile** shows a single open rating with no verification concept at all — volume without trust. **Avis Vérifiés** requires proof of purchase for everything, so it never has to draw the distinction on-page.

**Nobody in this market currently shows two clearly-separated ratings well.** That is an opening, and it's the strongest reason to make the split visually confident rather than apologetic.

### What the trust-signal research says

- **82% of shoppers say they are more likely to trust a site displaying a third-party verified trust badge** — but badges only work when they are *earned and verifiable*. Decorative badges anyone could paste on read as noise.
- **Badges should link to the underlying certification** so users can verify the claim independently. → The concept's "Voir le certificat →" links are exactly right; keep them.
- **A lone badge in an unexpected place backfires** — research found an isolated trust badge on a payment page *created* suspicion by prompting a question the user hadn't asked. → Don't scatter verification badges. Concentrate them where the claim is being made.
- **Transparency is displacing borrowed authority.** Explaining *how* the process works now builds more trust than asserting *that* you're certified. → "ISO 20488" means nothing to a consumer. "We only send the survey after a real purchase, and the business cannot delete your review" means everything. **Lead with the mechanism, footnote the standard number.**

### What review-UX research says

Baymard's product-page work (19 guidelines specifically on user reviews) and NN/g's mobile research converge on a few points that matter here:

- **Rating distribution histograms are load-bearing** — users use them to check whether a 4.9 is 300 fives or a bimodal mess. The concept has this; keep it prominent.
- **Filtering and sorting are where review sections fail.** Topic chips outperform generic sort dropdowns because users arrive with a specific question ("are they responsive?"). The concept's topic chips (#Accueil #Conseil #Tarifs #Réactivité) are the strongest single UX idea in it.
- **Mobile navigation performance trails desktop by ~9 percentage points** in Baymard's benchmark. On a page this long, that gap is the design problem.
- **Negative reviews increase credibility.** A page showing only 5-star content reads as filtered. The live OS page already shows a 2.2/5 review in its own feed — that honesty is an asset, and the "no arbitrary filtering" rule should be surfaced as a *selling point*, not buried in legal text.

---

## 3. Recommendations

### 3.1 Hierarchy

1. **One hero number.** The verified rating. Everything else is smaller, labeled with its source, and physically separated. (See §4 — the concepts currently break this.)
2. **Put the "why trust this" mechanism above the fold-ish**, not at the page bottom. The live page buries certification in a prose block after all the reviews; that's backwards.
3. **The "En résumé" verdict deserves its early placement** in the mobile concept. Both a scanning human and an AI crawler want the conclusion first. `JD Test.png` places it *after* the reviews — that's worse for both audiences.

### 3.2 Making "unverified" legible without making it look broken

- Gray + dashed border + explicit badge — as specified. But keep the text at **AA contrast**: the failure mode is unverified content that reads as *disabled* or *error*.
- **Never use green on an unverified card.** Green is the verification semantic on this page.
- Say what unverified *means* in consumer language, once, at the block level: *"Avis spontanés, sans vérification d'identité — hors du contrôle d'Opinion System."* Then badge each review.
- State the arithmetic explicitly — *"ne comptent pas dans la note de 4,9/5"*. Don't make users infer it.

### 3.3 Mobile specifics

- **Progressive disclosure is mandatory, not optional** (spec §7.4). Collapsed, this page should be ~2 screens; expanded, it can be long.
- **Sticky bottom action bar.** "Déposer un avis" and "Contacter" must stay reachable — on a 3,000–4,500px page, a header-only CTA is unreachable for most of the scroll.
- **Touch targets ≥48px.** MUI chips are 32px by default; expand the hit area without changing the visual size.
- **Horizontal chip scrollers** for topic filters — standard mobile pattern, keeps filters one thumb-swipe away.
- **Don't put the histogram behind a tap.** It's the credibility check.

### 3.4 SEO / AI answer engines

- The verdict block should be **one self-contained paragraph** naming the business, city, review count, certifying standard, and verdict — quotable without surrounding context.
- `aggregateRating` in Schema.org must be built from **verified reviews only**. Emitting a blended figure here would contradict the on-page claim and is the kind of inconsistency Rich Results testing surfaces.
- Keep FAQ answers factual and short — they double as `FAQPage` markup.

### 3.5 Things to drop or defer

- The **social icon row** in `Attestation.png` competes with the primary CTA for very little value. Move to footer.
- **"Sources trouvées : 6"** is a confusing metric for a consumer. Either name the sources or drop the count.
- The **interactive map** is out of scope (spec §7); the placeholder is fine, but don't let it occupy a full screen height on mobile.

---

## 4. ⚠ The one thing that needs a decision before design proceeds

**The concepts and the specification disagree about the hero rating.**

| Source | Hero rating |
|---|---|
| `mob 8 1.pdf`, `Attestation.png`, `web multi agence 2 1.pdf` | **4,7/5 — "toutes sources confondues"** (1 841 avis), with "dont 312 avis contrôlés" as subtext |
| Cahier des charges §5 + acceptance criterion #1 | *"The rating shown in the header and in the Trust Verdict block reflects **only verified reviews**"* |

These cannot both be true. The concept leads with a blended number computed mostly from **unverified** reviews (1,529 of 1,841 — 83%), which:

- fails the spec's first acceptance criterion outright;
- is the exact "dilution" risk the xlsx scoping table was written to prevent;
- puts the page's most prominent number outside the certified process, weakening the legal position under Art. L121-4 if a visitor reads it as a verified figure;
- and gives away the only thing OS has that Trustpilot doesn't.

Note also that in the concept's own numbers the verified rating (**4,9**) is *higher* than the blended one (**4,4**). Leading with the blend makes the business look **worse** while also being non-compliant. There is no upside.

**Recommendation:** verified rating is the hero; all-sources appears as a smaller, explicitly-labeled secondary line. All five prototypes implement it this way. If the PO wants the volume headline for commercial reasons, the compliant way to get it is to lead with **volume as a separate stat** ("1 841 avis, dont 312 contrôlés") while the *rating* shown remains the verified one.

**Secondary conflicts to confirm:**

- **Block order.** `mob 8` puts the platform row *inside* the unverified block near the bottom; `JD Test.png` puts it near the top, right under the header; the written spec references a missing §4.10. Pick one.
- **Verdict placement.** Early (mobile concept) vs. after reviews (`JD Test`). Recommend early.
- **§4.8 and §4.10 are missing from the spec** — see [design.md §9](design.md).

---

## 5. The five prototypes

Built as static HTML/CSS with an MUI-flavored design system
(`Prototypes/assets/os-mui.css`), branded with the palette extracted from the live site.
Open [Prototypes/index.html](Prototypes/index.html), or view at 390px wide.

| # | Variant | Core idea | Best when |
|---|---|---|---|
| 1 | **Onglets segmentés** | MUI Tabs — verified / unverified / platforms never share a scroll | Compliance clarity is the top priority |
| 2 | **Verdict d'abord** | Opens with the quotable verdict, then a 4-step "how verification works" | SEO / AI citation is the top priority |
| 3 | **Double registre** | Keeps the concepts' side-by-side reputation cards, fixes the hierarchy | Continuity with the approved concepts matters |
| 4 | **Divulgation progressive** | Everything in accordions; only verified open on load | Mobile ergonomics + the §7.4 perf requirement |
| 5 | **Attestation** | The page as an issued document — numbered clauses, seal, annexes | Maximum differentiation from open platforms |

All five share: verified-only hero rating · "Non vérifié" badge on every unverified review ·
green never on unverified · chronological default sort stated on-page · L121-4 disclosures ·
report + business response on every verified review · AA contrast · ≥48px touch targets ·
sticky bottom CTA.

**Suggested path:** variant 3 is the safest to socialize (closest to what stakeholders have
already approved), variant 4 is the best mobile experience, and variant 2 is the best answer
to the SEO/AI objective. A merge of 3's header, 4's disclosure model, and 2's verdict block is
probably the real design.

---

## Sources

- [Trustpilot — How do reviews get on Trustpilot?](https://help.trustpilot.com/s/article/How-do-reviews-get-on-Trustpilot)
- [Trustpilot — Verified vs. organic reviews](https://support.trustpilot.com/hc/en-us/articles/223402468--How-are-reviews-collected-)
- [Baymard Institute — Product Details Page UX (User Reviews)](https://baymard.com/research/product-page)
- [Nielsen Norman Group — Mobile & Tablet usability reports](https://www.nngroup.com/reports/topic/mobile-and-tablet-design/)
- [TrustedSite — Guide to trust badges (2026)](https://www.trustedsite.com/resources/trust-badges)
- [User Intuition — Trust UX: badges, proof, and the research behind them](https://www.userintuition.ai/reference-guides/trust-ux-badges-proof-and-the-research-behind-them/)
- [LogRocket — Building trust into UX](https://blog.logrocket.com/ux-design/trust-driven-ux-examples/)
- [Avis Vérifiés — Comparatif des plateformes d'avis clients 2026](https://fr.avis-verifies.com/blog/les-10-meilleures-plateformes-davis-clients-en-france-comparatif-complet-2026/)
