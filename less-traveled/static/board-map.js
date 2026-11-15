(function () {
  const el = document.getElementById("board-map");
  if (!el) return;
  if (typeof maplibregl === "undefined") {
    el.innerHTML = '<p class="map-fallback">Map library did not load.</p>';
    return;
  }

  function readJson(id) {
    const n = document.getElementById(id);
    if (!n) return null;
    try {
      return JSON.parse(n.textContent || "null");
    } catch (e) {
      return null;
    }
  }

  const fires = readJson("fires-data") || [];
  const lakes = readJson("lakes-data") || [];
  const nixle = readJson("nixle-data") || [];
  const snowpack = readJson("snowpack-data") || [];
  const roads = readJson("roads-data") || [];
  const BBOX = "-117.12,47.92,-115.50,49.05";
  const CENTER = [-116.55, 48.27];
  const REGION_RING = [
    [-117.12, 47.92],
    [-115.5, 47.92],
    [-115.5, 49.05],
    [-117.12, 49.05],
    [-117.12, 47.92],
  ];

  const STYLE_STREETS = "https://tiles.openfreemap.org/styles/liberty";
  const STYLE_SAT = {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      esri: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Tiles © Esri",
      },
      labels: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        ],
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

  const AQI_COLOR = [
    "match",
    ["get", "gridcode"],
    1,
    "#00e400",
    2,
    "#ffff00",
    3,
    "#ff7e00",
    4,
    "#ff0000",
    5,
    "#8f3f97",
    6,
    "#7e0023",
    "#9aa39c",
  ];

  const FIRE_SVG =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 2c2 5 3 8 3 11 2-3 6-1 6 5a9 9 0 1 1-18 0c0-4 3-8 6-11-1 5 3 6 3-5z"/></svg>';
  const LAKE_SVG =
    '<svg viewBox="0 0 40 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 8c3 4 6 4 9 0s6-4 9 0 6 4 9 0 6-4 9 0"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 14c3 4 6 4 9 0s6-4 9 0 6 4 9 0 6-4 9 0"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="M2 20c3 4 6 4 9 0s6-4 9 0 6 4 9 0"/></svg>';

  const map = new maplibregl.Map({
    container: el,
    style: STYLE_TOPO,
    center: CENTER,
    zoom: 8.5,
    minZoom: 2,
    maxZoom: 18,
    attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

  const fireMarkers = [];
  const lakeMarkers = [];
  const nixleActiveMarkers = [];
  const nixleClosedMarkers = [];
  const snowMarkers = [];
  const roadMarkers = [];
  const aqiMarkers = [];
  const planeMarkers = {};
  let overlaysReady = false;
  let currentBase = "topo";

  function fitMap() {
    try {
      map.resize();
    } catch (e) {}
  }
  map.on("load", function () {
    fitMap();
    requestAnimationFrame(fitMap);
    setTimeout(fitMap, 250);
  });
  window.addEventListener("resize", fitMap);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(fitMap).observe(el);
  }

  function popupHtml(title, lines, links) {
    const lis = (links || [])
      .filter((l) => l && l.url)
      .map(
        (l) =>
          `<li><a href="${l.url}" target="_blank" rel="noopener">${l.title || l.url}</a></li>`
      )
      .join("");
    return `<div class="map-pop"><strong>${title}</strong>${lines}<ul>${lis}</ul></div>`;
  }

  function fireNode(active) {
    const n = document.createElement("div");
    n.className = "ico-fire " + (active ? "is-active" : "is-contained");
    n.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.className = "ico-fire-inner";
    inner.innerHTML = FIRE_SVG;
    n.appendChild(inner);
    return n;
  }

  function addMarkers() {
    if (fireMarkers.length) return;
    try {
    fires.forEach((f) => {
      if (!validLL(f.lat, f.lon) || f._error) return;
      const active = f.active !== false;
      const acres = f.acres != null ? Number(f.acres).toLocaleString() + " ac" : "";
      const pct = f.contained != null ? f.contained + "% contained" : "";
      const m = new maplibregl.Marker({ element: fireNode(active), anchor: "bottom" })
        .setLngLat([f.lon, f.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 18, maxWidth: "280px" }).setHTML(
            popupHtml(f.name + " Fire", `<p>${f.county || ""} · ${acres} · ${pct}</p>`, f.stories)
          )
        )
        .addTo(map);
      fireMarkers.push(m);
    });
    lakes.forEach((lake) => {
      if (!validLL(lake.lat, lake.lon)) return;
      const n = document.createElement("div");
      n.className = "ico-lake";
      const pool = lake.pool_ft != null ? lake.pool_ft + " ft" : lake.gage_ft != null ? lake.gage_ft + " ft" : "—";
      const gage = lake.gage_ft != null && lake.pool_ft != null ? "gage " + lake.gage_ft : "";
      n.innerHTML =
        LAKE_SVG +
        `<div class="lake-tag"><span>${(lake.short || lake.name || "").toUpperCase()}</span><b>${pool}</b><em>${gage}</em></div>`;
      const m = new maplibregl.Marker({ element: n, anchor: "center" })
        .setLngLat([lake.lon, lake.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 20, maxWidth: "280px" }).setHTML(
            popupHtml(
              lake.name || "Lake",
              `<p>${pool}${lake.note ? " · " + lake.note : ""}</p><p>${lake.when || ""}</p>`,
              [{ title: "USGS gage", url: lake.link }]
            )
          )
        )
        .addTo(map);
      lakeMarkers.push(m);
    });
    const used = {};
    nixle.forEach((item) => {
      if (!validLL(item.lat, item.lon)) return;
      const key = Number(item.lat).toFixed(3) + "," + Number(item.lon).toFixed(3);
      used[key] = (used[key] || 0) + 1;
      const n = used[key] - 1;
      const lon = item.lon + (n ? Math.cos(n * 0.9) * 0.012 : 0);
      const lat = item.lat + (n ? Math.sin(n * 0.9) * 0.008 : 0);
      const kind = (item.kind || "Advisory").toLowerCase();
      const closed = item.active === false;
      const node = document.createElement("div");
      node.className =
        "ico-nixle is-" +
        kind.replace(/\s+/g, "-") +
        (closed ? " is-closed" : " is-open");
      node.setAttribute("aria-hidden", "true");
      node.innerHTML = '<span class="ico-nixle-inner">!</span>';
      const when = item.when_short || item.when || "";
      const m = new maplibregl.Marker({ element: node, anchor: "bottom" })
        .setLngLat([lon, lat])
        .setPopup(
          new maplibregl.Popup({ offset: 16, maxWidth: "280px" }).setHTML(
            popupHtml(
              (closed ? "Closed · " : "Active · ") + (item.kind || "Nixle"),
              `<p>${item.title || ""}</p><p>Nixle · ${item.source || ""} · ${when}</p>`,
              [{ title: "Nixle", url: item.link }]
            )
          )
        )
        .addTo(map);
      (closed ? nixleClosedMarkers : nixleActiveMarkers).push(m);
    });
    snowpack.forEach((sp) => {
      if (!validLL(sp.lat, sp.lon)) return;
      const n = document.createElement("div");
      n.className = "ico-snow";
      const depth = sp.depth_in != null ? sp.depth_in + " in" : "—";
      n.innerHTML =
        '<span class="ico-snow-inner">❄</span>' +
        `<div class="lake-tag"><span>${(sp.short || sp.name || "SNOTEL").toUpperCase()}</span><b>${depth}</b><em>SNOTEL</em></div>`;
      const m = new maplibregl.Marker({ element: n, anchor: "bottom" })
        .setLngLat([sp.lon, sp.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 18, maxWidth: "260px" }).setHTML(
            popupHtml(
              sp.name || "SNOTEL",
              `<p>Snow ${depth}${sp.swe_in != null ? " · SWE " + sp.swe_in + " in" : ""}${
                sp.elev_ft ? " · " + Math.round(sp.elev_ft) + " ft" : ""
              }</p><p>SNOTEL · ${sp.when || ""}</p>`,
              [{ title: "NRCS station", url: sp.link }]
            )
          )
        )
        .addTo(map);
      snowMarkers.push(m);
    });
    roads.forEach((rd) => {
      if (!validLL(rd.lat, rd.lon)) return;
      const n = document.createElement("div");
      n.className = "ico-road" + (rd.active === false || rd.kind === "cleared" ? " is-cleared" : "");
      n.innerHTML = '<span class="ico-road-inner">☰</span>';
      const m = new maplibregl.Marker({ element: n, anchor: "bottom" })
        .setLngLat([rd.lon, rd.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 16, maxWidth: "280px" }).setHTML(
            popupHtml(
              (rd.origin || "DOT") + " · " + (rd.road || "Road"),
              `<p>${rd.title || ""}</p><p>${rd.when_short || rd.when || ""}</p>`,
              [{ title: rd.origin || "DOT", url: rd.link }]
            )
          )
        )
        .addTo(map);
      roadMarkers.push(m);
    });
    } catch (e) {}
  }

  function validLL(lat, lon) {
    const a = Number(lat);
    const b = Number(lon);
    return Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180;
  }

  function setMarkerVis(list, on) {
    (list || []).forEach((m) => {
      if (!m || typeof m.getElement !== "function") return;
      const node = m.getElement();
      if (node) node.style.display = on ? "" : "none";
    });
  }

  function layerOn(id) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "visible");
  }
  function layerOff(id) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
  }

  function applyToggles() {
    const form = document.getElementById("sit-layers");
    if (!form) return;
    try {
    const on = {};
    form.querySelectorAll("input[data-layer]").forEach((inp) => {
      on[inp.getAttribute("data-layer")] = inp.checked;
    });
    setMarkerVis(fireMarkers, !!on.fires);
    setMarkerVis(lakeMarkers, !!on.lakes);
    setMarkerVis(nixleActiveMarkers, on.nixle !== false);
    setMarkerVis(nixleClosedMarkers, !!on["nixle-closed"]);
    (on.perimeters ? layerOn : layerOff)("perimeters-fill");
    (on.perimeters ? layerOn : layerOff)("perimeters-line");
    setMarkerVis(snowMarkers, !!on.snowpack);
    setMarkerVis(roadMarkers, !!on.roads);
    (on.roads ? layerOn : layerOff)("roads-line");
    Object.keys(planeMarkers).forEach((id) => {
      const rec = planeMarkers[id];
      setMarkerVis(rec && rec.marker ? [rec.marker] : [], !!on.planes);
    });
    if (on.radar) layerOn("radar");
    else layerOff("radar");
    const aqiOn = !!on.aqi;
    (aqiOn ? layerOn : layerOff)("aqi-fill");
    layerOff("aqi-monitors");
    layerOff("aqi-monitor-label");
    setMarkerVis(aqiMarkers, aqiOn);
    (on.region ? layerOn : layerOff)("region-fill");
    (on.region ? layerOn : layerOff)("region-line");
    (on.publicland ? layerOn : layerOff)("publicland");
    (on.flood ? layerOn : layerOff)("flood");
    (on.wetlands ? layerOn : layerOff)("wetlands");
    (on.hunt ? layerOn : layerOff)("hunt-fill");
    (on.hunt ? layerOn : layerOff)("hunt-pattern");
    (on.hunt ? layerOn : layerOff)("hunt-line");
    (on.hunt ? layerOn : layerOff)("hunt-label");
    (on.quakes ? layerOn : layerOff)("quakes-felt");
    (on.quakes ? layerOn : layerOff)("quakes-felt-line");
    (on.quakes ? layerOn : layerOff)("quakes");
    (on.quakes ? layerOn : layerOff)("quakes-core");
    (on.quakes ? layerOn : layerOff)("quakes-label");
    (on.airports ? layerOn : layerOff)("airports");
    (on.towers ? layerOn : layerOff)("towers");
    (on.towers ? layerOn : layerOff)("towers-label");
    document.querySelectorAll("#sit-legends [data-leg]").forEach((el) => {
      const id = el.getAttribute("data-leg");
      el.hidden = !on[id];
    });
    } catch (e) {}
  }

  function addEmpty(id) {
    if (map.getSource(id)) return;
    map.addSource(id, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }

  function addOverlayLayers() {
    addEmpty("perimeters");
    addEmpty("aqi");
    addEmpty("monitors");
    if (!map.getLayer("aqi-fill")) {
      map.addLayer({
        id: "aqi-fill",
        type: "fill",
        source: "aqi",
        paint: { "fill-color": AQI_COLOR, "fill-opacity": 0.38 },
      });
    }
    if (!map.getLayer("perimeters-fill")) {
      map.addLayer({
        id: "perimeters-fill",
        type: "fill",
        source: "perimeters",
        paint: { "fill-color": "#c45a22", "fill-opacity": 0.28 },
      });
    }
    if (!map.getLayer("perimeters-line")) {
      map.addLayer({
        id: "perimeters-line",
        type: "line",
        source: "perimeters",
        paint: { "line-color": "#c45a22", "line-width": 2 },
      });
    }
    if (!map.getLayer("aqi-monitors")) {
      map.addLayer({
        id: "aqi-monitors",
        type: "circle",
        source: "monitors",
        paint: {
          "circle-radius": 11,
          "circle-color": [
            "step",
            ["coalesce", ["get", "PM25_AQI"], 0],
            "#00e400",
            51,
            "#ffff00",
            101,
            "#ff7e00",
            151,
            "#ff0000",
            201,
            "#8f3f97",
            301,
            "#7e0023",
          ],
          "circle-stroke-width": 1.4,
          "circle-stroke-color": "#141816",
        },
      });
    }
    if (!map.getLayer("aqi-monitor-label")) {
      try {
        map.addLayer({
          id: "aqi-monitor-label",
          type: "symbol",
          source: "monitors",
          layout: {
            "text-field": ["to-string", ["coalesce", ["get", "PM25_AQI"], ""]],
            "text-size": 10,
          },
          paint: { "text-color": "#141816" },
        });
      } catch (e) {}
    }
    if (!map.getSource("radar")) {
      map.addSource("radar", {
        type: "raster",
        tiles: [
          "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "NWS NEXRAD · Iowa State",
      });
    }
    if (!map.getLayer("radar")) {
      map.addLayer({
        id: "radar",
        type: "raster",
        source: "radar",
        paint: { "raster-opacity": 0.55 },
      });
    }
    if (!map.getSource("region")) {
      map.addSource("region", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [REGION_RING] },
        },
      });
    }
    if (!map.getLayer("region-fill")) {
      map.addLayer({
        id: "region-fill",
        type: "fill",
        source: "region",
        paint: { "fill-color": "#1c5c4a", "fill-opacity": 0.04 },
      });
    }
    if (!map.getLayer("region-line")) {
      map.addLayer({
        id: "region-line",
        type: "line",
        source: "region",
        paint: { "line-color": "#1c5c4a", "line-width": 2, "line-dasharray": [2, 1] },
      });
    }
    if (!map.getSource("roads-line")) {
      const feats = (roads || [])
        .filter((rd) => Array.isArray(rd.line) && rd.line.length >= 2)
        .map((rd) => ({
          type: "Feature",
          properties: { title: rd.title || "", road: rd.road || "", origin: rd.origin || "" },
          geometry: { type: "LineString", coordinates: rd.line },
        }));
      map.addSource("roads-line", {
        type: "geojson",
        data: { type: "FeatureCollection", features: feats },
      });
    }
    if (!map.getLayer("roads-line")) {
      map.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads-line",
        paint: { "line-color": "#e0a106", "line-width": 4, "line-opacity": 0.88 },
      });
    }
    function addExportRaster(id, url, opacity) {
      if (!map.getSource(id)) {
        map.addSource(id, {
          type: "raster",
          tiles: [url],
          tileSize: 256,
        });
      }
      if (!map.getLayer(id)) {
        map.addLayer({
          id: id,
          type: "raster",
          source: id,
          paint: { "raster-opacity": opacity },
          layout: { visibility: "none" },
        });
      }
    }
    addExportRaster(
      "publicland",
      "https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_with_PriUnk/MapServer/tile/{z}/{y}/{x}",
      0.55
    );
    addExportRaster(
      "flood",
      "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&dpi=96&format=png32&transparent=true&layers=show:28&f=image",
      0.45
    );
    addExportRaster(
      "wetlands",
      "https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image",
      0.4
    );
    addEmpty("hunt");
    function huntPatternImage(kind, color, opt) {
      const s = 32;
      const cnv = document.createElement("canvas");
      cnv.width = s;
      cnv.height = s;
      const ctx = cnv.getContext("2d");
      const h = color.replace("#", "");
      const n = parseInt(h, 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      const ink = "rgba(" + r + "," + g + "," + b + ",0.92)";
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",0.12)";
      ctx.fillRect(0, 0, s, s);
      if (kind === "stripe") {
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (opt === 0) {
          for (let y = 3; y < s; y += 8) {
            ctx.moveTo(0, y);
            ctx.lineTo(s, y);
          }
        } else if (opt === -45) {
          for (let i = -s; i < s * 2; i += 8) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i + s, s);
          }
        } else {
          for (let i = -s; i < s * 2; i += 8) {
            ctx.moveTo(i, s);
            ctx.lineTo(i + s, 0);
          }
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = ink;
        const step = opt === "dense" ? 8 : 10;
        const rad = opt === "dense" ? 1.7 : 2.2;
        for (let y = step / 2; y < s; y += step) {
          for (let x = step / 2; x < s; x += step) {
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      return ctx.getImageData(0, 0, s, s);
    }
    [
      ["gmu-pat-1", "stripe", "#1a5c32", 45],
      ["gmu-pat-2", "dot", "#4caf50", ""],
      ["gmu-pat-3", "stripe", "#0e6b5c", -45],
      ["gmu-pat-4", "dot", "#8bc34a", "dense"],
      ["gmu-pat-4a", "stripe", "#2e8b6e", 0],
      ["gmu-pat-x", "dot", "#2f7a4a", ""],
    ].forEach((row) => {
      if (map.hasImage(row[0])) map.removeImage(row[0]);
      map.addImage(row[0], huntPatternImage(row[1], row[2], row[3]), { pixelRatio: 2 });
    });
    addEmpty("quakes");
    addEmpty("quakes-felt");
    addEmpty("airports");
    addEmpty("towers");
    if (!map.getLayer("hunt-fill")) {
      map.addLayer({
        id: "hunt-fill",
        type: "fill",
        source: "hunt",
        paint: {
          "fill-color": [
            "match",
            ["to-string", ["get", "NAME"]],
            "1",
            "#1a5c32",
            "2",
            "#4caf50",
            "3",
            "#0e6b5c",
            "4",
            "#8bc34a",
            "4A",
            "#2e8b6e",
            "#2f7a4a",
          ],
          "fill-opacity": 0.22,
        },
        layout: { visibility: "none" },
      });
    }
    if (!map.getLayer("hunt-pattern")) {
      map.addLayer({
        id: "hunt-pattern",
        type: "fill",
        source: "hunt",
        paint: {
          "fill-pattern": [
            "match",
            ["to-string", ["get", "NAME"]],
            "1",
            "gmu-pat-1",
            "2",
            "gmu-pat-2",
            "3",
            "gmu-pat-3",
            "4",
            "gmu-pat-4",
            "4A",
            "gmu-pat-4a",
            "gmu-pat-x",
          ],
          "fill-opacity": 0.72,
        },
        layout: { visibility: "none" },
      });
    }
    if (!map.getLayer("hunt-line")) {
      map.addLayer({
        id: "hunt-line",
        type: "line",
        source: "hunt",
        paint: { "line-color": "#163f34", "line-width": 1.4 },
        layout: { visibility: "none" },
      });
    }
    if (!map.getLayer("hunt-label")) {
      try {
        map.addLayer({
          id: "hunt-label",
          type: "symbol",
          source: "hunt",
          minzoom: 7,
          layout: {
            "text-field": ["concat", "GMU ", ["to-string", ["coalesce", ["get", "NAME"], ""]]],
            "text-size": 12,
            "text-font": ["Noto Sans Regular", "Open Sans Regular"],
            "text-anchor": "center",
          },
          paint: {
            "text-color": "#163f34",
            "text-halo-color": "#fffcf7",
            "text-halo-width": 1.4,
          },
        });
        map.setLayoutProperty("hunt-label", "visibility", "none");
      } catch (e) {}
    }
    if (!map.getLayer("quakes-felt")) {
      map.addLayer({
        id: "quakes-felt",
        type: "fill",
        source: "quakes-felt",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["to-number", ["get", "cdi"]], 2],
            2,
            "#acd8e9",
            3.5,
            "#83d0da",
            4.5,
            "#7bc87f",
            5.5,
            "#f9f518",
            6.5,
            "#fac612",
            7.5,
            "#fa8a11",
            8.5,
            "#f7100c",
            9.5,
            "#ff0000",
          ],
          "fill-opacity": 0.42,
        },
      });
    }
    if (!map.getLayer("quakes-felt-line")) {
      map.addLayer({
        id: "quakes-felt-line",
        type: "line",
        source: "quakes-felt",
        paint: {
          "line-color": "#6a3a28",
          "line-width": 0.8,
          "line-opacity": 0.45,
        },
      });
    }
    if (!map.getLayer("quakes")) {
      map.addLayer({
        id: "quakes",
        type: "circle",
        source: "quakes",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["coalesce", ["to-number", ["get", "mag"]], 1], 1, 6, 3, 10, 5, 16],
          "circle-color": "#c45a22",
          "circle-opacity": 0.22,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#7a2e12",
        },
      });
    }
    if (!map.getLayer("quakes-core")) {
      map.addLayer({
        id: "quakes-core",
        type: "circle",
        source: "quakes",
        paint: {
          "circle-radius": 3.4,
          "circle-color": "#1a1814",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#fffcf7",
        },
      });
    }
    if (!map.getLayer("quakes-label")) {
      try {
        map.addLayer({
          id: "quakes-label",
          type: "symbol",
          source: "quakes",
          layout: {
            "text-field": ["concat", "M", ["get", "magLabel"]],
            "text-size": 11,
            "text-offset": [0, 1.15],
            "text-anchor": "top",
            "text-font": ["Noto Sans Regular", "Open Sans Regular"],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#1a1814",
            "text-halo-color": "#fffcf7",
            "text-halo-width": 1.4,
          },
        });
      } catch (e) {}
    }
    if (!map.getLayer("airports")) {
      map.addLayer({
        id: "airports",
        type: "circle",
        source: "airports",
        paint: {
          "circle-radius": 5,
          "circle-color": "#1c5c4a",
          "circle-stroke-width": 1.2,
          "circle-stroke-color": "#fffcf7",
        },
      });
    }
    if (!map.getLayer("towers")) {
      map.addLayer({
        id: "towers",
        type: "circle",
        source: "towers",
        paint: {
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "kind"],
            "ranger station",
            "#1c5c4a",
            "lookout",
            "#c45a22",
            "#5b4a8a",
          ],
          "circle-stroke-width": 1.2,
          "circle-stroke-color": "#fffcf7",
        },
        layout: { visibility: "none" },
      });
    }
    if (!map.getLayer("towers-label")) {
      try {
        map.addLayer({
          id: "towers-label",
          type: "symbol",
          source: "towers",
          minzoom: 8,
          layout: {
            "text-field": ["coalesce", ["get", "name"], ["get", "kind"]],
            "text-size": 11,
            "text-offset": [0, 1.15],
            "text-anchor": "top",
            "text-font": ["Noto Sans Regular", "Open Sans Regular"],
            "text-optional": true,
          },
          paint: {
            "text-color": "#2a2438",
            "text-halo-color": "#fffcf7",
            "text-halo-width": 1.4,
          },
        });
        map.setLayoutProperty("towers-label", "visibility", "none");
      } catch (e) {}
    }
  }

  function loadArc(id, url) {
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((gj) => {
        if (!gj || gj.type !== "FeatureCollection" || !map.getSource(id)) return;
        map.getSource(id).setData(gj);
      })
      .catch(function () {});
  }

  function loadOverlays() {
    try {
      addOverlayLayers();
    } catch (e) {}
    loadArc(
      "perimeters",
      "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query?where=1=1&geometry=" +
        encodeURIComponent(BBOX) +
        "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=poly_IncidentName,poly_GISAcres,attr_PercentContained,attr_POOCounty,attr_POOState&f=geojson&outSR=4326&geometryPrecision=4&resultRecordCount=80"
    );
    loadArc(
      "hunt",
      "https://gisportal-idfg.idaho.gov/hosting/rest/services/Hunting/MapServer/3/query?where=1=1&geometry=" +
        encodeURIComponent(BBOX) +
        "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME,Elk_Zone&f=geojson&outSR=4326&geometryPrecision=4&resultRecordCount=80"
    );
    applyToggles();
    refreshLive();
  }

  function viewEnvelope() {
    const b = map.getBounds();
    return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(",");
  }

  function loadQuakes() {
    const box = document.querySelector('input[data-layer="quakes"]');
    if (box && !box.checked) return;
    if (typeof map.getBounds !== "function") return;
    const b = map.getBounds();
    const pad = 2.2;
    const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const q =
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" +
      start +
      "&minmagnitude=1&orderby=time&limit=80" +
      "&minlatitude=" + (b.getSouth() - pad) +
      "&maxlatitude=" + (b.getNorth() + pad) +
      "&minlongitude=" + (b.getWest() - pad) +
      "&maxlongitude=" + (b.getEast() + pad);
    fetch(q)
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (!raw) return;
        const epic = {
          type: "FeatureCollection",
          features: (raw.features || []).map(function (f) {
            const c = (f.geometry && f.geometry.coordinates) || [];
            const p = f.properties || {};
            const mag = p.mag;
            return {
              type: "Feature",
              geometry: { type: "Point", coordinates: [c[0], c[1]] },
              properties: {
                id: f.id,
                mag: mag,
                magLabel: mag != null ? Number(mag).toFixed(1) : "—",
                place: p.place || "",
                time: p.time,
                felt: p.felt || 0,
                url: p.url || "",
              },
            };
          }),
        };
        if (map.getSource("quakes")) map.getSource("quakes").setData(epic);
      })
      .catch(function () {});
  }

  function aqiColor(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "#9aa39c";
    if (n <= 50) return "#00e400";
    if (n <= 100) return "#ffff00";
    if (n <= 150) return "#ff7e00";
    if (n <= 200) return "#ff0000";
    if (n <= 300) return "#8f3f97";
    return "#7e0023";
  }

  function aqiCategory(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "No data";
    if (n <= 50) return "Good";
    if (n <= 100) return "Moderate";
    if (n <= 150) return "Sensitive groups";
    if (n <= 200) return "Unhealthy";
    if (n <= 300) return "Very unhealthy";
    return "Hazardous";
  }

  function aqiNode(p) {
    const n = document.createElement("div");
    const val = p.PM25_AQI;
    const num = Number(val);
    const dark = Number.isFinite(num) && num >= 151;
    n.className = "ico-aqi" + (dark ? " is-dark" : "");
    const name = p.SiteName || "Monitor";
    const shown = Number.isFinite(num) ? String(Math.round(num)) : "—";
    const cat = aqiCategory(val);
    n.innerHTML =
      '<span class="aqi-dot" style="background:' +
      aqiColor(val) +
      '">' +
      shown +
      "</span>" +
      '<div class="aqi-tag"><span>' +
      name +
      "</span><b>AQI " +
      shown +
      "</b><em>" +
      cat +
      "</em></div>";
    return n;
  }

  function clearAqiMarkers() {
    aqiMarkers.forEach((m) => {
      try {
        m.remove();
      } catch (e) {}
    });
    aqiMarkers.length = 0;
  }

  function syncAqiMarkers(features) {
    clearAqiMarkers();
    (features || []).forEach((f) => {
      const c = (f.geometry && f.geometry.coordinates) || [];
      if (!validLL(c[1], c[0])) return;
      const p = f.properties || {};
      const el = aqiNode(p);
      const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([c[0], c[1]])
        .setPopup(
          new maplibregl.Popup({ offset: 18, maxWidth: "260px" }).setHTML(
            popupHtml(
              p.SiteName || "AirNow monitor",
              `<p>AQI ${p.PM25_AQI ?? "—"} · ${aqiCategory(p.PM25_AQI)}</p><p>PM2.5 ${
                p.PM25 != null && p.PM25 !== "" ? p.PM25 : "—"
              } µg/m³</p><p>AirNow</p>`
            )
          )
        )
        .addTo(map);
      aqiMarkers.push(m);
    });
    applyToggles();
  }

  function loadAqiView() {
    const box = document.querySelector('input[data-layer="aqi"]');
    if (box && !box.checked) {
      clearAqiMarkers();
      return;
    }
    const env = encodeURIComponent(viewEnvelope());
    loadArc(
      "aqi",
      "https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/AirNowLatestContoursCombined/FeatureServer/0/query?where=1=1&geometry=" +
        env +
        "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=gridcode&f=geojson&outSR=4326&geometryPrecision=3&maxAllowableOffset=0.02&resultRecordCount=400"
    );
    const monUrl =
      "https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/Air_Now_Current_Monitors_PM25/FeatureServer/0/query?where=1=1&geometry=" +
      env +
      "&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=SiteName,PM25_AQI,PM25_AQI_LABEL,PM25,ValidTime&f=geojson&outSR=4326&resultRecordCount=80";
    fetch(monUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((gj) => {
        if (!gj || gj.type !== "FeatureCollection") return;
        if (map.getSource("monitors")) map.getSource("monitors").setData(gj);
        syncAqiMarkers(gj.features || []);
      })
      .catch(function () {});
  }

  function tagPhone(tags) {
    return tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags["emergency:phone"] || "";
  }

  function towerKind(tags) {
    const t = tags || {};
    const blob = ((t.name || "") + " " + (t["tower:type"] || "") + " " + (t.man_made || "")).toLowerCase();
    if (t.amenity === "ranger_station" || t.office === "ranger" || t.office === "forest_ranger") return "ranger station";
    if (
      t.building === "fire_lookout" ||
      t.man_made === "fire_lookout" ||
      /observation|watch/.test(t["tower:type"] || "") ||
      blob.indexOf("lookout") >= 0
    ) {
      return "lookout";
    }
    return "radio";
  }

  function osmToFc(elements, pred, asTower) {
    const features = [];
    (elements || []).forEach((el) => {
      const lat = el.lat || (el.center && el.center.lat);
      const lon = el.lon || (el.center && el.center.lon);
      if (!validLL(lat, lon)) return;
      const tags = el.tags || {};
      if (pred && !pred(tags)) return;
      const props = {
        name: tags.name || tags.ref || tags.icao || tags.iata || tags["tower:type"] || tags.aeroway || "",
        kind: asTower ? towerKind(tags) : tags.aeroway || tags["tower:type"] || tags.man_made || "",
        phone: tagPhone(tags),
        operator: tags.operator || tags.owner || tags.brand || "",
        website: tags.website || tags["contact:website"] || "",
        frequency: tags.frequency || tags["communication:radio"] || "",
        callsign: tags.callsign || "",
        icao: tags.icao || "",
        iata: tags.iata || "",
      };
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: props,
      });
    });
    return { type: "FeatureCollection", features: features };
  }

  function upsertPoint(fc, a) {
    if (!fc || !validLL(a.lat, a.lon)) return;
    const hit = (fc.features || []).find((f) => {
      const c = (f.geometry && f.geometry.coordinates) || [];
      return Math.abs(c[0] - a.lon) < 0.015 && Math.abs(c[1] - a.lat) < 0.015;
    });
    if (hit) {
      const p = hit.properties || (hit.properties = {});
      if (a.phone && !p.phone) p.phone = a.phone;
      if (a.name && (!p.name || p.name.length < a.name.length)) p.name = a.name;
      if (a.operator && !p.operator) p.operator = a.operator;
      if (a.kind) p.kind = a.kind;
      if (a.icao && !p.icao) p.icao = a.icao;
      return;
    }
    fc.features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [a.lon, a.lat] },
      properties: {
        name: a.name || "",
        kind: a.kind || "",
        phone: a.phone || "",
        operator: a.operator || "",
        website: a.website || "",
        frequency: a.frequency || "",
        callsign: a.callsign || "",
        icao: a.icao || "",
        iata: a.iata || "",
      },
    });
  }

  function loadOsmExtras() {
    if (map.getZoom() < 7.5) return;
    const b = map.getBounds();
    const bb = b.getSouth() + "," + b.getWest() + "," + b.getNorth() + "," + b.getEast();
    const q =
      "[out:json][timeout:25];(" +
      "nwr[\"aeroway\"~\"aerodrome|helipad\"](" + bb + ");" +
      "nwr[\"tower:type\"=\"communication\"](" + bb + ");" +
      "nwr[\"man_made\"=\"communications_tower\"](" + bb + ");" +
      "nwr[\"tower:type\"=\"observation\"](" + bb + ");" +
      "nwr[\"tower:type\"=\"watchtower\"](" + bb + ");" +
      "nwr[\"building\"=\"fire_lookout\"](" + bb + ");" +
      "nwr[\"man_made\"=\"fire_lookout\"](" + bb + ");" +
      "nwr[\"amenity\"=\"ranger_station\"](" + bb + ");" +
      "nwr[\"office\"=\"ranger\"](" + bb + ");" +
      "nwr[\"man_made\"=\"tower\"][\"name\"~\"Lookout\"](" + bb + ");" +
      ");out center 250;";
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(q),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || !d.elements) return;
        const air = osmToFc(d.elements, (t) => t.aeroway, false);
        const tw = osmToFc(
          d.elements,
          (t) =>
            t["tower:type"] ||
            t.man_made === "communications_tower" ||
            t.man_made === "fire_lookout" ||
            t.building === "fire_lookout" ||
            t.amenity === "ranger_station" ||
            t.office === "ranger" ||
            (t.man_made === "tower" && /lookout/i.test(t.name || "")),
          true
        );
        const extraAir = [
          { name: "Sandpoint Airport (SZT)", phone: "208-263-4037", icao: "KSZT", lon: -116.56, lat: 48.2995, kind: "aerodrome" },
          { name: "Priest River Municipal (1S6)", phone: "208-448-2112", lon: -116.909, lat: 48.19, kind: "aerodrome" },
          { name: "Boundary County (65S)", phone: "208-267-3102", lon: -116.308, lat: 48.726, kind: "aerodrome" },
        ];
        extraAir.forEach((a) => upsertPoint(air, a));
        const extraTowers = [
          {
            name: "Sandpoint Ranger District",
            kind: "ranger station",
            phone: "208-263-5111",
            operator: "Idaho Panhandle National Forests",
            lon: -116.5585,
            lat: 48.2704,
          },
          {
            name: "Priest Lake Ranger District",
            kind: "ranger station",
            phone: "208-443-2512",
            operator: "Idaho Panhandle National Forests",
            lon: -116.9094,
            lat: 48.1807,
          },
          {
            name: "Bonners Ferry Ranger District",
            kind: "ranger station",
            phone: "208-267-5561",
            operator: "Idaho Panhandle National Forests",
            lon: -116.316,
            lat: 48.6972,
          },
        ];
        extraTowers.forEach((a) => upsertPoint(tw, a));
        if (map.getSource("airports")) map.getSource("airports").setData(air);
        if (map.getSource("towers")) map.getSource("towers").setData(tw);
      })
      .catch(function () {});
  }

  function refreshLive() {
    loadAqiView();
    loadQuakes();
    loadOsmExtras();
    pollFlights();
  }

  map.on("error", function () {});
  map.on("style.load", function () {
    try {
      addMarkers();
      loadOverlays();
    } catch (e) {}
    overlaysReady = true;
    fitMap();
  });

  map.on("click", "perimeters-fill", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    new maplibregl.Popup({ offset: 12, maxWidth: "260px" })
      .setLngLat(e.lngLat)
      .setHTML(
        popupHtml(
          (p.poly_IncidentName || "Fire") + " perimeter",
          `<p>${p.attr_POOCounty || ""} · ${
            p.poly_GISAcres != null ? Number(p.poly_GISAcres).toFixed(0) + " ac" : ""
          } · ${p.attr_PercentContained != null ? p.attr_PercentContained + "% contained" : ""}</p>`
        )
      )
      .addTo(map);
  });
  map.on("click", "aqi-monitors", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    new maplibregl.Popup({ offset: 12, maxWidth: "240px" })
      .setLngLat(e.lngLat)
      .setHTML(
        popupHtml(
          p.SiteName || "Monitor",
          `<p>AQI ${p.PM25_AQI ?? "—"} · ${p.PM25_AQI_LABEL || "PM2.5"}</p>`
        )
      )
      .addTo(map);
  });
  map.on("mouseenter", "perimeters-fill", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "perimeters-fill", function () {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseenter", "aqi-monitors", function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "aqi-monitors", function () {
    map.getCanvas().style.cursor = "";
  });
  function quakePopup(p, title) {
    const bits = [];
    if (p.place) bits.push(p.place);
    if (p.when) bits.push(p.when);
    if (p.depth_km != null && p.depth_km !== "") bits.push(Number(p.depth_km).toFixed(1) + " km deep");
    if (p.felt) bits.push(p.felt + " felt reports");
    if (p.cdi != null && p.cdi !== "") bits.push("intensity " + p.cdi);
    bits.push("USGS");
    const links = p.url ? [{ title: "USGS event", url: p.url }] : [];
    return popupHtml(title, "<p>" + bits.join(" · ") + "</p>", links);
  }
  map.on("click", "quakes", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    new maplibregl.Popup({ offset: 10, maxWidth: "280px" })
      .setLngLat(e.lngLat)
      .setHTML(quakePopup(p, "M" + (p.magLabel || p.mag || "—") + " epicenter"))
      .addTo(map);
  });
  map.on("click", "quakes-core", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    new maplibregl.Popup({ offset: 10, maxWidth: "280px" })
      .setLngLat(e.lngLat)
      .setHTML(quakePopup(p, "M" + (p.magLabel || p.mag || "—") + " epicenter"))
      .addTo(map);
  });
  map.on("click", "quakes-felt", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    const mmi = p.cdi != null ? "MMI " + p.cdi : "felt";
    new maplibregl.Popup({ offset: 10, maxWidth: "280px" })
      .setLngLat(e.lngLat)
      .setHTML(quakePopup(p, mmi + (p.magLabel ? " · M" + p.magLabel : "")))
      .addTo(map);
  });
  ["quakes", "quakes-core", "quakes-felt"].forEach(function (id) {
    map.on("mouseenter", id, function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", id, function () {
      map.getCanvas().style.cursor = "";
    });
  });
  function huntPopup(e) {
    const f = e.features && e.features[0];
    if (!f) return;
    const p = f.properties || {};
    new maplibregl.Popup({ offset: 10, maxWidth: "280px" })
      .setLngLat(e.lngLat)
      .setHTML(
        popupHtml(
          "GMU " + (p.NAME || p.Name_sort || ""),
          `<p>Game Management Unit — Idaho Fish &amp; Game hunting district.</p><p>Elk zone: ${p.Elk_Zone || "—"}</p><p>Seasons, weapon type, tags, and bag limits are set by this unit.</p>`
        )
      )
      .addTo(map);
  }
  map.on("click", "hunt-fill", huntPopup);
  map.on("click", "hunt-pattern", huntPopup);
  ["hunt-fill", "hunt-pattern"].forEach(function (id) {
    map.on("mouseenter", id, function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", id, function () {
      map.getCanvas().style.cursor = "";
    });
  });
  const hoverPop = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, maxWidth: "260px" });
  function airportHtml(p) {
    const name = p.name || "Airstrip";
    const bits = [];
    if (p.icao) bits.push(p.icao);
    if (p.kind) bits.push(p.kind);
    let extra = bits.length ? `<p>${bits.join(" · ")}</p>` : "";
    if (p.phone) extra += `<p><a href="tel:${p.phone}">${p.phone}</a></p>`;
    else extra += "<p>No phone on file</p>";
    return popupHtml(name, extra);
  }
  map.on("mousemove", "airports", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    map.getCanvas().style.cursor = "pointer";
    hoverPop.setLngLat(e.lngLat).setHTML(airportHtml(f.properties || {})).addTo(map);
  });
  map.on("mouseleave", "airports", function () {
    map.getCanvas().style.cursor = "";
    hoverPop.remove();
  });
  map.on("click", "airports", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    new maplibregl.Popup({ offset: 12, maxWidth: "260px" })
      .setLngLat(e.lngLat)
      .setHTML(airportHtml(f.properties || {}))
      .addTo(map);
  });
  function towerHtml(p) {
    const name = p.name || (p.kind === "ranger station" ? "Ranger station" : p.kind === "lookout" ? "Lookout" : "Radio / tower");
    const bits = [];
    if (p.kind) bits.push(p.kind);
    if (p.operator) bits.push(p.operator);
    if (p.callsign) bits.push(p.callsign);
    if (p.frequency) bits.push(p.frequency);
    let extra = bits.length ? `<p>${bits.join(" · ")}</p>` : "";
    if (p.phone) extra += `<p><a href="tel:${String(p.phone).replace(/[^\d+]/g, "")}">${p.phone}</a></p>`;
    else extra += "<p>No phone on file</p>";
    const links = p.website ? [{ title: "Website", url: p.website }] : [];
    return popupHtml(name, extra, links);
  }
  map.on("mousemove", "towers", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    map.getCanvas().style.cursor = "pointer";
    hoverPop.setLngLat(e.lngLat).setHTML(towerHtml(f.properties || {})).addTo(map);
  });
  map.on("mouseleave", "towers", function () {
    map.getCanvas().style.cursor = "";
    hoverPop.remove();
  });
  map.on("click", "towers", function (e) {
    const f = e.features && e.features[0];
    if (!f) return;
    new maplibregl.Popup({ offset: 12, maxWidth: "280px" })
      .setLngLat(e.lngLat)
      .setHTML(towerHtml(f.properties || {}))
      .addTo(map);
  });

  const form = document.getElementById("sit-layers");
  if (form) {
    form.addEventListener("change", function () {
      applyToggles();
      refreshLive();
    });
    form.querySelectorAll("[data-base]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const next = btn.getAttribute("data-base");
        if (next === currentBase) return;
        currentBase = next;
        form.querySelectorAll("[data-base]").forEach((b) => b.classList.toggle("on", b === btn));
        const styles = { streets: STYLE_STREETS, sat: STYLE_SAT, topo: STYLE_TOPO };
        map.setStyle(styles[next] || STYLE_STREETS);
      });
    });
  }

  function loadRadar() {
    applyToggles();
  }

  const PLANE_SVG =
    '<svg class="plane-rot" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="#fffcf7" stroke-width="1.1" stroke-linejoin="round" d="M12 1.6 L15.1 10.4 L22.8 12.4 L15.1 13.7 L13.7 21.6 L12 19.2 L10.3 21.6 L8.9 13.7 L1.2 12.4 L8.9 10.4 Z"/></svg>';

  function planeNode(hdg) {
    const n = document.createElement("div");
    n.className = "ico-plane";
    n.innerHTML = PLANE_SVG;
    const rot = n.querySelector(".plane-rot");
    if (rot) rot.style.transform = "rotate(" + (Number.isFinite(hdg) ? hdg : 0) + "deg)";
    return n;
  }

  function planeHtml(s) {
    const title = s.summary || s.flight || s.call || s.icao;
    const bits = [];
    if (s.route) bits.push(s.route);
    if (s.airline && !String(title).includes(s.airline.split(" ")[0])) bits.push(s.airline);
    bits.push(
      s.onground ? "on ground" : Math.round((s.alt_m || 0) * 3.281) + " ft"
    );
    if (s.spd != null) bits.push(Math.round(s.spd * 1.94384) + " kt");
    bits.push("OpenSky");
    return popupHtml(title, "<p>" + bits.join(" · ") + "</p>");
  }

  function upsertPlanes(states) {
    const seen = {};
    (states || []).forEach((s) => {
      if (!validLL(s.lat, s.lon)) return;
      seen[s.icao] = true;
      let rec = planeMarkers[s.icao];
      const parsed = Number(s.hdg);
      const hdg =
        s.hdg == null || !Number.isFinite(parsed) ? (rec && rec.hdg) || 0 : parsed;
      if (!rec) {
        const eln = planeNode(hdg);
        const m = new maplibregl.Marker({ element: eln, anchor: "center" })
          .setLngLat([s.lon, s.lat])
          .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: "280px" }).setHTML(planeHtml(s)))
          .addTo(map);
        eln.addEventListener("mouseenter", function () {
          const p = m.getPopup();
          if (p && !p.isOpen()) m.togglePopup();
        });
        eln.addEventListener("mouseleave", function () {
          const p = m.getPopup();
          if (p && p.isOpen()) m.togglePopup();
        });
        rec = { marker: m };
        planeMarkers[s.icao] = rec;
      }
      rec.lat0 = s.lat;
      rec.lon0 = s.lon;
      rec.hdg = hdg;
      rec.spd = s.spd || 0;
      rec.onground = s.onground;
      rec.t0 = performance.now();
      rec.marker.setLngLat([s.lon, s.lat]);
      const elp = rec.marker.getElement();
      const rot = elp && elp.querySelector(".plane-rot");
      if (rot) rot.style.transform = "rotate(" + hdg + "deg)";
      const pop = rec.marker.getPopup && rec.marker.getPopup();
      if (pop) pop.setHTML(planeHtml(s));
    });
    Object.keys(planeMarkers).forEach((id) => {
      if (seen[id]) return;
      planeMarkers[id].marker.remove();
      delete planeMarkers[id];
    });
    applyToggles();
  }

  function bakedFlights() {
    try {
      const raw = (document.getElementById("flights-data") || {}).textContent || "";
      const d = JSON.parse(raw || "{}");
      return d.states || [];
    } catch (e) {
      return [];
    }
  }

  function pollFlights() {
    const box = document.querySelector('input[data-layer="planes"]');
    if (box && !box.checked) return;
    const baked = bakedFlights();
    if (location.protocol === "file:") {
      if (baked.length) upsertPlanes(baked);
      return;
    }
    if (typeof map.getBounds !== "function") {
      if (baked.length) upsertPlanes(baked);
      return;
    }
    const b = map.getBounds();
    const q =
      "/api/flights?lamin=" +
      b.getSouth() +
      "&lomin=" +
      b.getWest() +
      "&lamax=" +
      b.getNorth() +
      "&lomax=" +
      b.getEast();
    fetch(q)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.states && d.states.length) upsertPlanes(d.states);
        else if (baked.length) upsertPlanes(baked);
      })
      .catch(function () {
        if (baked.length) upsertPlanes(baked);
      });
  }

  function flyTick(now) {
    const R = 6371000;
    Object.keys(planeMarkers).forEach((id) => {
      const p = planeMarkers[id];
      if (!p || p.onground || !p.spd || p.spd < 5) return;
      const dt = (now - p.t0) / 1000;
      const dist = p.spd * Math.min(dt, 12);
      const brng = ((p.hdg || 0) * Math.PI) / 180;
      const lat1 = (p.lat0 * Math.PI) / 180;
      const lon1 = (p.lon0 * Math.PI) / 180;
      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(dist / R) + Math.cos(lat1) * Math.sin(dist / R) * Math.cos(brng)
      );
      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(brng) * Math.sin(dist / R) * Math.cos(lat1),
          Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2)
        );
      const nlat = (lat2 * 180) / Math.PI;
      const nlon = (lon2 * 180) / Math.PI;
      if (validLL(nlat, nlon) && p.marker) p.marker.setLngLat([nlon, nlat]);
    });
    requestAnimationFrame(flyTick);
  }

  map.on("style.load", function () {
    loadRadar();
    pollFlights();
  });
  let moveTimer;
  map.on("moveend", function () {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(refreshLive, 900);
  });
  setInterval(pollFlights, 10000);
  setInterval(loadQuakes, 5 * 60 * 1000);
  requestAnimationFrame(flyTick);
})();
