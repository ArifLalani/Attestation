# Design Principles

> **Source:** restructured from [../design.md §11](../design.md) and
> [../opinion-system.md §6.4](../opinion-system.md) (both unchanged, kept in place). These are
> the working rules for making visual decisions on this page — read this before making a
> layout, color, or copy call. Token values referenced here live in
> [tokens.css](tokens.css).

---

## Where visual authority comes from

The full source-of-truth hierarchy is stated once, in
[CLAUDE.md](../CLAUDE.md#source-of-truth-hierarchy) — this section only covers how it applies
to design principles specifically.

Figma (see [figma-source.md](figma-source.md)) governs *how things look*: color, type,
spacing, radii, component states. This document and requirements.md govern *what's allowed*:
the legal/hierarchy rules below don't change because a token's hex value changes. If a Figma
value and a rule below ever conflict — e.g. a Figma component uses green somewhere this
page's rules forbid it — **the rule below wins.** Figma is a visual reference, not a license
to break the compliance hierarchy.

The public certificate/review page has no frames of its own in the Figma file — it only
documents the member-facing app. Apply the app's tokens, type, and component patterns to
this page by extension; don't wait for page-specific Figma frames to exist before using them.

---

## The hard rule

> **Green is a trust semantic on this page, not decoration.** It must never appear on an
> unverified review card. If green appears anywhere on an unverified card, the design has
> failed its own brief — no exception is defensible.

## The eight working principles

1. **Hierarchy carries the legal burden.** Compliance here is not a footnote — it is the
   primary structural constraint. If a visitor could mistake an unverified review for a
   verified one, the design is non-compliant, regardless of how it looks.
2. **Verified is the default state of the page; everything else is opt-in.** Unverified and
   external blocks stay collapsed until the visitor asks for them.
3. **One number rules.** Exactly one rating gets hero treatment. Every other rating is
   smaller, labeled with its source, and physically separated from the hero. (This is the
   principle behind the hero-rating decision recorded in
   [../product/decisions.md](../product/decisions.md).)
4. **Color is semantic, not decorative.** Navy = Opinion System / the certifying party.
   Green = verified. Amber = stars. Yellow = the single primary action. Gray + dashed border
   = unverified.
5. **Gray must read as "not endorsed", not as "broken".** Unverified reviews are legitimate
   content displayed under a legal caveat — desaturated and clearly labeled, but still
   readable and respectable. Keep unverified text at AA contrast; the failure mode is
   content that reads as *disabled* or *error*.
6. **Write for the crawler and the human with the same words.** The Trust Verdict must be
   quotable verbatim by an AI answer engine *and* be the clearest paragraph on the page for
   a person. If it reads as SEO filler, it fails both.
7. **Modernize the form, keep the institutional voice.** Attestation language, dates, member
   numbers and standard numbers are the credibility. Don't restyle them into startup
   marketing copy.
8. **Progressive disclosure is a performance requirement, not just a UX preference.** See
   requirements.md §7.4 — this isn't only an aesthetic choice, it's how the page hits its
   load-time budget.

## Palette reading — why each token means what it means

The brand already supplies most of the semantic system the spec needs. Values below are kept
short deliberately — for exact hex and provenance, see [tokens.css](tokens.css); don't let
this list become a second place a color can drift:

- **Navy `#041B44`** = Opinion System itself, the certifying third party. Use for the trust
  banner and the "Quality Approach" band. `[FIGMA-CONFIRMED]`
- **Green `#43B6A3` / `#2D7B6E` text** = *verified*. Adopted from the Figma Design System on
  2026-08-27, replacing the legacy live-site value `#2DB38A` (see
  [../product/decisions.md](../product/decisions.md)). Used for borders on the Trust Verdict
  and the Verified Reviews dashboard. `[FIGMA-CONFIRMED / LOCAL-DERIVED]`
- **Yellow `#FFD500`** = action / "Leave my review". Reserve it — its power comes from
  rarity. `[FIGMA-CONFIRMED]`
- **Amber `#FFC107`** = stars only. Keep visually distinct from the yellow CTA — though note
  Figma itself doesn't draw this distinction (its star fill and the CTA yellow share one
  token); we're keeping ours separate until there's a reason not to (open item in
  product/decisions.md). `[LOCAL-ONLY]`
- **Neutral gray + dashed border** = *unverified*. Deliberately desaturated, deliberately
  outside the brand palette. Grayness must read as "not endorsed by OS", never as "disabled"
  or "broken". `[LOCAL-ONLY — not yet checked against Figma]`
- **Blue tints `#ECF3FB` / `#F5F9FE`** = page ground and card separation. `[LOCAL-ONLY — not
  yet checked against Figma]`

## Accessibility is load-bearing, not a pass at the end

RGAA / WCAG 2.1 AA is a spec requirement (requirements.md §7.2), and "unverified = gray" is
exactly the trap that produces low-contrast light-gray-on-white text. Three brand colors have
been darkened for this reason and are baked into tokens.css:

- Muted text `#8392A8` (3.16:1 — fails) → `--os-text-secondary` `#5A6B85` (5.42:1)
- Legacy verified green `#2DB38A` (2.65:1 as text — fails) → `#14795C` (5.36:1) — retired
  2026-08-27 along with the green it was derived from
- **Current** verified green `#43B6A3` (~2.48:1 as text — fails, even worse than the legacy
  value) → `--os-green-text` `#2D7B6E` (~5.0:1) — same darkening technique, re-derived for
  the new Figma-confirmed green. The brand green is retained for fills/borders only, never
  small text.

## Voice

Institutional and evidentiary — attestation language ("Opinion System attests that…"),
dates, member numbers, standard numbers. Modernize the *form*, not the register. The
stiffness is the credibility.
