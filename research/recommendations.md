# Recommendations & Prototype Comparison

> **Source:** restructured from [../research-best-practices.md §3 and §5](../research-best-practices.md)
> (unchanged, kept in place). Concrete design recommendations, plus the comparison of the five
> built prototypes. The formal decision record for what's been adopted vs. merely recommended
> lives in [../product/decisions.md](../product/decisions.md).

---

## Hierarchy

1. **One hero number.** The verified rating. Everything else is smaller, labeled with its
   source, and physically separated. (See [concept-teardown.md §4](concept-teardown.md) — the
   concepts currently break this.)
2. **Put the "why trust this" mechanism above the fold-ish**, not at the page bottom. The live
   page buries certification in a prose block after all the reviews; that's backwards.
3. **The "En résumé" verdict deserves its early placement** in the mobile concept. Both a
   scanning human and an AI crawler want the conclusion first. `JD Test.png` places it *after*
   the reviews — that's worse for both audiences.

## Making "unverified" legible without making it look broken

- Gray + dashed border + explicit badge — as specified. But keep the text at **AA contrast**:
  the failure mode is unverified content that reads as *disabled* or *error*.
- **Never use green on an unverified card.** Green is the verification semantic on this page.
- Say what unverified *means* in consumer language, once, at the block level: *"Avis
  spontanés, sans vérification d'identité — hors du contrôle d'Opinion System."* Then badge
  each review.
- State the arithmetic explicitly — *"ne comptent pas dans la note de 4,9/5"*. Don't make
  users infer it.

## Mobile specifics

- **Progressive disclosure is mandatory, not optional** (spec §7.4). Collapsed, this page
  should be ~2 screens; expanded, it can be long.
- **Sticky bottom action bar.** "Déposer un avis" and "Contacter" must stay reachable — on a
  3,000–4,500px page, a header-only CTA is unreachable for most of the scroll.
- **Touch targets ≥48px.** MUI chips are 32px by default; expand the hit area without changing
  the visual size.
- **Horizontal chip scrollers** for topic filters — standard mobile pattern, keeps filters one
  thumb-swipe away.
- **Don't put the histogram behind a tap.** It's the credibility check.

## SEO / AI answer engines

- The verdict block should be **one self-contained paragraph** naming the business, city,
  review count, certifying standard, and verdict — quotable without surrounding context.
- `aggregateRating` in Schema.org must be built from **verified reviews only**. Emitting a
  blended figure here would contradict the on-page claim and is the kind of inconsistency
  Rich Results testing surfaces.
- Keep FAQ answers factual and short — they double as `FAQPage` markup.

## Things to drop or defer

- The **social icon row** in `Attestation.png` competes with the primary CTA for very little
  value. Move to footer.
- **"Sources trouvées : 6"** is a confusing metric for a consumer. Either name the sources or
  drop the count.
- The **interactive map** is out of scope (spec §7); the placeholder is fine, but don't let it
  occupy a full screen height on mobile.

---

## The five prototypes

Built as static HTML/CSS with an MUI-flavored design system
(`Prototypes/assets/os-mui.css`), branded with the palette extracted from the live site.
Open [../Prototypes/index.html](../Prototypes/index.html), or view at 390px wide.

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
probably the real design. **This synthesis is a recommendation, not yet built** — see
[../product/decisions.md](../product/decisions.md).

> **Note:** a sixth variant (`Prototypes/variant-6-dashboard.html`) and a companion
> typography stylesheet (`Prototypes/assets/os-mui-poppins.css`) exist on disk but were added
> after this research was written and are not yet folded into the comparison above. Logged as
> a loose end in [../product/decisions.md](../product/decisions.md).

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
