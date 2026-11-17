(function () {
  const q = document.getElementById("dir-q");
  const groups = document.getElementById("dir-groups");
  const specs = document.getElementById("dir-specs");
  const townEl = document.getElementById("dir-town");
  const countEl = document.getElementById("dir-count");
  let group = "";
  let spec = "";

  function params() {
    const u = new URL(location.href);
    return {
      q: u.searchParams.get("q") || "",
      g: u.searchParams.get("g") || "",
      s: u.searchParams.get("s") || "",
      town: u.searchParams.get("town") || "",
    };
  }

  function writeParams() {
    const u = new URL(location.href);
    function set(k, v) {
      if (v) u.searchParams.set(k, v);
      else u.searchParams.delete(k);
    }
    set("q", ((q && q.value) || "").trim());
    set("g", group);
    set("s", spec);
    set("town", (townEl && townEl.value) || "");
    const next = u.pathname + u.search + u.hash;
    if (next !== location.pathname + location.search + location.hash) {
      history.replaceState(null, "", next);
    }
  }

  function tokens(raw) {
    return (raw || "")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  }

  function matchQ(hay, toks) {
    if (!toks.length) return true;
    const h = hay || "";
    return toks.every((t) => h.indexOf(t) >= 0);
  }

  function markChips(root, attr, value) {
    if (!root) return;
    root.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute(attr) || "") === value);
    });
  }

  function showSpecs() {
    if (!specs) return;
    specs.querySelectorAll("[data-spec]").forEach((btn) => {
      const parent = btn.getAttribute("data-parent");
      btn.hidden = !!(parent && group && parent !== group);
    });
  }

  function show() {
    const toks = tokens(q && q.value);
    const town = ((townEl && townEl.value) || "").trim();
    let n = 0;
    const cards = document.querySelectorAll(".dir-card");
    cards.forEach((el) => {
      const gOk = !group || el.getAttribute("data-group") === group;
      const sOk = !spec || el.getAttribute("data-spec") === spec;
      const tOk = !town || el.getAttribute("data-town") === town;
      const qOk = matchQ(el.getAttribute("data-q"), toks);
      const ok = gOk && sOk && tOk && qOk;
      el.hidden = !ok;
      if (ok) n += 1;
    });
    document.querySelectorAll(".dir-section").forEach((sec) => {
      sec.hidden = ![...sec.querySelectorAll(".dir-card")].some((c) => !c.hidden);
    });
    document.querySelectorAll(".dir-group").forEach((sec) => {
      sec.hidden = ![...sec.querySelectorAll(".dir-card")].some((c) => !c.hidden);
    });
    document.querySelectorAll(".dir-shutdown li").forEach((el) => {
      el.hidden = !matchQ(el.getAttribute("data-q"), toks);
    });
    showSpecs();
    if (countEl) {
      let msg = n === 1 ? "1 company" : n + " companies";
      if (n !== cards.length) msg += " of " + cards.length;
      if (group) msg += " · " + group;
      if (spec) msg += " · " + spec;
      if (town) msg += " · " + town;
      if (toks.length) msg += " matching “" + toks.join(" ") + "”";
      countEl.textContent = msg + ".";
    }
    writeParams();
  }

  const start = params();
  if (q && start.q) q.value = start.q;
  if (townEl && start.town) townEl.value = start.town;
  group = start.g;
  spec = start.s;
  markChips(groups, "data-group", group);
  markChips(specs, "data-spec", spec);

  if (q) q.addEventListener("input", show);
  if (townEl) townEl.addEventListener("change", show);
  if (groups) {
    groups.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-group]");
      if (!btn) return;
      group = btn.getAttribute("data-group") || "";
      spec = "";
      markChips(groups, "data-group", group);
      markChips(specs, "data-spec", "");
      show();
    });
  }
  if (specs) {
    specs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-spec]");
      if (!btn || btn.hidden) return;
      spec = btn.getAttribute("data-spec") || "";
      markChips(specs, "data-spec", spec);
      show();
    });
  }
  show();
  window.LT_dirShow = show;
})();
