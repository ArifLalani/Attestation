# Competitive Landscape — UX Pattern Analysis

> **Source:** restructured from [../research-best-practices.md §2](../research-best-practices.md)
> (unchanged, kept in place). This file covers *how* competitors solve the verified/unverified
> display problem at the UX-pattern level. For the business-model-level competitive comparison
> (pricing, positioning, vertical focus), see
> [../product/business-context.md §4](../product/business-context.md).

---

## The verified/unverified problem is not new

**Trustpilot** runs the closest analogue. It splits reviews into *organic* (anyone, unlabeled)
and *invited* (business-solicited), with reviews collected through Trustpilot's own automated
invitation flow labeled **"Verified"**. The instructive part: Trustpilot puts the label **on
the individual review**, and still computes **one blended TrustScore**. That blending is
precisely what OS's spec forbids — and it is why Trustpilot is persistently accused of being
gameable. **OS's separation rule is a genuine competitive advantage; the design should treat
it as a feature, not a compliance tax.**

**Google Business Profile** shows a single open rating with no verification concept at all —
volume without trust. **Avis Vérifiés** requires proof of purchase for everything, so it never
has to draw the distinction on-page.

**Nobody in this market currently shows two clearly-separated ratings well.** That is an
opening, and it's the strongest reason to make the split visually confident rather than
apologetic.

---

## What the trust-signal research says

- **82% of shoppers say they are more likely to trust a site displaying a third-party
  verified trust badge** — but badges only work when they are *earned and verifiable*.
  Decorative badges anyone could paste on read as noise.
- **Badges should link to the underlying certification** so users can verify the claim
  independently. → The concept's "Voir le certificat →" links are exactly right; keep them.
- **A lone badge in an unexpected place backfires** — research found an isolated trust badge
  on a payment page *created* suspicion by prompting a question the user hadn't asked. →
  Don't scatter verification badges. Concentrate them where the claim is being made.
- **Transparency is displacing borrowed authority.** Explaining *how* the process works now
  builds more trust than asserting *that* you're certified. → "ISO 20488" means nothing to a
  consumer. "We only send the survey after a real purchase, and the business cannot delete
  your review" means everything. **Lead with the mechanism, footnote the standard number.**

## What review-UX research says

Baymard's product-page work (19 guidelines specifically on user reviews) and NN/g's mobile
research converge on a few points that matter here:

- **Rating distribution histograms are load-bearing** — users use them to check whether a 4.9
  is 300 fives or a bimodal mess. The concept has this; keep it prominent.
- **Filtering and sorting are where review sections fail.** Topic chips outperform generic
  sort dropdowns because users arrive with a specific question ("are they responsive?"). The
  concept's topic chips (#Accueil #Conseil #Tarifs #Réactivité) are the strongest single UX
  idea in it.
- **Mobile navigation performance trails desktop by ~9 percentage points** in Baymard's
  benchmark. On a page this long, that gap is the design problem.
- **Negative reviews increase credibility.** A page showing only 5-star content reads as
  filtered. The live OS page already shows a 2.2/5 review in its own feed — that honesty is
  an asset, and the "no arbitrary filtering" rule should be surfaced as a *selling point*, not
  buried in legal text.

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
