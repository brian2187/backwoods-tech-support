(function () {
  const raw = document.getElementById("homestead-data");
  const grid = document.querySelector(".match-grid");
  if (!raw || !grid) return;
  let hs;
  try {
    hs = JSON.parse(raw.textContent || "{}");
  } catch (e) {
    return;
  }

  function band(items, sid) {
    return (items || []).find((it) => it.id === sid) || null;
  }
  function labelOf(items, id) {
    const it = band(items, id);
    return it ? it.label : id;
  }
  function scorePlaces(uses, budgetId, acresId, musts) {
    const budget = budgetId ? band(hs.budgets, budgetId) : null;
    const acres = acresId ? band(hs.acres, acresId) : null;
    return (hs.places || [])
      .map((raw) => {
        const p = Object.assign({}, raw);
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
  if (!useIds.length && !budgetId && !acresId && !mustIds.length) return;

  const scored = scorePlaces(useIds, budgetId, acresId, mustIds);
  const meta = document.querySelector(".wrap > p.meta, main p.meta");
  if (meta) {
    const bits = [];
    if (useIds.length) bits.push("Uses: " + useIds.map((u) => labelOf(hs.uses, u)).join(", ") + ".");
    if (budgetId) bits.push("Budget " + labelOf(hs.budgets, budgetId) + ".");
    if (acresId) bits.push("Acres " + labelOf(hs.acres, acresId) + ".");
    meta.innerHTML =
      bits.join(" ") +
      ' <a href="land-needs.html">Change plan</a> · <a href="land-step-permits.html">Continue without a type</a>';
  }
  grid.innerHTML = scored
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
