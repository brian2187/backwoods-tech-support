(function () {
  const ICONS = {
    music:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M8 26a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14-8V6l-12 3v15a4 4 0 1 0 2-3V12l8-2v9a4 4 0 1 0 2-3z"/></svg>',
    film:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="6.5" r="2.1" fill="currentColor"/><circle cx="16" cy="25.5" r="2.1" fill="currentColor"/><circle cx="6.5" cy="16" r="2.1" fill="currentColor"/><circle cx="25.5" cy="16" r="2.1" fill="currentColor"/><circle cx="9.2" cy="9.2" r="2" fill="currentColor"/><circle cx="22.8" cy="9.2" r="2" fill="currentColor"/><circle cx="9.2" cy="22.8" r="2" fill="currentColor"/><circle cx="22.8" cy="22.8" r="2" fill="currentColor"/><rect x="27" y="14" width="5" height="8" rx="1" fill="currentColor"/></svg>',
    art:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 4c7 0 12 5 12 11s-4 9-8 9c-2 0-3-1-3-3 0-1 1-2 1-3s-1-2-3-2c-4 0-7 4-7 8 0 .7.1 1.4.2 2C5 24 4 20 4 16 4 9 9 4 16 4zm-5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',
    market:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M9 4v10c0 3 2 5 5 6v8h4v-8c3-1 5-3 5-6V4h-3v10c0 1.5-1 3-3 3s-3-1.5-3-3V4H9zm13 0h5l-1.5 8H24V4z"/></svg>',
    dance:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-2 3 3 4 4-1 2 12h-3l-1.5-7-3 2 3 5h-3l-3.5-6 2-4-2-3h4z"/></svg>',
    comedy:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-4 9a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 12 13zm8 0a1.6 1.6 0 1 1 0 3.2A1.6 1.6 0 0 1 20 13zm-8.2 7c1.2 2 2.8 3 4.2 3s3-1 4.2-3h-8.4z"/></svg>',
    community:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M10 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm12 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM10 16c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5zm12 0c-.7 0-1.4.1-2 .3 1.7 1 3 2.6 3 4.7V24h8v-3c0-3-3-5-9-5z"/></svg>',
    festival:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3 6 28h4l2-5h8l2 5h4L16 3zm0 6 4 11h-8l4-11z"/></svg>',
    theater:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M6 8c3 0 6 2 10 2s7-2 10-2 4 3 0 8-8 6-10 6-6-1-10-6-3-8 0-8zm4 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 20c1.2 1.3 2.7 2 5 2s3.8-.7 5-2c-1.5.6-3.2 1-5 1s-3.5-.4-5-1z"/></svg>',
    mountain:
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M4 26 12 10l4 7 3-4 9 13H4zm8.5-6.5L9 26h7l-3.5-6.5z"/></svg>',
  };

  const VENUE_ICONS = {
    "Panida Theater":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#7a1f2b"/><path fill="#fff" d="M6 8c4 5 4 11 0 16h4c3-4 3-12 0-16H6zm16 0c-4 5-4 11 0 16h4c-3-4-3-12 0-16h-4z"/><rect x="13" y="4" width="6" height="3" fill="#fff"/><circle cx="14.2" cy="5.5" r=".7" fill="#7a1f2b"/><circle cx="16" cy="5.5" r=".7" fill="#7a1f2b"/><circle cx="17.8" cy="5.5" r=".7" fill="#7a1f2b"/></svg>',
    "War Memorial Field":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#2f6b3a"/><path fill="#fff" d="M6 22h20v3H6zM8 22l8-12 8 12H8zm8-12v-4h2v2h3v2h-5z"/></svg>',
    "The Hive":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#c9a227"/><path fill="#fff" d="M16 5l8 5v4l-8 5-8-5V10l8-5zm0 5.2 4.5 2.8-4.5 2.8-4.5-2.8L16 10.2zM8 16.2l8 5 8-5v5l-8 5-8-5v-5z"/></svg>',
    "Pend d'Oreille Winery":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#6b1d3a"/><path fill="#fff" d="M12 6h8l-1 8a5 5 0 0 1-3 8v4h4v2h-8v-2h4v-4a5 5 0 0 1-3-8L12 6zm2.2 2 .7 6.2A3.2 3.2 0 0 0 16 20a3.2 3.2 0 0 0 1.1-5.8L17.8 8h-3.6z"/></svg>',
    "Farmin Park":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#2a7a4a"/><path fill="#fff" d="M16 6c5 0 8 5 8 9 0 4-3 5-5 5v8h-6v-8c-2 0-5-1-5-5 0-4 3-9 8-9z"/></svg>',
    "Connie's":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#c41e3a"/><circle cx="16" cy="13" r="6" fill="none" stroke="#fff" stroke-width="2"/><path fill="#fff" d="M9 8h2v9H9zm12 0h2v9h-2zM11 24h10v2H11zm6-3h4v3h-4z"/></svg>',
    "Schweitzer Village":
      '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="4" fill="#2a4a7a"/><path fill="#fff" d="M6 24 16 6l10 18H6zm10-10 5 9h-10l5-9z"/></svg>',
  };

  function fillKindIcon(n) {
    const card = n.closest(".venue-card");
    const nameEl = card && card.querySelector("h3 a, h3 > span:not(.venue-ico)");
    const name = nameEl ? nameEl.textContent.trim() : "";
    if (name && VENUE_ICONS[name]) {
      n.innerHTML = VENUE_ICONS[name];
      return;
    }
    const kind = [...n.classList].find((c) => c.startsWith("ev-") && c !== "ev-ico" && c !== "ev-kind");
    const k = kind ? kind.slice(3) : "festival";
    n.innerHTML = ICONS[k] || ICONS.festival;
  }

  document.querySelectorAll(".ev-ico, .venue-ico").forEach(fillKindIcon);

  const el = document.getElementById("ent-map");
  const edgeLayer = document.getElementById("ent-edges");
  if (!el || typeof maplibregl === "undefined") return;

  function read(id) {
    try {
      return JSON.parse((document.getElementById(id) || {}).textContent || "[]");
    } catch (e) {
      return [];
    }
  }
  const venues = read("venues-data");
  const events = read("events-data");

  function iconFor(kind) {
    return ICONS[kind] || ICONS.festival;
  }
  function venueIcon(name, kind) {
    return VENUE_ICONS[name] || iconFor(kind || "festival");
  }

  const HOME = { center: [-116.55, 48.12], zoom: 8.4 };

  const map = new maplibregl.Map({
    container: el,
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: HOME.center,
    zoom: HOME.zoom,
    attributionControl: false,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  function fitMap() {
    map.resize();
    updateEdges();
  }
  map.on("load", function () {
    const pts = venues.filter((v) => v.lat != null && v.lon != null);
    if (pts.length > 1) {
      const b = new maplibregl.LngLatBounds();
      pts.forEach((v) => b.extend([v.lon, v.lat]));
      map.fitBounds(b, { padding: 40, maxZoom: 10, duration: 0 });
    }
    fitMap();
  });
  map.on("move", updateEdges);
  window.addEventListener("resize", fitMap);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(fitMap).observe(el);
  }

  function pinNode(kind, svg, animated) {
    const node = document.createElement("div");
    node.className = "fun-pin fun-" + kind + (animated ? " is-live" : " is-still");
    node.innerHTML = '<span class="fun-pin-inner">' + svg + "</span>";
    return node;
  }

  const tracked = [];

  venues.forEach((v) => {
    if (v.lat == null || v.lon == null) return;
    const node = pinNode("venue", venueIcon(v.name, v.kind), false);
    const site = v.url
      ? `<li><a href="${v.url}" target="_blank" rel="noopener">Venue site</a></li>`
      : "";
    const phone = v.phone ? `<p>${v.phone}</p>` : "";
    new maplibregl.Marker({ element: node, anchor: "bottom" })
      .setLngLat([v.lon, v.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 18, maxWidth: "280px" }).setHTML(
          `<div class="map-pop"><strong>${v.name}</strong><p>${v.area || ""} · ${v.kind || ""}</p><p>${v.address || ""}</p>${phone}<p>${v.about || ""}</p><ul>${site}</ul></div>`
        )
      )
      .addTo(map);
    tracked.push({
      lat: v.lat,
      lon: v.lon,
      label: v.name,
      kind: "venue",
      svg: venueIcon(v.name, v.kind),
    });
  });

  const atSpot = {};
  events.forEach((e) => {
    if (e.lat == null || e.lon == null) return;
    const key = String(e.lat) + "," + String(e.lon);
    const i = atSpot[key] || 0;
    atSpot[key] = i + 1;
    const angle = (i * 2.2) % (Math.PI * 2);
    const rad = 0.00038 + Math.floor(i / 6) * 0.00018;
    const lon = e.lon + Math.cos(angle) * rad;
    const lat = e.lat + Math.sin(angle) * rad * 0.75;
    const k = e.kind || "festival";
    const node = pinNode(k, iconFor(k), true);
    node.title = e.title;
    const artists = (e.artists || []).join(", ");
    const venueLink = e.venue_url
      ? `<li><a href="${e.venue_url}" target="_blank" rel="noopener">${e.venue} (venue)</a></li>`
      : "";
    new maplibregl.Marker({ element: node, anchor: "bottom" })
      .setLngLat([lon, lat])
      .setPopup(
        new maplibregl.Popup({ offset: 18, maxWidth: "280px" }).setHTML(
          `<div class="map-pop"><strong>${e.title}</strong><p>${e.date || ""} ${e.time || ""} · ${e.venue || ""}</p><p>${artists}</p><ul><li><a href="${e.url}" target="_blank" rel="noopener">Tickets / source</a></li>${venueLink}</ul></div>`
        )
      )
      .addTo(map);
    tracked.push({
      lat: e.lat,
      lon: e.lon,
      label: e.title,
      kind: k,
      svg: iconFor(k),
      go: [e.lon, e.lat],
    });
  });

  function clampEdge(lon, lat) {
    const w = el.clientWidth;
    const h = el.clientHeight;
    const pad = 26;
    const p = map.project([lon, lat]);
    const cx = w / 2;
    const cy = h / 2;
    const dx = p.x - cx;
    const dy = p.y - cy;
    const minX = pad;
    const maxX = w - pad;
    const minY = pad;
    const maxY = h - pad;
    let t = 1;
    if (dx > 0) t = Math.min(t, (maxX - cx) / dx);
    if (dx < 0) t = Math.min(t, (minX - cx) / dx);
    if (dy > 0) t = Math.min(t, (maxY - cy) / dy);
    if (dy < 0) t = Math.min(t, (minY - cy) / dy);
    return { x: cx + dx * t, y: cy + dy * t };
  }

  function updateEdges() {
    if (!edgeLayer) return;
    edgeLayer.innerHTML = "";
    const b = map.getBounds();
    const seen = new Set();
    tracked.forEach((item) => {
      if (b.contains([item.lon, item.lat])) return;
      const key = item.label;
      if (seen.has(key)) return;
      seen.add(key);
      const pos = clampEdge(item.lon, item.lat);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "edge-pin fun-" + (item.kind || "venue");
      btn.title = "Go to " + item.label;
      btn.innerHTML =
        '<span class="fun-pin-inner">' +
        item.svg +
        '</span><span class="edge-label">' +
        item.label +
        "</span>";
      btn.style.left = pos.x + "px";
      btn.style.top = pos.y + "px";
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        map.flyTo({
          center: item.go || [item.lon, item.lat],
          zoom: 15,
          essential: true,
        });
      });
      edgeLayer.appendChild(btn);
    });
  }
})();
