(function () {
  const el = document.getElementById("feed-map");
  if (!el) return;

  function readJson(id) {
    const n = document.getElementById(id);
    if (!n) return null;
    try {
      return JSON.parse(n.textContent || "null");
    } catch (e) {
      return null;
    }
  }

  const cameras = readJson("cameras-data") || [];
  const CENTER = [-116.55, 48.27];
  const CAM_SVG =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2" fill="currentColor"/><path fill="currentColor" d="M20 14l8-4v12l-8-4z"/><circle cx="12" cy="16" r="3.2" fill="#fffcf7"/></svg>';

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

  if (typeof maplibregl === "undefined") {
    el.innerHTML = '<p class="map-fallback">Map library did not load.</p>';
    return;
  }

  const map = new maplibregl.Map({
    container: el,
    style: STYLE_TOPO,
    center: CENTER,
    zoom: 8.4,
    minZoom: 2,
    maxZoom: 18,
    attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

  const watch = document.getElementById("feed-active");
  const empty = document.getElementById("feed-empty");
  const media = document.getElementById("feed-media");
  const titleEl = document.getElementById("feed-title");
  const placeEl = document.getElementById("feed-place");
  const condEl = document.getElementById("feed-conditions");
  const noteEl = document.getElementById("feed-note");
  const creditEl = document.getElementById("feed-credit");
  const listEl = document.getElementById("feed-list");

  const markers = {};
  let selected = null;
  let stillTimer = null;

  function validLL(lat, lon) {
    return typeof lat === "number" && typeof lon === "number" && isFinite(lat) && isFinite(lon);
  }

  function byPlace() {
    const groups = {};
    cameras.forEach((c) => {
      const p = c.place || "North Idaho";
      if (!groups[p]) groups[p] = [];
      groups[p].push(c);
    });
    return Object.keys(groups)
      .sort()
      .map((name) => ({ name, items: groups[name] }));
  }

  function camNode(cam) {
    const n = document.createElement("button");
    n.type = "button";
    n.className = "ico-cam" + (cam.kind === "youtube" ? " is-live" : "");
    n.setAttribute("aria-label", cam.name || "Camera");
    n.innerHTML = CAM_SVG + '<span class="cam-tag">' + (cam.kind === "youtube" ? "LIVE" : "511") + "</span>";
    n.addEventListener("mousedown", function (ev) {
      ev.preventDefault();
    });
    n.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      selectCam(cam.id, true);
    });
    return n;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function link(href, text) {
    if (!href) return escapeHtml(text);
    return (
      '<a href="' +
      escapeHtml(href) +
      '" rel="noopener" target="_blank">' +
      escapeHtml(text || href) +
      "</a>"
    );
  }

  function wxLine(cam) {
    const bits = [];
    (cam.rwis || []).forEach((row) => {
      if (row && row.k && row.v) bits.push("<li><strong>" + escapeHtml(row.k) + "</strong> " + escapeHtml(row.v) + "</li>");
    });
    const wx = cam.wx || {};
    if (wx.temp_f != null || wx.text) {
      const parts = [];
      if (wx.temp_f != null) parts.push(wx.temp_f + "°F");
      if (wx.text) parts.push(wx.text);
      if (wx.wind_mph != null) parts.push(Math.round(wx.wind_mph) + " mph");
      const where = wx.station_name || wx.station || "NWS";
      bits.push(
        "<li><strong>Area weather</strong> " +
          escapeHtml(parts.join(" · ")) +
          " · " +
          (wx.link ? link(wx.link, where) : escapeHtml(where)) +
          "</li>"
      );
    }
    const snow = cam.snow || {};
    if (snow.depth_in != null) {
      bits.push(
        "<li><strong>Snowpack</strong> " +
          escapeHtml(String(snow.depth_in)) +
          " in at " +
          escapeHtml(snow.name || "SNOTEL") +
          (snow.swe_in != null ? " · SWE " + escapeHtml(String(snow.swe_in)) + " in" : "") +
          "</li>"
      );
    }
    if (!bits.length) return "<p class='hint'>No site weather in the last pull.</p>";
    return "<ul>" + bits.join("") + "</ul>";
  }

  function stopMedia() {
    if (stillTimer) {
      clearInterval(stillTimer);
      stillTimer = null;
    }
    const iframe = media.querySelector("iframe");
    if (iframe) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "stopVideo", args: [] }),
          "*"
        );
      } catch (e) {}
      iframe.src = "about:blank";
    }
    const img = media.querySelector("img");
    if (img) img.removeAttribute("src");
    media.replaceChildren();
  }

  function showStill(url) {
    const img = document.createElement("img");
    img.alt = "Live camera still";
    img.addEventListener("error", function () {
      if (img.dataset.failed) return;
      img.dataset.failed = "1";
      const p = document.createElement("p");
      p.className = "feed-fail";
      p.textContent = "Still did not load. Open the source link below.";
      media.replaceChildren(p);
    });
    const bust = function () {
      img.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
    };
    bust();
    media.appendChild(img);
    stillTimer = setInterval(bust, 20000);
  }

  function showYouTube(id) {
    const iframe = document.createElement("iframe");
    const origin =
      location.protocol === "http:" || location.protocol === "https:"
        ? "&origin=" + encodeURIComponent(location.origin)
        : "";
    iframe.src =
      "https://www.youtube.com/embed/" +
      encodeURIComponent(id) +
      "?autoplay=1&mute=1&rel=0&playsinline=1&enablejsapi=1" +
      origin;
    iframe.title = "YouTube live camera";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("allowfullscreen", "");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    media.appendChild(iframe);
  }

  function revealWatch() {
    const box = document.getElementById("feed-watch");
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (rect.top >= 8 && rect.bottom <= vh && rect.height > 80) return;
    const top = rect.top + (window.scrollY || 0) - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function scrollListTo(id) {
    const wrap = document.querySelector(".feed-list-wrap") || listEl;
    const item = listEl.querySelector('.feed-item[data-id="' + id + '"]');
    if (!wrap || !item) return;
    const w = wrap.getBoundingClientRect();
    const b = item.getBoundingClientRect();
    if (b.top >= w.top && b.bottom <= w.bottom) return;
    wrap.scrollTop += b.top - w.top - 8;
  }

  function selectCam(id, fly) {
    const cam = cameras.find((c) => c.id === id);
    if (!cam) return;
    selected = id;
    Object.keys(markers).forEach((k) => {
      const node = markers[k].getElement();
      node.classList.toggle("is-on", k === id);
    });
    document.querySelectorAll(".feed-item").forEach((n) => {
      n.classList.toggle("is-on", n.getAttribute("data-id") === id);
    });
    empty.hidden = true;
    watch.hidden = false;
    titleEl.textContent = cam.name || "Camera";
    placeEl.textContent = (cam.place || "") + (cam.kind === "youtube" ? " · YouTube live" : " · ITD still");
    noteEl.textContent = cam.note || cam.detail || "";
    condEl.innerHTML = wxLine(cam);
    const owner = cam.owner || cam.source || "Camera operator";
    creditEl.innerHTML =
      "<p>" +
      escapeHtml(cam.credit || "") +
      "</p><p>" +
      link(cam.owner_url || cam.source_url, owner) +
      (cam.site_url && cam.site_url !== cam.owner_url ? " · " + link(cam.site_url, "Operator site") : "") +
      " · " +
      link(cam.source_url, cam.source === "YouTube" ? "Watch on YouTube" : "Open on Idaho 511") +
      "</p>";
    stopMedia();
    if (cam.kind === "youtube" && cam.youtube) {
      window.setTimeout(function () {
        if (selected !== id) return;
        showYouTube(cam.youtube);
      }, 120);
    } else if (cam.image) {
      showStill(cam.image);
    }
    if (fly && validLL(cam.lat, cam.lon)) {
      map.easeTo({
        center: [cam.lon, cam.lat],
        zoom: Math.min(Math.max(map.getZoom(), 9), 11),
        duration: 500,
      });
    }
    if (history.replaceState) history.replaceState(null, "", "#" + encodeURIComponent(id));
    scrollListTo(id);
    revealWatch();
  }

  function renderList() {
    listEl.innerHTML = byPlace()
      .map((g) => {
        const items = g.items
          .map((c) => {
            const kind = c.kind === "youtube" ? "YouTube" : "ITD";
            return (
              '<button type="button" class="feed-item" data-id="' +
              escapeHtml(c.id) +
              '"><span class="src">' +
              escapeHtml(kind) +
              "</span><strong>" +
              escapeHtml(c.name) +
              "</strong></button>"
            );
          })
          .join("");
        return "<section><h3>" + escapeHtml(g.name) + "</h3>" + items + "</section>";
      })
      .join("");
    listEl.querySelectorAll(".feed-item").forEach((btn) => {
      btn.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
      });
      btn.addEventListener("click", function () {
        selectCam(btn.getAttribute("data-id"), true);
      });
    });
  }

  const used = {};
  cameras.forEach((cam) => {
    if (!validLL(cam.lat, cam.lon)) return;
    const key = cam.lat.toFixed(3) + "," + cam.lon.toFixed(3);
    used[key] = (used[key] || 0) + 1;
    const n = used[key] - 1;
    const lon = cam.lon + (n ? Math.cos(n * 1.1) * 0.008 : 0);
    const lat = cam.lat + (n ? Math.sin(n * 1.1) * 0.006 : 0);
    const m = new maplibregl.Marker({ element: camNode(cam), anchor: "bottom" }).setLngLat([lon, lat]).addTo(map);
    markers[cam.id] = m;
  });

  renderList();

  document.querySelectorAll("#feed-layers [data-base]").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll("#feed-layers [data-base]").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      const which = btn.getAttribute("data-base");
      map.setStyle(which === "sat" ? STYLE_SAT : which === "streets" ? STYLE_STREETS : STYLE_TOPO);
    });
  });

  const hash = (location.hash || "").replace(/^#/, "");
  if (hash) selectCam(decodeURIComponent(hash), true);

  window.LT_setCameras = function (rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    cameras.splice(0, cameras.length);
    rows.forEach((c) => cameras.push(c));
    renderList();
    if (selected) {
      const cam = cameras.find((c) => c.id === selected);
      if (cam) {
        if (condEl) condEl.innerHTML = wxLine(cam);
        if (cam.image && cam.kind !== "youtube") showStill(cam.image);
      }
    }
  };
})();
