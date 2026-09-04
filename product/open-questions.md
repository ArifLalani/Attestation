# Open Questions

> **Source:** extracted from [../design.md §9](../design.md) (unchanged, kept in place). This
> is now the **living copy** — update the Status column here as answers come in from the
> Product Owner, rather than editing the frozen distillation in design.md. When a question is
> resolved, log the resolution in [decisions.md](decisions.md) and mark it Resolved below with
> a link to that entry.

| # | Question | Why it blocks layout work | Status |
|---|---|---|---|
| 1 | **Missing §4.8 and §4.10.** §4.10 is referenced by spec §7 but has no body text. Confirm §4.10 is the "On Other Platforms" block and identify §4.8. Both categories appear in §1.3, §2 and §5 of the spec. | The page cannot be fully laid out without knowing what §4.8 covers. | Open |
| 2 | **Empty state for the Trust Verdict.** Spec §4.3 defers this to "a UX workshop." | Needed before V1 ships — new members hit it on day one. | Open |
| 3 | **Header rating vs. "all sources combined."** Spec §4.2 requires an all-sources rating in the header, but §5's separation rule says only the verified rating is highlighted. Confirm the exact size/weight ratio, and whether "all sources" includes unverified in V1 while the external blocks are still LATER. | Directly determines the header layout and the hero-rating conflict — see [decisions.md](decisions.md) for the interim design-side resolution already adopted by all five prototypes. | Open — interim resolution adopted, not yet PO-confirmed |
| 4 | **Which categories ship in V1.** Spec tags external-source and other-platforms "LATER / Volet 3." | Confirm V1 = verified + unverified only, with layout reserving space for the other two. | Open — assumed yes, not yet PO-confirmed |
| 5 | **Retention period and consideration disclosure.** Spec §4.3/§3.2 require both to be displayed. | Neither has a defined value or a defined home in the page structure. | Open |
| 6 | **Vertical generalization.** Mockup and Schema example are insurance/real-estate specific ("agency", `InsuranceAgency`). | Confirm the industry-type mapping for personal services and driving schools. | Open |
| 7 | **Terminology.** Live FR site says *avis contrôlé*; EN locale says *verified review*; these docs say *verified*. | Lock the EN/FR glossary before copy is written. | Open |
| 8 | **Sub-rating criteria mismatch.** Spec §4.6 lists welcome / quality of advice / responsiveness / value for money; the live page shows onboarding / simplicity / customer relationship / visibility / benefit-cost. | Confirm which set the redesign uses, and whether it's per-vertical. | Open |

### How to use this file

- This is the single place to check "is X still undecided." Requirements.md and the
  prototypes should link here instead of restating the question.
- When you get an answer from the Product Owner, don't just delete the row — move it to
  decisions.md with the date and who confirmed it, then mark it Resolved here with a link.
  That keeps a record of *when* a requirement became fixed, which matters once several
  rounds of concepts have been built against different assumptions.
