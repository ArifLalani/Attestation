# Design Requirements — Public Review Page Redesign

> Distilled from the two source documents supplied by the Product Owner:
> - `Cahier_des_charges_Page_avis_publique_EN (1).docx` — Functional Specifications v1.0,
>   Discovery phase output, dated July 3 2026, status "For review / sign-off".
> - `OS_avis_controles_et_avis_non_controles_EN.xlsx` — the Discovery scoping table
>   (verified vs. unverified reviews: legal framework, brand risk, competitive impact).
>
> Brand context lives in [opinion-system.md](opinion-system.md); the task overview is in
> [CLAUDE.md](CLAUDE.md). Where the two source docs disagree or leave gaps, that is noted in
> §9 Open Questions rather than silently resolved.

---

## 1. The design problem in one paragraph

Opinion System wants **more review volume on the page** — unverified reviews from members'
internal questionnaires, and later reviews imported from competitors and other platforms —
**without diluting the one thing it sells**, which is that an OS review is verified under
triple AFNOR certification. Every layout, color, and copy decision on this page is
downstream of that tension. The design must make "verified" feel structurally dominant and
"unverified" feel plainly, legibly secondary — while staying inside French and EU
transparency law, which forbids making unverified reviews *look* verified.

---

## 2. Objectives (spec §1.2)

1. **Preserve the differentiating advantage.** Verified reviews stay the heart of the page,
   visually and editorially.
2. **Increase displayed volume.** Enable unverified, external-source, and other-platform
   reviews — without passing them off as verified.
3. **Eliminate confusion.** Each category explicitly labeled, visually distinguished, and
   never mixed into the verified rating calculation.
4. **Stay compliant.** NF Service 522 / ISO 20488, plus French and EU online-review
   transparency law.
5. **Serve as a conversion and SEO page.** Citable by AI answer engines and search engines
   (Schema.org), and drives contact requests / review submissions.

---

## 3. Review typology — the four categories (spec §2)

| # | Category | Origin | Counts toward the headline rating? | Phase |
|---|---|---|---|---|
| 1 | **OS Verified Reviews** | Satisfaction questionnaire after an actual purchase, verified by OS (NF Service 522 / ISO 20488 + ISO 20252) | **Yes — this is the page's reference rating** | V1 |
| 2 | **Unverified / Unconfirmed Reviews** | Members' internal questionnaires; unprompted reviews with no identity verification | **No** — separate "unverified" rating | V1 |
| 3 | **External-Source Reviews** | Imported from NF-certified competitors, with collection source shown (ISO 20252) | **No** — counted in displayed volume only | **LATER (Volet 3)** |
| 4 | **Reviews on Other Platforms** | Google, Trustpilot, Yellow Pages, social | **No** — rating and outbound link only, never republished | **LATER (Volet 3)** |

**Discovery caution (xlsx + spec §2):** if unverified reviews are distributed to boost
volume, the full legal transparency requirements in §4 apply to them exactly as they do to
verified reviews. Volume does not come with a compliance discount.

---

## 4. Legal & regulatory constraints (spec §3, xlsx row 1)

These are hard requirements, not design preferences. They shape actual UI elements.

### 4.1 Required per verified review (NF Service 522 / ISO 20488)

- Date the review was submitted
- An overall rating
- A comment
- The date or period of the consumer's experience
- Data related to service details

### 4.2 Collection & moderation rules that must be visible on the page

- No arbitrary selection of who may submit a review, and no arbitrary filtering of what gets
  published
- Reviews must reflect real experiences from identified authors
- The consumer is notified if their review is rejected
- OS does not alter review content
- The consumer can **report** a review they consider suspicious → needs a visible affordance
- Businesses can **respond** to reviews → needs a response slot in the card
- **Default sort is most recent → oldest, with no manipulation**

### 4.3 Required disclosures under French / EU law (Art. L121-4, Code de la consommation)

- Publication date of the review **and** date of the consumer experience
- Method / criteria used to rank reviews (chronological, by rating, etc.) — must be stated,
  not just implemented
- Whether any **consideration** (gift, discount, promotion) was given in exchange
- Maximum period for publishing or retaining the review
- Verification / moderation procedures: verification process, grounds for rejection, how to
  report a suspicious review

### 4.4 Information the visitor must be able to find

- Key characteristics of the verification process at collection, moderation and distribution
- Whether the consumer who wrote the review can be contacted
- Whether a review can be edited, and how
- Grounds justifying refusal to publish

### 4.5 The mandatory label

> **Every unverified review must explicitly carry an "Unverified" label. No exceptions, in
> any category.** Posting fake reviews or altering real ones is an unfair commercial
> practice carrying heavy penalties.

### 4.6 External-source imports (spec §3.3)

Competitors' verified reviews from a certified process may be redistributed **if the
collection source is shown** (ISO 20252). Required import fields: consumer first and last
name, review date, satisfaction rating, email and/or phone, comment, associated staff member
name. Recommended: recommendation rating, service date, response to comment, service details.
The import mechanics are specified separately in *"Spec — Competitor Review Import"* and are
**out of scope here**.

---

## 5. Page structure — block by block (spec §4)

Page is generated per member business. Parameters: business name, city, recommendation rate,
whether to highlight verified reviews.

| § | Block | Key design requirements |
|---|---|---|
| 4.1 | **Trust Banner** | Permanent, full-width, **navy** background. "Verified Reputation — [Business]'s reviews verified by Opinion System." Establishes OS as the verification source before any content below. |
| 4.2 | **Business Header & Contact Actions** | Photo/logo, name, city, industry. "Verified Reputation" badge (only if verified reviews exist). Verified rating (stars + /5), verified review count, recommendation rate. **"All sources combined" rating shown as a supplement in visibly smaller type.** Three trust badges: "Verified & Tamper-Proof Reviews", "Triple AFNOR Certification", "X% Recommend". Actions: Contact (modal), Call, Website, Directions, social, and primary **"Leave My Review"**. |
| 4.3 | **"Trust Verdict"** | Highlighted callout, **green border**. Written to be quoted verbatim by AI answer engines. Contains business name, city, verified review count, certification standard, explicit verdict ("trustworthy business"), last-updated date. Plus a 4-stat grid: verified rating, recommendation %, all-sources rating, date of most recent review. |
| 4.4 | **"Quality Approach" Banner** | Educational, **navy** background. The three certifications (ISO 20488 / ISO 20252 / ISO 9001) explained in plain language. Purpose: establish OS as an independent trusted third party. |
| 4.5 | **Verified Reviews Dashboard** | Callout, white background + **green border**. Certifying body, "unique in Europe" badge, summary of the three standards. Preview: avatars of first 4 reviews + "+N" counter, quote from the top review, % of 4- and 5-star reviews. Overall verified rating, count, recommendation rate. **"See the [N] Verified Reviews"** expands §4.6 with auto-scroll; **"Hide"** collapses. |
| 4.6 | **Verified Reviews Detail** | Three **automatic** highlights — top-rated, most recent, most helpful (computed, never manually curated). **Sticky sidebar**: large average rating, 5→1 star histogram, recommendation rate, sub-ratings by criterion (welcome, quality of advice, responsiveness, value for money) with illustrative quotes, "Leave My Review". **Review list**: sort control (most recent / highest rated / lowest rated), keyword-topic filter chips. Per review: author, "Verified Review" badge, service type, time since review, rating, text, topic tags, business response, "Helpful" counter, "Report" link. Empty state for no filter matches. Pagination / "See More Verified Reviews". |
| 4.7 | **Team Block** | Staff photos, names, roles. Humanizes the page; not tied to reviews. |
| 4.9 | **Unverified Customer Reviews** | **Gray** block, clearly separated. Label: "Unverified Customer Reviews". Description: "Unprompted reviews, without identity verification — displayed for informational purposes, outside Opinion System's control." Separate average rating and count. Each review carries the **"Unverified" badge** and a **dashed border**. Collapsible; not sorted or highlighted like verified reviews. |
| 4.11 | **Store Locator / Group Agencies** | Agency list with "This Agency" badge on the current one, address, phone, per-agency rating and verified review count, "Directions". Placeholder reserved for an interactive map. Overall counter: number of agencies + total verified reviews across the group. |
| 4.12 | **Verified Reputation Certificate** | "Download Certificate (PDF)" and "Group Certificate" CTAs. Stable, indexable URL. Schema.org: `InsuranceAgency` (or equivalent industry type), `aggregateRating`, `review`, `hasCredential`, `FAQPage`. |
| 4.13 | **FAQ** | Four Q&As generated from page data (trustworthiness, fake review risk, verifying body, business responsiveness). Feeds `FAQPage` structured data. |
| 4.14 | **"List My Business" CTA + Modals** | B2B conversion banner + modal (business name, industry, contact, phone, email) with confirmation screen. "Contact [Business]" modal (name, phone/email, message) with confirmation. "Leave My Review" modal — confirmation message only in the mockup. |

> ⚠️ **Sections 4.8 and 4.10 are absent from the supplied document** while §7 explicitly
> references "the ratings shown in 4.10". §4.10 is almost certainly the **"On Other
> Platforms"** block (referenced in §1.3 and §5); §4.8 is unidentified. See §9.

---

## 6. Cross-cutting business rules (spec §5)

| Rule | Detail |
|---|---|
| **Strict rating separation** | Exactly one "reference" rating — verified reviews — is highlighted in the header and Verdict block. Unverified, external-source and other-platform reviews always display their own rating, never aggregated into it. |
| **Non-manipulation of sorting** | Default descending chronological on verified reviews. No arbitrary selection of which reviews display. |
| **No modification of reviews** | Neither OS nor the business may alter a verified review's content. Only a public business response may be added. |
| **Reporting** | Every verified review carries a "Report" link. |
| **"Unverified" label** | Mandatory and visible on every unverified review, without exception, in any category. |
| **(LATER) No republishing third-party content** | Google / Trustpilot / Yellow Pages content is never republished. Rating, volume and outbound link only. |
| **(LATER) External-source excluded from rating** | Counted toward displayed volume, explicitly excluded from the verified rating calculation. |
| **Conditional display** | "External-Source Reviews" and "Unverified Reviews" blocks are **collapsed by default**, expanded on visitor click, so they never visually compete with verified reviews. |
| **Multi-agency consistency** | Each agency has its own verified rating; an aggregated "group" rating may appear in the store locator. |

### Business rules embedded in individual blocks

- **§4.2** — "Leave My Review" must route to the OS collection form, **not** a free-text field.
- **§4.3** — the Trust Verdict block renders **only** if the business has published verified
  reviews; otherwise an alternate message, to be defined in a UX workshop.
- **§4.6** — default sort is chronological, most recent first, per §4.2 of this document.

---

## 7. Non-functional requirements (spec §6)

### 7.1 SEO & structured data
- Schema.org: organization type (e.g. `InsuranceAgency`), `aggregateRating` **based solely
  on verified reviews**, `review` (sample of verified reviews), `hasCredential` (the OS
  certificate), `FAQPage`.
- Stable, permanent URL per business/agency; `robots.txt` and sitemap coverage.
- Trust Verdict copy written to be extracted and quoted verbatim by AI answer engines —
  short, factual, sourced.

### 7.2 Accessibility & responsive
- Mobile, tablet, desktop — adaptive grids.
- Contrast and font sizes to **RGAA / WCAG 2.1 Level AA**.

### 7.3 GDPR
- Contact, List-My-Business and Leave-My-Review forms need a disclosure notice, stated
  purpose, retention period and legal basis before go-live.
- Displayed authors follow data minimization (first name + last initial — the existing
  convention).

### 7.4 Performance
- Verified Reviews Detail, External-Source and Unverified blocks load/expand **on demand**,
  not on initial page load.

---

## 8. Out of scope for V1 (spec §7)

- The actual interactive store locator map — placeholder only.
- The competitor/external-source import technical spec (separate document).
- The full verified review submission flow — only the "Leave My Review" entry point is here.
- Admin back office (toggling the External Source / Unverified blocks, responding to reviews,
  managing listing data: photo, team, agencies).
- Automatic generation and updating of the certificate PDF.
- Real third-party API integrations (Google, Trustpilot, Yellow Pages, social) for the
  ratings shown in the missing §4.10.

---

## 9. Open questions to resolve with the Product Owner

1. **Missing §4.8 and §4.10.** §4.10 is referenced by §7 but has no body text. Confirm §4.10
   is the "On Other Platforms" block and identify §4.8. Both categories appear in §1.3, §2
   and §5, so the page cannot be fully laid out without them.
2. **Empty state for the Trust Verdict.** §4.3 defers this to "a UX workshop" — needed before
   V1 ships, since new members will hit it on day one.
3. **Header rating vs. "all sources combined."** §4.2 requires an all-sources rating in the
   header, but §5's separation rule says only the verified rating is highlighted. Confirm the
   exact size/weight ratio and whether "all sources" includes unverified in V1 when the
   external blocks are still LATER.
4. **Which categories ship in V1.** The spec covers all four categories but tags external
   source and other-platforms "LATER / Volet 3". Confirm V1 = verified + unverified only,
   with the layout reserving space for the other two.
5. **Retention period and consideration disclosure.** §4.3/§3.2 require both to be displayed;
   neither has a defined value or a defined home in the page structure.
6. **Vertical generalization.** Mockup and Schema example are insurance/real-estate specific
   ("agency", `InsuranceAgency`). Confirm the industry-type mapping for personal services and
   driving schools.
7. **Terminology.** The live FR site says *avis contrôlé*; the EN locale says *verified
   review*; these docs say *verified*. Lock the EN/FR glossary before copy is written.
8. **Sub-rating criteria mismatch.** §4.6 lists welcome / quality of advice / responsiveness /
   value for money; the live page shows onboarding / simplicity / customer relationship /
   visibility / benefit-cost. Confirm which set the redesign uses and whether it is
   per-vertical.

---

## 10. Acceptance criteria (spec §8)

- [ ] The rating in the header and Trust Verdict block reflects **only** verified reviews.
- [ ] Every non-verified review carries an explicit label/badge and is never visually
      confused with a verified review.
- [ ] *(LATER)* External-source reviews count in displayed volume but are excluded from the
      verified rating — confirmed by a mixed-review test case.
- [ ] Default sort on verified reviews is descending chronological, with no option to
      arbitrarily hide a review.
- [ ] Required legal disclosures (date, sorting method, consideration, verification
      procedures, reporting) are present and accessible on the page.
- [ ] *(LATER)* No third-party review content is republished — rating, volume and link only.
- [ ] The page exposes valid Schema.org structured data (verified via Rich Results Test).
- [ ] The page is usable and readable on mobile, tablet and desktop.
- [ ] Forms (contact, sign-up, review) show a confirmation screen and meet minimum GDPR
      requirements.
- [ ] Expanding/collapsing the Verified Detail, External Source and Unverified sections works
      independently, with no page reload.

---

## 11. Design principles derived from the above

These are the working rules for making visual decisions on this page.

1. **Hierarchy carries the legal burden.** Compliance here is not a footnote — it is the
   primary structural constraint. If a visitor could mistake an unverified review for a
   verified one, the design is non-compliant, regardless of how it looks.
2. **Verified is the default state of the page; everything else is opt-in.** Unverified and
   external blocks stay collapsed until the visitor asks for them.
3. **One number rules.** Exactly one rating gets hero treatment. Every other rating is
   smaller, labeled with its source, and physically separated from the hero.
4. **Color is semantic, not decorative.** Navy = Opinion System / the certifying party.
   Green = verified. Amber = stars. Yellow = the single primary action. Gray + dashed border
   = unverified. See [opinion-system.md §6.4](opinion-system.md).
5. **Gray must read as "not endorsed", not as "broken".** Unverified reviews are legitimate
   content displayed under a legal caveat — desaturated and clearly labeled, but still
   readable and respectable.
6. **Write for the crawler and the human with the same words.** The Trust Verdict must be
   quotable verbatim by an AI answer engine *and* be the clearest paragraph on the page for
   a person. If it reads as SEO filler, it fails both.
7. **Modernize the form, keep the institutional voice.** Attestation language, dates, member
   numbers and standard numbers are the credibility. Don't restyle them into startup
   marketing copy.
8. **Progressive disclosure is a performance requirement, not just a UX preference** (§7.4).
