/* ==========================================================================
   Opinion System — Figma-Profile exploration · shared interaction layer
   --------------------------------------------------------------------------
   Generic wiring, reused identically by Control and all five variants.
   Each variant's own assembly script builds the DOM (in whatever order/
   grouping it wants) using assets/sections.js, then calls
   OSInteractions.wireAll(root, fixture, config) once. Relies on a small
   set of stable ids/classes that every variant's markup provides:
     #tab-controles / #tab-non-controles / #tab-plateformes  (buttons)
     #panel-controles / #panel-non-controles / #panel-plateformes
     #filter-row, #filter-empty, #sort-select, #review-list
     [data-action="..."] on buttons (toggle-text, toggle-detail, toggle-bio,
     toggle-hours, toggle-faq, report, helpful)
   ========================================================================== */

(function () {
  "use strict";
  var S = window.OSSections;

  function taxonomyFor(fixture, config, state) {
    if (config.filterMode === "cleanTopics") return fixture.filterTaxonomies ? fixture.filterTaxonomies.cleanTopics : fixture.filterTaxonomy;
    return fixture.filterTaxonomy;
  }

  function wireAll(root, fixture, config) {
    config = config || {};
    var state = { filter: "Tous", sort: "recent" };

    // ---- Tabs
    var tabs = root.querySelectorAll(".tab");
    var panels = {
      controles: root.querySelector("#panel-controles"),
      "non-controles": root.querySelector("#panel-non-controles"),
      plateformes: root.querySelector("#panel-plateformes")
    };
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = true; });
        var p = panels[tab.getAttribute("data-tab")];
        if (p) p.hidden = false;
      });
    });

    // ---- Filters + sort + review list (Contrôlés panel)
    var filterRowEl = root.querySelector("#filter-row");
    var emptyEl = root.querySelector("#filter-empty");
    var listEl = root.querySelector("#review-list");
    var sortEl = root.querySelector("#sort-select");

    function renderFilterRow() {
      if (!filterRowEl) return;
      var topics = ["Tous"].concat(taxonomyFor(fixture, config, state));
      filterRowEl.innerHTML = topics.map(function (t) {
        return '<button class="chip' + (t === state.filter ? " chip-selected" : " chip-outlined") + '" type="button" data-topic="' + S.esc(t) + '" aria-pressed="' + (t === state.filter) + '">' + S.esc(t) + "</button>";
      }).join("");
      filterRowEl.querySelectorAll("[data-topic]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.filter = btn.getAttribute("data-topic");
          renderFilterRow();
          renderList();
        });
      });
    }

    function sortedReviews() {
      var arr = fixture.reviews.verified.slice();
      if (state.sort === "highest") arr.sort(function (a, b) { return b.rating - a.rating; });
      else if (state.sort === "lowest") arr.sort(function (a, b) { return a.rating - b.rating; });
      return arr;
    }

    function wireCardInteractions(container) {
      container.querySelectorAll('[data-action="toggle-text"]').forEach(function (btn) {
        btn.addEventListener("click", function () {
          var body = btn.closest(".review-card").querySelector(".review-body");
          var expanded = body.classList.toggle("is-clamped") === false;
          btn.setAttribute("aria-expanded", String(expanded));
          btn.childNodes[0].nodeValue = expanded ? "Voir moins " : "Voir plus ";
        });
      });
      container.querySelectorAll('[data-action="toggle-detail"]').forEach(function (btn) {
        btn.addEventListener("click", function () {
          var detail = btn.closest(".review-card").querySelector(".review-detail");
          var willOpen = detail.hidden;
          detail.hidden = !willOpen;
          btn.setAttribute("aria-expanded", String(willOpen));
          btn.childNodes[0].nodeValue = willOpen ? "Masquer le détail complet " : "Voir le détail complet ";
        });
      });
      container.querySelectorAll('[data-action="helpful"], [data-action="report"]').forEach(function (btn) {
        btn.addEventListener("click", function () { btn.disabled = true; btn.style.opacity = ".6"; });
      });
    }

    function renderList() {
      if (!listEl) return;
      var reviews = sortedReviews().filter(function (r) {
        return state.filter === "Tous" || r.topics.indexOf(state.filter) !== -1;
      });
      listEl.innerHTML = reviews.map(function (r) { return S.renderVerifiedCard(r, config); }).join("");
      if (emptyEl) emptyEl.classList.toggle("is-visible", reviews.length === 0);
      wireCardInteractions(listEl);
    }

    if (sortEl) sortEl.addEventListener("change", function (e) { state.sort = e.target.value; renderList(); });
    var resetBtn = root.querySelector("#filter-reset");
    if (resetBtn) resetBtn.addEventListener("click", function () { state.filter = "Tous"; renderFilterRow(); renderList(); });

    if (filterRowEl) renderFilterRow();
    if (listEl) renderList();

    // ---- Unverified list (static, no filter/sort per spec §4.9)
    var unverifiedListEl = root.querySelector("#unverified-list");
    if (unverifiedListEl) {
      unverifiedListEl.innerHTML = fixture.reviews.unverified.map(S.renderUnverifiedCard).join("");
      wireCardInteractions(unverifiedListEl);
    }

    // ---- Highlight chips (reviews-first variant) — jump + flash target card
    root.querySelectorAll("[data-jump]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-jump");
        var target = root.querySelector('[data-review-id="' + id + '"]');
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.outline = "2px solid var(--os-green)";
          target.style.outlineOffset = "2px";
          setTimeout(function () { target.style.outline = ""; }, 1500);
        }
      });
    });

    // ---- Bio expand
    root.querySelectorAll('[data-action="toggle-bio"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wrap = btn.closest("[data-bio]");
        var textEl = wrap.querySelector(".bio-text");
        var expanded = btn.textContent.trim() === "Voir plus";
        textEl.textContent = expanded ? fixture.business.bioFull : fixture.business.bioShort;
        btn.textContent = expanded ? "Voir moins" : "Voir plus";
      });
    });

    // ---- Agency hours toggle
    root.querySelectorAll('[data-action="toggle-hours"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".agency-card");
        var hours = card.querySelector(".agency-hours");
        if (!hours) return;
        var willOpen = hours.hidden;
        hours.hidden = !willOpen;
        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });

    // ---- FAQ accordion (multi-open, independent)
    root.querySelectorAll('[data-action="toggle-faq"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var answer = root.querySelector("#" + btn.getAttribute("aria-controls"));
        var willOpen = answer.hidden;
        answer.hidden = !willOpen;
        btn.setAttribute("aria-expanded", String(willOpen));
        btn.querySelector(".faq-icon").textContent = willOpen ? "−" : "+";
      });
    });
  }

  window.OSInteractions = { wireAll: wireAll };
})();
