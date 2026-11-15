(function () {
  const raw = document.getElementById("homestead-data");
  const listRaw = document.getElementById("listings-data");
  const listGrid = document.getElementById("listings-grid");
  const typeGrid = document.getElementById("types-grid") || document.querySelector(".match-grid");
  if (!raw) return;
  let hs;
  try {
    hs = JSON.parse(raw.textContent || "{}");
  } catch (e) {
    return;
  }
  let listings = [];
  if (listRaw) {
    try {
      listings = JSON.parse(listRaw.textContent || "[]") || [];
    } catch (e) {
      listings = [];
    }
  }

  function band(items, sid) {
    return (items || []).find((it) => it.id === sid) || null;
  }
  function labelOf(items, id) {
    const it = band(items, id);
    return it ? it.label : id;
  }
  const USE_TERMS = {
    house: ["home", "house", "cabin", "residence", "bedroom", "bath"],
    garden: ["garden", "tillable", "soil", "south exposure", "southern exposure"],
    orchard: ["orchard", "fruit", "apple", "cherry"],
    greenhouse: ["greenhouse", "high tunnel", "hoop"],
    chickens: ["chicken", "coop", "poultry", "homestead"],
    cattle: ["cattle", "ranch", "grazing", "pasture", "livestock"],
    horses: ["horse", "arena", "barn", "pasture"],
    hay: ["hay", "meadow", "alfalfa", "pasture", "open field"],
    timber: ["timber", "forest", "wooded", "treed", "trees"],
    shop: ["shop", "garage", "warehouse", "commercial", "pole barn"],
    cabin: ["cabin", "guest", "tiny"],
    hunt: ["hunt", "hunting", "elk", "deer", "wildlife"],
    lake: ["lake", "waterfront", "pend oreille", "shore", "beach"],
    offgrid: ["off-grid", "off grid", "solar", "generator", "spring"],
  };

  function scorePlaces(uses, budgetId, acresId, musts) {
    const budget = budgetId ? band(hs.budgets, budgetId) : null;
    const acres = acresId ? band(hs.acres, acresId) : null;
    return (hs.places || [])
      .map((rawP) => {
        const p = Object.assign({}, rawP);
        let score = 0;
        const why = [];
        const miss = [];
        const supports = new Set(p.supports || []);
        const weak = new Set(p.weak || []);
        uses.forEach((u) => {
          if (supports.has(u)) {
            score += 3;
            why.push(u);
          } else if (weak.has(u)) {
            score -= 4;
            miss.push(u);
          } else {
            score -= 1;
            miss.push(u);
          }
        });
        if (budget) {
          if ((p.budget_hi || 0) >= budget.lo && (p.budget_lo || 0) <= budget.hi) score += 3;
          else {
            score -= 3;
            miss.push("budget");
          }
        }
        if (acres) {
          if ((p.acres_hi || 0) >= acres.lo && (p.acres_lo || 0) <= acres.hi) score += 2;
          else {
            score -= 2;
            miss.push("acres");
          }
        }
        const flags = {
          house: p.has_house,
          well: p.has_well,
          septic: p.has_septic,
          power: p.power,
          county_road: p.county_road,
        };
        musts.forEach((m) => {
          if (flags[m]) score += 2;
          else {
            score -= 5;
            miss.push(m);
          }
        });
        p.score = score;
        p.why = why;
        p.miss = miss;
        return p;
      })
      .sort((a, b) => b.score - a.score);
  }

  function scoreListings(uses, budgetId, acresId, musts) {
    const budget = budgetId ? band(hs.budgets, budgetId) : null;
    const acresB = acresId ? band(hs.acres, acresId) : null;
    return listings
      .map((rawL) => {
        const p = Object.assign({}, rawL);
        let score = 0;
        const why = [];
        const miss = [];
        const priceK = (p.price || 0) / 1000;
        if (budget && p.price) {
          if (priceK >= budget.lo && priceK <= budget.hi) {
            score += 3;
            why.push("budget");
          } else {
            score -= 3;
            miss.push("budget");
          }
        }
        if (acresB && p.acres != null) {
          if (p.acres >= acresB.lo && p.acres <= acresB.hi) {
            score += 2;
            why.push("acres");
          } else {
            score -= 2;
            miss.push("acres");
          }
        }
        let blob = ((p.kind || "") + " " + (p.blurb || "") + " " + (p.address || "") + " " + (p.source_url || "")).toLowerCase();
        if (p.beds) blob += " house home bedroom";
        uses.forEach((u) => {
          const terms = USE_TERMS[u] || [u];
          if (terms.some((t) => blob.indexOf(t) >= 0)) {
            score += 3;
            why.push(u);
          } else score -= 1;
        });
        if (musts.indexOf("house") >= 0) {
          if (p.kind === "house" || p.beds) score += 2;
          else {
            score -= 5;
            miss.push("house");
          }
        }
        ["well", "septic", "power", "county_road"].forEach((m) => {
          if (musts.indexOf(m) < 0) return;
          const tokens = {
            well: ["well"],
            septic: ["septic"],
            power: ["power", "electric", "grid"],
            county_road: ["county road", "paved", "maintained"],
          }[m];
          if (tokens.some((t) => blob.indexOf(t) >= 0)) {
            score += 2;
            why.push(m);
          }
        });
        p.score = score;
        p.why = why;
        p.miss = miss;
        return p;
      })
      .sort((a, b) => b.score - a.score || (b.price || 0) - (a.price || 0));
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function money(n) {
    if (n == null) return "";
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  const params = new URLSearchParams(location.search);
  function readLS(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  const uses = params.getAll("use").filter(Boolean);
  const musts = params.getAll("must").filter(Boolean);
  const budget = params.get("budget") || "";
  const acres = params.get("acres") || "";
  const useIds = uses.length ? uses : readLS("lt-uses", []);
  const mustIds = musts.length ? musts : readLS("lt-musts", []);
  const budgetId = budget || readLS("lt-budget", "") || "";
  const acresId = acres || readLS("lt-acres", "") || "";
  const hasPlan = useIds.length || budgetId || acresId || mustIds.length;

  const meta = document.getElementById("match-meta") || document.querySelector("main p.meta");
  if (meta && hasPlan) {
    const bits = [];
    bits.push("Pulled live listings.");
    if (useIds.length) bits.push("Uses: " + useIds.map((u) => labelOf(hs.uses, u)).join(", ") + ".");
    if (budgetId) bits.push("Budget " + labelOf(hs.budgets, budgetId) + ".");
    if (acresId) bits.push("Acres " + labelOf(hs.acres, acresId) + ".");
    meta.innerHTML =
      bits.join(" ") +
      ' <a href="land-needs.html">Change plan</a> · <a href="land-step-permits.html">Continue without a type</a>';
  }

  if (listGrid && listings.length) {
    const scoredL = hasPlan ? scoreListings(useIds, budgetId, acresId, mustIds) : listings;
    listGrid.innerHTML = scoredL
      .slice(0, 60)
      .map((p, i) => {
        const addr = esc(p.address || "") + (p.city ? ", " + esc(p.city) : "") + (p.state ? " " + esc(p.state) : "");
        const href = p.source_url
          ? '<a class="listing-addr" href="' + esc(p.source_url) + '" rel="noopener" target="_blank">' + addr + "</a>"
          : addr;
        const metaBits = [];
        if (p.acres != null) metaBits.push("<span>" + esc(p.acres) + " ac</span>");
        if (p.price) metaBits.push("<span>" + money(p.price) + "</span>");
        if (p.beds) metaBits.push("<span>" + esc(p.beds) + " bd" + (p.baths ? " / " + esc(p.baths) + " ba" : "") + "</span>");
        const why = p.why && p.why.length ? '<p class="match-fit">Fits: ' + esc(p.why.join(", ")) + "</p>" : "";
        const miss = p.miss && p.miss.length ? '<p class="match-miss">Watch: ' + esc(p.miss.join(", ")) + "</p>" : "";
        return (
          '<article class="match-card listing-card' +
          (i < 3 ? " is-top" : "") +
          '"><p class="kicker">' +
          esc(p.city || "Bonner County") +
          " · " +
          esc(p.source || "") +
          (p.kind ? " · " + esc(p.kind) : "") +
          "</p><h3>" +
          href +
          "</h3>" +
          (p.blurb ? "<p>" + esc(p.blurb) + "</p>" : "") +
          '<p class="dir-meta">' +
          metaBits.join("") +
          "</p>" +
          (p.broker ? '<p class="listing-broker">' + esc(p.broker) + "</p>" : "") +
          why +
          miss +
          (p.source_url
            ? '<p class="quest-go"><a href="' + esc(p.source_url) + '" rel="noopener" target="_blank">Open listing on ' + esc(p.source) + "</a></p>"
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  if (!hasPlan || !typeGrid) return;
  const scored = scorePlaces(useIds, budgetId, acresId, mustIds);
  typeGrid.innerHTML = scored
    .map((p, i) => {
      const why = p.why && p.why.length ? '<p class="match-fit">Fits: ' + p.why.join(", ") + "</p>" : "";
      const miss = p.miss && p.miss.length ? '<p class="match-miss">Watch: ' + p.miss.join(", ") + "</p>" : "";
      return (
        '<article class="match-card' +
        (i < 3 ? " is-top" : "") +
        '"><p class="kicker">' +
        (p.area || "") +
        " · score " +
        p.score +
        "</p><h3><a href=\"land-place-" +
        p.slug +
        '.html">' +
        p.name +
        "</a></h3><p>" +
        (p.blurb || "") +
        '</p><p class="dir-meta"><span>' +
        p.acres_lo +
        "–" +
        p.acres_hi +
        " ac</span><span>$" +
        p.budget_lo +
        "–" +
        p.budget_hi +
        "k</span></p>" +
        why +
        miss +
        '<p class="quest-go"><a href="land-place-' +
        p.slug +
        '.html">Use this type</a></p></article>'
      );
    })
    .join("");
})();
