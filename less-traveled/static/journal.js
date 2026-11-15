(function () {
  const chips = document.getElementById("area-chips");
  const feed = document.getElementById("journal-feed");
  const status = document.getElementById("journal-status");
  const qEl = document.getElementById("journal-q");
  if (!chips || !feed) return;

  let area = "";

  function query() {
    return qEl && qEl.value ? String(qEl.value).trim().toLowerCase() : "";
  }

  function apply() {
    const q = query();
    chips.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute("data-area") || "") === area);
    });
    let shown = 0;
    feed.querySelectorAll(".journal-item").forEach((el) => {
      const mine = (el.getAttribute("data-areas") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const hideArea = !!(area && mine.length && mine.indexOf(area) < 0);
      const hideQ = !!(q && (el.textContent || "").toLowerCase().indexOf(q) < 0);
      const hide = hideArea || hideQ;
      el.hidden = hide;
      if (!hide) shown += 1;
    });
    if (status) {
      const bits = [];
      if (shown === 1) bits.push("1 item");
      else bits.push(shown + " items");
      if (area) bits.push("in " + area);
      if (q) bits.push('matching “' + q + "”");
      if (area || q) {
        status.hidden = false;
        status.textContent = bits.join(" ") + ".";
      } else {
        status.hidden = true;
        status.textContent = "";
      }
    }
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
})();
