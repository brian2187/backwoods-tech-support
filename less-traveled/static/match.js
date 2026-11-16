(function () {
  const raw = document.getElementById("homestead-data");
  const listRaw = document.getElementById("listings-data");
  const listGrid = document.getElementById("listings-grid");
  const typeGrid = document.getElementById("types-grid");
  const form = document.getElementById("criteria-form");
  const mapEl = document.getElementById("listing-map");
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
    chickens: ["chicken", "coop", "poultry"],
    cattle: ["cattle", "ranch", "grazing", "pasture", "livestock"],
    horses: ["horse", "arena", "barn", "pasture"],
    hay: ["hay", "meadow", "alfalfa", "pasture", "open field"],
    timber: ["timber", "forest", "wooded", "treed", "timbered"],
    shop: ["shop", "garage", "warehouse", "commercial", "pole barn"],
    cabin: ["cabin", "guest", "tiny"],
    hunt: ["hunt", "hunting", "elk", "deer", "wildlife"],
    lake: ["lake", "waterfront", "pend oreille", "shore", "beach"],
    offgrid: ["off-grid", "off grid", "solar", "generator"],
  };
  const USE_SHORT = {
    house: "House",
    garden: "Garden",
    orchard: "Orchard",
    greenhouse: "Greenhouse",
    chickens: "Chickens",
    cattle: "Cattle",
    horses: "Horses",
    hay: "Hay",
    timber: "Timber",
    shop: "Shop",
    lake: "Lake",
    hunt: "Hunt",
    offgrid: "Off-grid",
    cabin: "Cabin",
  };
  const USE_MIN_ACRES = {
    cattle: 5,
    horses: 3,
    hay: 5,
    timber: 5,
    hunt: 5,
    chickens: 1,
    orchard: 1,
  };
  const MUST_TOKENS = {
    well: ["well"],
    septic: ["septic"],
    power: ["power", "electric", "grid"],
    county_road: ["county road", "paved", "maintained"],
  };
  const MUST_NEG = {
    well: ["no well", "needs well", "without a well", "well needed"],
    septic: ["no septic", "needs septic", "perc needed", "without septic"],
    power: ["no power", "off-grid", "off grid", "without power"],
    county_road: ["unmaintained", "seasonal road", "snowmobile access"],
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

  function blobOf(p) {
    let blob = ((p.kind || "") + " " + (p.blurb || "") + " " + (p.address || "") + " " + (p.source_url || "")).toLowerCase();
    if (p.beds) blob += " house home bedroom";
    return blob;
  }

  function isHouse(p) {
    return p.kind === "house" || !!p.beds;
  }

  function listingHitsUse(p, blob, u) {
    if (u === "house") return isHouse(p);
    const minAc = USE_MIN_ACRES[u];
    const acres = p.acres == null ? null : Number(p.acres);
    if (minAc && (acres == null || acres < minAc)) return false;
    const terms = USE_TERMS[u] || [u];
    if (terms.some((t) => blob.indexOf(t) >= 0)) return true;
    if (u === "cattle" && acres >= 10) return true;
    if (u === "horses" && acres >= 5) return true;
    if (u === "hay" && acres >= 10) return true;
    return false;
  }

  function qualifyListings(kind, uses, budgetId, acresId, musts) {
    const budget = budgetId ? band(hs.budgets, budgetId) : null;
    const acresB = acresId ? band(hs.acres, acresId) : null;
    return listings
      .map((rawL) => {
        const p = Object.assign({}, rawL);
        const why = [];
        const miss = [];
        const blob = blobOf(p);
        if (kind === "house" && !isHouse(p)) return null;
        if (kind === "land" && isHouse(p)) return null;
        const priceK = (p.price || 0) / 1000;
        if (budget) {
          if (!p.price || priceK < budget.lo || priceK > budget.hi) return null;
          why.push("budget");
        }
        if (acresB) {
          if (p.acres == null || p.acres < acresB.lo || p.acres > acresB.hi) return null;
          why.push("acres");
        }
        if (kind !== "land" && musts.indexOf("house") >= 0 && !isHouse(p)) return null;
        if (isHouse(p) && (kind === "house" || musts.indexOf("house") >= 0)) why.push("house");
        let drop = false;
        ["well", "septic", "power", "county_road"].forEach((m) => {
          if (musts.indexOf(m) < 0) return;
          const neg = MUST_NEG[m] || [];
          const pos = MUST_TOKENS[m] || [m];
          if (neg.some((t) => blob.indexOf(t) >= 0)) {
            drop = true;
            return;
          }
          if (pos.some((t) => blob.indexOf(t) >= 0)) why.push(m);
          else miss.push("confirm " + m.replace("_", " "));
        });
        if (drop) return null;
        if (uses.length) {
          for (let i = 0; i < uses.length; i++) {
            const u = uses[i];
            if (!listingHitsUse(p, blob, u)) return null;
            why.push(u);
          }
        }
        p.why = why;
        p.miss = miss;
        p.score = why.length * 2 - miss.length;
        return p;
      })
      .filter(Boolean)
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (a.price || 0) - (b.price || 0));
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
  function validLL(lat, lon) {
    return typeof lat === "number" && typeof lon === "number" && isFinite(lat) && isFinite(lon);
  }
  function placeHref(slug) {
    const staticPage = /\.html$/i.test((location.pathname.split("/").pop() || ""));
    return staticPage ? "land-place-" + slug + ".html" : "/land/place/" + slug;
  }

  function readLS(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeLS(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  const params = new URLSearchParams(location.search);
  const urlUses = params.getAll("use").filter(Boolean);
  const urlMusts = params.getAll("must").filter(Boolean);
  const urlBudget = params.get("budget") || "";
  const urlAcres = params.get("acres") || "";
  const urlKind = params.get("kind") || "";
  const hasUrlFilter = ["use", "must", "budget", "acres", "kind"].some((k) => params.has(k));

  const CENTER = [-116.55, 48.27];
  const STYLE_STREETS = "https://tiles.openfreemap.org/styles/liberty";
  const STYLE_SAT = {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      esri: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Tiles © Esri",
      },
      labels: {
        type: "raster",
        tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
        tileSize: 256,
        maxzoom: 19,
      },
    },
    layers: [
      { id: "esri", type: "raster", source: "esri" },
      { id: "labels", type: "raster", source: "labels" },
    ],
  };
  const STYLE_TOPO = {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      topo: {
        type: "raster",
        tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 17,
        attribution: "OpenTopoMap · OSM",
      },
    },
    layers: [{ id: "topo", type: "raster", source: "topo" }],
  };
  const PIN_SVG =
    '<svg viewBox="0 0 24 32" aria-hidden="true"><path fill="currentColor" d="M12 1.5c-5 0-9 4-9 9.1 0 7 9 19.4 9 19.4s9-12.4 9-19.4C21 5.5 17 1.5 12 1.5z"/><path fill="#fffcf7" d="M8.2 12.2l2.4 2.3 5.2-5.4 1.3 1.3-6.5 6.7-3.7-3.6z"/></svg>';
  const LAND_SVG =
    '<svg viewBox="0 0 24 32" aria-hidden="true"><path fill="currentColor" d="M12 1.5c-5 0-9 4-9 9.1 0 7 9 19.4 9 19.4s9-12.4 9-19.4C21 5.5 17 1.5 12 1.5z"/><path fill="#fffcf7" d="M6.8 16.2l5.2-7.2 5.2 7.2H6.8z"/></svg>';

  let map = null;
  const markers = {};
  let selected = null;
  let lastQualify = [];

  function currentCriteria() {
    if (!form) {
      return {
        kind: urlKind || readLS("lt-kind", "house") || "house",
        uses: urlUses.length ? urlUses : readLS("lt-uses", []),
        musts: urlMusts.length ? urlMusts : readLS("lt-musts", ["house"]),
        budget: urlBudget || readLS("lt-budget", "") || "",
        acres: urlAcres || readLS("lt-acres", "") || "",
      };
    }
    const uses = [];
    const musts = [];
    form.querySelectorAll('input[name="use"]:checked').forEach((el) => uses.push(el.value));
    form.querySelectorAll('input[name="must"]:checked').forEach((el) => musts.push(el.value));
    return {
      kind: (form.querySelector('[name="kind"]') || {}).value || "house",
      uses: uses,
      musts: musts,
      budget: (form.querySelector('[name="budget"]') || {}).value || "",
      acres: (form.querySelector('[name="acres"]') || {}).value || "",
    };
  }

  function persist(c) {
    writeLS("lt-kind", c.kind);
    writeLS("lt-uses", c.uses);
    writeLS("lt-musts", c.musts);
    writeLS("lt-budget", c.budget);
    writeLS("lt-acres", c.acres);
    const q = new URLSearchParams();
    if (c.kind && c.kind !== "house") q.set("kind", c.kind);
    if (c.budget) q.set("budget", c.budget);
    if (c.acres) q.set("acres", c.acres);
    (c.uses || []).forEach((u) => q.append("use", u));
    (c.musts || []).forEach((m) => q.append("must", m));
    const qs = q.toString();
    const next = location.pathname + (qs ? "?" + qs : "") + location.hash;
    const now = location.pathname + location.search + location.hash;
    if (next !== now) {
      try {
        history.replaceState(null, "", next);
      } catch (e) {}
    }
  }

  function fillForm() {
    if (!form) return;
    const kind = urlKind || (hasUrlFilter ? "house" : readLS("lt-kind", "house") || "house");
    const uses = hasUrlFilter ? urlUses : readLS("lt-uses", []);
    const savedMusts = readLS("lt-musts", null);
    const musts = hasUrlFilter
      ? urlMusts.length
        ? urlMusts
        : kind === "house"
          ? ["house"]
          : []
      : savedMusts && savedMusts.length
        ? savedMusts
        : ["house"];
    const budget = hasUrlFilter ? urlBudget : readLS("lt-budget", "") || "";
    const acres = hasUrlFilter ? urlAcres : readLS("lt-acres", "") || "";
    const kindEl = form.querySelector('[name="kind"]');
    const budEl = form.querySelector('[name="budget"]');
    const acEl = form.querySelector('[name="acres"]');
    if (kindEl) kindEl.value = kind;
    if (budEl) budEl.value = budget;
    if (acEl) acEl.value = acres;
    form.querySelectorAll('input[name="use"]').forEach((el) => {
      el.checked = uses.indexOf(el.value) >= 0;
    });
    form.querySelectorAll('input[name="must"]').forEach((el) => {
      el.checked = musts.indexOf(el.value) >= 0;
    });
    if (uses.length) {
      const details = form.querySelector(".criteria-uses");
      if (details) details.open = true;
    }
  }

  function metaLine(c, n) {
    const bits = [];
    bits.push(n + " listing" + (n === 1 ? "" : "s") + " match.");
    if (c.kind === "house") bits.push("Houses.");
    else if (c.kind === "land") bits.push("Land.");
    if (c.budget) bits.push(labelOf(hs.budgets, c.budget) + ".");
    if (c.acres) bits.push(labelOf(hs.acres, c.acres) + ".");
    if (c.musts.length) bits.push("Must: " + c.musts.map((m) => labelOf(hs.musts, m)).join(", ") + ".");
    if (c.uses.length) bits.push("Uses: " + c.uses.map((u) => labelOf(hs.uses, u)).join(", ") + ".");
    return bits.join(" ");
  }

  function popupHtml(p) {
    const addr = esc(p.address || "") + (p.city ? ", " + esc(p.city) : "");
    const bits = [];
    if (p.price) bits.push(money(p.price));
    if (p.acres != null) bits.push(esc(p.acres) + " ac");
    if (p.beds) bits.push(esc(p.beds) + " bd" + (p.baths ? " / " + esc(p.baths) + " ba" : ""));
    bits.push(esc(listingStatus(p)));
    const approx = p.geo === "city" || p.geo === "region" ? "<p class=\"approx\">Town location — confirm the pin on the listing.</p>" : "";
    const href = p.source_url
      ? '<p><a href="' + esc(p.source_url) + '" rel="noopener" target="_blank">Open on ' + esc(p.source || "listing") + "</a></p>"
      : "";
    return (
      '<div class="listing-pop"><h3>' +
      addr +
      "</h3><p>" +
      bits.join(" · ") +
      "</p>" +
      approx +
      href +
      "</div>"
    );
  }

  function pinNode(p) {
    const n = document.createElement("button");
    n.type = "button";
    n.className = "ico-listing" + (isHouse(p) ? " is-house" : " is-land") + (p.geo === "city" || p.geo === "region" ? " is-approx" : "");
    n.setAttribute("aria-label", (p.address || "Listing") + (p.city ? ", " + p.city : ""));
    n.innerHTML = isHouse(p) ? PIN_SVG : LAND_SVG;
    n.addEventListener("mousedown", function (ev) {
      ev.preventDefault();
    });
    n.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      selectListing(p.id, true);
    });
    return n;
  }

  function clearMarkers() {
    Object.keys(markers).forEach((id) => {
      markers[id].remove();
      delete markers[id];
    });
  }

  function drawMarkers(rows) {
    if (!map) return;
    clearMarkers();
    const used = {};
    const bounds = typeof maplibregl !== "undefined" ? new maplibregl.LngLatBounds() : null;
    let n = 0;
    rows.forEach((p) => {
      if (!validLL(p.lat, p.lon)) return;
      const key = p.lat.toFixed(4) + "," + p.lon.toFixed(4);
      used[key] = (used[key] || 0) + 1;
      const i = used[key] - 1;
      const lon = p.lon + (i ? Math.cos(i * 1.15) * 0.004 : 0);
      const lat = p.lat + (i ? Math.sin(i * 1.15) * 0.003 : 0);
      const m = new maplibregl.Marker({ element: pinNode(p), anchor: "bottom" })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup({ offset: 18, maxWidth: "280px" }).setHTML(popupHtml(p)))
        .addTo(map);
      markers[p.id] = m;
      if (bounds) bounds.extend([lon, lat]);
      n += 1;
    });
    if (n === 1) {
      const only = rows.find((p) => markers[p.id]);
      if (only) map.easeTo({ center: [only.lon, only.lat], zoom: Math.max(map.getZoom(), 11), duration: 450 });
    } else if (n > 1 && bounds && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 450 });
    }
  }

  function listingStatus(p) {
    const given = String(p.status || "").trim();
    if (given) return given;
    const blob = blobOf(p);
    if (/\b(under contract|in contract|pending)\b/.test(blob)) return "In contract";
    if (/\bcontingent\b/.test(blob)) return "Contingent";
    if (/\bcoming soon\b/.test(blob)) return "Coming soon";
    if (/\bsold\b/.test(blob) && blob.indexOf("sold as") < 0) return "Sold";
    return "Active";
  }

  function useBoxes(p) {
    const blob = blobOf(p);
    return (hs.uses || [])
      .map((u) => {
        const on = listingHitsUse(p, blob, u.id);
        const short = USE_SHORT[u.id] || u.label || u.id;
        return (
          '<label class="' +
          (on ? "is-on" : "") +
          '"><input type="checkbox" tabindex="-1"' +
          (on ? " checked" : "") +
          ' onclick="return false"> ' +
          esc(short) +
          "</label>"
        );
      })
      .join("");
  }

  function renderList(rows) {
    if (!listGrid) return;
    if (!rows.length) {
      listGrid.innerHTML = '<p class="meta">Nothing in this pull matches. Loosen price, acres, or must-haves.</p>';
      return;
    }
    const MAX_ROWS = 250;
    const shown = rows.slice(0, MAX_ROWS);
    const extra =
      rows.length > MAX_ROWS
        ? '<p class="meta">Showing ' + MAX_ROWS + " of " + rows.length + ".</p>"
        : "";
    listGrid.innerHTML =
      shown
        .map((p) => {
          const addr = esc(p.address || "") + (p.city ? ", " + esc(p.city) : "");
          const href = p.source_url
            ? '<a class="listing-addr" href="' +
              esc(p.source_url) +
              '" rel="noopener" target="_blank">' +
              addr +
              "</a>"
            : '<span class="listing-addr">' + addr + "</span>";
          const st = listingStatus(p);
          const stClass =
            /contract|pending|contingent|sold/i.test(st) ? " is-contract" : "";
          const acres = p.acres != null ? esc(p.acres) + " ac" : "";
          const beds = p.beds ? esc(p.beds) + " bd" : "";
          const approx =
            p.geo === "city" || p.geo === "region" ? '<span class="approx">Town pin</span>' : "";
          return (
            '<article class="listing-row" data-id="' +
            esc(p.id) +
            '"><div class="listing-row-top">' +
            href +
            '<span class="listing-src">' +
            esc(p.source || "") +
            (p.kind ? " · " + esc(p.kind) : "") +
            "</span></div><div class=\"listing-row-meta\">" +
            (p.price ? '<span class="listing-price">' + money(p.price) + "</span>" : "") +
            (acres ? "<span>" + acres + "</span>" : "") +
            (beds ? "<span>" + beds + "</span>" : "") +
            '<span class="listing-status' +
            stClass +
            '">' +
            esc(st) +
            "</span>" +
            approx +
            '</div><div class="listing-uses">' +
            useBoxes(p) +
            "</div></article>"
          );
        })
        .join("") + extra;
  }

  function selectListing(id, fly) {
    const p = lastQualify.find((row) => row.id === id);
    selected = id;
    Object.keys(markers).forEach((k) => {
      markers[k].getElement().classList.toggle("is-on", k === id);
    });
    listGrid &&
      listGrid.querySelectorAll(".listing-row").forEach((n) => {
        n.classList.toggle("is-on", n.getAttribute("data-id") === id);
      });
    const m = markers[id];
    if (m) {
      const pop = m.getPopup();
      if (pop && !pop.isOpen()) m.togglePopup();
      if (fly && map && validLL(p && p.lat, p && p.lon)) {
        map.easeTo({ center: [p.lon, p.lat], zoom: Math.min(Math.max(map.getZoom(), 11), 13), duration: 400 });
      }
    }
    if (listGrid) {
      const item = listGrid.querySelector('.listing-row[data-id="' + id + '"]');
      if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function apply() {
    const c = currentCriteria();
    persist(c);
    lastQualify = qualifyListings(c.kind, c.uses, c.budget, c.acres, c.musts);
    const countEl = document.getElementById("qualify-count");
    const heading = document.getElementById("qualify-heading");
    const line = metaLine(c, lastQualify.length);
    if (countEl) countEl.textContent = line;
    if (heading) heading.textContent = "Properties by address";
    const meta = document.getElementById("match-meta");
    if (meta) {
      meta.textContent =
        "Pulled live listings. " + line + (c.geoNote ? "" : "") + " Confirm well, septic, and access with the listing.";
    }
    renderList(lastQualify);
    drawMarkers(lastQualify);
    if (typeGrid && (c.uses.length || c.budget || c.acres || c.musts.length)) {
      const scored = scorePlaces(c.uses, c.budget, c.acres, c.musts);
      typeGrid.innerHTML = scored
        .map((p, i) => {
          const why = p.why && p.why.length ? '<p class="match-fit">Fits: ' + esc(p.why.join(", ")) + "</p>" : "";
          const miss = p.miss && p.miss.length ? '<p class="match-miss">Watch: ' + esc(p.miss.join(", ")) + "</p>" : "";
          return (
            '<article class="match-card' +
            (i < 3 ? " is-top" : "") +
            '"><p class="kicker">' +
            esc(p.area || "") +
            " · score " +
            p.score +
            '</p><h3><a href="' +
            esc(placeHref(p.slug)) +
            '">' +
            esc(p.name) +
            "</a></h3><p>" +
            esc(p.blurb || "") +
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
            '<p class="quest-go"><a href="' +
            esc(placeHref(p.slug)) +
            '">Use this type</a></p></article>'
          );
        })
        .join("");
    }
  }

  function initMap() {
    if (!mapEl || typeof maplibregl === "undefined") {
      if (mapEl) mapEl.innerHTML = '<p class="map-fallback">Map library did not load. The list on the right still filters.</p>';
      apply();
      return;
    }
    map = new maplibregl.Map({
      container: mapEl,
      style: STYLE_TOPO,
      center: CENTER,
      zoom: 8.4,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("load", function () {
      apply();
    });
    document.querySelectorAll("#listing-layers [data-base]").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll("#listing-layers [data-base]").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const which = btn.getAttribute("data-base");
        map.setStyle(which === "sat" ? STYLE_SAT : which === "streets" ? STYLE_STREETS : STYLE_TOPO);
        map.once("style.load", function () {
          drawMarkers(lastQualify);
        });
      });
    });
  }

  if (listGrid) {
    listGrid.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return;
      const row = ev.target.closest(".listing-row");
      if (!row) return;
      selectListing(row.getAttribute("data-id"), true);
    });
  }

  fillForm();
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
    });
    const kindEl = form.querySelector('[name="kind"]');
    if (kindEl) {
      kindEl.addEventListener("change", function () {
        const house = form.querySelector('input[name="must"][value="house"]');
        if (!house) return;
        if (kindEl.value === "land") house.checked = false;
        if (kindEl.value === "house") house.checked = true;
      });
    }
    form.addEventListener("change", apply);
  }
  initMap();
  if (!mapEl) apply();
})();
