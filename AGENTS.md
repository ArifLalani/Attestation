# AGENTS.md — Opinion System Public Review Page Redesign

Project context for any agent or contributor picking up this work.

---

## The task

Redesign the **public review page** that Opinion System publishes for each member business —
the page currently live at `opinionsystem.fr/{locale}/certificate/{id}`, with
[`/fr-fr/certificate/129`](https://www.opinionsystem.fr/fr-fr/certificate/129) as the
reference example (that one happens to be Opinion System's own certificate, filed under its
parent company Success Market).

Opinion System is a French review aggregator: member businesses send OS-run satisfaction
surveys to their customers, OS verifies the responses under AFNOR certification, and the
aggregated results are published on these public pages.

**What is changing and why.** OS wants more review volume on the page — unverified reviews
from members' own internal questionnaires now, imported competitor and third-party platform
ratings later. The redesign has to absorb that new content **without diluting the verified
review**, which is the entire product. That is the design problem; everything else is detail.

---

## Documents in this repo

| File | What it holds | Read it when |
|---|---|---|
| [opinion-system.md](opinion-system.md) | Company, business model, audiences, competitors, current-page teardown, and the extracted brand palette + typography | You need brand, tone, color, or audience context |
| [design.md](design.md) | Requirements distilled from the two client documents: review typology, legal constraints, block-by-block page structure, business rules, NFRs, acceptance criteria, open questions | You are making a layout, component, or copy decision |
| [research-best-practices.md](research-best-practices.md) | Teardown of the supplied concepts, how Trustpilot/Google/Avis Vérifiés solve the same problem, trust-signal and review-UX research, concrete recommendations | Before designing anything |
| [Prototypes/](Prototypes/index.html) | Five mobile HTML/CSS prototypes on an MUI-flavored design system, plus a gallery index | You want to see or extend the current design direction |
| **AGENTS.md** (this file) | Task overview, source of truth, working rules | Start here |

### Concepts (client-supplied, in `Concepts/`)

`mob 8 1.pdf` (the most developed — full mobile page), `web multi agence 2 1.pdf` (desktop,
multi-agency), `JD Test.png` (second desktop direction), `Attestation.png` (mobile header).
Decoded and summarized in [research-best-practices.md §1](research-best-practices.md).

### Source documents (client-supplied, not in this repo)

- `~/Downloads/Cahier_des_charges_Page_avis_publique_EN (1).docx` — Functional
  Specifications v1.0, Discovery phase output, July 3 2026, status "For review / sign-off".
  **This is the primary source of truth.**
- `~/Downloads/OS_avis_controles_et_avis_non_controles_EN.xlsx` — the Discovery scoping table
  comparing verified vs. unverified reviews across legal framework, brand credibility,
  end-user understanding, abuse risk, competitive impact, and product coherence.
- Referenced but **not supplied**: the functional mockup, the scoping diagram, and
  *"Spec — Competitor Review Import"*.

If `design.md` and the source `.docx` ever disagree, the `.docx` wins — `design.md` is a
distillation, and it flags rather than resolves gaps.

---

## The one thing to hold onto

> Opinion System's only real asset is that an OS review is **verified**. The page must add
> volume from unverified sources while making the verified/unverified distinction
> unmistakable — visually, editorially, and in the arithmetic.

Three concrete consequences:

1. **Only verified reviews feed the headline rating.** Header and Trust Verdict block. No
   exceptions, no blending. An "all sources combined" figure may appear, but visibly smaller
   and clearly labeled.
2. **Every unverified review carries an "Unverified" badge.** This is French/EU law
   (Art. L121-4), not a style choice. Gray block, dashed border, collapsed by default.
3. **Sorting cannot be manipulated.** Default is most-recent-first, and no mechanism may
   arbitrarily hide a review — an NF Service 522 requirement.

---

## Audiences the page serves simultaneously

- **Consumers** comparing two or three local providers — mostly mobile, low patience, don't
  know what ISO 20488 means.
- **Member businesses** — this page is the marketing asset they pay ~€100/month for.
- **Search engines and AI answer engines** — the "Trust Verdict" block is deliberately
  written to be quoted verbatim, and the page must emit valid Schema.org.

---

## Design system quick reference

Full detail and rationale in [opinion-system.md §6](opinion-system.md).

| Semantic | Hex | Use |
|---|---|---|
| Navy — Opinion System / certifier | `#041B44` | Trust banner, Quality Approach band, body text |
| Verified green | `#2DB38A` | Verified badges, Trust Verdict border, Verified dashboard border |
| Star amber | `#FFC107` | Star fills only |
| Action yellow | `#FFD500` | The single primary CTA ("Leave My Review"). Keep rare. |
| Deep blue | `#004F9F` | Secondary buttons, icons |
| Accent blue | `#2C95FF` | Links |
| Surface tints | `#ECF3FB` / `#F5F9FE` | Page ground, card separation |
| Unverified | Neutral gray + **dashed** border | Deliberately outside the brand palette |

Type: **Poppins** for headings and buttons, **Roboto** for body and data.

**Hard rule:** green is a trust semantic on this page. It must never appear on an unverified
review card.

---

## Scope boundaries

**In V1:** verified reviews (full detail), unverified reviews (labeled, collapsed), trust
banner, business header, Trust Verdict, Quality Approach, verified dashboard, team block,
store locator (map placeholder only), certificate CTA, FAQ, and the contact / list-my-business
/ leave-a-review modals.

**Deferred ("LATER" / Volet 3):** external-source (competitor) review import and the
"On Other Platforms" block. Reserve layout space; don't build the integrations.

**Explicitly out of scope:** the interactive map component, the competitor import technical
spec, the full review submission flow, the admin back office, automated certificate PDF
generation, and real third-party API integrations. Full list in
[design.md §8](design.md).

---

## ⚠ Open conflict: the concepts contradict the spec on the hero rating

The supplied concepts lead with **4,7/5 "toutes sources confondues"** (1 841 reviews, 83 % of
them unverified). The spec's first acceptance criterion requires the header rating to reflect
**only verified reviews** (4,9/5 on 312). These cannot both ship. The blended number is also
*lower* than the verified one, so leading with it makes the business look worse while being
non-compliant. All five prototypes implement the spec's rule. Full analysis and the compliant
way to keep a volume headline: [research-best-practices.md §4](research-best-practices.md).

## Known gaps — check before deep layout work

The supplied specification jumps from §4.7 to §4.9 to §4.11: **§4.8 and §4.10 are missing**,
yet §7 explicitly references "the ratings shown in 4.10". §4.10 is almost certainly the
"On Other Platforms" block; §4.8 is unidentified. Seven further open questions — Trust
Verdict empty state, header rating ratio, V1 category set, retention/consideration
disclosure placement, vertical generalization, EN/FR glossary, sub-rating criteria mismatch —
are listed in [design.md §9](design.md). Several need a Product Owner answer before final
layout.

---

## Working rules for this project

- **Cite the spec section** when a design decision traces to a requirement (e.g. "collapsed
  by default per §5 Conditional display"). It makes sign-off reviewable.
- **Don't invent legal copy.** Disclosure wording is regulated; draft it, mark it
  `[NEEDS LEGAL REVIEW]`, and don't ship placeholder legalese as final.
- **Treat accessibility as a requirement, not a pass at the end.** RGAA / WCAG 2.1 AA is in
  the spec (§6.2), and low-contrast light-gray-on-white is exactly the trap the "unverified =
  gray" instruction sets.
- **Preserve the institutional voice.** Attestation language, dates, member numbers and
  standard numbers *are* the credibility. Modernize the form, not the register.
- **Bilingual from the start.** The page ships FR and EN (and the live EN build currently
  leaks untranslated French). Don't hardcode strings or assume French string lengths.

---

## Status

| | |
|---|---|
| Phase | Discovery complete → design |
| Spec version | 1.0, July 3 2026, "For review / sign-off" |
| Research + requirements written | 2026-08-25 |
| Next | Resolve [design.md §9](design.md) open questions; begin layout against the block structure in [design.md §5](design.md) |
