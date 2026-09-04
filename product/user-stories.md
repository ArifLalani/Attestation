# User Stories

> **Derived from:** [requirements.md](requirements.md) (acceptance criteria in particular),
> [business-context.md §3.2](business-context.md) (the three audiences), and
> [../research/recommendations.md](../research/recommendations.md). No user-story document
> existed in the original source material — this is a **new artifact**, generated for this
> restructuring.
>
> **Provenance tagging.** Every story below is tagged:
> - **[SPEC]** — traces directly to explicit requirement text or an acceptance criterion in
>   requirements.md. Citation given.
> - **[RESEARCH]** — traces to a specific recommendation in research-best-practices.md /
>   recommendations.md, but is not literal spec text.
> - **[INFERRED]** — a reasonable extrapolation from audience descriptions or general UX
>   principle, with no direct source sentence. Treat these as drafts to validate with the
>   Product Owner, not settled requirements.
>
> Use this file as the unit for generating targeted concepts — e.g. "show me three ways to
> solve story C-2" is a smaller, more checkable ask than "redesign the page."

---

## Persona A — The Consumer / Prospect

Mid-funnel, comparing two or three local providers, mostly on mobile, low patience, doesn't
know what ISO 20488 means. (business-context.md §3.2.1)

| ID | Story | Traceability |
|---|---|---|
| A-1 | As a prospect, I want the verified rating clearly separated from unverified feedback, so I don't get misled by an inflated blended number. | **[SPEC]** requirements.md §6 "Strict rating separation", AC1 |
| A-2 | As a prospect, I want every unverified review to carry an explicit "Unverified" label, so I never mistake it for a certified one. | **[SPEC]** requirements.md §4.5, AC2 |
| A-3 | As a prospect, I want reviews sorted most-recent-first with nothing arbitrarily hidden, so I can trust the feed is representative. | **[SPEC]** requirements.md §4.2, AC4 |
| A-4 | As a prospect, I want to report a review I find suspicious, so fraudulent content doesn't go unchallenged. | **[SPEC]** requirements.md §4.2 "consumer can report", AC5 |
| A-5 | As a prospect, I want to know whether the business gave any incentive (gift, discount) for a review, so I can judge how unbiased it is. | **[SPEC]** requirements.md §4.3 disclosures, AC5 |
| A-6 | As a prospect who doesn't know what "ISO 20488" means, I want the verification claim explained in plain language before I see the standard number, so I can judge credibility without looking anything up. | **[RESEARCH]** research/recommendations.md §3.1 "lead with the mechanism, footnote the standard number" |
| A-7 | As a mobile visitor with low patience, I want the key trust signal visible within the first screen or two, so I can decide quickly without scrolling through the whole page. | **[RESEARCH]** research/recommendations.md §3.3 progressive disclosure; requirements.md §7.4 |
| A-8 | As a prospect, I want a "verified" badge to link to the underlying certificate, so I can check the claim myself instead of taking it on faith. | **[RESEARCH]** research/recommendations.md §2 (badges should link to verifiable proof) |
| A-9 | As a prospect, I want to see negative or mixed reviews too, not only curated positive ones, so the page feels honest rather than filtered. | **[RESEARCH]** research/recommendations.md §2 "negative reviews increase credibility" |
| A-10 | As a prospect, I want to know in five seconds — without reading legal text — whether this business is trustworthy. | **[INFERRED]** synthesis of A-6/A-7; not a literal spec sentence, but the design problem stated in requirements.md §1 |

## Persona B — The Member Business

Checks their own page, shares the link, downloads the certificate, responds to reviews.
Wants to look credible and see their verified rating dominate. (business-context.md §3.2.2)

| ID | Story | Traceability |
|---|---|---|
| B-1 | As a member business, I want my verified rating to visually dominate the page, so my investment in certification is reflected in how prospects see me. | **[SPEC]** requirements.md §1, §2.1 |
| B-2 | As a member business, I want to respond publicly to a review, so I can address feedback without altering the original content. | **[SPEC]** requirements.md §4.2, §6 "No modification of reviews" |
| B-3 | As a member business, I want to download a certificate PDF, so I can use it as a marketing asset off this page. | **[SPEC]** requirements.md §5 block 4.12 |
| B-4 | As a member business with multiple agencies, I want each agency to show its own verified rating alongside a combined group figure, so a strong single location isn't hidden by a group average (or vice versa). | **[SPEC]** requirements.md §5 block 4.11, §6 "Multi-agency consistency" |
| B-5 | As a prospective member business looking at a competitor's certified page, I want an easy path to register my own business, so the page also works as an acquisition channel for OS. | **[SPEC]** requirements.md §5 block 4.14 |
| B-6 | As a member business, I want to see which topics customers mention most (e.g. responsiveness, price), so I understand my reputation, not just my score. | **[INFERRED]** from the topic-tag filtering in requirements.md §5 block 4.6, read from the business's side rather than the consumer's |

## Persona C — The Machine (search engines & AI answer engines)

Google's crawler and AI answer engines (AI Overviews, ChatGPT, Perplexity). A first-class
audience, not an afterthought. (business-context.md §3.2.3)

| ID | Story | Traceability |
|---|---|---|
| C-1 | As a search engine crawler, I need `aggregateRating` structured data built only from verified reviews, so the indexed rating matches what's displayed on the page. | **[SPEC]** requirements.md §7.1, AC7 |
| C-2 | As an AI answer engine, I want one self-contained, factual paragraph naming the business, city, review count, certifying standard and verdict, so I can quote it verbatim without needing surrounding context. | **[SPEC]** requirements.md §5 block 4.3; **[RESEARCH]** research/recommendations.md §3.4 |
| C-3 | As a search engine, I need short, factual FAQ answers mapped to `FAQPage` markup, so I can surface them directly in search results. | **[SPEC]** requirements.md §5 block 4.13 |

## Persona D — Legal / Compliance Reviewer

Not named as a persona in the source material, but the volume of hard legal requirements in
requirements.md §4 implies a real reviewing audience — whoever signs off that the page is
compliant before go-live. **[INFERRED]** persona; every individual story below is directly
**[SPEC]**-traceable even though the persona framing itself is new.

| ID | Story | Traceability |
|---|---|---|
| D-1 | As a compliance reviewer, I want every unverified review to carry its label with no exceptions, in any category, so the page satisfies Art. L121-4. | **[SPEC]** requirements.md §4.5, AC2 |
| D-2 | As a compliance reviewer, I want the sorting method stated on-page, not just implemented, so the disclosure requirement is met. | **[SPEC]** requirements.md §4.3 |
| D-3 | As a compliance reviewer, I want the verification/moderation procedure and rejection grounds findable on the page, so a visitor's "how does this work" question is answered without contacting support. | **[SPEC]** requirements.md §4.4 |
| D-4 | As a compliance reviewer, I want forms (contact, list-my-business, leave-a-review) to show a GDPR disclosure notice with stated purpose and retention period before go-live. | **[SPEC]** requirements.md §7.3, AC9 |

---

## Coverage gaps surfaced while writing these stories

Writing stories forced a check against every acceptance criterion in requirements.md §9.
Two criteria don't yet have a clean story because they depend on unresolved items in
[open-questions.md](open-questions.md):

- The "*(LATER)*" criteria (external-source volume counting, no third-party republishing)
  aren't written as stories here because Persona C/A stories for the LATER categories can't
  be finalized until open question 4 (which categories ship in V1) is answered.
- No story yet addresses the Trust Verdict empty state (a business with zero verified
  reviews) — blocked on open question 2. A first-pass fixture for this case exists at
  [../fixtures/edge-cases.json](../fixtures/edge-cases.json) so design work can proceed
  provisionally.
