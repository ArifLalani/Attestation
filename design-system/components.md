# Component Inventory

> **Provenance note (updated 2026-08-27):** Structural/legal components (Trust Banner, Trust
> Verdict, Unverified badge, Store Locator card) remain **[INFERRED]** — extracted from
> [../product/requirements.md §5](../product/requirements.md)'s block structure, since these
> are specific to the public page and have no frames of their own in Figma. Interactive
> primitives (Button, Chip, Text Input, Review Card, Rating, Icon Button) now have a real
> Figma counterpart — see the **Figma** column below and
> [figma-source.md](figma-source.md) for node IDs. Component names here remain working labels
> for this project; where a Figma name differs, it's noted.

---

## Trust & badge components

| Component | States | Token(s) used | Figma counterpart | Rule |
|---|---|---|---|---|
| **Verified badge** | default | `--os-green-bg` bg / `--os-green-text` text | `<Chip>` Property1=Google ("Contrôlé") — close but not identical: Figma's is a chip with a certified icon, ours is a standalone badge | Only on verified reviews. |
| **Unverified badge** | default | `--os-grey-chip` bg / dashed `--os-grey-border` | none found | Mandatory on every unverified review, no exceptions (requirements.md §4.5). |
| **Platform badge** | per-platform (Google, Trustpilot, Pages Jaunes, SeLoger…) | `--os-tint-2` bg | `<Chip>` Property1=Google (partial match — single-platform only) | LATER / Volet 3 — reserve layout space only (requirements.md §8). |
| **Trust badge chip** ("Verified & Tamper-Proof", "Triple AFNOR Certification", "X% Recommend") | default | navy or green depending on claim | none found | Header block 4.2. |

## Rating & data-viz components

| Component | Notes |
|---|---|
| **Score display** (large / small) | `.score` / `.score-sm` in tokens.css — the hero number and secondary numbers use the same component at different sizes, never different components, to keep the "one number rules" principle mechanically enforced. |
| **Star row** | Amber fill (`--os-amber`) only. A grey variant exists for disabled/empty states. |
| **Rating histogram** (5→1 stars) | Load-bearing per research/competitive-landscape.md — must never be collapsed behind a tap. |
| **NPS strip** (promoters / neutrals / detractors) | From the client concepts, not the written spec — confirm in scope before building (research/concept-teardown.md "things the concepts add"). |
| **Stat grid** (4-stat block in Trust Verdict) | verified rating, recommendation %, all-sources rating, most-recent-review date. |

## Review card

Two variants of the same underlying component, styled distinctly per requirements.md §11.4
("color is semantic, not decorative"):

| Field | Verified variant | Unverified variant |
|---|---|---|
| Border | solid, `--os-green` left accent | dashed, `--os-grey-border` |
| Background | white | `--os-grey-bg` |
| Badge | "Verified Review" | "Unverified" (mandatory) |
| Author | first name + last initial | first name + last initial |
| Meta | service type, time since review | — |
| Rating | shown | shown |
| Body text | shown | shown |
| Topic tags | shown, filterable | not specified — **[INFERRED]** omit until confirmed |
| Business response | shown, distinct background | not specified — **[INFERRED]** omit until confirmed |
| Helpful counter | shown | not specified |
| Report link | shown, mandatory | not specified — arguably should also be reportable; flag for PO |
| Sub-ratings (on expand) | from client concept, not written spec | — |

Radius: `--r-card-review` (16px, `[FIGMA-CONFIRMED]` — Figma's Review Card, node `416:13164`,
uses 16px specifically). Don't generalize this to other card types; see
[figma-source.md](figma-source.md).

> **New from Figma, not yet modeled here:** Figma's Review Card also has a **Pending** state
> (an invitation sent but not yet answered — shows an expiry countdown in `--os-error` and a
> "Renvoyer"/resend action). Nothing in requirements.md or the A-7 work currently calls for
> this on the public page; noted for future reference, not adopted.

## Structural / layout components

| Component | Source block | Behavior |
|---|---|---|
| **Trust banner** | requirements.md §5 block 4.1 | Permanent, full-width, navy. |
| **Business header** | block 4.2 | Contains identity, actions, hero rating, trust badges. |
| **Trust Verdict callout** | block 4.3 | Green border. Renders only if verified reviews exist (else empty state — open question 2). |
| **Quality Approach band** | block 4.4 | Navy, educational, explains the three ISO/AFNOR standards. |
| **Verified reviews dashboard** | block 4.5 | Collapsed summary; expands into the detail view. |
| **Verified reviews detail** | block 4.6 | Sticky sidebar + filterable/sortable list + pagination. |
| **Unverified reviews block** | block 4.9 | Gray, collapsed by default, own rating and count. |
| **Store locator card** | block 4.11 | Per-agency rating, "This Agency" badge, map placeholder. |
| **Certificate CTA** | block 4.12 | PDF download + group certificate. |
| **FAQ accordion** | block 4.13 | Feeds `FAQPage` schema. |
| **Modal — Contact** | block 4.14 | Name, phone/email, message, confirmation screen. |
| **Modal — List My Business** | block 4.14 | Business name, industry, contact, confirmation screen. |
| **Modal — Leave My Review** | block 4.14 | Routes to OS collection form, not a free-text field (requirements.md §6). |
| **Sticky bottom action bar** | research/recommendations.md | Keeps "Leave My Review" / "Contact" reachable on a long page. |

## Interaction components

| Component | Notes |
|---|---|
| **Sort control** | Most recent / highest rated / lowest rated. Default must be most-recent, stated on-page (requirements.md §4.2, §4.3). |
| **Topic filter chips** | Horizontal scroller on mobile; ≥48px touch target even though visual chip height is 32px (MUI convention, see tokens.css `.chip`). Radius: `--r` (8px, `[FIGMA-CONFIRMED]` as of 2026-08-27 — was previously assumed 4px). |
| **Expand/collapse control** | Drives blocks 4.6, 4.9, and (later) external-source — each must expand/collapse independently, no page reload (AC10). |
| **Report affordance** | Per-review, opens a report flow (flow itself is out of scope — requirements.md §8). |
| **Business response composer** | Out of scope for this page (admin back office) — display-only here. |
