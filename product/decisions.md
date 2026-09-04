# Decisions Log

> A running record of decisions made about the page design, so future rounds of concepts
> build on a known history instead of re-litigating settled ground. This file did not exist
> before this restructuring — the entries below backfill everything that is *already*
> effectively decided (stated or clearly recommended) in the existing docs and prototypes,
> so the log starts accurate rather than empty. Add a new entry every time a real decision
> gets made; don't overwrite old entries.

---

## Entry template

```
## YYYY-MM-DD — Short decision title
**Decision:** what was decided.
**Context:** the question or conflict that prompted it.
**Alternatives considered:** what else was on the table.
**Status:** Proposed / Confirmed by [who] / Superseded by [entry].
**Source:** file(s) this is recorded in or derived from.
```

---

## 2026-08-25 — Verified rating is the hero number, not the blended "all sources" figure

**Decision:** The header and Trust Verdict block show the **verified-only** rating (4.9/5 on
312 reviews in the fixture data) as the primary number. The "all sources combined" figure
(4.7/5 on 1,841) appears only as a smaller, explicitly labeled secondary line.

**Context:** The client-supplied concepts (`mob 8 1.pdf`, `Attestation.png`,
`web multi agence 2 1.pdf`) all lead with the blended 4.7/5 figure. The written spec's first
acceptance criterion requires the header rating to reflect only verified reviews. These
cannot both ship — see research/concept-teardown.md §4 for the full analysis. The blended
number is also *lower* than the verified one in the concepts' own data (4.7 vs 4.9), so
leading with it makes the business look worse while also being non-compliant.

**Alternatives considered:** Leading with the blended figure (rejected — fails AC1 and the
xlsx dilution-risk analysis); showing both at equal visual weight (rejected — violates the
"one number rules" principle in design-system/principles.md).

**Status:** Design-side resolution adopted in all five original prototypes and documented as
the recommendation in research/concept-teardown.md. **Not yet formally confirmed by the
Product Owner** — this is exactly open question 3 in product/open-questions.md. Treat as the
working assumption for new concepts until the PO signs off.

**Source:** research/concept-teardown.md §4; Prototypes/index.html warning banner; all five
`Prototypes/variant-*.html` files.

---

## 2026-08-25 — Five structural directions explored for the verified/unverified split

**Decision:** Built five distinct prototypes, each resolving the "more volume without
diluting verified" tension a different way, rather than converging early on one direction.

**Context:** No single obviously-correct layout for showing two legally-separated ratings on
one page — research/competitive-landscape.md notes that no competitor (Trustpilot, Google,
Avis Vérifiés) currently solves this well, so there was no pattern to copy directly.

**Alternatives considered / built:**
1. **Onglets segmentés (Segmented tabs)** — verified / unverified / platforms never share a
   scroll. Strongest compliance clarity; hides unverified volume behind a tab.
2. **Verdict d'abord (Verdict-first)** — opens on the quotable verdict, then explains the
   verification mechanism in 4 steps. Best for SEO/AI citation; pushes reviews further down.
3. **Double registre (Dual ledger)** — keeps the concepts' side-by-side reputation cards,
   fixes the hierarchy. Closest continuity with the client-approved concepts.
4. **Divulgation progressive (Progressive disclosure / accordions)** — everything collapsed
   except verified. Best mobile ergonomics and satisfies the §7.4 performance requirement by
   construction.
5. **Attestation** — the page as an issued document, numbered clauses, seal, annexes.
   Maximum differentiation from open platforms; register may read as cold, untested.

**Status:** Confirmed — all five built and published in Prototypes/index.html. Suggested
synthesis per research/recommendations.md §5: variant 3's header + variant 4's disclosure
model + variant 2's verdict block. **This synthesis has not been built or chosen yet** — it
is a recommendation, not a shipped decision.

**Source:** research/concept-teardown.md §5; Prototypes/index.html; Prototypes/variant-1
through variant-5 HTML files.

---

## 2026-08-26 — "Poppins throughout" typography variant opened for variants 6–10

**Decision:** A second stylesheet, `Prototypes/assets/os-mui-poppins.css`, was added to
explore replacing the documented Poppins(headings)/Roboto(body) split
(business-context.md §6, design-system/principles.md) with Poppins used for all text. It
loads after the base stylesheet and overrides only typeface — every color, spacing, shadow,
and shape token stays identical.

**Context:** Not explained in any prose document — inferred entirely from the stylesheet's
own header comment ("per explicit design-review request") and its presence alongside a new,
not-yet-catalogued `variant-6-dashboard.html`.

**Alternatives considered:** Not documented — this entry exists so the *fact* of the
exploration is on the record; the reasoning behind it should be filled in by whoever
requested it.

**Status:** **Resolved** — see the 2026-08-27 entry below, "Figma Design System adopted as
canonical visual source of truth." Poppins-throughout is now the canonical direction for
`design-system/tokens.css`. This stylesheet remains unintegrated into any prototype HTML.

**Source:** Prototypes/assets/os-mui-poppins.css (file header comment); Prototypes/variant-6-dashboard.html.

---

## 2026-08-27 — Figma Design System adopted as canonical visual source of truth

**Decision:** The Opinion System Figma Design System
([design-system/figma-source.md](../design-system/figma-source.md)) is now the canonical
visual reference for this entire workspace, including the public certificate/review page
prototypes, even though that page has no frames of its own in Figma. Four dependent token
decisions were confirmed at the same time:

1. **Typography:** Poppins throughout (headings and body), replacing the legacy
   Roboto-body/Poppins-heading split. The legacy split is unchanged in
   `Prototypes/assets/os-mui.css`; this decision lives in `design-system/tokens.css` only.
2. **Verified green:** `#43B6A3` (Figma's `--vert-os`) replaces legacy `#2DB38A`. A new
   AA-safe text variant, `#2D7B6E` (~5.0:1 on white), was derived using the same
   hue/saturation-preserving darkening technique as the value it replaces, since the raw
   Figma green fails AA as text (~2.48:1) just as the legacy one did (~2.65:1).
3. **Base interactive radius:** `8px` (confirmed identically across Button, Chip, and Text
   Input in Figma) replaces the assumed `4px`. Card radius was **not** blanket-changed: only
   Review Card has a confirmed Figma value (`16px`, captured as the new `--r-card-review`);
   the generic `--r-card` (12px) stays unconfirmed until a generic Card component is
   inspected in Figma.
4. **Error/warning token added:** `#FC6530` (Figma's `--error3`) — fills a real gap; there
   was no error/warning semantic color in this system before.

**Context:** Figma MCP access was confirmed working for `zwXFmmTHjufUoHYbrmWB6S` (the Opinion
System Design System file). Direct inspection of Button, Text Input, and Review Card via
`get_design_context` surfaced real, bound-variable token values rather than eyeballed ones —
see figma-source.md for exact node IDs and what was and wasn't inspected.

**Alternatives considered:** Keeping the legacy typography/green values until prototype HTML
is also migrated (rejected — the user explicitly asked for the documentation layer to be
updated now, independently of the prototype migration, which is separate future work);
blending old and new greens, or picking a radius by eye (rejected — the point of this
decision was to stop guessing and start citing a source).

**Status:** Confirmed by the user, 2026-08-27. Implemented in `design-system/tokens.css`,
`design-system/principles.md`, `design-system/components.md`, `design-system/figma-source.md`,
and `CLAUDE.md`. **Not applied to any prototype HTML** — `Prototypes/assets/os-mui.css` and
every built variant (1–10, plus the Figma "Variante 1/2/3" frames) still use the legacy
values. That migration is separate, not-yet-scheduled work.

**Source:** `design-system/tokens.css` provenance comments; `design-system/figma-source.md`;
`get_design_context` calls on Figma nodes `412:1912`, `412:1882`, `416:13164`.

---

## Open items not yet decided

These are tracked with more detail in [open-questions.md](open-questions.md) where they're
PRD-scoped; design-token-scoped open items are listed here instead, so this log stays the
single place to check "what's been decided so far":

- Exact size/weight ratio between verified and all-sources ratings in the header (open
  question 3).
- Whether V1 ships verified + unverified only, or reserves visible (not just structural)
  space for external-source/other-platforms (open question 4).
- Trust Verdict empty-state copy and layout for a business with zero verified reviews (open
  question 2).
- EN/FR terminology glossary (open question 7).
- **Generic card radius.** `--r-card` (12px) has no confirmed Figma source — only Review Card
  specifically was inspected (16px). Needs a generic "Card" component check before extending.
- **Star-amber vs. CTA-yellow.** Figma uses the same hex (`#FFD500` / `--jaune-400`) for both;
  we currently keep them as visually distinct tokens (`--os-amber` vs `--os-yellow`) per
  design-system/principles.md's "color is semantic" rule. Confirm this divergence from Figma
  is intentional, or fold `--os-amber` into `--os-yellow`.
- **Muted text color.** `--os-text-secondary` (#5A6B85) is a local AA-safe darkening of an old
  live-site gray; Figma's own muted-text token (`--gris` #8EA1B2) hasn't been checked for AA
  compliance. Needs its own contrast check before it could replace ours.
- **Prototype migration timing.** All ten built HTML prototypes and the three Figma "Variante"
  frames still render in the legacy tokens (Roboto/Poppins split, `#2DB38A` green, 4px/12px
  radii). Nothing here is a source-of-truth conflict — tokens.css is intentionally ahead of
  them — but a migration pass needs to be explicitly scheduled, not assumed.
