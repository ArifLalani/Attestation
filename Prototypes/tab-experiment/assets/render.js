/* ==========================================================================
   Opinion System — Tab-Experiment · shared render engine
   --------------------------------------------------------------------------
   ONE renderer, mounted identically by all five variant HTML files. Each
   file passes a small CONFIG object; everything else — markup, data,
   interactions — is identical code, so the ONLY thing that can differ
   between variants is what CONFIG actually changes:

     responsePlacement : "detail" | "always"
       "detail"  -> business response appears only inside "Voir le détail
                    complet" (Control, Variant 3).
       "always"  -> business response appears directly in the collapsed
                    card, styled subordinate to the review (Variant 2).

     filterMode : "legacyMixed" | "cleanTopics" | "configurable"
       "legacyMixed"  -> the Figma wireframe's actual 8-chip row, mismatched
                         insurance chips included (Control).
       "cleanTopics"  -> the fixed 6-chip real-estate-only set (Variant 4).
       "configurable" -> chips sourced from fixture.filterTaxonomies.verticals,
                         with a demo switcher (Variant 5).

   Tabs, sort, "Voir plus" (text-only) vs "Voir le détail complet"
   (KPIs/metadata/sub-ratings), the verified/unverified signal badges, and
   the Trust Verdict are NOT experimental variables — same code path, same
   markup, in all five variants.
   ========================================================================== */

(function () {
  "use strict";

  var svgCounter = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function starsHtml(rating, size) {
    size = size || 16;
    var out = '<span class="stars" role="img" aria-label="' + rating + ' sur 5">';
    for (var i = 1; i <= 5; i++) {
      var diff = rating - (i - 1);
      var pct = diff >= 1 ? 100 : diff > 0 ? Math.round(diff * 100) : 0;
      var id = "sc" + (svgCounter++);
      out += '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true">' +
        '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + (24 * pct / 100).toFixed(1) + '" height="24"/></clipPath></defs>' +
        '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" fill="var(--os-border)"/>' +
        '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" fill="currentColor" clip-path="url(#' + id + ')"/>' +
        "</svg>";
    }
    out += "</span>";
    return out;
  }

  var ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12.5l2 2 4.5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.6"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3v18M6 4h11l-2.5 3.5L17 11H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V6l8-3 8 3v15M4 21h16M9 21v-5h6v5M9 10h.01M13 10h.01M9 14h.01M13 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function renderResponse(response, subordinate) {
    return (
      '<div class="review-response' + (subordinate ? " is-subordinate" : "") + '">' +
      '<div class="rr-author">' + esc(response.author) + " · " + (subordinate ? "réponse de l'entreprise" : "Réponse de Martin Immo") + "</div>" +
      '<p class="rr-body">' + esc(response.body) + "</p>" +
      "</div>"
    );
  }

  function renderVerifiedCard(r, config) {
    var showResponseInline = config.responsePlacement === "always" && r.response;
    var showResponseInDetail = config.responsePlacement === "detail" && r.response;
    return (
      '<article class="review-card" data-review-id="' + r.id + '" data-topics="' + r.topics.join(",") + '">' +
        '<div class="row-top">' +
          '<div class="avatar">' + r.initial + "</div>" +
          '<div style="flex:1 0 0;min-width:0">' +
            '<div class="row-between">' +
              '<span class="strong">' + esc(r.author) + "</span>" +
              '<span class="signal-badge badge badge-verified">' + ICON.check + "<span>Avis contrôlé</span></span>" +
            "</div>" +
            '<div class="row-between" style="margin-top:2px">' +
              '<span class="review-meta">' + esc(r.dateLabel) + " · " + esc(r.service) + "</span>" +
              starsHtml(r.rating) +
            "</div>" +
          "</div>" +
        "</div>" +
        '<p class="review-body' + (r.truncatable ? " is-clamped" : "") + '">' + esc(r.body) + "</p>" +
        '<div class="chip-scroller" style="padding:8px 0 0">' +
          r.topics.map(function (t) { return '<span class="chip chip-outlined">#' + esc(t) + "</span>"; }).join("") +
        "</div>" +
        (showResponseInline ? renderResponse(r.response, true) : "") +
        '<div class="review-actions">' +
          (r.truncatable
            ? '<button class="link-btn" type="button" data-action="toggle-text" aria-expanded="false">Voir plus' + ICON.chev + "</button>"
            : "") +
          '<button class="link-btn" type="button" data-action="toggle-detail" aria-expanded="false">Voir le détail complet' + ICON.chev + "</button>" +
          '<span class="spacer"></span>' +
          '<button class="link-btn" type="button" data-action="helpful">👍 Utile (' + r.helpful + ")</button>" +
          '<button class="link-btn" type="button" data-action="report">' + ICON.flag + " Signaler</button>" +
        "</div>" +
        '<div class="review-detail" hidden>' +
          (showResponseInDetail ? renderResponse(r.response, false) : "") +
          '<div class="detail-kpis">' +
            '<div class="detail-kpi"><div class="dk-label">Satisfaction générale</div><div class="dk-track"><i style="width:' + r.detail.satisfaction + '%"></i></div><div class="dk-value">' + r.detail.satisfaction + "%</div></div>" +
            '<div class="detail-kpi is-recommend"><div class="dk-label">Recommande</div><div class="dk-track"><i style="width:' + r.detail.recommend + '%"></i></div><div class="dk-value">' + r.detail.recommend + "%</div></div>" +
          "</div>" +
          '<div class="detail-meta">' +
            '<div class="detail-meta-row"><span class="dm-label">Type de questionnaire</span><span>' + ICON.check + " " + esc(r.detail.questionnaireType) + "</span></div>" +
            '<div class="detail-meta-row"><span class="dm-label">Service</span><span>' + esc(r.service) + "</span></div>" +
            '<div class="detail-meta-row"><span class="dm-label">Score NPS</span><span>' + r.detail.nps + "/10 <span class=\"nps-chip " + r.detail.npsCategory.toLowerCase() + '">' + r.detail.npsCategory + "</span></span></div>" +
          "</div>" +
          '<div class="subratings">' +
            '<p class="subratings-title">Répartition des notes</p>' +
            r.detail.subRatings.map(function (s) {
              return '<div class="subrating-row"><span class="sr-label">' + esc(s.label) + '</span><span class="sr-track"><i style="width:' + (s.value / 5 * 100) + '%"></i></span><span class="sr-value">' + s.value.toFixed(1) + "</span></div>";
            }).join("") +
          "</div>" +
          '<p class="legal detail-caption">Sous-notes, KPI et score NPS affichés à titre d\'illustration (données de prototype) — ensemble de critères non encore arbitré, voir product/open-questions.md #8.</p>' +
        "</div>" +
      "</article>"
    );
  }

  function renderUnverifiedCard(r) {
    return (
      '<article class="review-card is-unverified" data-review-id="' + r.id + '">' +
        '<div class="row-top">' +
          '<div class="avatar" style="background:var(--os-grey-border)">' + r.initial + "</div>" +
          '<div style="flex:1 0 0;min-width:0">' +
            '<div class="row-between">' +
              '<span class="strong">' + esc(r.author) + "</span>" +
              '<span class="signal-badge badge badge-unverified">' + ICON.flag + "<span>Non vérifié</span></span>" +
            "</div>" +
            '<div class="row-between" style="margin-top:2px">' +
              '<span class="review-meta">' + esc(r.dateLabel) + "</span>" +
              starsHtml(r.rating) +
            "</div>" +
          "</div>" +
        "</div>" +
        '<p class="review-body">' + esc(r.body) + "</p>" +
        '<div class="review-actions"><span class="spacer"></span>' +
          '<button class="link-btn" type="button" data-action="report">' + ICON.flag + " Signaler</button>" +
        "</div>" +
      "</article>"
    );
  }

  function taxonomyFor(fixture, config, state) {
    if (config.filterMode === "cleanTopics") return fixture.filterTaxonomies.cleanTopics;
    if (config.filterMode === "configurable") return fixture.filterTaxonomies.verticals[state.vertical].topics;
    return fixture.filterTaxonomies.legacyMixed;
  }

  function renderShell(root, fixture, config) {
    var v = fixture.ratings.verified, u = fixture.ratings.unverified, all = fixture.ratings.allSources;
    root.innerHTML =
      '<div class="viewport">' +
        '<div class="trust-banner">' +
          '<span class="icon">' + ICON.check + "</span>" +
          '<div><p class="t-overline">RÉPUTATION VÉRIFIÉE</p>' +
          '<p class="t-caption" style="color:var(--os-on-dark-secondary)">Avis de ' + esc(fixture.business.name) + " contrôlés par Opinion System</p></div>" +
        "</div>" +

        '<div class="section stack-16">' +
          '<div class="row-top">' +
            '<div class="avatar" style="width:56px;height:56px;font-size:20px;border-radius:12px;background:var(--os-navy)">' + fixture.business.name.slice(0,2).toUpperCase() + "</div>" +
            "<div>" +
              '<p class="t-h6 t-brand" style="margin:0">' + esc(fixture.business.name) + "</p>" +
              '<p class="t-caption muted" style="margin-top:2px">' + esc(fixture.business.industry) + " · " + esc(fixture.business.city) + " · " + esc(fixture.business.memberNumber) + "</p>" +
            "</div>" +
          "</div>" +

          '<div class="kpi-grid">' +
            '<div class="kpi kpi-verified"><span class="kpi-label">Avis contrôlés</span>' +
              '<span class="kpi-value">' + v.rating.toFixed(1).replace(".", ",") + '<span class="suffix">/5</span></span>' +
              '<span class="t-caption muted">' + v.count + " avis</span></div>" +
            '<div class="kpi kpi-light"><span class="kpi-label" style="color:var(--os-text-secondary)">Avis non contrôlés</span>' +
              '<span class="kpi-value" style="color:var(--os-text-secondary)">' + u.rating.toFixed(1).replace(".", ",") + '<span class="suffix">/5</span></span>' +
              '<span class="t-caption muted">' + u.count.toLocaleString("fr-FR") + " avis</span></div>" +
          "</div>" +

          '<button class="btn btn-cta btn-block" type="button" disabled title="Hors périmètre de cette expérience">Déposer un avis</button>' +
        "</div>" +

        '<div class="section">' +
          '<div class="surface-verified surface-body">' +
            '<div class="row-between"><p class="t-sub1 strong" style="margin:0">' + esc(fixture.verdict.title) + "</p>" +
            '<span class="t-caption muted">' + esc(fixture.verdict.lastUpdated) + "</span></div>" +
            '<p class="t-body2" style="margin-top:8px">' + esc(fixture.verdict.text) + "</p>" +
            '<div class="verdict-stats">' +
              '<div class="verdict-stat is-hero"><div class="vs-label">Note vérifiée</div><div class="vs-value">' + v.rating.toFixed(1).replace(".", ",") + "/5</div></div>" +
              '<div class="verdict-stat is-hero"><div class="vs-label">Recommandation</div><div class="vs-value">' + v.recommend + "%</div></div>" +
              '<div class="verdict-stat is-secondary"><div class="vs-label">' + esc(all.label) + '</div><div class="vs-value">' + all.rating.toFixed(1).replace(".", ",") + "/5 · " + all.count.toLocaleString("fr-FR") + " avis</div></div>" +
              '<div class="verdict-stat is-secondary"><div class="vs-label">Avis le plus récent</div><div class="vs-value" style="font-size:14px">' + esc(v.mostRecentReviewDate) + "</div></div>" +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="tabbar" role="tablist" aria-label="Catégories d\'avis">' +
          '<button class="tab is-active" role="tab" aria-selected="true" id="tab-controles" aria-controls="panel-controles" data-tab="controles">CONTRÔLÉS<span class="tab-count">' + v.count + " avis</span></button>" +
          '<button class="tab" role="tab" aria-selected="false" id="tab-non-controles" aria-controls="panel-non-controles" data-tab="non-controles">NON VÉRIFIÉS<span class="tab-count">' + u.count.toLocaleString("fr-FR") + " avis</span></button>" +
          '<button class="tab" role="tab" aria-selected="false" id="tab-plateformes" aria-controls="panel-plateformes" data-tab="plateformes">PLATEFORMES<span class="tab-count">' + fixture.platforms.sourceCount + " sources</span></button>" +
        "</div>" +

        '<div class="panel" id="panel-controles" role="tabpanel" aria-labelledby="tab-controles">' +
          (config.filterMode === "configurable"
            ? '<div class="vertical-switch"><span class="vsw-label">Démo — taxonomie de filtres par secteur :</span>' +
              '<span class="vsw-active" id="vertical-active-label"></span>' +
              '<button class="link-btn" type="button" id="vertical-switch-btn" style="padding:4px 8px">Changer de secteur (démo)</button></div>' +
              '<p class="legal" style="margin:0 16px 8px">Cette bascule ne change que la liste de filtres ci-dessous, à titre de démonstration — les avis affichés restent ceux de Martin Immo.</p>'
            : "") +
          '<div class="section" style="padding-bottom:0">' +
            '<div class="filter-scroller" id="filter-row"></div>' +
            '<div class="filter-empty" id="filter-empty"><span>Aucun avis contrôlé ne correspond à ce filtre.</span><button class="link-btn" type="button" id="filter-reset" style="padding:4px 8px">Réinitialiser</button></div>' +
          "</div>" +
          '<div class="section stack-8" style="padding-top:8px">' +
            '<div class="sort-row"><label for="sort-select">Trier</label>' +
              '<select class="sort-select" id="sort-select">' +
                '<option value="recent">Les plus récents</option>' +
                '<option value="highest">Mieux notés</option>' +
                '<option value="lowest">Moins bien notés</option>' +
              "</select>" +
            "</div>" +
            '<p class="legal">' + esc(fixture.legal.sortDisclosure) + "</p>" +
          "</div>" +
          '<div class="section stack-12" id="review-list" style="padding-top:0"></div>' +
        "</div>" +

        '<div class="panel" id="panel-non-controles" role="tabpanel" aria-labelledby="tab-non-controles" hidden>' +
          '<div class="unverified-explainer" style="margin-top:16px">' + esc(fixture.legal.unverifiedExplainer) + "</div>" +
          '<div class="section" style="padding-top:0"><span class="t-sub2 muted">' + u.rating.toFixed(1).replace(".", ",") + "/5 · " + u.count.toLocaleString("fr-FR") + " avis non contrôlés</span></div>" +
          '<div class="section stack-12" id="unverified-list" style="padding-top:0"></div>' +
        "</div>" +

        '<div class="panel" id="panel-plateformes" role="tabpanel" aria-labelledby="tab-plateformes" hidden>' +
          '<div class="coming-soon">' +
            '<div class="cs-icon">' + ICON.building + "</div>" +
            '<p class="cs-title">Avis externes — bientôt disponibles</p>' +
            '<p class="cs-body">' + esc(fixture.platforms.note) + "</p>" +
            '<span class="cs-count">' + fixture.platforms.sourceCount + " sources identifiées</span>" +
          "</div>" +
        "</div>" +

        '<div class="legal-stack">' +
          '<div class="disclosure stack-8">' +
            '<p class="t-sub2" style="margin:0">Informations légales</p>' +
            '<p class="legal">' + esc(fixture.legal.considerationDisclosure) + "</p>" +
            '<p class="legal">' + esc(fixture.legal.retentionDisclosure) + "</p>" +
            '<p class="legal">' + esc(fixture.legal.verificationDisclosure) + "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function mount(root, fixture, config) {
    var state = { filter: "Tous", sort: "recent", vertical: "immobilier" };

    renderShell(root, fixture, config);

    var tabs = root.querySelectorAll(".tab");
    var panels = { controles: root.querySelector("#panel-controles"), "non-controles": root.querySelector("#panel-non-controles"), plateformes: root.querySelector("#panel-plateformes") };
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        Object.keys(panels).forEach(function (k) { panels[k].hidden = true; });
        panels[tab.getAttribute("data-tab")].hidden = false;
      });
    });

    function renderFilterRow() {
      var topics = ["Tous"].concat(taxonomyFor(fixture, config, state));
      var el = root.querySelector("#filter-row");
      el.innerHTML = topics.map(function (t) {
        return '<button class="chip' + (t === state.filter ? " chip-selected" : " chip-outlined") + '" type="button" data-topic="' + esc(t) + '" aria-pressed="' + (t === state.filter) + '">' + esc(t) + "</button>";
      }).join("");
      el.querySelectorAll("[data-topic]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          state.filter = chip.getAttribute("data-topic");
          renderFilterRow();
          renderList();
        });
      });
      if (config.filterMode === "configurable") {
        root.querySelector("#vertical-active-label").textContent = fixture.filterTaxonomies.verticals[state.vertical].label;
      }
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
          btn.childNodes[0].nodeValue = (willOpen ? "Masquer le détail complet " : "Voir le détail complet ");
        });
      });
      container.querySelectorAll('[data-action="helpful"], [data-action="report"]').forEach(function (btn) {
        btn.addEventListener("click", function () { btn.disabled = true; btn.style.opacity = ".6"; });
      });
    }

    function renderList() {
      var listEl = root.querySelector("#review-list");
      var emptyEl = root.querySelector("#filter-empty");
      var reviews = sortedReviews().filter(function (r) {
        return state.filter === "Tous" || r.topics.indexOf(state.filter) !== -1;
      });
      listEl.innerHTML = reviews.map(function (r) { return renderVerifiedCard(r, config); }).join("");
      emptyEl.classList.toggle("is-visible", reviews.length === 0);
      wireCardInteractions(listEl);
    }

    root.querySelector("#sort-select").addEventListener("change", function (e) {
      state.sort = e.target.value;
      renderList();
    });
    root.querySelector("#filter-reset").addEventListener("click", function () {
      state.filter = "Tous";
      renderFilterRow();
      renderList();
    });

    if (config.filterMode === "configurable") {
      root.querySelector("#vertical-switch-btn").addEventListener("click", function () {
        state.vertical = state.vertical === "immobilier" ? "assurance" : "immobilier";
        state.filter = "Tous";
        renderFilterRow();
        renderList();
      });
    }

    var unverifiedList = root.querySelector("#unverified-list");
    unverifiedList.innerHTML = fixture.reviews.unverified.map(renderUnverifiedCard).join("");
    wireCardInteractions(unverifiedList);

    renderFilterRow();
    renderList();
  }

  window.OSExperiment = { mount: mount };
})();
