# Figma Source Reference

> This is the only place Figma URLs, file keys, and node IDs should live — everything else in
> `design-system/` should reference this file rather than repeating a URL or node ID inline,
> since those are the values most likely to drift as the Figma files evolve.
>
> Full hierarchy: [../CLAUDE.md](../CLAUDE.md#source-of-truth-hierarchy). In short: this file
> tells you *where to look*; [tokens.css](tokens.css) and [components.md](components.md) hold
> *what we've already confirmed and copied out*. Don't blindly copy the entire Figma system
> into either of those — only what a prototype actually needs, tagged with where it came from.

---

## Design System (canonical — visual source of truth)

- **File:** 🚧 OS — Design System 🚧
- **URL:** https://www.figma.com/design/zwXFmmTHjufUoHYbrmWB6S/%F0%9F%9A%A7-OS---Design-System-%F0%9F%9A%A7
- **File key:** `zwXFmmTHjufUoHYbrmWB6S`
- **Scope:** the member-facing app — login, "Mes Avis" (review management), Home dashboard,
  "Récoltez des avis" (survey-sending flow), Service/Survey/Recipient components. **No public
  certificate-page frames exist here.** Apply its tokens, type, and component patterns to the
  public page by extension — see [principles.md](principles.md).
- **Base library:** MUI (Material UI) — every inspected interactive component links to a
  `mui.com/api/...` docs page.
- **Last inspected:** 2026-08-27, via `get_metadata` on section `416:18092` and
  `get_design_context` on the three node IDs below.

### Node references confirmed so far

| Component | Node ID | States confirmed | What we pulled from it |
|---|---|---|---|
| `<Button>` | `412:1912` | Enabled, Outlined, Disabled | Colors, radius (8px), Poppins SemiBold 18px label style |
| Text Input | `412:1882` | Empty, Typing, Warning, Filled | Radius (8px), focus border (30% opacity blue), warning border color |
| Review Card | `416:13164` | Review, Google Review, Variant4, **Pending** | Radius (16px), author/body text styles, the `Pending` expiry state (not yet modeled on our page) |
| `<Chip>` (nested in Review Card) | `416:13306` / `416:13308` | Promoteur, Google | `--vert-os` green, `--success-light-2` bg, radius (8px) |
| KPI Card | `416:9753` | Default, Selected, Variant3 (sync) | Radius (12px), Poppins Bold 24px number, `rgba(44,149,255,.2)` translucent navy-tint surface, `--vert-os-2 #00d492` count-pill text on a `rgba(44,149,255,.3)` pill |
| Dashboard (stat tiles) | `416:13085` | Default | Same 12px radius, two-tone tile pattern (translucent-blue-on-dark / white-on-light), Poppins Bold 40px "Ma note" numeral, `/5` suffix in `--gris #8ea1b2` |

Named Figma text styles seen so far: **OS/Heading 1** (Poppins Bold 32px), **OS/Heading 4**
(Poppins SemiBold 18px), **OS/Heading 5** (Poppins SemiBold 16px), **OS/Heading 6** (Poppins
SemiBold 14px). Body copy observed at Poppins Regular 16px / Regular 14px / Medium 13px — no
named style captured for these yet.

Named Figma color variables seen so far: `--bleu-fonce #041b44`, `--bleu-400 #2c95ff`,
`--yellow #ffd500`, `--jaune-400 #ffd500` (same hex as `--yellow`), `--vert-os #43b6a3`,
`--vert-os-2 #00d492` (a SECOND, distinct green — seen only on KPI Card's count pill so far;
not adopted into tokens.css beyond a logged, unused entry — see tokens.css and
product/decisions.md), `--success-light-2 #e9fff2`, `--error3 #fc6530`, `--gris #8ea1b2`,
`--gris-clair-1 #f7fafc`, `--gris-clair-2 #f0f6f9`, `--gris-moyen-1 #dfe9ef`.

**Not yet inspected:** a generic "Card" component (so `--r-card`'s 12px stays formally
unconfirmed, though KPI Card/Dashboard now corroborate the same value — see tokens.css),
spacing/grid as a named token system (only inferred from observed padding/gap values), effect
styles (shadows, including the `card-dropshadow` effect style seen in search results but not
inspected), and most of the Home/Survey/Recipient sections beyond their component names.

**2026-08-27 addendum:** searched for a dedicated public-page "Card"/"Stat" component ahead of
building A-7 concepts 6–9 (`Prototypes/A-7/concept-6..9`) — no OS-specific generic Card exists
in the design system (only third-party MUI/Hologram/etc. library Cards, which aren't ours);
KPI Card and Dashboard were the closest real matches and are now the basis for those
prototypes' stat-tile components.

---

## Our own prototyping file (NOT the design system — don't confuse the two)

- **File:** 🚧 NON-VERIFIED - ATTESTATION ELECTRONIQUE 🚧
- **URL:** https://www.figma.com/design/oFEG69fZBUK2wh0esta2Ov/%F0%9F%9A%A7-NON-VERIFIED---ATTESTATION-ELECTRONIQUE
- **File key:** `oFEG69fZBUK2wh0esta2Ov`
- **Scope:** our own built exploration frames on the "Arif" page — Variante 1 (Onglets
  segmentés), Variante 2 (Scorecard), Variante 3 (Double registre) so far. **This is a
  prototype file, never a source of truth** — see the hierarchy in CLAUDE.md. Built by cloning
  Variante 3's structure and reusing its component instances, so it inherits this file's own
  (currently legacy) token values, not yet the ones confirmed above.

---

## How to use this file

1. **Check [tokens.css](tokens.css) first.** If the value or component you need is already
   there with a `[FIGMA-CONFIRMED]` tag, use it — don't re-query Figma.
2. **If it's not there, or is tagged `[UNCONFIRMED]`/`[LOCAL-ONLY]`**, look it up by node ID
   above if one exists, or inspect the design-system file directly (`get_metadata` on a
   section to find the right node, then `get_design_context` on it — see
   `skill://figma/figma-design-to-code/SKILL.md`).
3. **Never invent a visual value that looks plausible.** If it's not confirmed here or in
   tokens.css, either query Figma or flag it explicitly as a decision to make — don't guess
   and move on silently.
4. **Log what you find.** Add the value to tokens.css with a provenance tag, add the node ID
   to the table above, and — if it's a deliberate choice with alternatives (not just a fact
   lookup) — log it in [../product/decisions.md](../product/decisions.md) too.
5. **Re-verify before trusting an old lookup.** Figma files change; the "Last inspected" date
   above is a staleness warning, not a guarantee.
