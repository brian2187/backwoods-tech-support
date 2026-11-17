(function () {
  const frozen = /\.html$/i.test(location.pathname || "") || location.protocol === "file:";
  const path = location.pathname || "";

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function pacificToday() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function dateLabel(ymd, today) {
    today = today || pacificToday();
    const day = String(ymd || "").slice(0, 10);
    if (!day) return "";
    if (day === today) return "Today";
    const t = new Date(today + "T12:00:00");
    const d = new Date(day + "T12:00:00");
    if (isNaN(d.getTime())) return day;
    const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
    if (diff === 1) return "Tomorrow";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate();
  }

  function pageId() {
    if (/\/land\/match$/i.test(path) || /land-match\.html$/i.test(path)) return "land-match";
    if (/\/small-biz$/i.test(path) || /small-biz\.html$/i.test(path)) return "small-biz";
    if (/\/showup$/i.test(path) || /showup\.html$/i.test(path)) return "showup";
    if (/\/looking$/i.test(path) || /looking\.html$/i.test(path)) return "looking";
    if (/\/journal$/i.test(path) || /journal\.html$/i.test(path)) return "journal";
    if (/\/situation$/i.test(path) || /situation\.html$/i.test(path)) return "situation";
    if (/\/feeds$/i.test(path) || /feeds\.html$/i.test(path)) return "feeds";
    if (/\/entertainment$/i.test(path) || /entertainment\.html$/i.test(path)) return "entertainment";
    if (/\/land$/i.test(path) || /land\.html$/i.test(path)) return "land";
    if (/\/donate$/i.test(path) || /donate\.html$/i.test(path)) return "donate";
    if (/\/contact$/i.test(path) || /contact\.html$/i.test(path)) return "contact";
    if (/index\.html$/i.test(path) || path === "/" || /\/less-traveled\/?$/i.test(path)) return "home";
    return "";
  }

  function jsonUrls(name) {
    const t = Date.now();
    if (frozen) return ["data/" + name + ".json?t=" + t];
    return ["/api/" + name + ".json?t=" + t];
  }

  async function getJSON(url) {
    const r = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  async function firstJSON(urls) {
    for (let i = 0; i < urls.length; i += 1) {
      try {
        return await getJSON(urls[i]);
      } catch (e) {}
    }
    return null;
  }

  function fmtWhen(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 16);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let h = d.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    return months[d.getMonth()] + " " + d.getDate() + ", " + h + ":" + m + " " + ap;
  }

  function stamp(when, live) {
    const el = document.getElementById("live-stamp");
    if (!el) return;
    const label = live ? "Live" : "Updated";
    el.textContent = when ? label + " · " + fmtWhen(when) : label + " on load";
    el.classList.toggle("is-live", !!live);
  }

  function sitHref() {
    return frozen ? "situation.html" : "/situation";
  }

  function dirHref(spec) {
    const q = spec ? "?s=" + encodeURIComponent(spec) : "";
    return (frozen ? "showup.html" : "/showup") + q;
  }

  function setAlertBar(n) {
    const bar = document.getElementById("alert-bar");
    const link = document.getElementById("alert-bar-link");
    if (!bar || !link) return;
    const count = Number(n) || 0;
    if (count < 1) {
      bar.hidden = true;
      link.textContent = "";
      return;
    }
    bar.hidden = false;
    link.href = sitHref();
    link.textContent =
      count + " NWS alert" + (count === 1 ? "" : "s") + " — regional info";
  }

  async function nwsAlerts() {
    const r = await fetch(
      "https://api.weather.gov/alerts/active?zone=IDC017,IDC021",
      { cache: "no-store", headers: { Accept: "application/geo+json, application/json" } }
    );
    if (!r.ok) throw new Error("NWS " + r.status);
    const data = await r.json();
    const seen = {};
    const out = [];
    (data.features || []).forEach((f) => {
      const p = (f && f.properties) || {};
      const id = p.id || p.headline;
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push({
        event: p.event,
        headline: p.headline,
        severity: p.severity,
        area: p.areaDesc,
        ends: p.ends,
        id: p.id,
        origin: "NWS",
        link: p.web || "https://www.weather.gov/",
      });
    });
    return out.slice(0, 12);
  }

  async function refreshAlerts() {
    try {
      const alerts = await nwsAlerts();
      setAlertBar(alerts.length);
      return alerts;
    } catch (e) {
      return null;
    }
  }

  function wxIco(text, night) {
    const t = String(text || "").toLowerCase();
    let inner = '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M16 18a10 10 0 0 1 18-2.8A8 8 0 1 1 35.5 32H18a8 8 0 0 1-2-14z"/></svg>';
    if (t.indexOf("thunder") >= 0) {
      inner =
        '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M16 18a10 10 0 0 1 18.2-3.2A8 8 0 1 1 36 32H18a8 8 0 0 1-2-14z"/><path fill="#c9a227" d="M24 22l-6 10h5l-2 10 10-12h-5z"/></svg>';
    } else if (t.indexOf("snow") >= 0 || t.indexOf("sleet") >= 0 || t.indexOf("flurries") >= 0) {
      inner =
        '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M16 16a10 10 0 0 1 18-2.8A8 8 0 1 1 35.5 30H18a8 8 0 0 1-2-14z"/></svg>';
    } else if (t.indexOf("rain") >= 0 || t.indexOf("shower") >= 0 || t.indexOf("drizzle") >= 0) {
      inner =
        '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M16 16a10 10 0 0 1 18-2.8A8 8 0 1 1 35.5 30H18a8 8 0 0 1-2-14z"/><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M18 36l-2 7M25 36l-2 7M32 36l-2 7"/></svg>';
    } else if (t.indexOf("sun") >= 0 || t.indexOf("clear") >= 0 || t.indexOf("fair") >= 0) {
      inner = night
        ? '<svg viewBox="0 0 48 48"><path fill="#c9a227" d="M30 10a14 14 0 1 0 6 22 12 12 0 1 1-6-22z"/></svg>'
        : '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="#c9a227"/></svg>';
    }
    return '<span class="wx-ico" aria-hidden="true">' + inner + "</span>";
  }

  function newsList(items, emptyText) {
    if (!items || !items.length) return "<li>" + esc(emptyText) + "</li>";
    return items
      .map((n) => {
        const src = [n.origin || n.source || "", n.kind || "", n.when_short || n.when || ""]
          .filter(Boolean)
          .join(" · ");
        return (
          "<li" +
          (n.active === false ? ' class="is-closed"' : "") +
          '><span class="src">' +
          esc(src) +
          '</span><a href="' +
          esc(n.link || "#") +
          '" rel="noopener" target="_blank">' +
          esc(n.title || n.event || "Item") +
          "</a></li>"
        );
      })
      .join("");
  }

  async function nwsForecastAndObs() {
    const pts = await getJSON("https://api.weather.gov/points/48.2766,-116.5535");
    const forecastUrl = ((pts || {}).properties || {}).forecast;
    let forecast = [];
    if (forecastUrl) {
      const fc = await getJSON(forecastUrl);
      forecast = (((fc || {}).properties || {}).periods || []).slice(0, 8).map((p) => ({
        name: p.name,
        temp: p.temperature,
        unit: p.temperatureUnit,
        wind: ((p.windSpeed || "") + " " + (p.windDirection || "")).trim(),
        short: p.shortForecast,
        detail: p.detailedForecast,
      }));
    }
    let obs = {};
    try {
      const raw = await getJSON("https://api.weather.gov/stations/KSZT/observations/latest");
      const p = (raw && raw.properties) || {};
      const tc = p.temperature && p.temperature.value;
      obs = {
        origin: "NWS",
        station: "KSZT",
        text: p.textDescription || "",
        temp_f: tc == null ? null : Math.round((tc * 9) / 5 + 32),
        wind_mph: p.windSpeed && p.windSpeed.value != null ? Math.round(p.windSpeed.value * 2.23694) : null,
        when: p.timestamp,
      };
    } catch (e) {}
    return { forecast, obs };
  }

  async function usgsLakes() {
    const specs = [
      { site: "12392500", name: "Lake Pend Oreille", short: "Pend Oreille", datum: 2000.0 },
      { site: "12393000", name: "Priest Lake", short: "Priest", datum: 2434.64 },
      { site: "12415500", name: "Coeur d'Alene Lake", short: "CDA", datum: 2100.0 },
    ];
    const url =
      "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=" +
      specs.map((s) => s.site).join(",") +
      "&parameterCd=00065,62614,00062&siteStatus=all";
    const data = await getJSON(url);
    const by = {};
    specs.forEach((s) => {
      by[s.site] = {
        name: s.name,
        short: s.short,
        site: s.site,
        gage_ft: null,
        pool_ft: null,
        datum: s.datum,
        link: "https://waterdata.usgs.gov/monitoring-location/USGS-" + s.site + "/",
      };
    });
    ((((data || {}).value || {}).timeSeries) || []).forEach((ts) => {
      const site = ((((ts.sourceInfo || {}).siteCode) || [{}])[0] || {}).value;
      const row = by[site];
      if (!row) return;
      const code = ((((ts.variable || {}).variableCode) || [{}])[0] || {}).value;
      const v0 = ((((ts.values || [{}])[0] || {}).value) || [{}])[0] || {};
      const num = parseFloat(v0.value);
      if (!isFinite(num) || num < -90000) return;
      if (code === "00065") {
        row.gage_ft = Math.round(num * 100) / 100;
        if (row.datum) row.pool_ft = Math.round((num + row.datum) * 100) / 100;
        row.when = v0.dateTime;
      } else if (code === "62614" || code === "00062") {
        row.pool_ft = Math.round(num * 100) / 100;
        row.when = v0.dateTime;
      }
    });
    return specs.map((s) => by[s.site]);
  }

  async function nifcFires() {
    const where = encodeURIComponent(
      "POOCounty IN ('Bonner','Boundary','Kootenai','Shoshone','Benewah','Pend Oreille')"
    );
    const fields = [
      "IncidentName",
      "POOCounty",
      "POOState",
      "PercentContained",
      "IncidentSize",
      "IncidentTypeCategory",
      "UniqueFireIdentifier",
      "FireCause",
      "IncidentShortDescription",
    ].join(",");
    const url =
      "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?where=" +
      where +
      "&outFields=" +
      fields +
      "&f=geojson&resultRecordCount=80";
    const data = await getJSON(url);
    const fires = [];
    (data.features || []).forEach((f) => {
      const p = f.properties || {};
      const cat = p.IncidentTypeCategory || "WF";
      if (cat !== "WF" && cat !== "CX") return;
      const coords = (f.geometry && f.geometry.coordinates) || [null, null];
      const contained = p.PercentContained;
      const name = p.IncidentName || "Unnamed";
      fires.push({
        name: name,
        county: p.POOCounty,
        state: p.POOState,
        acres: p.IncidentSize,
        contained: contained,
        cause: p.FireCause,
        id: p.UniqueFireIdentifier,
        note: p.IncidentShortDescription,
        lat: coords[1],
        lon: coords[0],
        origin: "NIFC",
        active: contained == null || Number(contained) < 100,
        stories: [{ title: name + " on InciWeb (search)", url: "https://inciweb.wildfire.gov/" }],
      });
    });
    fires.sort((a, b) => Number(a.active) === Number(b.active) ? Number(b.acres || 0) - Number(a.acres || 0) : a.active ? -1 : 1);
    return fires;
  }

  function paintWx(alerts, forecast, obs) {
    const card = document.getElementById("sit-wx");
    if (!card) return;
    const tonight = (forecast || []).find((p) => /night/i.test(p.name || "")) || null;
    const nowText = (obs && obs.text) || (forecast[0] && forecast[0].short) || "";
    const nowTemp =
      obs && obs.temp_f != null
        ? Math.round(obs.temp_f) + "°F"
        : forecast[0]
          ? forecast[0].temp + "°" + (forecast[0].unit || "")
          : "—";
    const nowWind = obs && obs.wind_mph != null ? " · " + Math.round(obs.wind_mph) + " mph" : "";
    let alertHtml = '<div class="wx-alert is-clear">No active NWS weather alerts for Bonner / Boundary.</div>';
    if (alerts && alerts.length) {
      alertHtml =
        '<div class="wx-alert is-on"><strong>NWS weather alert' +
        (alerts.length === 1 ? "" : "s") +
        "</strong><ul>" +
        alerts
          .slice(0, 3)
          .map((a) => {
            const label = esc(a.event || "Alert");
            const extra = a.headline ? " — " + esc(a.headline) : "";
            const inner = a.link
              ? '<a href="' + esc(a.link) + '" rel="noopener" target="_blank">' + label + "</a>"
              : label;
            return "<li>" + inner + extra + "</li>";
          })
          .join("") +
        "</ul></div>";
    }
    card.innerHTML =
      "<h3>Weather</h3>" +
      alertHtml +
      '<div class="wx-panes"><div class="wx-pane">' +
      wxIco(nowText, false) +
      "<div><p class=\"wx-when\">Now</p><p class=\"big\">" +
      esc(String(nowTemp)) +
      "</p><p>" +
      esc(nowText || "No observation") +
      esc(nowWind) +
      '</p><p class="wx-src">NWS' +
      (obs && obs.station ? " · " + esc(obs.station) : "") +
      "</p></div></div><div class=\"wx-pane\">" +
      wxIco(tonight && tonight.short, true) +
      "<div><p class=\"wx-when\">" +
      esc((tonight && tonight.name) || "Tonight") +
      '</p><p class="big">' +
      (tonight ? esc(String(tonight.temp) + "°" + (tonight.unit || "")) : "—") +
      "</p><p>" +
      (tonight
        ? esc(tonight.short || "") + (tonight.wind ? " · " + esc(tonight.wind) : "")
        : "No overnight forecast") +
      "</p></div></div></div>";
  }

  function paintLakes(lakes) {
    (lakes || []).forEach((lk) => {
      const card = document.querySelector('.lake-card[data-site="' + (lk.site || "") + '"]');
      if (!card) return;
      const big = card.querySelector(".big");
      if (big) {
        if (lk.pool_ft != null) big.textContent = lk.pool_ft + " ft";
        else if (lk.gage_ft != null) big.textContent = lk.gage_ft + " ft";
      }
    });
    if (typeof window.LT_updateLakes === "function") window.LT_updateLakes(lakes);
  }

  function paintFires(fires) {
    const row = document.getElementById("sit-fires");
    if (row) {
      const live = (fires || []).filter((f) => !f._error);
      if (!live.length) {
        row.innerHTML = "<p>No panhandle fires in the last NIFC pull.</p>";
      } else {
        row.innerHTML = live
          .map((f) => {
            const acres = f.acres != null ? Number(f.acres).toLocaleString() + " ac" : "— ac";
            const pct = f.contained != null ? f.contained + "%" : "—%";
            const stories = (f.stories || [])
              .map(
                (s) =>
                  '<a href="' +
                  esc(s.url) +
                  '" rel="noopener" target="_blank">' +
                  esc(s.title) +
                  "</a>"
              )
              .join("");
            return (
              '<article class="fire-card"><div class="ico-fire ' +
              (f.active ? "is-active" : "is-contained") +
              '"><span class="ico-fire-inner"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 2c2 5 3 8 3 11 2-3 6-1 6 5a9 9 0 1 1-18 0c0-4 3-8 6-11-1 5 3 6 3-5z"/></svg></span></div><div><h3>' +
              esc(f.name) +
              "</h3><p>" +
              esc(f.origin || "NIFC") +
              " · " +
              esc(f.county || "") +
              " · " +
              acres +
              " · " +
              pct +
              '</p><p class="links">' +
              stories +
              "</p></div></article>"
            );
          })
          .join("");
      }
    }
    if (typeof window.LT_replaceFires === "function") window.LT_replaceFires(fires);
  }

  function paintSitLists(sit) {
    const active = document.getElementById("sit-nixle-active");
    const closed = document.getElementById("sit-nixle-closed");
    const news = document.getElementById("sit-news");
    const roads = document.getElementById("sit-roads");
    const nixle = sit.nixle || [];
    if (active) {
      active.innerHTML = newsList(
        nixle.filter((n) => n.active),
        "No active Nixle items."
      );
    }
    if (closed) {
      closed.innerHTML = newsList(
        nixle.filter((n) => !n.active),
        "No closed Nixle items."
      );
    }
    if (news) {
      news.innerHTML = newsList(sit.news || [], "No incident items in the last pull.");
    }
    if (roads) {
      const rows = (sit.roads || []).slice(0, 12);
      if (!rows.length) {
        roads.innerHTML =
          '<p class="meta">No live work zones in this box from Idaho 511 or WSDOT. Street closures from Nixle still plot when Road work is on.</p>';
      } else {
        roads.innerHTML =
          '<ul class="sit-news">' +
          rows
            .map((r) => {
              const bits = [r.origin, r.road];
              if (r.kind === "cleared") bits.push("reopened");
              if (r.kind === "all-lanes-closed") bits.push("closed");
              if (r.when_short) bits.push(r.when_short);
              return (
                "<li><span class=\"src\">" +
                esc(bits.filter(Boolean).join(" · ")) +
                '</span><a href="' +
                esc(r.link || "#") +
                '" rel="noopener" target="_blank">' +
                esc(r.title || "") +
                "</a></li>"
              );
            })
            .join("") +
          "</ul>";
      }
    }
  }

  async function loadSituation() {
    const sit = (await firstJSON(jsonUrls("situation"))) || {};
    const meta = document.getElementById("sit-updated");
    const jobs = [
      nwsAlerts().catch(() => sit.alerts || []),
      nwsForecastAndObs().catch(() => ({ forecast: sit.forecast || [], obs: sit.obs || {} })),
      usgsLakes().catch(() => sit.lakes || []),
      nifcFires().catch(() => sit.fires || []),
    ];
    const [alerts, wx, lakes, fires] = await Promise.all(jobs);
    paintSitLists(sit);
    paintWx(alerts || [], (wx && wx.forecast) || [], (wx && wx.obs) || {});
    paintLakes(lakes || []);
    paintFires(fires || []);
    if (meta) {
      meta.textContent =
        "Updated " +
        (fmtWhen(new Date().toISOString()) || sit.updated || "—") +
        " · NIFC, USGS, NWS, AirNow, Nixle, SNOTEL, Idaho 511, WSDOT, OpenSky";
    }
    stamp(new Date().toISOString(), true);
  }

  function paintHome(payload) {
    const wrap = document.getElementById("home-journal-wrap");
    const list = document.getElementById("home-journal");
    if (!list) return;
    const raw = payload.items || payload.feed || [];
    const items = raw.filter((it) => {
      const link = String(it.link || "").toLowerCase();
      return it.kind !== "x" && link.indexOf("x.com/") < 0 && link.indexOf("twitter.com/") < 0;
    });
    const top = items.slice(0, 3);
    if (!top.length) return;
    if (wrap) wrap.hidden = false;
    list.innerHTML = top
      .map((e) => {
        const blank = /^https?:/i.test(e.link || "") ? ' target="_blank"' : "";
        const sum = e.summary ? " · " + e.summary : "";
        return (
          '<a href="' +
          esc(e.link || "#") +
          '" rel="noopener"' +
          blank +
          "><strong>" +
          esc(e.title || "") +
          "</strong><span>" +
          esc((e.when_short || "") + (e.source ? " · " + e.source : "") + sum) +
          "</span></a>"
        );
      })
      .join("");
  }

  function bizCard(b, spec) {
    const name = b.name || "";
    const title = b.site
      ? '<a href="' + esc(b.site) + '" rel="noopener" target="_blank">' + esc(name) + "</a>"
      : esc(name);
    const bits = [];
    bits.push("<span>" + esc(spec || b.category || "") + "</span>");
    if (b.town) bits.push("<span>" + esc(b.town) + "</span>");
    if (b.address) bits.push("<span>" + esc(b.address) + "</span>");
    if (b.phone) bits.push('<a href="tel:' + esc(b.phone) + '">' + esc(b.phone) + "</a>");
    if (b.email) bits.push('<a href="mailto:' + esc(b.email) + '">' + esc(b.email) + "</a>");
    if (b.site) {
      bits.push('<a class="dir-web" href="' + esc(b.site) + '" rel="noopener" target="_blank">Website</a>');
    } else if (b.chamber_page) {
      bits.push(
        '<a class="dir-web" href="' + esc(b.chamber_page) + '" rel="noopener" target="_blank">Chamber listing</a>'
      );
    }
    const q = (b.search_q || [b.name, b.town, b.summary, spec].filter(Boolean).join(" ")).toLowerCase();
    return (
      '<article class="dir-card' +
      (b.is_new ? " is-new" : "") +
      '" data-group="' +
      esc(b.group || "") +
      '" data-spec="' +
      esc(spec || b.category || "") +
      '" data-town="' +
      esc(b.town || "") +
      '" data-q="' +
      esc(q) +
      '"><header><h3>' +
      title +
      "</h3>" +
      (b.is_new ? '<span class="dir-badge">New</span>' : "") +
      '</header><p class="dir-sum">' +
      esc(b.summary || "Local business.") +
      '</p><p class="dir-meta">' +
      bits.join("") +
      "</p>" +
      (b.updated_label ? '<p class="dir-updated">Updated ' + esc(b.updated_label) + "</p>" : "") +
      "</article>"
    );
  }

  function paintDirectory(data) {
    const body = document.getElementById("dir-body");
    const meta = document.getElementById("dir-meta");
    const groupsEl = document.getElementById("dir-groups");
    const specsEl = document.getElementById("dir-specs");
    const townEl = document.getElementById("dir-town");
    const shutSec = document.getElementById("shutdown");
    const foot = document.getElementById("dir-foot");
    if (meta) {
      meta.textContent =
        (data.n || 0) +
        " open · " +
        (data.shut_n || 0) +
        " shutdown · watched " +
        (data.updated || "—") +
        ". Chamber roster, OpenStreetMap, and local news. New members and contact details refresh each morning.";
    }
    if (groupsEl) {
      groupsEl.innerHTML =
        '<button type="button" class="dir-chip on" data-group="">All</button>' +
        (data.groups || [])
          .map(
            (g) =>
              '<button type="button" class="dir-chip" data-group="' +
              esc(g.name) +
              '">' +
              esc(g.name) +
              ' <span class="n">' +
              esc(g.count) +
              "</span></button>"
          )
          .join("");
    }
    if (specsEl) {
      specsEl.innerHTML =
        '<button type="button" class="dir-chip on" data-spec="">All specialties</button>' +
        (data.specs || [])
          .map(
            (s) =>
              '<button type="button" class="dir-chip" data-spec="' +
              esc(s.name) +
              '" data-parent="' +
              esc(s.group) +
              '">' +
              esc(s.name) +
              ' <span class="n">' +
              esc(s.count) +
              "</span></button>"
          )
          .join("");
    }
    if (townEl) {
      const cur = townEl.value;
      townEl.innerHTML =
        '<option value="">All towns</option>' +
        (data.towns || [])
          .map(
            (t) =>
              '<option value="' + esc(t.name) + '">' + esc(t.name) + " (" + esc(t.count) + ")</option>"
          )
          .join("");
      townEl.value = cur;
    }
    if (body) {
      body.innerHTML = (data.groups || [])
        .map((g) => {
          const specs = (g.specialties || [])
            .map((s) => {
              const cards = (s.listings || []).map((b) => bizCard(b, s.name)).join("");
              return (
                '<section class="dir-section" data-group="' +
                esc(g.name) +
                '" data-spec="' +
                esc(s.name) +
                '"><h3 class="dir-spec">' +
                esc(s.name) +
                '</h3><div class="dir-grid">' +
                cards +
                "</div></section>"
              );
            })
            .join("");
          return (
            '<section class="dir-group" data-group="' +
            esc(g.name) +
            '"><h2 class="section-title">' +
            esc(g.name) +
            "</h2>" +
            specs +
            "</section>"
          );
        })
        .join("");
    }
    if (shutSec) {
      const shut = data.shut || [];
      let html =
        '<h2 class="section-title">Shutdown</h2><p class="hint">Flagged from local news or a confirmed close. A dissolved LLC is not automatically a boarded shop.</p>';
      if (shut.length) {
        html +=
          '<ul id="dir-shut">' +
          shut
            .map((b) => {
              const q = (b.search_q || [b.name, b.town, b.closed_note].filter(Boolean).join(" ")).toLowerCase();
              return (
                '<li data-q="' +
                esc(q) +
                '"><strong>' +
                esc(b.name) +
                "</strong><span>" +
                esc(b.category || "") +
                (b.town ? " · " + esc(b.town) : "") +
                (b.closed ? " · " + esc(b.closed) : "") +
                "</span>" +
                (b.closed_note ? '<span class="dir-note">' + esc(b.closed_note) + "</span>" : "") +
                "</li>"
              );
            })
            .join("") +
          "</ul>";
      } else {
        html += '<p class="meta">No closures flagged in the last watch.</p>';
      }
      shutSec.innerHTML = html;
    }
    if (foot && data.note) {
      foot.textContent =
        data.note +
        " Ratings will sit on the card once we have enough neighbor confirmations. Licensed trades keep their license number when we have it.";
    }
    if (typeof window.LT_dirShow === "function") window.LT_dirShow();
    stamp(data.updated, false);
  }

  function lookCard(it) {
    const q = [it.ask, it.title, it.summary, it.category, it.town, it.source]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const fits = it.fits || [];
    let fitHtml = '<p class="meta">No matching company in the directory yet.</p>';
    if (fits.length) {
      fitHtml =
        '<p class="look-fits-label">Companies that could meet this</p><ul class="look-fits">' +
        fits
          .map((c) => {
            const name = c.site
              ? '<a href="' + esc(c.site) + '" rel="noopener" target="_blank">' + esc(c.name) + "</a>"
              : esc(c.name);
            return (
              "<li>" +
              name +
              "<span>" +
              esc(c.town || "") +
              (c.phone ? ' · <a href="tel:' + esc(c.phone) + '">' + esc(c.phone) + "</a>" : "") +
              "</span></li>"
            );
          })
          .join("") +
        "</ul>";
    }
    const blank = /^https?:/i.test(it.link || "") ? ' target="_blank"' : "";
    const more = it.category
      ? ' · <a href="' + dirHref(it.category) + '">More ' + esc(it.category) + "</a>"
      : "";
    return (
      '<article class="look-card" data-spec="' +
      esc(it.category || "") +
      '" data-kind="' +
      esc(it.kind || "") +
      '" data-q="' +
      esc(q) +
      '"><header><p class="look-meta"><span>Date <time datetime="' +
      esc(it.when || "") +
      '">' +
      esc(it.when_short || "") +
      '</time></span><span class="kind-tag kind-' +
      esc(it.kind || "") +
      '">' +
      esc(it.kind_label || it.kind || "") +
      "</span><span>" +
      esc(it.town || "") +
      "</span><span>Industry " +
      esc(it.category || "") +
      "</span></p><h3>" +
      esc(it.title || "") +
      '</h3></header><p class="look-fits-label">What\'s asked</p><p class="look-ask">' +
      esc(it.ask || "") +
      "</p>" +
      fitHtml +
      '<p class="orig"><a href="' +
      esc(it.link || "#") +
      '" rel="noopener"' +
      blank +
      ">Original on " +
      esc(it.source || "") +
      "</a>" +
      more +
      "</p></article>"
    );
  }

  function paintLooking(data) {
    const meta = document.getElementById("look-meta");
    const specs = document.getElementById("look-specs");
    const daysEl = document.getElementById("look-days");
    const items = data.items || [];
    if (meta) {
      meta.textContent =
        items.length +
        " public ask" +
        (items.length === 1 ? "" : "s") +
        " in " +
        (data.days || 90) +
        " days · pulled " +
        (data.updated || "—") +
        ". " +
        (data.note || "");
    }
    if (specs) {
      const on = (specs.querySelector(".dir-chip.on") || {}).getAttribute
        ? specs.querySelector(".dir-chip.on").getAttribute("data-spec") || ""
        : "";
      specs.innerHTML =
        '<button type="button" class="dir-chip' +
        (on ? "" : " on") +
        '" data-spec="">All</button>' +
        (data.industries || [])
          .map(
            (s) =>
              '<button type="button" class="dir-chip' +
              (on === s.name ? " on" : "") +
              '" data-spec="' +
              esc(s.name) +
              '">' +
              esc(s.name) +
              ' <span class="n">' +
              esc(s.count) +
              "</span></button>"
          )
          .join("");
    }
    if (daysEl) {
      if (!items.length) {
        daysEl.innerHTML =
          '<p class="meta">No public asks in the last ' +
          (data.days || 90) +
          " days. Use the trade links above — Facebook groups and Craigslist are where most of this talk happens.</p>";
      } else {
        const byDay = [];
        let cur = null;
        items.forEach((it) => {
          const day = String(it.when || "").slice(0, 10);
          if (!cur || cur.date !== day) {
            cur = { date: day, label: it.when_short || day, listings: [] };
            byDay.push(cur);
          }
          cur.listings.push(it);
        });
        daysEl.innerHTML = byDay
          .map(
            (day) =>
              '<section class="look-day" data-day="' +
              esc(day.date) +
              '"><h2 class="section-title">' +
              esc(day.label) +
              "</h2>" +
              day.listings.map(lookCard).join("") +
              "</section>"
          )
          .join("");
      }
    }
    if (typeof window.LT_lookingShow === "function") window.LT_lookingShow();
    stamp(data.updated, false);
  }

  function paintSmallbiz(data) {
    const meta = document.getElementById("sb-meta");
    const hint = document.getElementById("sb-openings-hint");
    const openBody = document.getElementById("sb-openings-body");
    const evBody = document.getElementById("sb-events-body");
    const stBody = document.getElementById("sb-stories-body");
    const openings = data.openings || [];
    const events = data.events || [];
    const stories = data.stories || [];
    const week = data.week || {};
    if (meta) {
      meta.textContent =
        openings.length +
        " filing" +
        (openings.length === 1 ? "" : "s") +
        " this week · " +
        stories.length +
        (stories.length === 1 ? " story" : " stories") +
        " · " +
        events.length +
        " upcoming · pulled " +
        (data.updated || "—") +
        ". " +
        (data.note || "");
    }
    if (hint) {
      hint.textContent =
        (week.label ? week.label + ". " : "") +
        "Public licenses and filings. The list refreshes Mondays. A filing under a person's own name is not shown.";
    }
    if (openBody) {
      if (!openings.length) {
        openBody.innerHTML =
          '<p class="meta">This week\'s list is not in yet. It updates every Monday from the Market Narc New Business List.</p>';
      } else {
        openBody.innerHTML =
          '<div class="sb-table">' +
          openings
            .map((it) => {
              const loc = [it.address, it.city].filter(Boolean).join(" · ");
              return (
                '<article class="sb-row"><div><strong>' +
                esc(it.name) +
                "</strong>" +
                (it.type ? '<span class="sb-type">' + esc(it.type) + "</span>" : "") +
                "<p>" +
                esc(loc) +
                '</p></div><p class="sb-src">' +
                esc((it.listed_short || "") + (it.source ? " · " + it.source : "")) +
                "</p></article>"
              );
            })
            .join("") +
          '</div><p class="meta"><a href="https://kcounty.media/business/new-this-week/" rel="noopener" target="_blank">Full list on Kcounty.Media</a></p>';
      }
    }
    if (evBody) {
      if (!events.length) {
        evBody.innerHTML = '<p class="meta">No upcoming business-tagged events in the last pull.</p>';
      } else {
        evBody.innerHTML =
          '<div class="sb-table">' +
          events
            .map((e) => {
              return (
                '<article class="sb-row"><div class="sb-when"><strong>' +
                esc(e.when_short || "") +
                "</strong>" +
                (e.time ? "<span>" + esc(e.time) + "</span>" : "") +
                "</div><div><strong><a href=\"" +
                esc(e.url || "#") +
                '" rel="noopener" target="_blank">' +
                esc(e.title || "") +
                "</a></strong><p>" +
                esc([e.venue, e.city, e.kind, e.source].filter(Boolean).join(" · ")) +
                "</p></div></article>"
              );
            })
            .join("") +
          "</div>";
      }
    }
    if (stBody) {
      if (!stories.length) {
        stBody.innerHTML = '<p class="meta">No business-section stories in the last pull.</p>';
      } else {
        stBody.innerHTML = stories
          .map((it) => {
            return (
              '<article class="look-card"><header><p class="look-meta"><span><time datetime="' +
              esc(it.when || "") +
              '">' +
              esc(it.when_short || "") +
              '</time></span><span class="kind-tag kind-news">' +
              esc(it.source || "") +
              "</span>" +
              (it.town ? "<span>" + esc(it.town) + "</span>" : "") +
              '</p><h3><a href="' +
              esc(it.link || "#") +
              '" rel="noopener" target="_blank">' +
              esc(it.title || "") +
              "</a></h3></header>" +
              (it.summary ? '<p class="look-ask">' + esc(it.summary) + "</p>" : "") +
              '<p class="orig"><a href="' +
              esc(it.link || "#") +
              '" rel="noopener" target="_blank">Original on ' +
              esc(it.source || "") +
              "</a></p></article>"
            );
          })
          .join("");
      }
    }
    stamp(data.updated, false);
  }

  function paintLand(data) {
    const meta = document.getElementById("hs-meta");
    if (meta) {
      meta.textContent =
        (data.hs_n_companies || 0) +
        " local outfits from the directory · watched " +
        (data.hs_biz_updated || "—") +
        ". Call them yourself. We do not take a cut of the job.";
    }
    (data.hs_stages || []).forEach((s) => {
      const sec = document.getElementById("hs-" + s.id);
      if (!sec) return;
      sec.querySelectorAll(".hs-group, .hs-table").forEach((n) => n.remove());
      const empty = sec.querySelectorAll(".meta");
      empty.forEach((p) => {
        if (p.parentNode === sec) p.remove();
      });
      const html = [];
      (s.groups || []).forEach((g) => {
        if (!(g.companies || []).length) return;
        html.push(
          '<h3 class="hs-group">' +
            esc(g.label) +
            ' <span class="n">' +
            g.companies.length +
            "</span></h3><div class=\"hs-table\">" +
            g.companies
              .map((b) => {
                const name = b.site
                  ? '<a href="' + esc(b.site) + '" rel="noopener" target="_blank">' + esc(b.name) + "</a>"
                  : b.chamber_page
                    ? '<a href="' +
                      esc(b.chamber_page) +
                      '" rel="noopener" target="_blank">' +
                      esc(b.name) +
                      "</a>"
                    : esc(b.name);
                const loc = [];
                if (b.town) loc.push(esc(b.town));
                if (b.phone) loc.push('<a href="tel:' + esc(b.phone) + '">' + esc(b.phone) + "</a>");
                if (b.category) loc.push(esc(b.category));
                return (
                  '<article class="hs-row"><div><strong>' +
                  name +
                  "</strong><p>" +
                  loc.join(" · ") +
                  "</p>" +
                  (b.summary ? '<p class="hs-sum">' + esc(b.summary) + "</p>" : "") +
                  "</div></article>"
                );
              })
              .join("") +
            "</div>"
        );
      });
      if (!html.length) {
        if ((s.offices || []).length) {
          html.push(
            '<p class="meta">This step is the office, not a shop. Trades that touch it show in the steps around it.</p>'
          );
        } else {
          html.push(
            '<p class="meta">No matching company in the directory yet. <a href="' +
              (frozen ? "showup.html" : "/showup") +
              '">Who shows up</a>.</p>'
          );
        }
      }
      sec.insertAdjacentHTML("beforeend", html.join(""));
    });
    stamp(data.hs_biz_updated, false);
  }

  function eventRow(e, today) {
    const label = e.date_label || dateLabel(e.date, today);
    return (
      '<div class="event-row" data-area="' +
      esc(e.area || "") +
      '"><div class="when"><span class="ev-ico ev-' +
      esc(e.kind || "") +
      '" aria-hidden="true"></span>' +
      esc(label) +
      (e.time ? "<br>" + esc(e.time) : "") +
      "</div><div><h3><a href=\"" +
      esc(e.url || "#") +
      '" rel="noopener" target="_blank">' +
      esc(e.title || "") +
      '</a></h3><p><span class="area-tag">' +
      esc(e.area || "") +
      "</span> " +
      esc(e.venue || "") +
      " · " +
      esc(e.kind || "") +
      " · " +
      esc(e.source || "") +
      "</p>" +
      (e.artists && e.artists.length ? '<p class="who">' + esc(e.artists.join(", ")) + "</p>" : "") +
      "</div></div>"
    );
  }

  function paintEntertainment(raw) {
    const todayYmd = pacificToday();
    let events = [];
    if (Array.isArray(raw.events) && raw.events.length) {
      events = raw.events.slice();
    } else {
      const seen = {};
      (raw.today_events || [])
        .concat(raw.upcoming_events || [])
        .concat((raw.areas || []).flatMap((a) => a.events || []))
        .forEach((e) => {
          const k = (e.title || "") + "|" + (e.date || "");
          if (seen[k]) return;
          seen[k] = 1;
          events.push(e);
        });
    }
    const future = events.filter((e) => (e.date || "") >= todayYmd);
    const data = {
      updated: raw.updated,
      catchment: raw.catchment || "",
      areas: raw.areas || [],
      today_events: future.filter((e) => e.date === todayYmd),
      n_venues: raw.n_venues || (raw.venues || []).length,
      n_events: future.length,
      today: todayYmd,
    };
    const meta = document.getElementById("cal-meta");
    const eventsEl = document.getElementById("cal-events");
    if (meta) {
      meta.textContent =
        "Pulled " +
        (data.updated || "—") +
        " · " +
        (data.n_venues || 0) +
        " places · " +
        (data.n_events || 0) +
        " upcoming listings. " +
        (data.catchment || "");
    }
    if (eventsEl) {
      const todayEvents = data.today_events || [];
      const areas = data.areas || [];
      let html = "";
      if (todayEvents.length) {
        html +=
          '<h2 class="section-title">Today</h2>' +
          todayEvents.map((e) => eventRow(e, todayYmd)).join("");
      }
      areas.forEach((a) => {
        const later = (a.events || []).filter((e) => (e.date || "") > todayYmd);
        if (!later.length) return;
        html +=
          '<details class="area-block" data-area="' +
          esc(a.name) +
          '"' +
          (a.name === "Sandpoint" ? " open" : "") +
          '><summary class="section-title">' +
          esc(a.name) +
          ' <span class="n">' +
          esc(a.drive_min) +
          " min · " +
          later.length +
          "</span></summary>" +
          later.map((e) => eventRow(e, todayYmd)).join("") +
          "</details>";
      });
      if (!html) {
        html =
          '<p class="meta">No upcoming listings in the last pull. Next ingest will try Panida and the Chamber again.</p>';
      }
      const keep = eventsEl.querySelectorAll("h2.section-title, .event-row, details.area-block, p.meta");
      keep.forEach((n) => n.remove());
      eventsEl.insertAdjacentHTML("afterbegin", html);
    }
    stamp(data.updated, false);
  }

  async function loadPage() {
    const id = pageId();
    if (id === "situation") {
      await loadSituation();
      return;
    }
    if (id === "home") {
      const data = await firstJSON(jsonUrls("journal"));
      if (data) paintHome(data.items && !data.feed_n && data.feed_n !== 0 ? { items: data.items } : data);
      stamp((data && (data.feed_updated || data.updated)) || new Date().toISOString(), !frozen);
      return;
    }
    if (id === "showup") {
      const data = await firstJSON(jsonUrls("directory"));
      if (data) paintDirectory(data);
      return;
    }
    if (id === "looking") {
      const data = await firstJSON(jsonUrls("demand"));
      if (data) paintLooking(data);
      return;
    }
    if (id === "small-biz") {
      const data = await firstJSON(jsonUrls("smallbiz"));
      if (data) paintSmallbiz(data);
      return;
    }
    if (id === "land") {
      const data = await firstJSON(jsonUrls("homestead-path"));
      if (data) paintLand(data);
      return;
    }
    if (id === "entertainment") {
      const data = await firstJSON(jsonUrls("entertainment"));
      if (data) paintEntertainment(data);
      return;
    }
    if (id === "feeds") {
      const data = await firstJSON(jsonUrls("cameras"));
      if (data && data.cameras && typeof window.LT_setCameras === "function") {
        window.LT_setCameras(data.cameras);
      }
      const meta = document.getElementById("feeds-updated");
      if (meta && data && data.updated) {
        meta.textContent = "Updated " + data.updated + " · Idaho 511, Schweitzer on YouTube, NWS";
      }
      stamp((data && data.updated) || new Date().toISOString(), true);
      return;
    }
    if (id === "land-match") {
      const data = await firstJSON(jsonUrls("listings"));
      const rows = data && (data.listings || (Array.isArray(data) ? data : null));
      if (rows && typeof window.LT_setListings === "function") window.LT_setListings(rows);
      const meta = document.getElementById("match-meta");
      if (meta && data) {
        meta.textContent =
          "Pulled " +
          (data.updated || "—") +
          " · " +
          (rows ? rows.length : 0) +
          " listings from LandWatch and Redfin.";
      }
      stamp((data && data.updated) || new Date().toISOString(), false);
      return;
    }
    if (id === "journal") {
      stamp(new Date().toISOString(), !frozen);
      return;
    }
    stamp(new Date().toISOString(), true);
  }

  refreshAlerts().then((alerts) => {
    if (alerts) stamp(new Date().toISOString(), true);
  });
  loadPage().catch(function () {
    stamp(new Date().toISOString(), false);
  });
})();
