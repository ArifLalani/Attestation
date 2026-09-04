/* ==========================================================================
   Shared, non-experimental interactive behavior for the A-7 prototypes.
   --------------------------------------------------------------------------
   These widgets (sort control, topic filter, auto-scroll-on-expand) are
   identical across all three concepts on purpose — they are NOT the thing
   being tested. The variable under test is the top-level information
   architecture, which each concept file implements in its own <script>.
   ========================================================================== */

window.OSWidgets = {
  /* A real, functional sort control. With a single illustrative review the
     list order can't visibly change, but the control itself is live and
     announces its state — it is not a disabled decoration. */
  initSort: function (selectEl, liveEl) {
    if (!selectEl) return;
    selectEl.addEventListener("change", function () {
      var label = selectEl.options[selectEl.selectedIndex].text;
      if (liveEl) liveEl.textContent = "Tri actuel : " + label;
    });
  },

  /* Real topic-chip filtering against data-tags on each review card.
     Selecting a topic with no matching review shows the spec-required
     empty state (design.md / requirements.md block 4.6) rather than an
     empty list. */
  initTopicFilter: function (scrollerEl, reviewEls, emptyStateEl) {
    if (!scrollerEl) return;
    var chips = scrollerEl.querySelectorAll("[data-topic]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var topic = chip.getAttribute("data-topic");
        chips.forEach(function (c) {
          var isSelected = c === chip;
          c.classList.toggle("chip-selected", isSelected);
          c.setAttribute("aria-pressed", String(isSelected));
        });
        var anyVisible = false;
        reviewEls.forEach(function (r) {
          var tags = (r.getAttribute("data-tags") || "").split(",");
          var match = topic === "Tous" || tags.indexOf(topic) !== -1;
          r.hidden = !match;
          if (match) anyVisible = true;
        });
        if (emptyStateEl) emptyStateEl.hidden = anyVisible;
      });
    });
  },

  /* Mirrors the spec's "See the N Verified Reviews -> auto-scroll" behavior
     (requirements.md block 4.5) for any <details> element. */
  initAutoScrollDetails: function (detailsEl) {
    if (!detailsEl) return;
    detailsEl.addEventListener("toggle", function () {
      if (detailsEl.open) {
        window.setTimeout(function () {
          detailsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    });
  }
};
