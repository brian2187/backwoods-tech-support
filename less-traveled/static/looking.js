(function () {
  const q = document.getElementById("look-q");
  const specs = document.getElementById("look-specs");
  const countEl = document.getElementById("look-count");
  let spec = "";

  function params() {
    const u = new URL(location.href);
    return { q: u.searchParams.get("q") || "", s: u.searchParams.get("s") || "" };
  }

  function writeParams() {
    const u = new URL(location.href);
    const needle = ((q && q.value) || "").trim();
    if (needle) u.searchParams.set("q", needle);
    else u.searchParams.delete("q");
    if (spec) u.searchParams.set("s", spec);
    else u.searchParams.delete("s");
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

  function show() {
    const toks = tokens(q && q.value);
    const cards = document.querySelectorAll(".look-card");
    let n = 0;
    cards.forEach((el) => {
      const sOk = !spec || el.getAttribute("data-spec") === spec;
      const qOk = matchQ(el.getAttribute("data-q"), toks);
      const ok = sOk && qOk;
      el.hidden = !ok;
      if (ok) n += 1;
    });
    document.querySelectorAll(".look-day").forEach((sec) => {
      sec.hidden = ![...sec.querySelectorAll(".look-card")].some((c) => !c.hidden);
    });
    if (countEl) {
      let msg = n === 1 ? "1 ask" : n + " asks";
      if (n !== cards.length) msg += " of " + cards.length;
      if (spec) msg += " · " + spec;
      if (toks.length) msg += " matching “" + toks.join(" ") + "”";
      countEl.textContent = msg + ".";
    }
    writeParams();
  }

  const start = params();
  if (q && start.q) q.value = start.q;
  spec = start.s;
  if (specs) {
    specs.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute("data-spec") || "") === spec);
    });
    specs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-spec]");
      if (!btn) return;
      spec = btn.getAttribute("data-spec") || "";
      specs.querySelectorAll(".dir-chip").forEach((b) => b.classList.toggle("on", b === btn));
      show();
    });
  }
  if (q) q.addEventListener("input", show);
  show();
  window.LT_lookingShow = show;
})();
