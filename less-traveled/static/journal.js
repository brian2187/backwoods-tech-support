(function () {
  const chips = document.getElementById("area-chips");
  const feed = document.getElementById("journal-feed");
  const whispers = document.getElementById("whispers-list");
  const status = document.getElementById("journal-status");
  const emptyW = document.getElementById("whispers-empty");
  const qEl = document.getElementById("journal-q");
  const pulled = document.getElementById("journal-pulled");
  const refreshBtn = document.getElementById("journal-refresh");
  if (!chips || !feed) return;

  let area = "";
  const frozen = /journal\.html$/i.test(location.pathname || "");

  function query() {
    return qEl && qEl.value ? String(qEl.value).trim().toLowerCase() : "";
  }

  function match(el, q, areaName) {
    const mine = (el.getAttribute("data-areas") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hideArea = !!(areaName && mine.length && mine.indexOf(areaName) < 0);
    const hideQ = !!(q && (el.textContent || "").toLowerCase().indexOf(q) < 0);
    return !(hideArea || hideQ);
  }

  function apply() {
    const q = query();
    chips.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute("data-area") || "") === area);
    });
    let notes = 0;
    feed.querySelectorAll(".journal-item").forEach((el) => {
      const ok = match(el, q, area);
      el.hidden = !ok;
      if (ok) notes += 1;
    });
    let wisps = 0;
    if (whispers) {
      whispers.querySelectorAll(".whisper").forEach((el) => {
        const ok = match(el, q, area);
        el.hidden = !ok;
        if (ok) wisps += 1;
      });
    }
    if (emptyW) emptyW.hidden = wisps > 0;
    if (status) {
      const bits = [];
      bits.push(notes === 1 ? "1 note" : notes + " notes");
      bits.push(wisps === 1 ? "1 whisper" : wisps + " whispers");
      if (area) bits.push("in " + area);
      if (q) bits.push('matching “' + q + "”");
      if (area || q) {
        status.hidden = false;
        status.textContent = bits.join(" · ") + ".";
      } else {
        status.hidden = true;
        status.textContent = "";
      }
    }
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function href(link) {
    const raw = String(link || "");
    if (!raw) return "#";
    if (frozen && raw.indexOf("/g/") === 0) return "g-" + raw.slice(3) + ".html";
    return raw;
  }

  function isHttp(link) {
    return /^https?:/i.test(String(link || ""));
  }

  function areasOf(it) {
    const list = it.areas && it.areas.length ? it.areas : it.area ? [it.area] : [];
    return list.filter(Boolean);
  }

  function metaHtml(it) {
    const tags = areasOf(it)
      .map((a) => '<span class="area-tag">' + esc(a) + "</span>")
      .join("");
    const kind = it.kind || "";
    const label = (it.kind_label || KIND[kind] || kind);
    const author = it.author ? " · " + esc(it.author) : "";
    return (
      '<p class="journal-meta">' +
      '<time datetime="' + esc(it.when || "") + '">' + esc(it.when_short || "") + "</time>" +
      tags +
      (kind
        ? '<span class="kind-tag kind-' + esc(kind) + '">' + esc(label) + "</span>"
        : "") +
      '<span class="src">' + esc(it.source || "") + author + "</span>" +
      "</p>"
    );
  }

  const KIND = {
    news: "News",
    x: "X",
    facebook: "Facebook",
    reddit: "Reddit",
    journal: "Homestead",
  };

  function noteHtml(it) {
    const areas = areasOf(it).join(",");
    const link = href(it.link);
    const blank = isHttp(it.link) ? ' target="_blank"' : "";
    const sum = it.summary ? '<p class="sum">' + esc(it.summary) + "</p>" : "";
    return (
      '<article class="journal-item" data-areas="' +
      esc(areas) +
      '">' +
      metaHtml(it) +
      "<h2><a href=\"" +
      esc(link) +
      '" rel="noopener"' +
      blank +
      ">" +
      esc(it.title) +
      "</a></h2>" +
      sum +
      '<p class="orig"><a href="' +
      esc(link) +
      '" rel="noopener"' +
      blank +
      ">Original at " +
      esc(it.source || "") +
      "</a></p></article>"
    );
  }

  function whisperHtml(it) {
    const areas = areasOf(it).join(",");
    const link = href(it.link);
    const sum = it.summary ? '<p class="sum">' + esc(it.summary) + "</p>" : "";
    const who = it.author || it.source || "X";
    return (
      '<article class="whisper" data-areas="' +
      esc(areas) +
      '">' +
      '<p class="journal-meta">' +
      '<time datetime="' +
      esc(it.when || "") +
      '">' +
      esc(it.when_short || "") +
      "</time>" +
      areasOf(it)
        .map((a) => '<span class="area-tag">' + esc(a) + "</span>")
        .join("") +
      '<span class="src">' +
      esc(who) +
      "</span></p>" +
      "<h3><a href=\"" +
      esc(link) +
      '" rel="noopener" target="_blank">' +
      esc(it.title) +
      "</a></h3>" +
      sum +
      '<p class="orig"><a href="' +
      esc(link) +
      '" rel="noopener" target="_blank">Open on X</a></p></article>'
    );
  }

  function fromFile(data) {
    const all = data.items || [];
    function isX(it) {
      const link = String(it.link || "").toLowerCase();
      return it.kind === "x" && (link.indexOf("x.com/") >= 0 || link.indexOf("twitter.com/") >= 0);
    }
    const whispersItems = all.filter(isX).slice(0, 48);
    const items = all.filter((it) => !isX(it) && it.kind !== "x");
    return {
      items: items,
      whispers: whispersItems,
      areas: data.areas || [],
      feed_n: items.length,
      whisper_n: whispersItems.length,
      feed_updated: data.updated || "",
      feed_note: data.note || "",
      kind_label: KIND,
    };
  }

  function paint(payload) {
    const labels = payload.kind_label || KIND;
    (payload.items || []).forEach((it) => {
      it.kind_label = labels[it.kind] || it.kind;
    });
    feed.innerHTML = (payload.items || []).map(noteHtml).join("") ||
      '<p class="meta">Nothing in the last 90 days yet.</p>';
    if (whispers) {
      whispers.innerHTML = (payload.whispers || []).map(whisperHtml).join("");
    }
    const nAll = (payload.feed_n || 0) + (payload.whisper_n || 0);
    const areaBtns = ['<button type="button" class="dir-chip" data-area="">All areas <span class="n">' + nAll + "</span></button>"];
    (payload.areas || []).forEach((a) => {
      areaBtns.push(
        '<button type="button" class="dir-chip" data-area="' +
          esc(a.name) +
          '">' +
          esc(a.name) +
          ' <span class="n">' +
          esc(a.n) +
          "</span></button>"
      );
    });
    chips.innerHTML = areaBtns.join("");
    if (pulled) {
      pulled.textContent =
        "Pulled " +
        (payload.feed_updated || "—") +
        " · " +
        (payload.feed_n || 0) +
        " notes · " +
        (payload.whisper_n || 0) +
        " whispers. " +
        (payload.feed_note || "");
    }
    apply();
  }

  function jsonUrl() {
    if (frozen) return "data/journal.json";
    return "/api/journal.json";
  }

  async function pullLive() {
    const urls = frozen ? [] : ["/journal/refresh"];
    if (!urls.length) throw new Error("static");
    let lastErr = "refresh";
    for (const url of urls) {
      try {
        const r = await fetch(url, { method: "POST", headers: { Accept: "application/json" } });
        if (!r.ok) {
          lastErr = "HTTP " + r.status;
          continue;
        }
        const data = await r.json();
        if (data && (data.items || data.whispers)) return data;
      } catch (e) {
        lastErr = e && e.message ? e.message : "network";
      }
    }
    throw new Error(lastErr);
  }

  async function pullFile() {
    const r = await fetch(jsonUrl() + "?t=" + Date.now(), { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    if (data.items && !data.feed_n && data.feed_n !== 0) return fromFile(data);
    if (data.items || data.whispers) return data;
    throw new Error("empty");
  }

  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-area]");
    if (!btn) return;
    area = btn.getAttribute("data-area") || "";
    apply();
  });
  if (qEl) {
    qEl.addEventListener("input", apply);
    qEl.addEventListener("search", apply);
  }

  async function refresh(fromUser) {
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "Updating…";
    }
    if (status && fromUser) {
      status.hidden = false;
      status.textContent = "Pulling news, public posts, and whispers.";
    }
    try {
      let payload;
      try {
        payload = await pullLive();
      } catch (_) {
        payload = await pullFile();
      }
      paint(payload);
      if (status) {
        status.hidden = false;
        status.textContent = fromUser ? "Journal updated." : "Journal loaded.";
      }
    } catch (_) {
      if (status && fromUser) {
        status.hidden = false;
        status.textContent = "Could not pull a fresh journal. Try again in a minute.";
      }
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "Update";
      }
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refresh(true);
    });
  }
  refresh(false);
})();
