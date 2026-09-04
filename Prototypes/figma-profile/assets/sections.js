/* ==========================================================================
   Opinion System — Figma-Profile exploration · shared section library
   --------------------------------------------------------------------------
   Pure render functions, one per Figma block. Control and all five variants
   call the SAME functions with the SAME fixture — a variant may reorder
   sections, wrap them in different containers, pass a `compact`/`opts` flag,
   or apply different CSS, but never rewrites content. This is what makes
   the six pages a controlled comparison instead of six separate rebuilds.
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
    var out = '<span class="stars" role="img" aria-label="' + rating + ' sur 5" style="display:inline-flex;gap:1px;color:var(--os-amber)">';
    for (var i = 1; i <= 5; i++) {
      var diff = rating - (i - 1);
      var pct = diff >= 1 ? 100 : diff > 0 ? Math.round(diff * 100) : 0;
      var id = "sc" + (svgCounter++);
      out += '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true">' +
        '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + (24 * pct / 100).toFixed(1) + '" height="24"/></clipPath></defs>' +
        '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" fill="var(--os-border)"/>' +
        '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" fill="currentColor" clip-path="url(#' + id + ')"/></svg>';
    }
    out += "</span>";
    return out;
  }

  var ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12.5l2 2 4.5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.6"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3v18M6 4h11l-2.5 3.5L17 11H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V6l8-3 8 3v15M4 21h16M9 21v-5h6v5M9 10h.01M13 10h.01M9 14h.01M13 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.6"/></svg>',
    buildings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V4h9v17M13 21v-9h7v9M4 21h16M7 8h2M7 12h2M7 16h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg>',
    mapPinLg: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 22s8-7.05 8-13A8 8 0 0 0 4 9c0 5.95 8 13 8 13z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9" r="2.7" stroke="currentColor" stroke-width="1.7"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10.6 19 5 13.4 5 6a2 2 0 0 1 1-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" stroke="currentColor" stroke-width="1.6"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="19" r="2" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="5" r="2" stroke="currentColor" stroke-width="1.6"/><path d="M6 17c0-6 4-4 8-8 2-2 2-2 4-2" stroke="currentColor" stroke-width="1.6"/></svg>',
    cert: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 14.5L7 21l5-2.5L17 21l-1.5-6.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9.3 9l1.8 1.8L14.7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function chip(label, cls) { return '<span class="' + (cls || "chip chip-outlined") + '">' + esc(label) + "</span>"; }

  // ---------------------------------------------------------------- Banner
  function renderBanner(f) {
    return (
      '<div class="trust-banner"><div class="tb-left"><span class="icon">' + ICON.check + '</span>' +
      '<div><p class="t-overline">' + esc(f.trustBanner.kicker) + '</p>' +
      '<p class="t-caption tb-sub">' + esc(f.trustBanner.subtitle) + "</p></div></div>" +
      '<button class="btn-subscribe" type="button">' + esc(f.trustBanner.subscribeLabel) + "</button></div>"
    );
  }

  // ------------------------------------------------------- Hero + identity
  function renderHeroPhoto() { return '<div class="hero-photo"></div>'; }

  function renderBusinessIdentity(f) {
    var b = f.business;
    return (
      '<div class="row-top">' +
        '<div class="logo-tile">' + ICON.buildings.replace("<svg ", '<svg style="width:26px;height:26px;color:var(--os-navy);opacity:.5" ') + '<span style="position:absolute">' + esc(b.logoInitials) + "</span></div>" +
        '<div class="biz-name">' + esc(b.name) + "</div>" +
        '<button class="icon-btn" type="button" aria-label="Plus d\'options"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button>' +
      "</div>" +
      '<div class="about-list">' +
        '<div class="about-col">' +
          '<span class="about-item">' + ICON.briefcase + esc(b.category) + "</span>" +
          '<span class="about-item">' + ICON.buildings + esc(b.activity) + "</span>" +
        "</div>" +
        '<div class="about-col">' +
          '<span class="about-item">' + ICON.mapPin + esc(b.city) + "</span>" +
          '<span class="about-item">' + ICON.user + esc(b.memberNumber) + "</span>" +
        "</div>" +
      "</div>" +
      '<p class="bio" data-bio><span class="bio-text">' + esc(b.bioShort) + '</span> <button class="bio-link" type="button" data-action="toggle-bio">Voir plus</button></p>'
    );
  }

  // -------------------------------------------------------------- Dashboard
  function renderDashboard(f, opts) {
    opts = opts || {};
    var v = f.ratings.verified, u = f.ratings.unverified;
    var kpis =
      '<div class="kpi-grid">' +
        '<div class="kpi is-verified"><span class="kpi-label">' + ICON.check + "Avis contrôlés</span>" +
          '<span class="kpi-value">' + v.rating.toFixed(1).replace(".", ",") + '<span class="suffix">/5</span></span>' +
          '<span class="kpi-count">' + v.count + " avis</span></div>" +
        '<div class="kpi is-neutral"><span class="kpi-label">Non contrôlés</span>' +
          '<span class="kpi-value">' + u.rating.toFixed(1).replace(".", ",") + '<span class="suffix">/5</span></span>' +
          '<span class="kpi-count">' + u.count.toLocaleString("fr-FR") + " avis</span></div>" +
      "</div>";
    var recommend =
      '<div class="recommend-tile"><div class="rt-label">Clients qui recommandent</div>' +
      '<div class="rt-track"><i style="width:' + v.recommend + '%"></i></div>' +
      '<div class="rt-value">' + v.recommend + '<span class="suffix">%</span></div></div>';
    var cta = '<button class="btn btn-cta btn-block" type="button" disabled title="Hors périmètre de cette expérience">Déposer un avis</button>';
    var contact =
      '<div class="contact-row">' +
        '<span class="contact-chip">' + ICON.phone + "Contacter</span>" +
        '<span class="contact-chip">' + ICON.globe + "Site web</span>" +
        '<span class="contact-chip">' + ICON.route + "Itinéraire</span>" +
      "</div>";
    var social = '<div class="social-row"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="Facebook">FB</a><a href="#" aria-label="LinkedIn">IN</a></div>';
    if (opts.compact) {
      return '<div class="stack-12">' + kpis + '<div class="row" style="gap:8px">' + recommend.replace('class="recommend-tile"', 'class="recommend-tile" style="flex:1 0 0"') + "</div>" + cta + "</div>";
    }
    return '<div class="stack-16">' + kpis + recommend + cta + contact + social + "</div>";
  }

  // ---------------------------------------------------------------- Verdict
  function renderVerdict(f, opts) {
    opts = opts || {};
    var v = f.ratings.verified, all = f.ratings.allSources;
    var stats =
      '<div class="verdict-stats">' +
        '<div class="verdict-stat is-hero"><div class="vs-label">Note vérifiée</div><div class="vs-value">' + v.rating.toFixed(1).replace(".", ",") + "/5</div></div>" +
        '<div class="verdict-stat is-hero"><div class="vs-label">Recommandation</div><div class="vs-value">' + v.recommend + "%</div></div>" +
        '<div class="verdict-stat is-secondary"><div class="vs-label">' + esc(all.label) + '</div><div class="vs-value">' + all.rating.toFixed(1).replace(".", ",") + "/5 · " + all.count.toLocaleString("fr-FR") + " avis</div></div>" +
        '<div class="verdict-stat is-secondary"><div class="vs-label">Avis le plus récent</div><div class="vs-value" style="font-size:14px">' + esc(v.mostRecentReviewDate) + "</div></div>" +
      "</div>";
    return (
      '<div class="verdict-card">' +
        '<div class="row-between"><p class="t-sub1 strong" style="margin:0">' + esc(f.verdict.title) + "</p>" +
        '<span class="t-caption muted">' + esc(f.verdict.lastUpdated) + "</span></div>" +
        '<p class="t-body2" style="margin-top:8px">' + esc(f.verdict.text) + "</p>" +
        (opts.hideStats ? "" : stats) +
      "</div>"
    );
  }

  // --------------------------------------------------------- Quality Approach
  function renderQualityApproach(f, opts) {
    opts = opts || {};
    var qa = f.qualityApproach;
    if (opts.compact) {
      return (
        '<div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:10px 16px">' +
        qa.items.map(function (it) {
          return '<div class="row" style="gap:8px;flex:1 0 140px"><span class="qa-code" style="background:var(--os-tint-1);color:var(--os-green-text)">' + esc(it.code) + "</span><span class=\"t-caption muted\">" + esc(it.title) + "</span></div>";
        }).join("") + "</div>"
      );
    }
    return (
      '<div class="quality-approach">' +
        '<span class="qa-badge">' + esc(qa.badge) + "</span>" +
        '<p class="qa-headline">' + esc(qa.headline.replace(qa.headlineHighlight, "␟")).split("␟").join('</p><p class="qa-headline"><em>' + esc(qa.headlineHighlight) + "</em>") + "</p>" +
        '<p class="qa-desc">' + esc(qa.description) + "</p>" +
        '<div class="qa-items">' +
        qa.items.map(function (it) {
          return '<div class="qa-item"><span class="qa-code">' + esc(it.code) + '</span><div><div class="qa-item-title">' + esc(it.title) + '</div><div class="qa-item-desc">' + esc(it.desc) + "</div></div></div>";
        }).join("") +
        "</div></div>"
    );
  }

  // -------------------------------------------------------------------- Tabs
  function renderTabsBar(f) {
    var v = f.ratings.verified, u = f.ratings.unverified;
    return (
      '<div class="tabbar" role="tablist" aria-label="Catégories d\'avis">' +
        '<button class="tab is-active" role="tab" aria-selected="true" id="tab-controles" aria-controls="panel-controles" data-tab="controles">CONTRÔLÉS<span class="tab-count">' + v.count + " avis</span></button>" +
        '<button class="tab" role="tab" aria-selected="false" id="tab-non-controles" aria-controls="panel-non-controles" data-tab="non-controles">NON VÉRIFIÉS<span class="tab-count">' + u.count.toLocaleString("fr-FR") + " avis</span></button>" +
        '<button class="tab" role="tab" aria-selected="false" id="tab-plateformes" aria-controls="panel-plateformes" data-tab="plateformes">PLATEFORMES<span class="tab-count">' + f.platforms.sourceCount + " sources</span></button>" +
      "</div>"
    );
  }

  function renderHighlightsRow(f) {
    var byId = {};
    f.reviews.verified.forEach(function (r) { if (r.highlight) byId[r.highlight] = r; });
    var defs = [
      { key: "top", label: "Le mieux noté" },
      { key: "recent", label: "Le plus récent" },
      { key: "helpful", label: "Le plus utile" }
    ];
    var items = defs.filter(function (d) { return byId[d.key]; }).map(function (d) {
      return '<button class="highlight-chip" type="button" data-jump="' + byId[d.key].id + '">' + ICON.check + esc(d.label) + "</button>";
    }).join("");
    if (!items) return "";
    return '<div class="highlights-row">' + items + "</div>";
  }

  // --------------------------------------------------------- Review cards
  function renderResponse(response, subordinate) {
    return (
      '<div class="review-response' + (subordinate ? " is-subordinate" : "") + '">' +
      '<div class="rr-author">' + esc(response.author) + " · " + (subordinate ? "réponse de l'entreprise" : "Réponse de Martin Immo") + "</div>" +
      '<p class="rr-body">' + esc(response.body) + "</p></div>"
    );
  }

  function renderVerifiedCard(r, opts) {
    opts = opts || {};
    var responsePlacement = opts.responsePlacement || "detail";
    var showInline = responsePlacement === "always" && r.response;
    var showInDetail = responsePlacement === "detail" && r.response;
    return (
      '<article class="review-card" id="review-' + r.id + '" data-review-id="' + r.id + '" data-topics="' + r.topics.join(",") + '">' +
        '<div class="row-top">' +
          '<div class="avatar">' + r.initial + "</div>" +
          '<div style="flex:1 0 0;min-width:0">' +
            '<div class="row-between"><span class="strong">' + esc(r.author) + '</span>' +
            '<span class="signal-badge badge badge-verified">' + ICON.check + "<span>Avis contrôlé</span></span></div>" +
            '<div class="row-between" style="margin-top:2px"><span class="review-meta">' + esc(r.dateLabel) + " · " + esc(r.service) + "</span>" + starsHtml(r.rating) + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="review-body' + (r.truncatable ? " is-clamped" : "") + '">' + esc(r.body) + "</p>" +
        '<div class="chip-scroller" style="padding:8px 0 0">' + r.topics.map(function (t) { return chip("#" + t); }).join("") + "</div>" +
        (showInline ? renderResponse(r.response, true) : "") +
        '<div class="review-actions">' +
          (r.truncatable ? '<button class="link-btn" type="button" data-action="toggle-text" aria-expanded="false">Voir plus' + ICON.chev + "</button>" : "") +
          '<button class="link-btn" type="button" data-action="toggle-detail" aria-expanded="false">Voir le détail complet' + ICON.chev + "</button>" +
          '<span class="spacer"></span>' +
          '<button class="link-btn" type="button" data-action="helpful">👍 Utile (' + r.helpful + ")</button>" +
          '<button class="link-btn" type="button" data-action="report">' + ICON.flag + " Signaler</button>" +
        "</div>" +
        '<div class="review-detail" hidden>' +
          (showInDetail ? renderResponse(r.response, false) : "") +
          '<div class="detail-kpis">' +
            '<div class="detail-kpi"><div class="dk-label">Satisfaction générale</div><div class="dk-track"><i style="width:' + r.detail.satisfaction + '%"></i></div><div class="dk-value">' + r.detail.satisfaction + "%</div></div>" +
            '<div class="detail-kpi is-recommend"><div class="dk-label">Recommande</div><div class="dk-track"><i style="width:' + r.detail.recommend + '%"></i></div><div class="dk-value">' + r.detail.recommend + "%</div></div>" +
          "</div>" +
          '<div class="detail-meta">' +
            '<div class="detail-meta-row"><span class="dm-label">Type de questionnaire</span><span>' + ICON.check + " " + esc(r.detail.questionnaireType) + "</span></div>" +
            '<div class="detail-meta-row"><span class="dm-label">Service</span><span>' + esc(r.service) + "</span></div>" +
            '<div class="detail-meta-row"><span class="dm-label">Score NPS</span><span>' + r.detail.nps + '/10 <span class="nps-chip ' + r.detail.npsCategory.toLowerCase() + '">' + r.detail.npsCategory + "</span></span></div>" +
          "</div>" +
          '<div class="subratings"><p class="subratings-title">Répartition des notes</p>' +
          r.detail.subRatings.map(function (s) {
            return '<div class="subrating-row"><span class="sr-label">' + esc(s.label) + '</span><span class="sr-track"><i style="width:' + (s.value / 5 * 100) + '%"></i></span><span class="sr-value">' + s.value.toFixed(1) + "</span></div>";
          }).join("") + "</div>" +
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
            '<div class="row-between"><span class="strong">' + esc(r.author) + '</span>' +
            '<span class="signal-badge badge badge-unverified">' + ICON.flag + "<span>Non vérifié</span></span></div>" +
            '<div class="row-between" style="margin-top:2px"><span class="review-meta">' + esc(r.dateLabel) + "</span>" + starsHtml(r.rating) + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="review-body">' + esc(r.body) + "</p>" +
        '<div class="review-actions"><span class="spacer"></span><button class="link-btn" type="button" data-action="report">' + ICON.flag + " Signaler</button></div>" +
      "</article>"
    );
  }

  // --------------------------------------------------------------- Locations
  function renderLocations(f, opts) {
    opts = opts || {};
    var loc = f.locations;
    var agencies = loc.agencies.map(function (a, i) {
      var expanded = opts.allCollapsed ? false : (a.isCurrent || i === 0);
      var hours = a.hours ? (
        '<div class="agency-hours"' + (expanded ? "" : " hidden") + ">" +
        a.hours.map(function (h) { return '<div class="hours-row"><span>' + esc(h[0]) + "</span><span>" + esc(h[1]) + "</span></div>"; }).join("") +
        "</div>"
      ) : "";
      return (
        '<div class="agency-card" data-agency-id="' + a.id + '">' +
          '<div class="agency-top"><span class="agency-name">' + esc(a.name) + (a.isCurrent ? ' <span class="t-caption muted">(cette agence)</span>' : "") + "</span>" +
          '<span class="agency-open">' + '<i class="dot"></i>' + esc(a.openLabel) + "</span></div>" +
          '<p class="agency-address">' + esc(a.address) + "</p>" +
          '<div class="agency-meta">' + starsHtml(a.rating, 14) + "<span>" + a.rating.toFixed(1) + "/5</span><span class=\"dot-sep\">•</span><span>" + a.count.toLocaleString("fr-FR") + " avis</span><span class=\"dot-sep\">•</span><span>" + ICON.phone.replace('width="24" height="24"', 'width="14" height="14" style="vertical-align:-2px"') + " " + esc(a.phone) + "</span></div>" +
          '<div class="agency-actions"><button class="btn-itinerary" type="button">Itinéraire</button>' +
          (a.hours ? '<button class="link-btn" type="button" data-action="toggle-hours" aria-expanded="' + expanded + '">Horaires' + ICON.chev + "</button>" : "") +
          "</div>" +
          hours +
        "</div>"
      );
    }).join("");
    return (
      '<div class="locations-header">' + ICON.mapPinLg +
        '<div><p class="section-title" style="margin:0">Nos agences</p><p class="section-sub">' + loc.groupCount + " agences · " + loc.groupVerifiedTotal + " avis contrôlés au total</p></div>" +
      "</div>" +
      '<div class="stack-12" style="margin-top:16px">' + agencies + "</div>" +
      '<div class="map-placeholder">Carte interactive — hors périmètre du prototype</div>'
    );
  }

  // -------------------------------------------------------------------- Team
  function renderTeam(f, opts) {
    opts = opts || {};
    var members = f.team.map(function (m) {
      return '<div class="team-card"><div class="team-avatar"></div><p class="team-name">' + esc(m.name) + '</p><p class="team-role">' + esc(m.role) + "</p></div>";
    }).join("");
    return '<div class="team-scroller">' + members + "</div>";
  }

  // ------------------------------------------------------------- Certificate
  function renderCertificate(f) {
    var c = f.certificate;
    return (
      '<div class="certificate-card">' + ICON.cert +
        '<p class="t-sub1 strong">' + esc(c.title) + "</p>" +
        '<p class="t-body2 muted" style="margin-top:6px">' + esc(c.body) + "</p>" +
        '<div class="certificate-actions">' +
          '<button class="btn btn-outlined btn-block" type="button" disabled>' + esc(c.ctaSingle) + "</button>" +
          '<button class="btn btn-text btn-block" type="button" disabled>' + esc(c.ctaGroup) + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  // ------------------------------------------------------------------- FAQ
  function renderFAQ(f) {
    return f.faq.map(function (item, i) {
      var open = !!item.defaultOpen;
      return (
        '<div class="faq-item">' +
          '<button class="faq-q" type="button" data-action="toggle-faq" aria-expanded="' + open + '" aria-controls="faq-a-' + i + '"><span>' + esc(item.q) + '</span><span class="faq-icon">+</span></button>' +
          '<div class="faq-a" id="faq-a-' + i + '"' + (open ? "" : " hidden") + ">" + esc(item.a) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  // --------------------------------------------------------- List My Business
  function renderListMyBusiness(f) {
    var l = f.listMyBusiness;
    return (
      '<div class="lmb-card">' +
        '<span class="lmb-kicker">' + ICON.briefcase + esc(l.kicker) + "</span>" +
        '<p class="lmb-title">' + esc(l.title) + "</p>" +
        '<p class="lmb-body">' + esc(l.body) + "</p>" +
        '<button class="btn btn-cta btn-block" type="button" style="margin-top:16px" disabled>' + esc(l.cta) + " »</button>" +
      "</div>"
    );
  }

  // ----------------------------------------------------------------- Footer
  function renderFooter(f) {
    var ft = f.footer;
    return (
      '<div class="footer">' +
        '<div class="footer-brand">' + ICON.check + "<span>opinion system</span></div>" +
        '<div class="footer-contact"><strong>' + esc(ft.contactLabel) + "</strong>" + esc(ft.email) + "<br>" + esc(ft.phone) + "</div>" +
        '<div class="footer-social"><a href="#">FB</a><a href="#">IG</a><a href="#">IN</a></div>' +
        '<div class="footer-columns">' +
        ft.columns.map(function (c) {
          return '<div><p class="footer-col-title">' + esc(c.title) + '</p><div class="footer-col-items">' + c.items.map(function (i) { return "<span>" + esc(i) + "</span>"; }).join("") + "</div></div>";
        }).join("") +
        "</div>" +
        '<div class="footer-legal">' + esc(ft.legalLinks) + "<br>" + esc(ft.copyright) +
        '<div class="footer-eu">🇪🇺 ' + esc(ft.euBadge) + "</div></div>" +
      "</div>"
    );
  }

  // -------------------------------------------------------------- Legal block
  function renderLegalBlock(f) {
    return (
      '<div class="legal-stack"><div class="disclosure stack-8">' +
        '<p class="t-sub2" style="margin:0">Informations légales</p>' +
        '<p class="legal">' + esc(f.legal.considerationDisclosure) + "</p>" +
        '<p class="legal">' + esc(f.legal.retentionDisclosure) + "</p>" +
        '<p class="legal">' + esc(f.legal.verificationDisclosure) + "</p>" +
      "</div></div>"
    );
  }

  // ------------------------------------------------------------ Histogram
  function renderHistogram(f) {
    var h = f.ratings.verified.histogram, total = f.ratings.verified.count;
    return '<div class="stack-8">' + h.map(function (row) {
      var pct = Math.round(row.n / total * 100);
      return '<div class="row" style="gap:8px"><span class="t-caption" style="width:14px">' + row.stars + "★</span>" +
        '<span style="flex:1 0 0;height:6px;border-radius:3px;background:var(--os-border);overflow:hidden"><i style="display:block;height:100%;width:' + pct + '%;background:var(--os-green);border-radius:3px"></i></span>' +
        '<span class="t-caption muted" style="width:34px;text-align:right">' + row.n + "</span></div>";
    }).join("") + "</div>";
  }

  // Combined trust hub for the Trust-First variant: dashboard KPIs + verdict
  // text + histogram + stat grid, one continuous card instead of three
  // separate ones. Same numbers, same verdict copy — only the grouping and
  // the visual weight change.
  function renderTrustHub(f) {
    var v = f.ratings.verified;
    return (
      '<div class="verdict-card">' +
        renderDashboard(f, { compact: true }) +
        '<div class="divider" style="margin:16px 0"></div>' +
        '<p class="t-sub1 strong" style="margin:0">' + esc(f.verdict.title) + "</p>" +
        '<p class="t-body2" style="margin-top:6px">' + esc(f.verdict.text) + "</p>" +
        '<p class="subratings-title" style="margin-top:16px">Répartition des ' + v.count + " avis contrôlés</p>" +
        renderHistogram(f) +
      "</div>"
    );
  }

  // -------------------------------------------------- Composite: tabs block
  // Builds the tabbar + all three panels together with the stable ids
  // interactions.js expects, so every variant can drop this one block
  // wherever its layout wants it. opts.showHighlights adds the automatic
  // top-rated/most-recent/most-helpful row (requirements.md §4.6) above the
  // filter row — used by the Reviews-First variant.
  function renderReviewTabsBlock(f, opts) {
    opts = opts || {};
    return (
      renderTabsBar(f) +
      '<div class="panel" id="panel-controles" role="tabpanel" aria-labelledby="tab-controles">' +
        (opts.showHighlights ? '<div class="section" style="padding-bottom:0">' + renderHighlightsRow(f) + "</div>" : "") +
        '<div class="section" style="padding-bottom:0"><div class="filter-scroller" id="filter-row"></div>' +
        '<div class="filter-empty" id="filter-empty"><span>Aucun avis contrôlé ne correspond à ce filtre.</span><button class="link-btn" type="button" id="filter-reset" style="padding:4px 8px">Réinitialiser</button></div></div>' +
        '<div class="section stack-8" style="padding-top:8px"><div class="sort-row"><label for="sort-select">Trier</label>' +
        '<select class="sort-select" id="sort-select"><option value="recent">Les plus récents</option><option value="highest">Mieux notés</option><option value="lowest">Moins bien notés</option></select></div>' +
        '<p class="legal">' + esc(f.legal.sortDisclosure) + "</p></div>" +
        '<div class="section stack-12" id="review-list" style="padding-top:0"></div>' +
      "</div>" +
      '<div class="panel" id="panel-non-controles" role="tabpanel" aria-labelledby="tab-non-controles" hidden>' +
        '<div class="unverified-explainer" style="margin-top:16px">' + esc(f.legal.unverifiedExplainer) + "</div>" +
        '<div class="section" style="padding-top:0"><span class="t-sub2 muted">' + f.ratings.unverified.rating.toFixed(1).replace(".", ",") + "/5 · " + f.ratings.unverified.count.toLocaleString("fr-FR") + " avis non contrôlés</span></div>" +
        '<div class="section stack-12" id="unverified-list" style="padding-top:0"></div>' +
      "</div>" +
      '<div class="panel" id="panel-plateformes" role="tabpanel" aria-labelledby="tab-plateformes" hidden>' +
        '<div class="coming-soon">' + ICON.building.replace('aria-hidden="true"', 'class="cs-icon" aria-hidden="true"') +
        '<p class="cs-title">Avis externes — bientôt disponibles</p>' +
        '<p class="cs-body">' + esc(f.platforms.note) + "</p>" +
        '<span class="cs-count">' + f.platforms.sourceCount + " sources identifiées</span></div>" +
      "</div>"
    );
  }

  window.OSSections = {
    renderReviewTabsBlock: renderReviewTabsBlock,
    renderHistogram: renderHistogram,
    renderTrustHub: renderTrustHub,
    esc: esc, starsHtml: starsHtml, ICON: ICON,
    renderBanner: renderBanner,
    renderHeroPhoto: renderHeroPhoto,
    renderBusinessIdentity: renderBusinessIdentity,
    renderDashboard: renderDashboard,
    renderVerdict: renderVerdict,
    renderQualityApproach: renderQualityApproach,
    renderTabsBar: renderTabsBar,
    renderHighlightsRow: renderHighlightsRow,
    renderVerifiedCard: renderVerifiedCard,
    renderUnverifiedCard: renderUnverifiedCard,
    renderLocations: renderLocations,
    renderTeam: renderTeam,
    renderCertificate: renderCertificate,
    renderFAQ: renderFAQ,
    renderListMyBusiness: renderListMyBusiness,
    renderFooter: renderFooter,
    renderLegalBlock: renderLegalBlock
  };
})();
